import React, { useContext, useEffect, useRef } from 'react';
import { CollabContext } from '../context/CollabContext';
import '../styles/eventlog.css';

export default function EventLog() {
  const { state } = useContext(CollabContext);
  const { events } = state;
  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [events]);

  // Events are prepended in reducer, so to scroll to bottom naturally we might want to map them in reverse 
  // or flex column-reverse. I'll reverse them to display chronological order from top to bottom.
  const displayEvents = [...events].reverse();

  return (
    <div className="panel eventlog-panel">
      <div className="panel-header">
        <span className="header-title">
          <span className="live-dot pulse-animation">●</span> LIVE
        </span>
        <span className="header-subtitle">redis channel: collab:edits</span>
      </div>
      <div className="panel-content eventlog-content">
        {displayEvents.length === 0 ? (
          <div className="empty-state">Awaiting ws://localhost:8765…</div>
        ) : (
          displayEvents.map((evt) => (
            <div key={evt.id} className="log-line">
              <span className="log-time">[{evt.timestamp.substring(0, 8)}]</span>
              <span 
                className="log-user" 
                style={{ color: `var(--color-${evt.user.toLowerCase()})` }}
              >
                {evt.user}
              </span>
              <span className="log-arrow">→</span>
              <span className="log-char">'{evt.char === ' ' ? ' ' : evt.char}'</span>
              <span className="log-doc">doc: "{evt.docState}"</span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
