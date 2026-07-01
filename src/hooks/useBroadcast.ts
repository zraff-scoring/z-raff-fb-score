import { useState, useEffect, useRef, useCallback } from 'react';
import { BroadcastState, Player } from '../types.js';
import { io, Socket } from 'socket.io-client';

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

// WebSocket server connection URL resolver
const getSocketUrl = (): string => {
  const envUrl = import.meta.env.VITE_WEBSOCKET_URL;
  if (envUrl) return envUrl;
  
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'http://localhost:3000';
};

// Socket.IO singleton instance
let socketInstance: Socket | null = null;

const getSocket = (): Socket | null => {
  if (typeof window === 'undefined') return null;
  if (!socketInstance) {
    const url = getSocketUrl();
    console.log(`[Socket] Connecting Socket.IO client to: ${url}`);
    socketInstance = io(url, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true,
    });
  }
  return socketInstance;
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

  // Helper to publish updates over WebSockets
  const publishToWebSocket = useCallback((payload: any) => {
    if (!cloudSyncEnabled) return;
    const s = getSocket();
    if (!s || !s.connected) return;

    if (payload.type === 'STATE_UPDATE' && payload.state) {
      // For timer toggles or period shifts, send instantly
      const prevTimerState = stateRef.current.timer;
      const isTimerToggle = prevTimerState.isRunning !== payload.state.timer.isRunning || 
                            prevTimerState.period !== payload.state.timer.period;

      if (isTimerToggle) {
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }
        s.emit('STATE_UPDATE', payload.state);
        return;
      }

      // Debounce continuous controls (such as sliders and text fields) by 150ms
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      debounceTimeoutRef.current = setTimeout(() => {
        s.emit('STATE_UPDATE', payload.state);
      }, 150);
    } else if (payload.type === 'TRIGGER_REPLAY') {
      s.emit('TRIGGER_REPLAY');
    } else if (payload.type === 'CLEAR_OVERLAYS') {
      s.emit('CLEAR_OVERLAYS');
    }
  }, [cloudSyncEnabled]);

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

        // Publish over WebSocket periodically (every 5 seconds) to keep overlays in sync
        if (cloudSyncEnabled && isController && nextSecs % 5 === 0) {
          publishToWebSocket({
            type: 'STATE_UPDATE',
            state: updated,
          });
        }

        return updated;
      });
    }, 1000);

    return () => clearInterval(t);
  }, [state.timer.isRunning, cloudSyncEnabled, publishToWebSocket, isController]);

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

  // Subscribe to Socket.IO events
  useEffect(() => {
    if (!cloudSyncEnabled) {
      setIsConnected(false);
      return;
    }

    const s = getSocket();
    if (!s) return;

    setIsConnected(s.connected);

    const onConnect = () => {
      console.log('[Socket] Connected to WebSocket Server successfully');
      setIsConnected(true);
      
      // Seed initial state if we are the control panel to set the server's cache
      if (isController) {
        s.emit('STATE_UPDATE', stateRef.current);
      }
    };

    const onDisconnect = () => {
      console.log('[Socket] Disconnected from WebSocket Server');
      setIsConnected(false);
    };

    const onStateUpdate = (serverState: BroadcastState) => {
      if (serverState && serverState.settings) {
        setAndPersistState(serverState);
        if (!serverState.activeReplay) {
          const endReplayEvent = new CustomEvent('broadcast-replay-end');
          window.dispatchEvent(endReplayEvent);
        }
      }
    };

    const onTriggerReplay = () => {
      const replayEvent = new CustomEvent('broadcast-replay');
      window.dispatchEvent(replayEvent);
    };

    const onClearOverlays = () => {
      clearOverlays();
    };

    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    s.on('STATE_UPDATE', onStateUpdate);
    s.on('TRIGGER_REPLAY', onTriggerReplay);
    s.on('CLEAR_OVERLAYS', onClearOverlays);

    // If socket is already connected when this mounts, trigger onConnect manually
    if (s.connected) {
      onConnect();
    }

    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
      s.off('STATE_UPDATE', onStateUpdate);
      s.off('TRIGGER_REPLAY', onTriggerReplay);
      s.off('CLEAR_OVERLAYS', onClearOverlays);
    };
  }, [cloudSyncEnabled, isController, setAndPersistState]);

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

    // 3. Sync via WebSocket
    if (cloudSyncEnabled) {
      publishToWebSocket({
        type: 'STATE_UPDATE',
        state: nextState,
      });
    }
  }, [cloudSyncEnabled, publishToWebSocket]);

  const triggerReplay = useCallback(() => {
    // 1. Send over BroadcastChannel
    if (typeof window !== 'undefined') {
      const channel = new BroadcastChannel('broadcast_state_sync');
      channel.postMessage({ type: 'TRIGGER_REPLAY' });
      channel.close();
    }
    
    // 2. Dispatch local event
    const replayEvent = new CustomEvent('broadcast-replay');
    window.dispatchEvent(replayEvent);

    // 3. Sync via WebSocket
    if (cloudSyncEnabled) {
      publishToWebSocket({ type: 'TRIGGER_REPLAY' });
    }
  }, [cloudSyncEnabled, publishToWebSocket]);

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

    const s = getSocket();
    if (s && s.connected && cloudSyncEnabled) {
      s.emit('CLEAR_OVERLAYS');
    }
  }, [updateState, cloudSyncEnabled]);

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
