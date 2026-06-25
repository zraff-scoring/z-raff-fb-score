import { useState, useEffect, useRef, useCallback } from 'react';
import { BroadcastState, Player } from '../types.js';

// Default mock players matching the server setup
const defaultHomeXI: Player[] = [
  { id: 'h1', name: 'Aaron Ramsdale', number: 1, position: 'GK', x: 10, y: 50 },
  { id: 'h2', name: 'Ben White', number: 4, position: 'DF', x: 30, y: 15 },
  { id: 'h3', name: 'William Saliba', number: 2, position: 'DF', x: 30, y: 38 },
  { id: 'h4', name: 'Gabriel Magalhães', number: 6, position: 'DF', x: 30, y: 62 },
  { id: 'h5', name: 'Oleksandr Zinchenko', number: 35, position: 'DF', x: 30, y: 85 },
  { id: 'h6', name: 'Declan Rice', number: 41, position: 'MF', x: 55, y: 30 },
  { id: 'h7', name: 'Martin Ødegaard', number: 8, position: 'MF', x: 55, y: 70 },
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
  { id: 'a2', name: 'Reece James', number: 24, position: 'DF', x: 30, y: 15 },
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
    homeLogo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=120&auto=format&fit=crop&q=60',
    awayLogo: 'https://images.unsplash.com/photo-1540747737956-37872a7e937a?w=120&auto=format&fit=crop&q=60',
    leagueName: 'Z-raff Premier Trophy',
    location: 'Emirates Arena, London',
    referee: 'Michael Oliver',
    kickoffTime: '20:00 BST',
    competitionLogo: '🏆',
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
  },
  stats: {
    possessionHome: 50,
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
    logoUrl: '⭐',
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

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  // Sync state helper to both local state & local storage safely
  const setAndPersistState = useCallback((next: BroadcastState) => {
    setState(next);
    try {
      localStorage.setItem('broadcast_state', JSON.stringify(next));
    } catch (e) {
      // Ignore
    }
  }, []);

  // Fetch initial state via REST API on load to override with live server values if running
  useEffect(() => {
    let active = true;
    const fetchInitialState = async () => {
      try {
        const res = await fetch('/api/state');
        if (!res.ok) return;
        const data = await res.json();
        if (active && data && typeof data === 'object' && data.settings) {
          setAndPersistState(data);
        }
      } catch (err) {
        // Silently ignore initial fetch errors (running serverless)
      }
    };
    fetchInitialState();
    return () => {
      active = false;
    };
  }, [setAndPersistState]);

  // Connect to live WebSocket if available
  const connect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'STATE_UPDATE' && data.state) {
          setAndPersistState(data.state);
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
      setIsConnected(false);
      reconnectTimeoutRef.current = window.setTimeout(() => {
        connect();
      }, 3000);
    };

    socket.onerror = () => {
      socket.close();
    };
  }, [setAndPersistState]);

  useEffect(() => {
    connect();
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
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
    if (isConnected) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/state');
        if (!res.ok) return;
        const data = await res.json();
        if (data && typeof data === 'object' && data.settings) {
          setAndPersistState(data);
        }
      } catch (err) {
        // Silent (running offline/standalone)
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isConnected, setAndPersistState]);

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

        return updated;
      });
    }, 1000);

    return () => clearInterval(t);
  }, [isConnected, state.timer.isRunning]);

  const updateState = useCallback((updater: BroadcastState | ((prev: BroadcastState) => BroadcastState)) => {
    setState((prev) => {
      const nextState = typeof updater === 'function' ? updater(prev) : updater;
      
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

      return nextState;
    });
  }, []);

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
  }, []);

  const clearOverlays = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'CLEAR_OVERLAYS' }));
    } else {
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
    }
  }, [updateState]);

  return {
    state,
    updateState,
    triggerReplay,
    clearOverlays,
    isConnected,
  };
}
