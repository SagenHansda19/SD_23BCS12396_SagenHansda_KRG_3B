import { useEffect, useRef } from 'react';
import { DEMO_TEXT, USERS } from '../constants/users';

const WS_URL = 'ws://localhost:8765';
const MAX_RETRIES = 5;

export default function useCollabSocket(dispatch, state) {
  const wsRef = useRef(null);
  const retryCount = useRef(0);
  const reconnectTimeout = useRef(null);
  const eventTimestamps = useRef([]);
  const peakEps = useRef(0);

  useEffect(() => {
    if (state.demoMode) return;

    function connect() {
      dispatch({ type: 'CONNECTION_STATUS', payload: 'connecting' });
      
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        dispatch({ type: 'CONNECTION_STATUS', payload: 'connected' });
        retryCount.current = 0;
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleMessage(data);
      };

      ws.onclose = () => {
        if (retryCount.current < MAX_RETRIES) {
          retryCount.current += 1;
          dispatch({ type: 'INCREMENT_RETRY' });
          dispatch({ type: 'CONNECTION_STATUS', payload: 'reconnecting' });
          reconnectTimeout.current = setTimeout(connect, 3000);
        } else {
          dispatch({ type: 'CONNECTION_STATUS', payload: 'disconnected' });
          startDemoMode();
        }
      };

      ws.onerror = () => {
        // Will trigger onclose
      };
    }

    connect();

    return () => {
      clearTimeout(reconnectTimeout.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [state.demoMode]);

  // Rolling EPS calculator
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      // Keep events from last 3 seconds
      eventTimestamps.current = eventTimestamps.current.filter(ts => now - ts <= 3000);
      
      const eps = eventTimestamps.current.length / 3;
      if (eps > peakEps.current) peakEps.current = eps;
      
      dispatch({ 
        type: 'UPDATE_METRICS', 
        payload: { 
          eventsPerSecond: eps.toFixed(1),
          peakEps: peakEps.current.toFixed(1)
        } 
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const handleMessage = (data) => {
    if (data.type === 'init') {
      dispatch({ type: 'INIT', payload: data });
    } else if (data.type === 'char_appended') {
      eventTimestamps.current.push(Date.now());
      dispatch({ type: 'CHAR_APPENDED', payload: data });
      
      // Diagram animation
      dispatch({ type: 'SET_ACTIVE_COMPONENT', payload: data.user });
      setTimeout(() => dispatch({ type: 'SET_ACTIVE_COMPONENT', payload: null }), 1200);
      
    } else if (data.type === 'document_cleared') {
      dispatch({ type: 'CLEAR_DOCUMENT', payload: data });
    } else if (data.type === 'session_complete') {
      dispatch({ type: 'SESSION_COMPLETE', payload: data });
    }
  };

  const startDemoMode = () => {
    dispatch({ type: 'ENTER_DEMO_MODE' });
    
    // Hardcoded 25-event sequence spelling "Hello from Redis PubSub"
    const chars = DEMO_TEXT.split('');
    let docState = "";
    let i = 0;
    
    dispatch({ 
      type: 'INIT', 
      payload: { document: "", active_users: USERS, timestamp: getTimestamp() } 
    });

    const playNext = () => {
      if (i >= chars.length) {
        dispatch({ 
          type: 'SESSION_COMPLETE', 
          payload: { document: docState, total_chars: docState.length, total_versions: Math.floor(docState.length/5), timestamp: getTimestamp() } 
        });
        return;
      }

      const char = chars[i];
      docState += char;
      const user = USERS[i % USERS.length];
      
      let version_snapshot = null;
      if (docState.length % 5 === 0) {
        version_snapshot = {
          version: Math.floor(docState.length / 5),
          snapshot: docState,
          char_count: docState.length,
          delta: 5,
          triggered_by: user,
          timestamp: getTimestamp(),
          label: `v${Math.floor(docState.length / 5)}`
        };
      }

      handleMessage({
        type: 'char_appended',
        user,
        char,
        document_state: docState,
        timestamp: getTimestamp(),
        version_snapshot
      });

      i++;
      setTimeout(playNext, Math.random() * 300 + 150);
    };

    setTimeout(playNext, 1000);
  };

  function getTimestamp() {
    const d = new Date();
    return d.toISOString().substring(11, 23); // HH:mm:ss.SSS
  }

  const sendMessage = (msg) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  };

  return { sendMessage };
}

