import React, { useContext, useEffect, useState } from 'react';
import { CollabContext } from '../context/CollabContext';
import '../styles/diagram.css';

export default function ArchitectureDiagram() {
  const { state } = useContext(CollabContext);
  const { activeComponent, events } = state;
  const [animating, setAnimating] = useState(false);
  const [activeUser, setActiveUser] = useState(null);

  useEffect(() => {
    if (activeComponent) {
      setAnimating(true);
      setActiveUser(activeComponent);
      const timer = setTimeout(() => {
        setAnimating(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [activeComponent]);

  const lastEvent = events.length > 0 ? events[0].timestamp : null;
  const userColor = activeUser ? `var(--color-${activeUser.toLowerCase()})` : 'var(--text-secondary)';

  return (
    <div className="panel diagram-panel">
      <div className="diagram-content">
        <div className="diagram-nodes">
          <div className={`node simulator ${animating ? 'active' : ''}`} style={{ '--delay': '0ms', '--user-color': userColor }}>
            ⚙ Simulator
          </div>
          <div className="arrow-container">
            <div className="arrow-line" />
            {animating && <div className="traveling-dot" style={{ '--delay': '0ms', '--user-color': userColor }} />}
          </div>
          
          <div className={`node redis ${animating ? 'active' : ''}`} style={{ '--delay': '200ms', '--user-color': userColor }}>
            📡 Redis
          </div>
          
          <div className="arrow-container-down">
             <div className="arrow-line-down" />
             {animating && <div className="traveling-dot-down" style={{ '--delay': '200ms', '--user-color': userColor }} />}
          </div>
          <div className={`node collab ${animating ? 'active' : ''}`} style={{ '--delay': '400ms', '--user-color': userColor }}>
            💾 CollabService
          </div>

          <div className="arrow-container">
            <div className="arrow-line" />
            {animating && <div className="traveling-dot" style={{ '--delay': '400ms', '--user-color': userColor }} />}
          </div>
          
          <div className={`node gateway ${animating ? 'active' : ''}`} style={{ '--delay': '600ms', '--user-color': userColor }}>
            ⇄ WS Gateway
          </div>
          
          <div className="arrow-container">
            <div className="arrow-line" />
            {animating && <div className="traveling-dot" style={{ '--delay': '800ms', '--user-color': userColor }} />}
          </div>
          
          <div className={`node react ${animating ? 'active' : ''}`} style={{ '--delay': '1000ms', '--user-color': userColor }}>
            ⬡ React UI
          </div>
        </div>
        
        {lastEvent && (
          <div className="diagram-footer">
            last event: {lastEvent}
          </div>
        )}
      </div>
    </div>
  );
}
