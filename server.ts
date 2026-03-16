import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

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

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    console.log('Starting Vite in middleware mode...');
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
      console.log('Vite middleware attached.');
    } catch (e) {
      console.error('Vite failed to start:', e);
    }
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('CRITICAL: Failed to start server:', err);
  process.exit(1);
});
