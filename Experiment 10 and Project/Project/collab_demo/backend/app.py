"""
Entry point. Wires together all backend components:
1. Connects to Redis — verifies connection with PING
2. Initializes CollaborationService — clears old document state
3. Starts WebSocketGateway in a background asyncio thread
4. Waits 1.5s for clients to connect
5. Starts UserSimulator — begins typing simulation
6. Waits for simulation to complete
7. Logs final document state and exits cleanly
"""
import sys
import time
import asyncio
import threading
import redis

from config import (
    REDIS_HOST, REDIS_PORT, REDIS_DB, 
    WS_HOST, WS_PORT, 
    SIMULATE_USERS, SIMULATE_TEXT
)
from collaboration_service import CollaborationService
from websocket_gateway import WebSocketGateway
from simulator import UserSimulator

def run_asyncio_loop(gateway):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        loop.run_until_complete(gateway.run())
    except asyncio.CancelledError:
        pass
    except Exception as e:
        print(f"[ERROR] WebSocket server error: {e}")
    finally:
        loop.close()

def main():
    try:
        print(f"[BOOT] Connecting to Redis at {REDIS_HOST}:{REDIS_PORT}...")
        r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB)
        r.ping()
        print("[BOOT] Redis connection OK ✓")
        
        service = CollaborationService(r)
        print("[BOOT] Document state cleared")
        
        simulator = UserSimulator(service)
        
        def handle_command(data):
            cmd = data.get("command")
            if cmd == "start_v1":
                print("\n[CMD] Starting V1 Static Simulation")
                simulator.start_static(SIMULATE_USERS, SIMULATE_TEXT)
            elif cmd == "start_v2":
                speed = float(data.get("speed", 1.0))
                print(f"\n[CMD] Starting V2 Continuous Simulation (Speed: {speed}x)")
                simulator.start_continuous(SIMULATE_USERS, speed)
            elif cmd == "stop":
                print("\n[CMD] Stopping Simulation")
                simulator.stop()
            elif cmd == "reset":
                print("\n[CMD] Resetting Document")
                simulator.stop()
                service.clear_document()
            elif cmd == "set_speed":
                speed = float(data.get("speed", 1.0))
                simulator.set_speed(speed)
                print(f"\n[CMD] Speed changed to {speed}x")
            elif cmd == "set_role":
                user = data.get("user")
                role = data.get("role")
                simulator.set_user_role(user, role)
                print(f"\n[CMD] Role changed: {user} is now {role}")

        gateway = WebSocketGateway(r, on_command=handle_command)
        print(f"[BOOT] WebSocket server starting on ws://{WS_HOST}:{WS_PORT}")
        
        ws_thread = threading.Thread(target=run_asyncio_loop, args=(gateway,), daemon=True)
        ws_thread.start()
        
        print("[BOOT] Waiting for frontend commands... (V1/V2 ready)")
        
        while True:
            time.sleep(1)
            
    except redis.exceptions.ConnectionError:
        print(f"[ERROR] Could not connect to Redis at {REDIS_HOST}:{REDIS_PORT}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n[SHUTDOWN] Stopping server...")
        try:
            r.close()
        except:
            pass

if __name__ == "__main__":
    main()

