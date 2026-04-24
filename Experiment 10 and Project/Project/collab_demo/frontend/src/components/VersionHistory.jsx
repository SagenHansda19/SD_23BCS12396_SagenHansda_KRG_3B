import React, { useContext } from 'react';
import { CollabContext } from '../context/CollabContext';
import '../styles/versions.css';

export default function VersionHistory() {
  const { state, dispatch } = useContext(CollabContext);
  const { versions } = state;

  const handlePreview = (snapshot) => {
    dispatch({ type: 'SET_PREVIEW_SNAPSHOT', payload: snapshot });
    setTimeout(() => {
      dispatch({ type: 'SET_PREVIEW_SNAPSHOT', payload: null });
    }, 4000);
  };

  return (
    <div className="panel versions-panel">
      <div className="panel-header">
        <span className="header-title">VERSION HISTORY</span>
        <span className="header-subtitle">· {versions.length} snapshots</span>
      </div>
      <div className="panel-content versions-list">
        {versions.map((v, idx) => (
          <div 
            key={v.id} 
            className="version-card slide-in-right"
            onClick={() => handlePreview(v.snapshot)}
            style={{ animationDelay: '0ms' }} // Newly added is at top, so 0ms is fine
          >
            <div className="version-header">
              <span className="version-label">{v.label}</span>
              <span className="version-delta">· +{v.delta} chars</span>
              <span className="version-time">· {v.timestamp.substring(0, 8)}</span>
            </div>
            <div className="version-divider" />
            <div className="version-body">
              <div className="version-preview">"{v.snapshot.length > 8 ? v.snapshot.substring(0,8) + '…' : v.snapshot}"</div>
              <div className="version-author">by <span style={{ color: `var(--color-${v.triggered_by.toLowerCase()})` }}>{v.triggered_by}</span></div>
            </div>
          </div>
        ))}
        {versions.length === 0 && (
          <div className="empty-state">No snapshots yet...</div>
        )}
      </div>
    </div>
  );
}
