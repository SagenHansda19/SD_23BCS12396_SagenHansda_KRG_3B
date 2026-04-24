import React, { createContext, useReducer, useEffect } from 'react';
import { initialState, collabReducer } from '../reducers/collabReducer';
import useCollabSocket from '../hooks/useCollabSocket';

export const CollabContext = createContext();

export function CollabProvider({ children }) {
  const [state, dispatch] = useReducer(collabReducer, initialState);

  const { sendMessage } = useCollabSocket(dispatch, state);

  // Metrics update loop
  useEffect(() => {
    if (state.sessionComplete) return;

    let eventHistory = [];
    const interval = setInterval(() => {
      const now = Date.now();
      const duration = state.sessionStartedAt ? Math.floor((now - state.sessionStartedAt) / 1000) : 0;
      dispatch({ type: 'UPDATE_METRICS', payload: { sessionDuration: duration } });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.sessionComplete, state.sessionStartedAt]);

  return (
    <CollabContext.Provider value={{ state, dispatch, sendMessage }}>
      {children}
    </CollabContext.Provider>
  );
}
