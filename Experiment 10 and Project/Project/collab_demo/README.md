# Real-Time Collaborative Document Editor — Full Stack System Design Demo

A visually impressive, fully functional system design demo of a real-time collaborative document editor. This project visualizes backend events in real-time, showcasing a Redis Pub/Sub architecture bridged via WebSockets to a React frontend.

## Quick Start

### Prerequisites
- Python 3.9+
- Node 18+
- Redis running on localhost:6379

### Running the Demo
Open two terminals.

**Terminal 1 (Backend)**
```bash
cd backend
pip install -r requirements.txt
python app.py
```

**Terminal 2 (Frontend)**
```bash
cd frontend
npm install
npm run dev
```

## How it works

The system uses a single-node Redis instance as the source of truth for the document state and as a message broker. A Python backend simulates multiple users typing characters at random intervals. Each keystroke triggers an atomic `APPEND` operation in Redis and publishes an event to a Pub/Sub channel. A WebSocket gateway listens to this channel and broadcasts every event to connected React clients. The React frontend visualizes these events in real-time with smooth animations, presence indicators, rolling metrics, and an active architecture diagram.

## Component map

### Backend
- **`app.py`**: Entry point — wires all components together and manages startup/shutdown.
- **`config.py`**: Configuration constants for Redis, WebSockets, and simulation parameters.
- **`collaboration_service.py`**: Owns document state in Redis; handles atomic updates and version snapshots.
- **`websocket_gateway.py`**: Subscribes to Redis Pub/Sub and broadcasts to all WebSocket clients.
- **`simulator.py`**: Spawns user threads to simulate typing with randomized delays.

### Frontend
- **`src/App.jsx`**: Main layout container (Dashboard).
- **`src/context/CollabContext.jsx`**: Global state provider managing real-time data.
- **`src/reducers/collabReducer.js`**: Pure reducer handling all incoming WebSocket events and updating state.
- **`src/hooks/useCollabSocket.js`**: Manages WS connection, reconnection, and fallback "Demo Mode".
- **`src/components/*`**: React components (DocumentCanvas, EventLog, UserPresence, VersionHistory, ArchitectureDiagram, MetricsBar).

## Data flow walkthrough

When a user types a character, the following sequence occurs end-to-end:

1. User thread types 'H'
2. → `CollaborationService`: Redis `APPEND` → document = "H"
3. → Publishes JSON event to Redis channel `collab:edits`
4. → `WebSocketGateway` receives from Pub/Sub
5. → Broadcasts to all connected WS clients
6. → React `useCollabSocket` receives message
7. → Dispatches `CHAR_APPENDED` to `collabReducer`
8. → `DocumentCanvas` re-renders with new char span
9. → `EventLog` appends new line
10. → `MetricsBar` increments counters
11. → `ArchitectureDiagram` triggers pulse sequence

## Architecture diagram

```text
[⚙ Simulator] → [📡 Redis] → [⇄ WS Gateway] → [⬡ React UI]
                     │
                     ↓
              [💾 CollabService]
```

## Limitations

- **Race conditions**: Without Operational Transformation (OT) or CRDTs, concurrent edits in a real scenario would cause ordering conflicts.
- **No ordering guarantee**: Redis Pub/Sub does not guarantee strict global ordering under heavy load or across partitions.
- **Single-node Redis**: Not highly available.
- **No conflict resolution**: The current model uses simple appends.
- **Simulated users only**: The backend currently only receives input from the simulator, not from real WebSocket clients.

## Production improvements

- **OT/CRDT**: Implement Operational Transformation or Conflict-free Replicated Data Types for true multi-cursor collaborative editing.
- **Redis Cluster**: Use Redis Cluster for high availability and partitioning.
- **Persistence**: Periodically save snapshots to a persistent data store (e.g., PostgreSQL or MongoDB) instead of just keeping state in Redis.
- **Authentication**: Add JWT-based auth for WebSocket connections.
- **Bidirectional WebSockets**: Allow real users to send edits back to the server via WebSocket.
