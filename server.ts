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

  // Database write test
  try {
    await db.run('CREATE TABLE IF NOT EXISTS _write_test (id INTEGER PRIMARY KEY, val TEXT)');
    await db.run('INSERT INTO _write_test (val) VALUES (?)', ['test_' + Date.now()]);
    console.log('Database write test successful');
    
    // Ensure totalVotes is initialized to 0 for existing polls
    try {
      await db.run('UPDATE polls SET totalVotes = 0 WHERE totalVotes IS NULL');
    } catch (e) {
      console.error('Error initializing totalVotes:', e);
    }
  } catch (e) {
    console.error('DATABASE WRITE TEST FAILED! Database might be read-only.', e);
  }

  app.use(express.json());

  // Health check
  app.get('/api/health', async (req, res) => {
    let dbStatus = 'unknown';
    let dbError = null;
    try {
      await db.run('CREATE TABLE IF NOT EXISTS _write_test (id INTEGER PRIMARY KEY, val TEXT)');
      await db.run('INSERT INTO _write_test (val) VALUES (?)', ['health_check_' + Date.now()]);
      dbStatus = 'writable';
    } catch (e: any) {
      dbStatus = 'error';
      dbError = e.message;
      console.error('Health check DB error:', e);
    }
    res.json({ 
      status: 'ok', 
      time: new Date().toISOString(),
      database: dbStatus,
      databaseError: dbError,
      env: process.env.NODE_ENV || 'development'
    });
  });

  // Auth API
  app.post('/api/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Check users table (admins)
      const user = await db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
      if (user) {
        return res.json({ success: true, user: { id: user.id, username: user.username, role: user.role, email: user.email } });
      }

      // Check members table (soci)
      const member = await db.get('SELECT * FROM members WHERE email = ? AND password = ?', [username, password]);
      if (member) {
        return res.json({ 
          success: true, 
          user: { id: member.id, username: member.name, role: member.role || 'Socio', email: member.email } 
        });
      }

      res.status(401).json({ success: false, message: 'Credenziali errate' });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Members API
  app.get('/api/members', async (req, res) => {
    try {
      const members = await db.all('SELECT * FROM members ORDER BY name ASC');
      res.json(members.map(m => ({
        ...m,
        payments: JSON.parse(m.payments || '{}')
      })));
    } catch (error) {
      console.error('Error fetching members:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/members', async (req, res) => {
    const { name, email, phone, address, role, status, joinDate, password, payments } = req.body;
    try {
      const result = await db.run(
        'INSERT INTO members (name, email, phone, address, role, status, joinDate, password, payments) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [name, email, phone, address, role || 'Socio', status || 'attivo', joinDate || new Date().toISOString(), password, JSON.stringify(payments || {})]
      );
      res.json({ id: result.lastID });
    } catch (e) {
      console.error('Error creating member:', e);
      res.status(400).json({ error: 'Email già presente o dati non validi' });
    }
  });

  app.put('/api/members/:id', async (req, res) => {
    const { name, email, phone, address, role, status, password, payments } = req.body;
    try {
      await db.run(
        'UPDATE members SET name = ?, email = ?, phone = ?, address = ?, role = ?, status = ?, password = ?, payments = ? WHERE id = ?',
        [name, email, phone, address, role, status, password, JSON.stringify(payments || {}), req.params.id]
      );
      res.json({ success: true });
    } catch (error) {
      console.error('Error updating member:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
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
    try {
      const polls = await db.all('SELECT * FROM polls ORDER BY id DESC');
      res.json(polls.map(p => {
        let options = [];
        let votes = [];
        try {
          options = JSON.parse(p.options || '[]');
        } catch (e) {
          console.error(`Error parsing options for poll ${p.id}:`, e);
        }
        try {
          votes = JSON.parse(p.votes || '[]');
        } catch (e) {
          console.error(`Error parsing votes for poll ${p.id}:`, e);
        }
        return { 
          ...p, 
          options,
          votes,
          totalVotes: p.totalVotes || 0,
          active: !!p.active,
          showOnHomepage: !!p.showOnHomepage
        };
      }));
    } catch (error) {
      console.error('Error fetching polls:', error);
      res.status(500).json({ error: 'Errore durante il caricamento dei sondaggi' });
    }
  });

  app.post('/api/polls', async (req, res) => {
    const { question, options, active, showOnHomepage, endDate } = req.body;
    console.log('Creating new poll:', { question, active, showOnHomepage, endDate });
    try {
      const result = await db.run(
        'INSERT INTO polls (question, options, votes, active, showOnHomepage, endDate) VALUES (?, ?, ?, ?, ?, ?)',
        [question || '', JSON.stringify(options || []), JSON.stringify([]), active ? 1 : 0, showOnHomepage ? 1 : 0, endDate || null]
      );
      console.log('Poll created successfully, ID:', result.lastID);
      res.json({ success: true, id: result.lastID });
    } catch (error: any) {
      console.error('Error creating poll:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Errore durante la creazione del sondaggio' 
      });
    }
  });

  app.put('/api/polls/:id', async (req, res) => {
    const { question, options, active, showOnHomepage, endDate } = req.body;
    console.log(`Updating poll ${req.params.id}:`, { question, active, showOnHomepage, endDate });
    try {
      const result = await db.run(
        'UPDATE polls SET question = ?, options = ?, active = ?, showOnHomepage = ?, endDate = ? WHERE id = ?',
        [question || '', JSON.stringify(options || []), active ? 1 : 0, showOnHomepage ? 1 : 0, endDate || null, req.params.id]
      );
      console.log(`Poll ${req.params.id} updated successfully. Changes:`, result.changes);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error updating poll:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Errore durante il salvataggio del sondaggio' 
      });
    }
  });

  app.post('/api/polls/:id/vote', async (req, res) => {
    const { optionIndex, email, phone } = req.body;
    console.log(`Vote request for poll ${req.params.id}:`, { optionIndex, email, phone });
    try {
      const poll = await db.get('SELECT * FROM polls WHERE id = ?', [req.params.id]);
      if (poll) {
        const options = JSON.parse(poll.options || '[]');
        const votes = JSON.parse(poll.votes || '[]');
        
        if (optionIndex === undefined || optionIndex < 0 || optionIndex >= options.length) {
          console.error('Invalid option index:', optionIndex);
          return res.status(400).json({ error: 'Indice opzione non valido' });
        }

        // Update option vote count
        options[optionIndex].votes = (options[optionIndex].votes || 0) + 1;

        // Add detailed vote
        votes.push({
          email,
          phone,
          date: new Date().toISOString(),
          optionId: options[optionIndex].id,
          optionText: options[optionIndex].text
        });

        const currentTotalVotes = (poll.totalVotes || 0) + 1;

        await db.run(
          'UPDATE polls SET options = ?, votes = ?, totalVotes = ? WHERE id = ?',
          [JSON.stringify(options), JSON.stringify(votes), currentTotalVotes, req.params.id]
        );
        
        console.log(`Vote recorded successfully for poll ${req.params.id}. New total: ${currentTotalVotes}`);
        res.json({ success: true });
      } else {
        res.status(404).json({ error: 'Sondaggio non trovato' });
      }
    } catch (error: any) {
      console.error('Error recording vote:', error);
      res.status(500).json({ error: 'Errore durante la registrazione del voto: ' + error.message });
    }
  });

  app.delete('/api/polls/:id', async (req, res) => {
    try {
      await db.run('DELETE FROM polls WHERE id = ?', [req.params.id]);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting poll:', error);
      res.status(500).json({ error: 'Errore durante l\'eliminazione del sondaggio' });
    }
  });

  // Minutes API
  app.get('/api/minutes', async (req, res) => {
    const minutes = await db.all('SELECT * FROM minutes ORDER BY date DESC');
    res.json(minutes);
  });

  app.post('/api/minutes', async (req, res) => {
    const { title, date, content, file_path } = req.body;
    const result = await db.run(
      'INSERT INTO minutes (title, date, content, file_path) VALUES (?, ?, ?, ?)',
      [title, date || new Date().toISOString(), content, file_path || null]
    );
    res.json({ id: result.lastID });
  });

  const minutesStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = 'public/minutes/';
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, `verbale_${Date.now()}_${file.originalname}`);
    }
  });
  const uploadMinutes = multer({ storage: minutesStorage });

  app.post('/api/minutes/:id/upload', uploadMinutes.single('file'), async (req: any, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'Nessun file caricato' });
    }
    const filePath = `/minutes/${req.file.filename}`;
    await db.run('UPDATE minutes SET file_path = ? WHERE id = ?', [filePath, req.params.id]);
    res.json({ success: true, path: filePath });
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
    const { name, email, phone, message, password } = req.body;
    const result = await db.run(
      'INSERT INTO registrations (name, email, phone, message, date, password) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, phone, message, new Date().toISOString(), password]
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
    const { event_name, type, amount, date, company_details, receipt_number, social_year, receipt_path } = req.body;
    const result = await db.run(
      'INSERT INTO finances (event_name, type, amount, date, company_details, receipt_number, social_year, receipt_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [event_name, type, amount, date || new Date().toISOString(), company_details || null, receipt_number || null, social_year || null, receipt_path || null]
    );
    res.json({ id: result.lastID });
  });

  const receiptsStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = 'public/receipts/';
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, `ricevuta_${Date.now()}_${file.originalname}`);
    }
  });
  const uploadReceipts = multer({ storage: receiptsStorage });

  app.post('/api/finances/upload-receipt', uploadReceipts.single('file'), (req: any, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'Nessun file caricato' });
    }
    const filePath = `/receipts/${req.file.filename}`;
    res.json({ success: true, path: filePath });
  });

  app.delete('/api/finances/:id', async (req, res) => {
    await db.run('DELETE FROM finances WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  });

  // Contests API
app.get('/api/contests', async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM contests ORDER BY id DESC');
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/contests', async (req, res) => {
  console.log('POST /api/contests - Body:', req.body);
  const { title, type, description, image, startDate, endDate, cost, prizes, showOnHomepage, winners } = req.body;
  try {
    const result = await db.run(
      'INSERT INTO contests (title, type, description, image, startDate, endDate, cost, prizes, showOnHomepage, winners) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, type, description, image, startDate, endDate, cost, prizes, showOnHomepage ? 1 : 0, winners || '[]']
    );
    console.log('Insert result:', result);
    res.json({ id: result.lastID });
  } catch (err: any) {
    console.error('Error inserting contest:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/contests/:id', async (req, res) => {
  console.log(`PUT /api/contests/${req.params.id} - Body:`, req.body);
  const { title, type, description, image, startDate, endDate, cost, prizes, showOnHomepage, winners } = req.body;
  try {
    const result = await db.run(
      'UPDATE contests SET title = ?, type = ?, description = ?, image = ?, startDate = ?, endDate = ?, cost = ?, prizes = ?, showOnHomepage = ?, winners = ? WHERE id = ?',
      [title, type, description, image, startDate, endDate, cost, prizes, showOnHomepage ? 1 : 0, winners || '[]', req.params.id]
    );
    console.log('Update result:', result);
    res.json({ success: true });
  } catch (err: any) {
    console.error('Error updating contest:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/contests/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`DELETE /api/contests/${id} - Request received`);
  try {
    // First, delete registrations associated with this contest to avoid FK issues
    const regResult = await db.run('DELETE FROM contest_registrations WHERE contestId = ?', [id]);
    console.log(`Deleted ${regResult.changes} registrations for contest ${id}`);

    // Then delete the contest
    const result = await db.run('DELETE FROM contests WHERE id = ?', [id]);
    console.log(`Delete contest result:`, result);
    
    if (result.changes === 0) {
      console.warn(`No contest found with ID: ${id}`);
      return res.status(404).json({ error: 'Concorso non trovato' });
    }
    
    res.json({ success: true, message: 'Concorso eliminato con successo' });
  } catch (err: any) {
    console.error('Error deleting contest:', err);
    res.status(500).json({ error: err.message });
  }
});

const contestStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'public/contests/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `concorso_${Date.now()}_${file.originalname}`);
  }
});
const uploadContest = multer({ storage: contestStorage });

app.post('/api/contests/:id/upload', uploadContest.single('image'), async (req: any, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nessun file caricato' });
  }
  const filePath = `/contests/${req.file.filename}`;
  await db.run('UPDATE contests SET image = ? WHERE id = ?', [filePath, req.params.id]);
  res.json({ success: true, path: filePath });
});

// Contest Registrations API
app.get('/api/contest-registrations', async (req, res) => {
  const { contestId } = req.query;
  let query = 'SELECT * FROM contest_registrations';
  let params: any[] = [];
  if (contestId) {
    query += ' WHERE contestId = ?';
    params.push(contestId);
  }
  query += ' ORDER BY id DESC';
  try {
    const rows = await db.all(query, params);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/contest-registrations', async (req, res) => {
  const { contestId, name, email, phone, isMinor, parentName, parentEmail, parentPhone, privacyAccepted } = req.body;
  const date = new Date().toISOString();
  try {
    const result = await db.run(
      'INSERT INTO contest_registrations (contestId, name, email, phone, isMinor, parentName, parentEmail, parentPhone, privacyAccepted, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [contestId, name, email, phone, isMinor ? 1 : 0, parentName, parentEmail, parentPhone, privacyAccepted ? 1 : 0, date]
    );
    res.json({ id: result.lastID });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/contest-registrations/:id', async (req, res) => {
  try {
    await db.run('DELETE FROM contest_registrations WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
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

  // Settings API
  app.get('/api/settings/:key', async (req, res) => {
    try {
      const setting = await db.get('SELECT * FROM settings WHERE key = ?', [req.params.key]);
      if (setting) {
        res.json({ value: JSON.parse(setting.value) });
      } else {
        // Return a default empty object or null instead of 404 for settings
        res.json({ value: null });
      }
    } catch (error) {
      console.error('Error fetching setting:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/settings/:key', async (req, res) => {
    try {
      const { value } = req.body;
      await db.run(
        'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
        [req.params.key, JSON.stringify(value)]
      );
      res.json({ success: true });
    } catch (error) {
      console.error('Error saving setting:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Users API
  app.get('/api/users', async (req, res) => {
    try {
      const users = await db.all('SELECT id, username, email, role, lastLogin FROM users');
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/users', async (req, res) => {
    try {
      const { username, password, role, email } = req.body;
      const result = await db.run(
        'INSERT INTO users (username, password, role, email) VALUES (?, ?, ?, ?)',
        [username, password || 'admin', role || 'Operatore', email]
      );
      res.json({ id: result.lastID });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
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
