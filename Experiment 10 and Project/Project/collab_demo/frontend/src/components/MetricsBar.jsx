import React, { useContext } from 'react';
import { CollabContext } from '../context/CollabContext';
import '../styles/metrics.css';

export default function MetricsBar() {
  const { state } = useContext(CollabContext);
  const { metrics, users } = state;

  const numUsers = Object.keys(users).length;
  
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const isHighEps = metrics.eventsPerSecond > 3.0;
  const isHighPeak = metrics.peakEps > 3.0;

  return (
    <div className="metrics-bar">
      <div className="metric-item">
        <span className="metric-label">EVENTS</span>
        <span className="metric-value">{metrics.totalEvents}</span>
      </div>
      <div className="metric-item">
        <span className="metric-label">EVT/SEC</span>
        <span className={`metric-value ${isHighEps ? 'warning' : ''}`}>{metrics.eventsPerSecond}</span>
      </div>
      <div className="metric-item">
        <span className="metric-label">PEAK</span>
        <span className={`metric-value ${isHighPeak ? 'warning' : ''}`}>{metrics.peakEps}</span>
      </div>
      <div className="metric-item">
        <span className="metric-label">DURATION</span>
        <span className="metric-value">{formatTime(metrics.sessionDuration)}</span>
      </div>
      <div className="metric-item">
        <span className="metric-label">USERS</span>
        <span className="metric-value">{numUsers}</span>
      </div>
    </div>
  );
}
