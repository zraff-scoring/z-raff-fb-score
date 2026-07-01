import { useState, useEffect, useRef, useCallback } from 'react';
import { BroadcastState, Player } from '../types.js';
import {
  initFirebase,
  doc,
  setDoc,
  onSnapshot,
  getDoc,
  handleFirestoreError,
  OperationType
} from '../lib/firebase.js';

// Default mock players matching the server setup
const defaultHomeXI: Player[] = [
  { id: 'h1', name: 'Aaron Ramsdale', number: 1, position: 'GK', x: 10, y: 50 },
  { id: 'h2', name: 'Ben White', number: 4, position: 'DF', x: 30, y: 15 },
  { id: 'h3', name: 'William Saliba', number: 2, position: 'DF', x: 30, y: 38 },
  { id: 'h4', name: 'Gabriel Magalhães', number: 6, position: 'DF', x: 30, y: 62 },
  { id: 'h5', name: 'Oleksandr Zinchenko', number: 35, position: 'DF', x: 30, y: 85 },
  { id: 'h6', name: 'Declan Rice', number: 41, position: 'MF', x: 55, y: 30 },
  { id: 'h7', name: 'Martin Ødegaard', number: 8, position: 'MF', x: 55, y: 70, isCaptain: true, photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200' },
  { id: 'h8', name: 'Bukayo Saka', number: 7, position: 'MF', x: 75, y: 15 },
  { id: 'h9', name: 'Gabriel Martinelli', number: 11, position: 'MF', x: 75, y: 85 },
  { id: 'h10', name: 'Kai Havertz', number: 29, position: 'FW', x: 80, y: 50 },
  { id: 'h11', name: 'Gabriel Jesus', number: 9, position: 'FW', x: 90, y: 50 },
];

const defaultHomeSubs: Player[] = [
  { id: 'hs1', name: 'David Raya', number: 22, position: 'GK' },
  { id: 'hs2', name: 'Jakub Kiwior', number: 15, position: 'DF' },
  { id: 'hs3', name: 'Thomas Partey', number: 5, position: 'MF' },
  { id: 'hs4', name: 'Jorginho', number: 20, position: 'MF' },
  { id: 'hs5', name: 'Leandro Trossard', number: 19, position: 'FW' },
  { id: 'hs6', name: 'Eddie Nketiah', number: 14, position: 'FW' },
];

const defaultAwayXI: Player[] = [
  { id: 'a1', name: 'Robert Sánchez', number: 1, position: 'GK', x: 10, y: 50 },
  { id: 'a2', name: 'Reece James', number: 24, position: 'DF', x: 30, y: 15, isCaptain: true, photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200' },
  { id: 'a3', name: 'Axel Disasi', number: 2, position: 'DF', x: 30, y: 38 },
  { id: 'a4', name: 'Levi Colwill', number: 26, position: 'DF', x: 30, y: 62 },
  { id: 'a5', name: 'Marc Cucurella', number: 3, position: 'DF', x: 30, y: 85 },
  { id: 'a6', name: 'Enzo Fernández', number: 8, position: 'MF', x: 55, y: 30 },
  { id: 'a7', name: 'Moisés Caicedo', number: 25, position: 'MF', x: 55, y: 70 },
  { id: 'a8', name: 'Cole Palmer', number: 20, position: 'MF', x: 75, y: 30 },
  { id: 'a9', name: 'Conor Gallagher', number: 23, position: 'MF', x: 75, y: 70 },
  { id: 'a10', name: 'Raheem Sterling', number: 7, position: 'FW', x: 80, y: 50 },
  { id: 'a11', name: 'Nicolas Jackson', number: 15, position: 'FW', x: 90, y: 50 },
];

const defaultAwaySubs: Player[] = [
  { id: 'as1', name: 'Djordje Petrović', number: 28, position: 'GK' },
  { id: 'as2', name: 'Benoît Badiashile', number: 5, position: 'DF' },
  { id: 'as3', name: 'Malo Gusto', number: 27, position: 'DF' },
  { id: 'as4', name: 'Mykhailo Mudryk', number: 10, position: 'FW' },
  { id: 'as5', name: 'Noni Madueke', number: 11, position: 'FW' },
  { id: 'as6', name: 'Christopher Nkunku', number: 18, position: 'FW' },
];

export const DEFAULT_STATE: BroadcastState = {
  settings: {
    homeTeam: 'London Red',
    awayTeam: 'London Blue',
    homeLogo: '',
    awayLogo: '',
    leagueName: 'Z-raff Premier Trophy',
    location: 'Emirates Arena, London',
    referee: 'Michael Oliver',
    kickoffTime: '20:00 BST',
    competitionLogo: '',
    season: '2026/27',
  },
  scoreboard: {
    homeScore: 0,
    awayScore: 0,
  },
  timer: {
    timeSeconds: 0,
    isRunning: false,
    period: '1ST',
    injuryTimeMinutes: 0,
  },
  lineups: {
    homeCoach: 'Mikel Arteta',
    awayCoach: 'Mauricio Pochettino',
    homeFormation: '4-3-3',
    awayFormation: '4-2-3-1',
    homeStartingXI: defaultHomeXI,
    awayStartingXI: defaultAwayXI,
    homeSubs: defaultHomeSubs,
    awaySubs: defaultAwaySubs,
    activeLineupView: null,
    rosterSize: 11,
  },
  stats: {
    possessionHome: 0,
    shotsHome: 0,
    shotsAway: 0,
    shotsOnTargetHome: 0,
    shotsOnTargetAway: 0,
    cornersHome: 0,
    cornersAway: 0,
    foulsHome: 0,
    foulsAway: 0,
    yellowCardsHome: 0,
    yellowCardsAway: 0,
    redCardsHome: 0,
    redCardsAway: 0,
    xGHome: 0.0,
    xGAway: 0.0,
    activeStatsView: false,
  },
  penaltyShootout: {
    active: false,
    homeAttempts: [],
    awayAttempts: [],
    winner: null,
  },
  activeSubstitution: null,
  activeGoal: null,
  activeCard: null,
  activeVAR: null,
  activeLowerThird: null,
  activeSponsor: {
    type: null,
    logoUrl: '',
    sponsorName: 'Z-raff Tech Solutions',
    promoText: 'Elevating Sports Broadcast Graphics Everywhere',
  },
  activeSocial: null,
  activeReplay: false,
  hideAllGraphics: false,
  hideScoreboard: false,
  hideTimer: false,
  scoreboardStyle: 'classic',
  activeWinnerAnnounce: null,
  activeWelcome: false,
  activeTicker: {
    active: false,
    text: 'BREAKING NEWS: Welcome to the Z-raff Sports Live Broadcast Graphic Console! Fully interactive real-time control system is now live.',
    speed: 'medium',
    theme: 'classic'
  },
};

export function useBroadcast() {
  // Initialize from LocalStorage if available, fallback to DEFAULT_STATE
  const [state, setState] = useState<BroadcastState>(() => {
    try {
      const saved = localStorage.getItem('broadcast_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.settings) {
          return parsed;
        }
      }
    } catch (e) {
      // Ignore
    }
    return DEFAULT_STATE;
  });

  const stateRef = useRef<BroadcastState>(state);
  stateRef.current = state;

  const [isWsConnected, setIsWsConnected] = useState<boolean>(false);
  const [isRestConnected, setIsRestConnected] = useState<boolean>(false);
  const isConnected = isWsConnected || isRestConnected;
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  // Client ID to prevent self-update loops
  const clientId = useRef<string>(Math.random().toString(36).substring(2, 10));

  const isController = typeof window !== 'undefined' && !window.location.pathname.includes('/output');

  const [cloudSyncEnabled, setCloudSyncEnabled] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('syncKey')) {
          return true;
        }
        const host = window.location.hostname;
        if (
          host !== 'localhost' && 
          host !== '127.0.0.1' && 
          host !== '' && 
          !host.startsWith('192.168.') && 
          !host.startsWith('10.')
        ) {
          return true;
        }
      }
      const saved = localStorage.getItem('cloud_sync_enabled');
      if (saved) {
        return saved === 'true';
      }
    } catch (e) {
      // Ignore
    }
    return false;
  });

  const [syncKey, setSyncKey] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlSyncKey = urlParams.get('syncKey');
      if (urlSyncKey) {
        return urlSyncKey;
      }
      try {
        const savedKey = localStorage.getItem('cloud_sync_key');
        if (savedKey) {
          return savedKey;
        }
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let newKey = 'zraff-sync-';
        for (let i = 0; i < 8; i++) {
          newKey += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        localStorage.setItem('cloud_sync_key', newKey);
        return newKey;
      } catch (e) {
        // Ignore
      }
    }
    return '';
  });

  // Sync state helper to both local state & local storage safely
  const setAndPersistState = useCallback((next: BroadcastState) => {
    setState((prev) => {
      if (prev && prev.updatedAt && next && next.updatedAt && next.updatedAt < prev.updatedAt) {
        return prev;
      }
      try {
        localStorage.setItem('broadcast_state', JSON.stringify(next));
      } catch (e) {
        // Ignore
      }
      return next;
    });
  }, []);

  // Fetch initial state via REST API on load to override with live server values if running
  useEffect(() => {
    let active = true;
    const fetchInitialState = async () => {
      try {
        const res = await fetch('/api/state');
        if (!res.ok) {
          setIsRestConnected(false);
          return;
        }
        const data = await res.json();
        if (active && data && typeof data === 'object' && data.settings) {
          setAndPersistState(data);
          setIsRestConnected(true);
        }
      } catch (err) {
        // Silently ignore initial fetch errors (running serverless)
        setIsRestConnected(false);
      }
    };
    fetchInitialState();
    return () => {
      active = false;
    };
  }, [setAndPersistState]);

  // Fetch initial state from cloud sync source (Firestore or fallback ntfy.sh) on active load
  useEffect(() => {
    if (!syncKey) return;
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const hasUrlSyncKey = urlParams?.has('syncKey');
    const shouldFetch = hasUrlSyncKey || cloudSyncEnabled;

    if (!shouldFetch) return;

    let active = true;

    const fetchCloudHistory = async () => {
      const { db: firestoreDb, isMock: isFirebaseMock } = await initFirebase();
      if (!active) return;

      let fetchedFromFirestore = false;

      if (!isFirebaseMock && firestoreDb) {
        try {
          const docSnap = await getDoc(doc(firestoreDb, 'broadcast_states', syncKey));
          if (active && docSnap.exists()) {
            const data = docSnap.data();
            if (data && data.stateJson) {
              const parsedState = JSON.parse(data.stateJson);
              if (parsedState && parsedState.settings) {
                setAndPersistState(parsedState);
                fetchedFromFirestore = true;
              }
            }
          }
        } catch (err) {
          console.error('Failed to fetch initial state from Firestore (falling back to ntfy):', err);
          try {
            handleFirestoreError(err, OperationType.GET, `broadcast_states/${syncKey}`);
          } catch (thrownErr) {
            // Error captured, continue fallback gracefully
          }
        }
      }

      if (!fetchedFromFirestore) {
        try {
          const res = await fetch(`https://ntfy.sh/${syncKey}/json?poll=1`);
          if (!res.ok) return;
          const text = await res.text();
          const lines = text.split('\n').filter(Boolean);
          let latestState = null;
          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              if (data.event === 'message' && data.message) {
                const payload = JSON.parse(data.message);
                if (payload.type === 'STATE_UPDATE' && payload.state) {
                  latestState = payload.state;
                }
              }
            } catch (e) {
              // Ignore parse errors for keepalive or other ntfy events
            }
          }
          if (active && latestState && latestState.settings) {
            setAndPersistState(latestState);
          }
        } catch (err) {
          console.error('Failed to fetch initial cloud sync state from ntfy fallback:', err);
        }
      }
    };

    fetchCloudHistory();

    return () => {
      active = false;
    };
  }, [syncKey, cloudSyncEnabled, setAndPersistState]);

  // Connect to live WebSocket if available
  const connect = useCallback(() => {
    if (socketRef.current) {
      try {
        socketRef.current.onclose = null;
        socketRef.current.onerror = null;
        if (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING) {
          socketRef.current.close();
        }
      } catch (e) {
        // Ignore
      }
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/ws`;
    
    try {
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        setIsWsConnected(true);
        if (reconnectTimeoutRef.current) {
          window.clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'STATE_UPDATE' && data.state) {
            const incomingState = data.state;
            setState((prev) => {
              if (isController && prev && prev.updatedAt && incomingState && incomingState.updatedAt && incomingState.updatedAt < prev.updatedAt) {
                // Server state is older than local state. Send newer local state back to server.
                if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                  socketRef.current.send(JSON.stringify({
                    type: 'UPDATE_STATE',
                    state: prev
                  }));
                }
                return prev;
              }
              try {
                localStorage.setItem('broadcast_state', JSON.stringify(incomingState));
              } catch (e) {}
              return incomingState;
            });

            if (data.state && !data.state.activeReplay) {
              const endReplayEvent = new CustomEvent('broadcast-replay-end');
              window.dispatchEvent(endReplayEvent);
            }
          } else if (data.type === 'TRIGGER_REPLAY') {
            const replayEvent = new CustomEvent('broadcast-replay');
            window.dispatchEvent(replayEvent);
          }
        } catch (err) {
          // Ignore
        }
      };

      socket.onclose = () => {
        setIsWsConnected(false);
        if (reconnectTimeoutRef.current) {
          window.clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = window.setTimeout(() => {
          connect();
        }, 4000);
      };

      socket.onerror = () => {
        try {
          if (socket.readyState === WebSocket.OPEN) {
            socket.close();
          }
        } catch (e) {
          // Ignore
        }
      };
    } catch (e) {
      setIsWsConnected(false);
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
      }
      reconnectTimeoutRef.current = window.setTimeout(() => {
        connect();
      }, 4000);
    }
  }, [isController]);

  useEffect(() => {
    connect();
    return () => {
      if (socketRef.current) {
        try {
          socketRef.current.onclose = null;
          socketRef.current.onerror = null;
          if (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING) {
            socketRef.current.close();
          }
        } catch (e) {
          // Ignore
        }
      }
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  // Cross-tab synchronization via BroadcastChannel for serverless/static environments like Vercel
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const channel = new BroadcastChannel('broadcast_state_sync');
    
    const handleMessage = (event: MessageEvent) => {
      const { type, state: msgState } = event.data;
      if (type === 'STATE_UPDATE' && msgState) {
        setAndPersistState(msgState);
        if (!msgState.activeReplay) {
          const endReplayEvent = new CustomEvent('broadcast-replay-end');
          window.dispatchEvent(endReplayEvent);
        }
      } else if (type === 'TRIGGER_REPLAY') {
        const replayEvent = new CustomEvent('broadcast-replay');
        window.dispatchEvent(replayEvent);
      }
    };
    
    channel.addEventListener('message', handleMessage);
    
    return () => {
      channel.removeEventListener('message', handleMessage);
      channel.close();
    };
  }, [setAndPersistState]);

  // HTTP polling fallback when WebSocket is not connected or fails
  useEffect(() => {
    if (isWsConnected) {
      setIsRestConnected(false);
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/state');
        if (!res.ok) {
          setIsRestConnected(false);
          return;
        }
        const data = await res.json();
        if (data && typeof data === 'object' && data.settings) {
          const incomingState = data;
          setState((prev) => {
            if (isController && prev && prev.updatedAt && incomingState && incomingState.updatedAt && incomingState.updatedAt < prev.updatedAt) {
              // Server state is older than local state. POST newer local state back to server.
              fetch('/api/state', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(prev),
              }).catch(() => {});
              return prev;
            }
            try {
              localStorage.setItem('broadcast_state', JSON.stringify(incomingState));
            } catch (e) {}
            return incomingState;
          });
          setIsRestConnected(true);
        }
      } catch (err) {
        setIsRestConnected(false);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isWsConnected, isController]);

  // Helper to publish updates to Firestore or fallback ntfy.sh Cloud Sync topic
  const publishToCloud = useCallback(async (payload: any) => {
    if (!syncKey) return;

    // Attach sender ID to payload to prevent infinite self-reverberation loops
    payload.sender = clientId.current;

    const { db: firestoreDb, isMock: isFirebaseMock } = await initFirebase();

    if (!isFirebaseMock && firestoreDb) {
      try {
        await setDoc(doc(firestoreDb, 'broadcast_states', syncKey), {
          syncKey,
          updatedAt: new Date().toISOString(),
          // Store raw state JSON for backward compatibility
          stateJson: payload.type === 'STATE_UPDATE' && payload.state ? JSON.stringify(payload.state) : null,
          // Store complete unified action payload for replay, score updates, etc.
          lastPayloadJson: JSON.stringify(payload)
        });
      } catch (err) {
        console.error('Firestore failed to save state:', err);
        try {
          handleFirestoreError(err, OperationType.WRITE, `broadcast_states/${syncKey}`);
        } catch (thrown) {}
      }
    }

    // ALWAYS publish to ntfy.sh in background for dual-channel absolute synchronization
    fetch(`https://ntfy.sh/${syncKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify(payload),
    }).catch((err) => {
      console.error('Cloud Sync failed to publish to ntfy:', err);
    });
  }, [syncKey]);

  // Local client-side timer tick backup (important for Vercel/serverless where server ticker is absent)
  useEffect(() => {
    if (isConnected) return; // If connected to active server, prioritize server authoritative clock
    if (!state.timer.isRunning) return;

    const t = setInterval(() => {
      setState((prev) => {
        const nextSecs = prev.timer.timeSeconds + 1;
        const updated = {
          ...prev,
          timer: {
            ...prev.timer,
            timeSeconds: nextSecs,
          },
        };
        try {
          localStorage.setItem('broadcast_state', JSON.stringify(updated));
        } catch (e) {
          // Ignore
        }
        
        // Notify other tabs immediately of the new second ticker
        if (typeof window !== 'undefined') {
          const channel = new BroadcastChannel('broadcast_state_sync');
          channel.postMessage({ type: 'STATE_UPDATE', state: updated });
          channel.close();
        }

        // If Cloud Sync is enabled, and we are the controller, publish a sync update every 5 seconds
        if (cloudSyncEnabled && isController && nextSecs % 5 === 0) {
          publishToCloud({
            type: 'STATE_UPDATE',
            state: updated,
          });
        }

        return updated;
      });
    }, 1000);

    return () => clearInterval(t);
  }, [isConnected, state.timer.isRunning, cloudSyncEnabled, publishToCloud, isController]);

  // Subscribe to Cloud Sync stream (Firestore or fallback ntfy.sh SSE)
  useEffect(() => {
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const hasUrlSyncKey = urlParams?.has('syncKey');
    const shouldSubscribe = syncKey && (hasUrlSyncKey || cloudSyncEnabled);

    if (!shouldSubscribe) return;

    let unsubFirestore: (() => void) | null = null;
    let sse: EventSource | null = null;
    let reconnectTimeout: number | null = null;
    let active = true;

    const startSubscription = async () => {
      const { db: firestoreDb, isMock: isFirebaseMock } = await initFirebase();
      if (!active) return;

      const connectSse = () => {
        try {
          if (sse) sse.close();
          sse = new EventSource(`https://ntfy.sh/${syncKey}/sse`);

          sse.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              if (data.event === 'message' && data.message) {
                const payload = JSON.parse(data.message);
                
                // Skip if sent by our own client instance
                if (payload.sender === clientId.current) {
                  return;
                }

                if (payload.type === 'STATE_UPDATE' && payload.state) {
                  if (payload.state.settings) {
                    setAndPersistState(payload.state);
                    if (!payload.state.activeReplay) {
                      const endReplayEvent = new CustomEvent('broadcast-replay-end');
                      window.dispatchEvent(endReplayEvent);
                    }
                  }
                } else if (payload.type === 'TRIGGER_REPLAY') {
                  const replayEvent = new CustomEvent('broadcast-replay');
                  window.dispatchEvent(replayEvent);
                }
              }
            } catch (err) {
              // Ignore parse errors
            }
          };

          sse.onerror = () => {
            if (sse) sse.close();
            reconnectTimeout = window.setTimeout(() => {
              if (active) connectSse();
            }, 3000);
          };
        } catch (e) {
          console.error('Failed to establish Cloud Sync EventSource:', e);
        }
      };

      if (!isFirebaseMock && firestoreDb) {
        console.log('Establishing Firestore real-time listener for syncKey:', syncKey);
        try {
          unsubFirestore = onSnapshot(doc(firestoreDb, 'broadcast_states', syncKey), (docSnap) => {
            if (!active) return;
            if (docSnap.exists()) {
              const data = docSnap.data();
              if (data) {
                // Parse the complete unified payload first if available
                if (data.lastPayloadJson) {
                  try {
                    const payload = JSON.parse(data.lastPayloadJson);
                    if (payload.sender === clientId.current) return; // Prevent self-update loop

                    if (payload.type === 'STATE_UPDATE' && payload.state) {
                      if (payload.state.settings) {
                        setAndPersistState(payload.state);
                        if (!payload.state.activeReplay) {
                          const endReplayEvent = new CustomEvent('broadcast-replay-end');
                          window.dispatchEvent(endReplayEvent);
                        }
                      }
                    } else if (payload.type === 'TRIGGER_REPLAY') {
                      const replayEvent = new CustomEvent('broadcast-replay');
                      window.dispatchEvent(replayEvent);
                    }
                  } catch (e) {
                    console.error('Failed to parse Firestore lastPayloadJson:', e);
                  }
                } else if (data.stateJson) {
                  // Fallback for older schemas
                  try {
                    const parsedState = JSON.parse(data.stateJson);
                    if (parsedState && parsedState.settings) {
                      setAndPersistState(parsedState);
                      if (!parsedState.activeReplay) {
                        const endReplayEvent = new CustomEvent('broadcast-replay-end');
                        window.dispatchEvent(endReplayEvent);
                      }
                    }
                  } catch (e) {
                    console.error('Failed to parse Firestore stateJson:', e);
                  }
                }
              }
            }
          }, (err) => {
            console.error('Firestore real-time subscription error (falling back to ntfy SSE):', err);
            try {
              handleFirestoreError(err, OperationType.GET, `broadcast_states/${syncKey}`);
            } catch (thrownErr) {
              // Captured error, fallback gracefully
            }
            if (active) {
              connectSse();
            }
          });
        } catch (err) {
          console.error('Failed to setup Firestore listener (falling back to ntfy SSE):', err);
          if (active) {
            connectSse();
          }
        }
      } else {
        console.log('Establishing SSE ntfy.sh fallback listener for syncKey:', syncKey);
        connectSse();
      }
    };

    startSubscription();

    return () => {
      active = false;
      if (unsubFirestore) {
        unsubFirestore();
      }
      if (sse) {
        sse.close();
      }
      if (reconnectTimeout) {
        window.clearTimeout(reconnectTimeout);
      }
    };
  }, [syncKey, cloudSyncEnabled, setAndPersistState]);

  const updateState = useCallback((updater: BroadcastState | ((prev: BroadcastState) => BroadcastState)) => {
    const prev = stateRef.current;
    const rawNext = typeof updater === 'function' ? updater(prev) : updater;
    const nextState = { ...rawNext, updatedAt: Date.now() };

    setState(nextState);

    // 1. Save to LocalStorage for offline persistence
    try {
      localStorage.setItem('broadcast_state', JSON.stringify(nextState));
    } catch (e) {
      // Ignore
    }

    // 2. Broadcast via BroadcastChannel to other local tabs
    if (typeof window !== 'undefined') {
      const channel = new BroadcastChannel('broadcast_state_sync');
      channel.postMessage({ type: 'STATE_UPDATE', state: nextState });
      channel.close();
    }

    // 3. Sync with live WebSocket server if connected
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'UPDATE_STATE',
        state: nextState,
      }));
    } else {
      // REST API backup sync
      fetch('/api/state', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nextState),
      }).catch(() => {
        // Silent catch
      });
    }

    // 4. Sync via Cloud Sync if enabled
    if (cloudSyncEnabled) {
      publishToCloud({
        type: 'STATE_UPDATE',
        state: nextState,
      });
    }
  }, [cloudSyncEnabled, publishToCloud]);

  const triggerReplay = useCallback(() => {
    // 1. Send over BroadcastChannel instantly
    if (typeof window !== 'undefined') {
      const channel = new BroadcastChannel('broadcast_state_sync');
      channel.postMessage({ type: 'TRIGGER_REPLAY' });
      channel.close();
    }
    
    // 2. Dispatch local event instantly
    const replayEvent = new CustomEvent('broadcast-replay');
    window.dispatchEvent(replayEvent);

    // 3. Dispatch to live server
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'TRIGGER_REPLAY' }));
    } else {
      fetch('/api/replay', { method: 'POST' }).catch(() => {});
    }

    // 4. Sync via Cloud Sync if enabled
    if (cloudSyncEnabled) {
      publishToCloud({ type: 'TRIGGER_REPLAY' });
    }
  }, [cloudSyncEnabled, publishToCloud]);

  const clearOverlays = useCallback(() => {
    updateState((prev) => ({
      ...prev,
      activeSubstitution: null,
      activeGoal: null,
      activeCard: null,
      activeVAR: null,
      activeLowerThird: null,
      activeSocial: null,
      activeReplay: false,
      hideScoreboard: false,
      hideTimer: false,
      stats: {
        ...prev.stats,
        activeStatsView: false,
      },
      lineups: {
        ...prev.lineups,
        activeLineupView: null,
      },
      penaltyShootout: {
        ...prev.penaltyShootout,
        active: false,
      },
      activeSponsor: {
        ...prev.activeSponsor,
        type: null,
      },
      activeWinnerAnnounce: null
    }));
  }, [updateState]);

  return {
    state,
    updateState,
    triggerReplay,
    clearOverlays,
    isConnected,
    cloudSyncEnabled,
    setCloudSyncEnabled: (enabled: boolean) => {
      setCloudSyncEnabled(enabled);
      try {
        localStorage.setItem('cloud_sync_enabled', String(enabled));
      } catch (e) {}
    },
    syncKey,
    setSyncKey: (key: string) => {
      setSyncKey(key);
      try {
        localStorage.setItem('cloud_sync_key', key);
      } catch (e) {}
    },
  };
}
