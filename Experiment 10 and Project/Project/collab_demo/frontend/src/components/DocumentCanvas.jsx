import React, { useContext } from 'react';
import { CollabContext } from '../context/CollabContext';
import '../styles/document.css';

export default function DocumentCanvas() {
  const { state } = useContext(CollabContext);
  const { document, sessionComplete, previewSnapshot } = state;

  return (
    <div className="panel document-panel">
      <div className="panel-header">
        <span className="header-title">DOCUMENT</span>
        <span className="header-subtitle">{document.length} chars</span>
      </div>
      <div className="panel-content document-canvas">
        {previewSnapshot ? (
          <div className="ghost-overlay">
            {previewSnapshot}
          </div>
        ) : (
          <div className="document-text">
            {document.map((item, idx) => (
              <span 
                key={item.id} 
                className="char-span" 
                style={{ color: `var(--color-${item.user.toLowerCase()})` }}
                title={item.user}
              >
                {item.char === ' ' ? '\u00A0' : item.char}
              </span>
            ))}
            {!sessionComplete && <span className="cursor-blink">▌</span>}
          </div>
        )}
        
        {sessionComplete && (
          <div className="session-complete-badge slide-up">
            Session Complete ✓
          </div>
        )}
      </div>
    </div>
  );
}
