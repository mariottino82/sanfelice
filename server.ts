import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Mock data for testing without SQLite
  const members = [
    { id: 1, name: 'Mario Rossi', email: 'mario@example.com', status: 'attivo' },
    { id: 2, name: 'Luigi Verdi', email: 'luigi@example.com', status: 'attivo' }
  ];

  app.get('/api/members', (req, res) => {
    res.json(members);
  });

  app.get('/api/collections', (req, res) => {
    res.json([]);
  });

  // Serve static files from dist if it exists
  const rootPath = process.cwd();
  const distPath = path.resolve(rootPath, 'dist');
  const publicPath = path.resolve(rootPath, 'public');
  
  console.log('Server Info:', {
    cwd: rootPath,
    __dirname,
    distPath,
    publicPath,
    env: process.env.NODE_ENV
  });

  // Explicit route for logo.png to debug
  app.get('/logo.png', (req, res, next) => {
    const locations = [
      path.join(publicPath, 'logo.png'),
      path.join(distPath, 'logo.png'),
      path.join(rootPath, 'logo.png')
    ];
    
    for (const loc of locations) {
      if (fs.existsSync(loc)) {
        return res.sendFile(loc);
      }
    }
    next();
  });

  app.use(express.static(publicPath));
  app.use(express.static(distPath));

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'staging') {
    console.log('Starting Vite in middleware mode...');
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.error('Vite failed to start:', e);
    }
  }

  // SPA fallback - must be last
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) return next();
    
    const indexPath = path.join(distPath, 'index.html');
    res.sendFile(indexPath, (err) => {
      if (err) {
        // If dist/index.html doesn't exist, we are probably in dev mode
        res.status(404).send('Not found');
      }
    });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('CRITICAL: Failed to start server:', err);
  process.exit(1);
});
