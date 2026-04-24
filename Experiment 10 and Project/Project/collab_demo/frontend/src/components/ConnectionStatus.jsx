import React, { useContext } from 'react';
import { CollabContext } from '../context/CollabContext';
import '../styles/dashboard.css';

export default function ConnectionStatus() {
  const { state } = useContext(CollabContext);
  const { connectionStatus, retryCount } = state;

  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'connecting':
        return { dotClass: 'amber-pulse', label: 'Connecting…' };
      case 'connected':
        return { dotClass: 'green-pulse', label: 'Live' };
      case 'reconnecting':
        return { dotClass: 'amber-pulse', label: `Retry ${retryCount}/5` };
      case 'disconnected':
        return { dotClass: 'red-static', label: 'Offline' };
      case 'demo':
        return { dotClass: 'blue-pulse', label: 'Demo Mode' };
      default:
        return { dotClass: 'amber-pulse', label: 'Connecting…' };
    }
  };

  const { dotClass, label } = getStatusConfig();

  return (
    <div className="connection-status">
      <span className={`status-dot ${dotClass}`} />
      <span className="status-label">{label}</span>
    </div>
  );
}
