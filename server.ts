import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';
import { getDb } from './db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;
  const db = await getDb();

  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Auth API
  app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    
    // Check users table (admins)
    const user = await db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
    if (user) {
      return res.json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
    }

    // Check members table (soci)
    const member = await db.get('SELECT * FROM members WHERE email = ?', [username]);
    if (member && (password === 'socio' || password === member.email)) {
      return res.json({ 
        success: true, 
        user: { id: member.id, username: member.name, role: member.role || 'Socio', email: member.email } 
      });
    }

    res.status(401).json({ success: false, message: 'Credenziali errate' });
  });

  // Members API
  app.get('/api/members', async (req, res) => {
    const members = await db.all('SELECT * FROM members ORDER BY name ASC');
    res.json(members);
  });

  app.post('/api/members', async (req, res) => {
    const { name, email, phone, address, role, status, joinDate } = req.body;
    try {
      const result = await db.run(
        'INSERT INTO members (name, email, phone, address, role, status, joinDate) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, email, phone, address, role || 'Socio', status || 'attivo', joinDate || new Date().toISOString()]
      );
      res.json({ id: result.lastID });
    } catch (e) {
      res.status(400).json({ error: 'Email già presente o dati non validi' });
    }
  });

  app.put('/api/members/:id', async (req, res) => {
    const { name, email, phone, address, role, status } = req.body;
    await db.run(
      'UPDATE members SET name = ?, email = ?, phone = ?, address = ?, role = ?, status = ? WHERE id = ?',
      [name, email, phone, address, role, status, req.params.id]
    );
    res.json({ success: true });
  });

  app.delete('/api/members/:id', async (req, res) => {
    await db.run('DELETE FROM members WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  });

  // Events API
  app.get('/api/events', async (req, res) => {
    const events = await db.all('SELECT * FROM events ORDER BY date DESC');
    res.json(events);
  });

  app.post('/api/events', async (req, res) => {
    const { title, date, location, description, image, category } = req.body;
    const result = await db.run(
      'INSERT INTO events (title, date, location, description, image, category) VALUES (?, ?, ?, ?, ?, ?)',
      [title, date, location, description, image, category]
    );
    res.json({ id: result.lastID });
  });

  app.delete('/api/events/:id', async (req, res) => {
    await db.run('DELETE FROM events WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  });

  // News API
  app.get('/api/news', async (req, res) => {
    const news = await db.all('SELECT * FROM news ORDER BY date DESC');
    res.json(news);
  });

  app.post('/api/news', async (req, res) => {
    const { title, date, excerpt, content, image, category } = req.body;
    const result = await db.run(
      'INSERT INTO news (title, date, excerpt, content, image, category) VALUES (?, ?, ?, ?, ?, ?)',
      [title, date, excerpt, content, image, category]
    );
    res.json({ id: result.lastID });
  });

  app.delete('/api/news/:id', async (req, res) => {
    await db.run('DELETE FROM news WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  });

  // Gallery API
  app.get('/api/gallery', async (req, res) => {
    const gallery = await db.all('SELECT * FROM gallery ORDER BY date DESC');
    res.json(gallery);
  });

  app.post('/api/gallery', async (req, res) => {
    const { url, title, category, date } = req.body;
    const result = await db.run(
      'INSERT INTO gallery (url, title, category, date) VALUES (?, ?, ?, ?)',
      [url, title, category, date || new Date().toISOString()]
    );
    res.json({ id: result.lastID });
  });

  app.delete('/api/gallery/:id', async (req, res) => {
    await db.run('DELETE FROM gallery WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  });

  // Polls API
  app.get('/api/polls', async (req, res) => {
    const polls = await db.all('SELECT * FROM polls ORDER BY id DESC');
    res.json(polls.map(p => ({ 
      ...p, 
      options: JSON.parse(p.options),
      votes: JSON.parse(p.votes || '[]')
    })));
  });

  app.post('/api/polls', async (req, res) => {
    const { question, options } = req.body;
    const result = await db.run(
      'INSERT INTO polls (question, options, votes) VALUES (?, ?, ?)',
      [question, JSON.stringify(options), JSON.stringify([])]
    );
    res.json({ id: result.lastID });
  });

  app.put('/api/polls/:id', async (req, res) => {
    const { question, options, active, showOnHomepage } = req.body;
    await db.run(
      'UPDATE polls SET question = ?, options = ?, active = ?, showOnHomepage = ? WHERE id = ?',
      [question, JSON.stringify(options), active ? 1 : 0, showOnHomepage ? 1 : 0, req.params.id]
    );
    res.json({ success: true });
  });

  app.post('/api/polls/:id/vote', async (req, res) => {
    const { optionIndex, email, phone } = req.body;
    const poll = await db.get('SELECT * FROM polls WHERE id = ?', [req.params.id]);
    if (poll) {
      const options = JSON.parse(poll.options);
      const votes = JSON.parse(poll.votes || '[]');
      
      // Update option vote count
      if (options[optionIndex]) {
        options[optionIndex].votes = (options[optionIndex].votes || 0) + 1;
      }

      // Add detailed vote
      votes.push({
        email,
        phone,
        date: new Date().toISOString(),
        optionId: options[optionIndex]?.id
      });

      await db.run(
        'UPDATE polls SET options = ?, votes = ?, totalVotes = totalVotes + 1 WHERE id = ?',
        [JSON.stringify(options), JSON.stringify(votes), req.params.id]
      );
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Sondaggio non trovato' });
    }
  });

  // Minutes API
  app.get('/api/minutes', async (req, res) => {
    const minutes = await db.all('SELECT * FROM minutes ORDER BY date DESC');
    res.json(minutes);
  });

  app.post('/api/minutes', async (req, res) => {
    const { title, date, content } = req.body;
    const result = await db.run(
      'INSERT INTO minutes (title, date, content) VALUES (?, ?, ?)',
      [title, date || new Date().toISOString(), content]
    );
    res.json({ id: result.lastID });
  });

  app.delete('/api/minutes/:id', async (req, res) => {
    await db.run('DELETE FROM minutes WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  });

  // Appointments API
  app.get('/api/appointments', async (req, res) => {
    const appointments = await db.all('SELECT * FROM appointments ORDER BY date ASC');
    res.json(appointments);
  });

  app.post('/api/appointments', async (req, res) => {
    const { title, date, location, description } = req.body;
    const result = await db.run(
      'INSERT INTO appointments (title, date, location, description) VALUES (?, ?, ?, ?)',
      [title, date, location, description]
    );
    res.json({ id: result.lastID });
  });

  app.delete('/api/appointments/:id', async (req, res) => {
    await db.run('DELETE FROM appointments WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  });

  // Registrations API
  app.get('/api/registrations', async (req, res) => {
    const registrations = await db.all('SELECT * FROM registrations ORDER BY date DESC');
    res.json(registrations);
  });

  app.post('/api/registrations', async (req, res) => {
    const { name, email, phone, message } = req.body;
    const result = await db.run(
      'INSERT INTO registrations (name, email, phone, message, date) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone, message, new Date().toISOString()]
    );
    res.json({ id: result.lastID });
  });

  app.delete('/api/registrations/:id', async (req, res) => {
    await db.run('DELETE FROM registrations WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  });

  // Finances API
  app.get('/api/finances', async (req, res) => {
    const finances = await db.all('SELECT * FROM finances ORDER BY date DESC');
    res.json(finances);
  });

  app.post('/api/finances', async (req, res) => {
    const { event_name, type, amount, date } = req.body;
    const result = await db.run(
      'INSERT INTO finances (event_name, type, amount, date) VALUES (?, ?, ?, ?)',
      [event_name, type, amount, date || new Date().toISOString()]
    );
    res.json({ id: result.lastID });
  });

  app.delete('/api/finances/:id', async (req, res) => {
    await db.run('DELETE FROM finances WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  });

  // Lottery API
  app.get('/api/lottery', async (req, res) => {
    const lottery = await db.get('SELECT * FROM lottery LIMIT 1');
    if (lottery) {
      res.json({
        ...lottery,
        active: !!lottery.active,
        showOnHomepage: !!lottery.showOnHomepage,
        prizes: JSON.parse(lottery.prizes),
        history: JSON.parse(lottery.history)
      });
    } else {
      res.status(404).json({ error: 'Lotteria non trovata' });
    }
  });

  app.put('/api/lottery', async (req, res) => {
    const { active, showOnHomepage, name, drawDate, prizes, history } = req.body;
    await db.run(
      'UPDATE lottery SET active = ?, showOnHomepage = ?, name = ?, drawDate = ?, prizes = ?, history = ? WHERE id = 1',
      [active ? 1 : 0, showOnHomepage ? 1 : 0, name, drawDate, JSON.stringify(prizes), JSON.stringify(history)]
    );
    res.json({ success: true });
  });

  // Users API
  app.get('/api/users', async (req, res) => {
    const users = await db.all('SELECT id, username, role, lastLogin FROM users');
    res.json(users);
  });

  app.post('/api/users', async (req, res) => {
    const { username, password, role } = req.body;
    const result = await db.run(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, password || 'admin', role || 'Operatore']
    );
    res.json({ id: result.lastID });
  });

  app.delete('/api/users/:id', async (req, res) => {
    await db.run('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  });

  // Logo Upload API
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/');
    },
    filename: (req, file, cb) => {
      cb(null, 'logo.png');
    }
  });
  const upload = multer({ storage });

  app.post('/api/upload-logo', upload.single('logo'), (req: any, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'Nessun file caricato' });
    }
    res.json({ success: true, path: '/logo.png' });
  });

  // 1. Percorsi Assoluti Certi
  const rootPath = __dirname;
  const distPath = path.join(rootPath, 'dist');
  const publicPath = path.join(rootPath, 'public');

  console.log('DEBUG PERCORSI:', {
    rootPath,
    distPath,
    publicPath,
    logoInPublic: fs.existsSync(path.join(publicPath, 'logo.png')),
    logoInDist: fs.existsSync(path.join(distPath, 'logo.png'))
  });

  // 2. Servizio file statici (PRIMA di ogni altra rotta)
  app.use(express.static(publicPath));
  app.use(express.static(distPath));

  // 3. Rotta specifica per il logo con log di debug
  app.get('/logo.png', (req, res) => {
    const fileP = path.join(publicPath, 'logo.png');
    const fileD = path.join(distPath, 'logo.png');
    const fileR = path.join(rootPath, 'logo.png');
    
    if (fs.existsSync(fileP)) return res.sendFile(fileP);
    if (fs.existsSync(fileD)) return res.sendFile(fileD);
    if (fs.existsSync(fileR)) return res.sendFile(fileR);
    
    res.status(404).send('Logo non trovato sul disco');
  });

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
