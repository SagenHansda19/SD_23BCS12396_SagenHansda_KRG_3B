import React from 'react';
import { CollabProvider } from './context/CollabContext';
import MetricsBar from './components/MetricsBar';
import DocumentCanvas from './components/DocumentCanvas';
import EventLog from './components/EventLog';
import UserPresence from './components/UserPresence';
import VersionHistory from './components/VersionHistory';
import ArchitectureDiagram from './components/ArchitectureDiagram';
import ConnectionStatus from './components/ConnectionStatus';
import SimulationControls from './components/SimulationControls';

function Dashboard() {
  return (
    <div className="dashboard-container">
      <ConnectionStatus />
      
      <div className="top-row">
        <MetricsBar />
      </div>

      <SimulationControls />

      <div className="main-layout">
        <div className="left-column">
          <DocumentCanvas />
        </div>
        <div className="middle-column">
          <UserPresence />
          <EventLog />
        </div>
        <div className="right-column">
          <VersionHistory />
        </div>
      </div>

      <div className="bottom-row">
        <ArchitectureDiagram />
      </div>
    </div>
  );
}

function App() {
  return (
    <CollabProvider>
      <Dashboard />
    </CollabProvider>
  );
}

export default App;
