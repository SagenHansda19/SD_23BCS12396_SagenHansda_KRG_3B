export const initialState = {
  connectionStatus: 'connecting',
  document: [],           // [{ id, char, user, timestamp }]
  users: {},              // { Alice: { charCount, lastChar, status, lastActiveAt } }
  events: [],             // [{ id, user, char, timestamp }] max 200
  activeComponent: null,
  versions: [],           // [{ id, version, snapshot, delta, triggeredBy, timestamp, label }]
  metrics: {
    totalEvents: 0,
    eventsPerSecond: 0,
    peakEps: 0,
    sessionDuration: 0,
    sessionStartedAt: null,
  },
  sessionComplete: false,
  retryCount: 0,
  demoMode: false,
  previewSnapshot: null,  // string (snapshot document)
  simulationStatus: 'idle', // 'idle', 'v1', 'v2'
};

export function collabReducer(state, action) {
  switch (action.type) {
    case 'INIT': {
      const { document: docString, active_users, timestamp } = action.payload;
      const users = {};
      active_users.forEach(u => {
        users[u] = { charCount: 0, lastChar: '', status: 'DONE', lastActiveAt: null, role: 'editor' };
      });
      return {
        ...state,
        connectionStatus: 'connected',
        users,
        document: docString ? docString.split('').map((c, i) => ({ id: i, char: c, user: 'System', timestamp })) : [],
        sessionStartedAt: Date.now(),
        retryCount: 0
      };
    }
    case 'CHAR_APPENDED': {
      const { user, char, document_state, timestamp, version_snapshot, role } = action.payload;
      
      const newUsers = { ...state.users };
      if (!newUsers[user]) {
        newUsers[user] = { charCount: 0, lastChar: '', status: 'TYPING', lastActiveAt: timestamp, role: role || 'editor' };
      }
      newUsers[user] = {
        ...newUsers[user],
        charCount: newUsers[user].charCount + 1,
        lastChar: char,
        status: 'TYPING',
        lastActiveAt: timestamp,
        role: role || newUsers[user].role
      };

      const newDoc = [...state.document, { id: state.document.length, char, user, timestamp }];
      
      const newEvent = { id: state.events.length, user, char, timestamp, docState: document_state };
      const newEvents = [newEvent, ...state.events].slice(0, 200);

      const newVersions = version_snapshot 
        ? [{ ...version_snapshot, id: state.versions.length }, ...state.versions].slice(0, 50)
        : state.versions;

      return {
        ...state,
        document: newDoc,
        users: newUsers,
        events: newEvents,
        versions: newVersions,
        metrics: {
          ...state.metrics,
          totalEvents: state.metrics.totalEvents + 1
        }
      };
    }
    case 'SESSION_COMPLETE': {
      const newUsers = { ...state.users };
      Object.keys(newUsers).forEach(u => {
        newUsers[u].status = 'DONE';
      });
      return {
        ...state,
        sessionComplete: true,
        users: newUsers
      };
    }
    case 'CONNECTION_STATUS':
      return { ...state, connectionStatus: action.payload };
    case 'SET_ACTIVE_COMPONENT':
      return { ...state, activeComponent: action.payload };
    case 'INCREMENT_RETRY':
      return { ...state, retryCount: state.retryCount + 1 };
    case 'ENTER_DEMO_MODE':
      return { ...state, demoMode: true, connectionStatus: 'demo', sessionStartedAt: Date.now() };
    case 'UPDATE_METRICS':
      return { ...state, metrics: { ...state.metrics, ...action.payload } };
    case 'SET_PREVIEW_SNAPSHOT':
      return { ...state, previewSnapshot: action.payload };
    case 'CLEAR_DOCUMENT':
      return {
        ...state,
        document: [],
        events: [],
        versions: [],
        sessionComplete: false,
        metrics: {
          ...state.metrics,
          totalEvents: 0
        }
      };
    case 'SET_SIMULATION_STATUS':
      return { ...state, simulationStatus: action.payload };
    case 'SET_USER_ROLE':
      return {
        ...state,
        users: {
          ...state.users,
          [action.payload.user]: {
            ...state.users[action.payload.user],
            role: action.payload.role
          }
        }
      };
    default:
      return state;
  }
}
