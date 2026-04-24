import asyncio
import json
import logging
import websockets

from config import CHANNEL_NAME, WS_HOST, WS_PORT

logger = logging.getLogger(__name__)

class WebSocketGateway:
    """
    Subscribes to the Redis Pub/Sub channel.
    Maintains a set of connected WebSocket clients.
    Forwards every Redis message as JSON to all clients.
    """
    def __init__(self, redis_client, on_command=None):
        self.redis = redis_client
        self.clients = set()
        self.pubsub = self.redis.pubsub()
        self.on_command = on_command

    async def start_server(self):
        server = await websockets.serve(self._handle_client, WS_HOST, WS_PORT)
        await server.wait_closed()

    async def _handle_client(self, websocket):
        import datetime
        from config import SIMULATE_USERS, DOCUMENT_KEY
        
        remote_address = websocket.remote_address
        logger.info(f"Client connected from {remote_address}")
        
        self.clients.add(websocket)
        try:
            init_event = self._build_init_event()
            await websocket.send(init_event)
            
            async for message in websocket:
                if self.on_command:
                    try:
                        data = json.loads(message)
                        # We call it in executor if it blocks, but it's simple enough to just call.
                        # Since app.py might modify thread state, we run it in executor or safely.
                        loop = asyncio.get_event_loop()
                        await loop.run_in_executor(None, self.on_command, data)
                    except Exception as e:
                        logger.error(f"Error handling message {message}: {e}")
        except websockets.exceptions.ConnectionClosed:
            pass
        finally:
            self.clients.remove(websocket)
            logger.info(f"Client disconnected: {remote_address}")

    async def _redis_listener(self):
        self.pubsub.subscribe(CHANNEL_NAME)
        # Use a non-blocking approach to listen to redis messages
        loop = asyncio.get_event_loop()
        while True:
            # We can use execute_command or loop.run_in_executor for blocking redis read
            # or just a simple sleep and get_message
            message = await loop.run_in_executor(None, self.pubsub.get_message, True, 0.01)
            if message and message['type'] == 'message':
                data = message['data'].decode('utf-8')
                await self._broadcast(data)
            await asyncio.sleep(0.01)

    async def _broadcast(self, message: str):
        if not self.clients:
            return
        # Create a copy or iterate over set safely
        for client in list(self.clients):
            try:
                await client.send(message)
            except websockets.exceptions.ConnectionClosed:
                pass # removed in handle_client finally block

    def _build_init_event(self) -> str:
        from config import SIMULATE_USERS, DOCUMENT_KEY
        import datetime
        now = datetime.datetime.now().strftime("%H:%M:%S.%f")[:-3]
        
        val = self.redis.get(DOCUMENT_KEY)
        doc = val.decode('utf-8') if val else ""
        
        event = {
            "type": "init",
            "document": doc,
            "active_users": SIMULATE_USERS,
            "timestamp": now
        }
        return json.dumps(event)

    async def run(self):
        await asyncio.gather(
            self.start_server(),
            self._redis_listener()
        )
