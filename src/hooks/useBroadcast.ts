import { useState, useEffect, useRef, useCallback } from 'react';
import { BroadcastState, Player } from '../types.js';
import { db } from '../lib/firebase.js';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

// Default mock players
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
    homeTeamShort: 'LDR',
    awayTeamShort: 'LDB',
    homeLogo: '',
    awayLogo: '',
    leagueName: 'Z-raff Premier Trophy',
    location: 'Emirates Arena, London',
    referee: 'Michael Oliver',
    kickoffTime: '20:00 BST',
    competitionLogo: '',
    season: '2026/27',
    homeColor: '#EF4444',
    awayColor: '#3B82F6',
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
    customStatus: null,
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
  hideClassicScoreboard: false,
  hideWorldcupScoreboard: false,
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

// Firestore error logging and type checking utilities conforming to the firebase-integration skill
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
    },
    operationType,
    path
  };
  console.error('[Firestore Error]:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function useBroadcast() {
  // Initialize from LocalStorage if available, fallback to DEFAULT_STATE
  const [state, setState] = useState<BroadcastState>(() => {
    try {
      const saved = localStorage.getItem('broadcast_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.settings) {
          if (!parsed.settings.homeTeamShort) {
            parsed.settings.homeTeamShort = (parsed.settings.homeTeam || 'HOME').substring(0, 3).toUpperCase();
          }
          if (!parsed.settings.awayTeamShort) {
            parsed.settings.awayTeamShort = (parsed.settings.awayTeam || 'AWAY').substring(0, 3).toUpperCase();
          }
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

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const isController = typeof window !== 'undefined' && !window.location.pathname.includes('/output');

  const [cloudSyncEnabled, setCloudSyncEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('cloud_sync_enabled');
      return saved !== 'false'; // Default to true
    } catch (e) {
      return true;
    }
  });

  const [syncKey, setSyncKey] = useState<string>(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const urlKey = params.get('key');
        if (urlKey) {
          // Keep it in localStorage for future default/resilience
          try {
            localStorage.setItem('cloud_sync_key', urlKey);
          } catch (e) {}
          return urlKey;
        }
      }
      const saved = localStorage.getItem('cloud_sync_key');
      return saved || 'zraff-sports-global-sync';
    } catch (e) {
      return 'zraff-sports-global-sync';
    }
  });

  // Sync state helper to both local state & local storage safely
  const setAndPersistState = useCallback((next: BroadcastState) => {
    setState((prev) => {
      if (isController && prev && prev.updatedAt && next && next.updatedAt && next.updatedAt < prev.updatedAt) {
        return prev;
      }
      try {
        localStorage.setItem('broadcast_state', JSON.stringify(next));
      } catch (e) {
        // Ignore
      }
      return next;
    });
  }, [isController]);

  // Debouncing publication ref
  const debounceTimeoutRef = useRef<any>(null);

  // Helper to publish updates over Firestore
  const publishToFirestore = useCallback((nextState: BroadcastState, instant = false) => {
    if (!cloudSyncEnabled) return;

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    const performWrite = async () => {
      try {
        const docRef = doc(db, 'broadcast_states', syncKey);
        await setDoc(docRef, {
          syncKey,
          updatedAt: new Date().toISOString(),
          stateJson: JSON.stringify(nextState)
        });
        setIsConnected(true);
      } catch (err) {
        setIsConnected(false);
        handleFirestoreError(err, OperationType.WRITE, `broadcast_states/${syncKey}`);
      }
    };

    if (instant) {
      performWrite();
    } else {
      // Debounce inputs by 150ms for performance and Firebase quota protection
      debounceTimeoutRef.current = setTimeout(performWrite, 150);
    }
  }, [cloudSyncEnabled, syncKey]);

  // Local client-side timer tick
  useEffect(() => {
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
        
        // Notify other tabs immediately
        if (typeof window !== 'undefined') {
          const channel = new BroadcastChannel('broadcast_state_sync');
          channel.postMessage({ type: 'STATE_UPDATE', state: updated });
          channel.close();
        }

        // Publish over Firestore periodically (every 5 seconds) to keep overlays in sync
        if (cloudSyncEnabled && isController && nextSecs % 5 === 0) {
          publishToFirestore(updated, true);
        }

        return updated;
      });
    }, 1000);

    return () => clearInterval(t);
  }, [state.timer.isRunning, cloudSyncEnabled, publishToFirestore, isController]);

  // Cross-tab synchronization via BroadcastChannel for instant same-browser syncing
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
      }
    };
    
    channel.addEventListener('message', handleMessage);
    
    return () => {
      channel.removeEventListener('message', handleMessage);
      channel.close();
    };
  }, [setAndPersistState]);

  // Subscribe to Firestore events
  useEffect(() => {
    if (!cloudSyncEnabled) {
      setIsConnected(false);
      return;
    }

    const docRef = doc(db, 'broadcast_states', syncKey);
    console.log(`[Firestore] Subscribing to sync channel: ${syncKey}`);

    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      setIsConnected(true);
      if (!snapshot.exists()) {
        // If the document doesn't exist yet, we can seed it if we are the controller
        if (isController) {
          console.log('[Firestore] Document does not exist. Seeding initial state...');
          setDoc(docRef, {
            syncKey,
            updatedAt: new Date().toISOString(),
            stateJson: JSON.stringify(stateRef.current)
          }).catch(err => {
            console.error('Error seeding document:', err);
          });
        }
        return;
      }

      const data = snapshot.data();
      if (data && data.stateJson) {
        try {
          const parsed = JSON.parse(data.stateJson);
          if (parsed && typeof parsed === 'object') {
            // Compare updatedAt to avoid cycles where the controller updates itself with older data
            if (parsed.updatedAt && (!stateRef.current.updatedAt || parsed.updatedAt > stateRef.current.updatedAt)) {
              if (parsed.settings) {
                if (!parsed.settings.homeTeamShort) {
                  parsed.settings.homeTeamShort = (parsed.settings.homeTeam || 'HOME').substring(0, 3).toUpperCase();
                }
                if (!parsed.settings.awayTeamShort) {
                  parsed.settings.awayTeamShort = (parsed.settings.awayTeam || 'AWAY').substring(0, 3).toUpperCase();
                }
              }

              // Trigger replay event locally if replay trigger timestamp changed
              if (parsed.replayTriggeredAt && parsed.replayTriggeredAt !== stateRef.current.replayTriggeredAt) {
                const replayEvent = new CustomEvent('broadcast-replay');
                window.dispatchEvent(replayEvent);
              }

              setAndPersistState(parsed);
            }
          }
        } catch (err) {
          console.error('Error parsing synced stateJson:', err);
        }
      }
    }, (error) => {
      console.error('Firestore snapshot subscription error:', error);
      setIsConnected(false);
    });

    return () => {
      unsubscribe();
    };
  }, [cloudSyncEnabled, syncKey, isController, setAndPersistState]);

  const updateState = useCallback((updater: BroadcastState | ((prev: BroadcastState) => BroadcastState)) => {
    const prev = stateRef.current;
    const rawNext = typeof updater === 'function' ? updater(prev) : updater;
    const nextState = { ...rawNext, updatedAt: Date.now() };

    setState(nextState);

    // 1. Save to LocalStorage
    try {
      localStorage.setItem('broadcast_state', JSON.stringify(nextState));
    } catch (e) {
      // Ignore
    }

    // 2. Broadcast to other tabs
    if (typeof window !== 'undefined') {
      const channel = new BroadcastChannel('broadcast_state_sync');
      channel.postMessage({ type: 'STATE_UPDATE', state: nextState });
      channel.close();
    }

    // 3. Sync via Firestore
    if (cloudSyncEnabled) {
      // Detect if it is an instant action (e.g. timer toggle) to bypass debouncing
      const isTimerToggle = prev.timer.isRunning !== nextState.timer.isRunning || 
                            prev.timer.period !== nextState.timer.period;
      publishToFirestore(nextState, isTimerToggle);
    }
  }, [cloudSyncEnabled, publishToFirestore]);

  const triggerReplay = useCallback(() => {
    const nextState = {
      ...stateRef.current,
      activeReplay: true,
      replayTriggeredAt: Date.now(),
      updatedAt: Date.now()
    };

    setState(nextState);

    // 1. Save locally
    try {
      localStorage.setItem('broadcast_state', JSON.stringify(nextState));
    } catch (e) {}

    // 2. Broadcast to other tabs
    if (typeof window !== 'undefined') {
      const channel = new BroadcastChannel('broadcast_state_sync');
      channel.postMessage({ type: 'STATE_UPDATE', state: nextState });
      channel.close();
    }

    // 3. Dispatch local event
    const replayEvent = new CustomEvent('broadcast-replay');
    window.dispatchEvent(replayEvent);

    // 4. Publish to Firestore instantly
    if (cloudSyncEnabled) {
      publishToFirestore(nextState, true);
    }
  }, [cloudSyncEnabled, publishToFirestore]);

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
      hideClassicScoreboard: false,
      hideWorldcupScoreboard: false,
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

