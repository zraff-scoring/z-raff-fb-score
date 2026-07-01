import express from 'express';
import http from 'http';
import path from 'path';
import cors from 'cors';
import { Server } from 'socket.io';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = 3000;

  // Configure CORS
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  }));

  // Setup Socket.IO with wild-card CORS for OBS overlays
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 30000,
    pingInterval: 15000,
    allowEIO3: true
  });

  // Server-side state cache
  let currentBroadcastState: any = null;

  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Immediately send the latest state to the newly connected client
    if (currentBroadcastState) {
      socket.emit('STATE_UPDATE', currentBroadcastState);
    }

    // Handle full state updates
    socket.on('STATE_UPDATE', (state: any) => {
      currentBroadcastState = state;
      // Broadcast to all other connected clients
      socket.broadcast.emit('STATE_UPDATE', state);
    });

    // Handle replay triggers
    socket.on('TRIGGER_REPLAY', () => {
      io.emit('TRIGGER_REPLAY');
    });

    // Handle clear overlays trigger
    socket.on('CLEAR_OVERLAYS', () => {
      io.emit('CLEAR_OVERLAYS');
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  // Health check API endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', clientsConnected: io.engine.clientsCount });
  });

  // Dev vs Production Routing
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Dev] Initializing Vite middleware mode...');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : { server }
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('[Prod] Serving production static assets from /dist...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`🟢 Broadcast Control Server running on http://0.0.0.0:${PORT}`);
    console.log(`🟢 WebSocket Sync endpoint is active via Socket.IO`);
    console.log(`====================================================`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting Broadcast Control Server:', err);
  process.exit(1);
});
