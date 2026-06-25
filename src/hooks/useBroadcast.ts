import { useState, useEffect, useRef, useCallback } from 'react';
import { BroadcastState } from '../types.js';

export function useBroadcast() {
  const [state, setState] = useState<BroadcastState | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  // Fetch initial state via REST API on load to make sure UI is immediately usable
  useEffect(() => {
    let active = true;
    const fetchInitialState = async () => {
      try {
        const res = await fetch('/api/state');
        if (!res.ok) return;
        const data = await res.json();
        if (active) {
          setState(data);
        }
      } catch (err) {
        // Silently ignore initial fetch errors
      }
    };
    fetchInitialState();
    return () => {
      active = false;
    };
  }, []);

  const connect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    // Attempt standard connection quietly
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
        if (data.type === 'STATE_UPDATE') {
          setState(data.state);
          if (data.state && !data.state.activeReplay) {
            // Stop replay effect if state indicates it's finished
            const endReplayEvent = new CustomEvent('broadcast-replay-end');
            window.dispatchEvent(endReplayEvent);
          }
        } else if (data.type === 'TRIGGER_REPLAY') {
          // Trigger custom local event for instant replay visual effect
          const replayEvent = new CustomEvent('broadcast-replay');
          window.dispatchEvent(replayEvent);
        }
      } catch (err) {
        // Silently skip parse exceptions
      }
    };

    socket.onclose = () => {
      setIsConnected(false);
      // Attempt reconnection after 3 seconds quietly
      reconnectTimeoutRef.current = window.setTimeout(() => {
        connect();
      }, 3000);
    };

    socket.onerror = () => {
      // Gracefully close to trigger retry without logging console errors
      socket.close();
    };
  }, []);

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

  // HTTP polling fallback when WebSocket is not connected or fails
  useEffect(() => {
    if (isConnected) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/state');
        if (!res.ok) return;
        const data = await res.json();
        setState(data);
      } catch (err) {
        // Silent
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isConnected]);

  const updateState = useCallback((updater: BroadcastState | ((prev: BroadcastState) => BroadcastState)) => {
    if (!state) return;
    const nextState = typeof updater === 'function' ? updater(state) : updater;
    
    // Optimistic local state update
    setState(nextState);

    // Broadcast to server via socket or fall back to REST API
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'UPDATE_STATE',
        state: nextState,
      }));
    } else {
      // REST API fallback
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
  }, [state]);

  const triggerReplay = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'TRIGGER_REPLAY' }));
    } else {
      // REST API fallback
      fetch('/api/replay', { method: 'POST' }).catch(() => {});
    }
  }, []);

  const clearOverlays = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'CLEAR_OVERLAYS' }));
    } else {
      // Local state fallback + API sync
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
    isConnected: isConnected || !!state, // Mark as connected if we have valid state synced
  };
}
