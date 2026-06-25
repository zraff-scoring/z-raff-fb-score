import express from 'express';
import { createServer as createHttpServer } from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import { BroadcastState, Player } from './src/types.js';

// Default mock players
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

const initialBroadcastState: BroadcastState = {
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

let currentState: BroadcastState = { ...initialBroadcastState };

// Helper to start/stop the server timer interval
let timerInterval: NodeJS.Timeout | null = null;
let wss: WebSocketServer;

function broadcast(eventData: any) {
  if (wss) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(eventData));
      }
    });
  }
}

function handleTimerTick() {
  if (currentState.timer.isRunning) {
    currentState.timer.timeSeconds += 1;
    
    // Broadcast state update on every tick so timer is synchronized exactly
    broadcast({ type: 'STATE_UPDATE', state: currentState });
  } else {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }
}

function startTimerInterval() {
  if (!timerInterval) {
    timerInterval = setInterval(handleTimerTick, 1000);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.use(express.json());

  // API REST Endpoints for easier controls (backup / redundancy)
  app.get('/api/state', (req, res) => {
    res.json(currentState);
  });

  app.post('/api/state', (req, res) => {
    currentState = { ...currentState, ...req.body };
    
    // Manage timer interval based on running status
    if (currentState.timer.isRunning) {
      startTimerInterval();
    } else {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
    }
    
    broadcast({ type: 'STATE_UPDATE', state: currentState });
    res.json({ success: true, state: currentState });
  });

  app.post('/api/reset', (req, res) => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    currentState = JSON.parse(JSON.stringify(initialBroadcastState));
    broadcast({ type: 'STATE_UPDATE', state: currentState });
    res.json({ success: true, state: currentState });
  });

  app.post('/api/replay', (req, res) => {
    broadcast({ type: 'TRIGGER_REPLAY' });
    res.json({ success: true });
  });

  // Setup Server-Sent Events (SSE) fallback for ultra-stable OBS stream if sockets drop
  app.get('/api/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    const sendEvent = (data: any) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    sendEvent({ type: 'STATE_UPDATE', state: currentState });

    const interval = setInterval(() => {
      sendEvent({ type: 'HEARTBEAT' });
    }, 15000);

    req.on('close', () => {
      clearInterval(interval);
    });
  });

  const httpServer = createHttpServer(app);

  // Initialize WebSockets
  wss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });

  wss.on('connection', (ws: WebSocket) => {
    // Immediately send current state on connection
    ws.send(JSON.stringify({ type: 'STATE_UPDATE', state: currentState }));

    ws.on('message', (message: string) => {
      try {
        const event = JSON.parse(message);
        
        if (event.type === 'UPDATE_STATE') {
          currentState = event.state;
          
          // Sync timer status
          if (currentState.timer.isRunning) {
            startTimerInterval();
          } else {
            if (timerInterval) {
              clearInterval(timerInterval);
              timerInterval = null;
            }
          }
          
          broadcast({ type: 'STATE_UPDATE', state: currentState });
        } else if (event.type === 'TRIGGER_REPLAY') {
          broadcast({ type: 'TRIGGER_REPLAY' });
        } else if (event.type === 'CLEAR_OVERLAYS') {
          currentState.activeSubstitution = null;
          currentState.activeGoal = null;
          currentState.activeCard = null;
          currentState.activeVAR = null;
          currentState.activeLowerThird = null;
          currentState.activeSocial = null;
          currentState.activeReplay = false;
          currentState.hideScoreboard = false;
          currentState.hideTimer = false;
          if (currentState.stats) currentState.stats.activeStatsView = false;
          if (currentState.lineups) currentState.lineups.activeLineupView = null;
          if (currentState.penaltyShootout) currentState.penaltyShootout.active = false;
          if (currentState.activeSponsor) currentState.activeSponsor.type = null;
          currentState.activeWinnerAnnounce = null;
          
          broadcast({ type: 'STATE_UPDATE', state: currentState });
        }
      } catch (err) {
        console.error('Failed to process WS message:', err);
      }
    });
  });

  // Integrate Vite for single-page React app rendering
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`[Z-RAFF SPORTS SERVER] Running live on http://localhost:${PORT}`);
  });
}

startServer();
