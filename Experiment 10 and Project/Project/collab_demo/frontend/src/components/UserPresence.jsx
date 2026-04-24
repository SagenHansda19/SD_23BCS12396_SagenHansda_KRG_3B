import React, { useContext } from 'react';
import { CollabContext } from '../context/CollabContext';
import '../styles/presence.css';

export default function UserPresence() {
  const { state, dispatch, sendMessage } = useContext(CollabContext);
  const { users } = state;

  const handleRoleChange = (userName, role) => {
    dispatch({ type: 'SET_USER_ROLE', payload: { user: userName, role } });
    if (sendMessage) {
      sendMessage({ command: 'set_role', user: userName, role });
    }
  };

  return (
    <div className="panel presence-panel">
      <div className="panel-content presence-list">
        {Object.keys(users).map((userName, idx) => {
          const user = users[userName];
          const isDone = user.status === 'DONE';
          const isViewer = user.role === 'viewer';
          
          return (
            <div 
              key={userName} 
              className={`user-card slide-up ${isViewer ? 'role-viewer' : ''}`}
              style={{ 
                '--user-color': `var(--color-${userName.toLowerCase()})`,
                animationDelay: `${idx * 80}ms`
              }}
            >
              <div className="user-info">
                <span className="user-name">{userName}</span>
                <select 
                  className="role-select" 
                  value={user.role || 'editor'}
                  onChange={(e) => handleRoleChange(userName, e.target.value)}
                >
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              
              {isViewer ? (
                <div className="viewer-badge" title="Viewer cannot edit">
                  👁️ View Only
                </div>
              ) : (
                <>
                  <div className="user-status-row">
                    <span className={`user-status ${isDone ? 'done' : 'typing'}`}>
                      {isDone ? '✓ DONE' : <><span className="pulse">●</span> TYPING</>}
                    </span>
                  </div>
                  <div className="user-stats">
                    <span>{user.charCount} chars</span>
                    <span className="last-char">
                      {user.lastChar ? `'${user.lastChar === ' ' ? ' ' : user.lastChar}'` : ''}
                    </span>
                  </div>
                  <div className="mini-progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${Math.min(100, user.charCount * 4)}%` }} 
                    />
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
