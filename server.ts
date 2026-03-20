import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';
import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import Pop3Command from 'node-pop3';
import { getDb } from './db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer configuration for gallery uploads
const galleryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), 'public', 'gallery');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const emailUpload = multer({ storage: galleryStorage });

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

  // Sponsors API
  const uploadSponsor = multer({ storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'sponsors');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'sponsor-' + uniqueSuffix + path.extname(file.originalname));
    }
  }) });

  app.post('/api/sponsors/upload', uploadSponsor.single('image'), (req: any, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const url = `/uploads/sponsors/${req.file.filename}`;
    res.json({ path: url });
  });

  app.get('/api/sponsors', async (req, res) => {
    try {
      const sponsors = await db.all('SELECT * FROM sponsors ORDER BY id DESC');
      res.json(sponsors);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/sponsors/active', async (req, res) => {
    try {
      const now = new Date().toISOString();
      const sponsors = await db.all(
        'SELECT * FROM sponsors WHERE active = 1 AND (startDate IS NULL OR startDate <= ?) AND (endDate IS NULL OR endDate >= ?)',
        [now, now]
      );
      res.json(sponsors);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/sponsors', async (req, res) => {
    try {
      const { name, image, startDate, endDate, active } = req.body;
      const result = await db.run(
        'INSERT INTO sponsors (name, image, startDate, endDate, active) VALUES (?, ?, ?, ?, ?)',
        [name, image, startDate, endDate, active ? 1 : 0]
      );
      res.json({ id: result.lastID });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put('/api/sponsors/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, image, startDate, endDate, active } = req.body;
      await db.run(
        'UPDATE sponsors SET name = ?, image = ?, startDate = ?, endDate = ?, active = ? WHERE id = ?',
        [name, image, startDate, endDate, active ? 1 : 0, id]
      );
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/sponsors/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await db.run('DELETE FROM sponsors WHERE id = ?', [id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

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
    const { title, date, location, description, image, video, category } = req.body;
    const result = await db.run(
      'INSERT INTO events (title, date, location, description, image, video, category) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, date || new Date().toISOString(), location, description, image, video, category]
    );
    res.json({ id: result.lastID });
  });

  app.put('/api/events/:id', async (req, res) => {
    const { title, date, location, description, image, video, category } = req.body;
    await db.run(
      'UPDATE events SET title = ?, date = ?, location = ?, description = ?, image = ?, video = ?, category = ? WHERE id = ?',
      [title, date || new Date().toISOString(), location, description, image, video, category, req.params.id]
    );
    res.json({ success: true });
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
    const { title, date, excerpt, content, image, video, category } = req.body;
    const result = await db.run(
      'INSERT INTO news (title, date, excerpt, content, image, video, category) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, date || new Date().toISOString(), excerpt, content, image, video, category]
    );
    res.json({ id: result.lastID });
  });

  app.put('/api/news/:id', async (req, res) => {
    const { title, date, excerpt, content, image, video, category } = req.body;
    await db.run(
      'UPDATE news SET title = ?, date = ?, excerpt = ?, content = ?, image = ?, video = ?, category = ? WHERE id = ?',
      [title, date || new Date().toISOString(), excerpt, content, image, video, category, req.params.id]
    );
    res.json({ success: true });
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
    const { url, title, type, category, date } = req.body;
    const result = await db.run(
      'INSERT INTO gallery (url, title, type, category, date) VALUES (?, ?, ?, ?, ?)',
      [url, title, type || 'image', category, date || new Date().toISOString()]
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
    try {
      // 1. Get the record to know its year and if it has a receipt number
      const record = await db.get('SELECT social_year, receipt_number FROM finances WHERE id = ?', [req.params.id]);
      
      if (!record) {
        return res.status(404).json({ error: 'Record non trovato' });
      }

      // 2. Delete the record
      await db.run('DELETE FROM finances WHERE id = ?', [req.params.id]);

      // 3. If it had a receipt number, re-sequence all receipts for that year
      if (record.receipt_number && record.social_year) {
        const year = record.social_year;
        const yearReceipts = await db.all(
          'SELECT id FROM finances WHERE social_year = ? AND receipt_number IS NOT NULL ORDER BY CAST(receipt_number AS INTEGER) ASC',
          [year]
        );

        for (let i = 0; i < yearReceipts.length; i++) {
          const newNumber = (i + 1).toString();
          await db.run('UPDATE finances SET receipt_number = ? WHERE id = ?', [newNumber, yearReceipts[i].id]);
        }
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting finance record:', error);
      res.status(500).json({ error: error.message });
    }
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

  // Email API
  app.post('/api/send-email', async (req, res) => {
    const { to, subject, html, text } = req.body;
    
    try {
      const nodemailer = await import('nodemailer');
      const emailSettingsRow = await db.get('SELECT * FROM settings WHERE key = ?', ['email_settings']);
      
      if (!emailSettingsRow) {
        return res.status(400).json({ error: 'Email settings not configured' });
      }
      
      const settings = JSON.parse(emailSettingsRow.value);
      
      if (!settings.smtp_user || !settings.smtp_pass) {
        return res.status(400).json({ error: 'SMTP credentials missing' });
      }

      const transporter = nodemailer.createTransport({
        host: settings.smtp_host || 'smtp.gmail.com',
        port: parseInt(settings.smtp_port) || 587,
        secure: parseInt(settings.smtp_port) === 465,
        requireTLS: parseInt(settings.smtp_port) === 587,
        auth: {
          user: settings.smtp_user,
          pass: settings.smtp_pass,
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      const info = await transporter.sendMail({
        from: `"${settings.from_name || 'Associazione'}" <${settings.from_email || settings.smtp_user}>`,
        to,
        subject,
        text,
        html,
      });

      console.log('Message sent: %s', info.messageId);
      res.json({ success: true, messageId: info.messageId });
    } catch (error: any) {
      console.error('Error sending email:', error);
      let errorMessage = error.message;
      if (errorMessage.includes('Username and Password not accepted') || errorMessage.includes('535')) {
        errorMessage = 'Credenziali SMTP non accettate. Se usi Gmail, DEVI attivare la "Verifica in due passaggi" e usare una "Password per le App" (16 caratteri). Google blocca la tua password normale per motivi di sicurezza.';
      }
      res.status(500).json({ error: `Errore invio email: ${errorMessage}` });
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
        prizes: JSON.parse(lottery.prizes || '[]'),
        history: JSON.parse(lottery.history || '[]'),
        regulations_path: lottery.regulations_path,
        municipality_request_path: lottery.municipality_request_path,
        minutes_path: lottery.minutes_path
      });
    } else {
      res.status(404).json({ error: 'Lotteria non trovata' });
    }
  });

  app.put('/api/lottery', async (req, res) => {
    const { active, showOnHomepage, name, drawDate, prizes, history, regulations_path, municipality_request_path, minutes_path } = req.body;
    await db.run(
      'UPDATE lottery SET active = ?, showOnHomepage = ?, name = ?, drawDate = ?, prizes = ?, history = ?, regulations_path = ?, municipality_request_path = ?, minutes_path = ? WHERE id = 1',
      [active ? 1 : 0, showOnHomepage ? 1 : 0, name, drawDate, JSON.stringify(prizes), JSON.stringify(history), regulations_path || null, municipality_request_path || null, minutes_path || null]
    );
    res.json({ success: true });
  });

  const lotteryStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = 'public/lottery-docs/';
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, `lotteria_${Date.now()}_${file.originalname}`);
    }
  });
  const uploadLottery = multer({ storage: lotteryStorage });

  app.post('/api/lottery/upload-doc', uploadLottery.single('file'), (req: any, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'Nessun file caricato' });
    }
    const filePath = `/lottery-docs/${req.file.filename}`;
    res.json({ success: true, path: filePath });
  });

  const galleryStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });
  const galleryUpload = multer({ storage: galleryStorage });

  // Gallery Upload
  app.post('/api/upload-gallery', galleryUpload.single('file'), async (req: any, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const type = req.body.type || 'image';
    const url = `/uploads/${req.file.filename}`;
    
    try {
      const result = await db.run('INSERT INTO gallery (url, type) VALUES (?, ?)', [url, type]);
      res.json({ id: result.lastID, url, type });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Gallery Delete
  app.delete('/api/gallery/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const row = await db.get('SELECT url FROM gallery WHERE id = ?', [id]);
      if (!row) return res.status(404).json({ error: 'Item not found' });
      
      const filePath = path.join(process.cwd(), 'public', row.url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      await db.run('DELETE FROM gallery WHERE id = ?', [id]);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Email Client API
  // Helper to get POP3 client from settings
  const getPop3Client = (settings: any) => {
    const popUser = settings.pop_user || settings.smtp_user;
    const popPass = settings.pop_pass || settings.smtp_pass;
    const port = parseInt(settings.pop_port) || 995;
    
    // For POP3, SSL/TLS is standard on port 995.
    // If port is 995, we force TLS.
    const useTls = settings.pop_tls !== undefined ? settings.pop_tls : (port === 995);
    
    return new Pop3Command({
      user: popUser,
      password: popPass,
      host: settings.pop_host || 'pop.gmail.com',
      port: port,
      tls: useTls,
      timeout: 10000,
      servername: settings.pop_host || 'pop.gmail.com',
      tlsOptions: {
        rejectUnauthorized: false
      }
    });
  };

  app.get('/api/emails', async (req, res) => {
    const { folder = 'INBOX', page = '1', search = '' } = req.query;
    const pageSize = 20;
    const skip = (parseInt(page as string) - 1) * pageSize;

    try {
      const emailSettingsRow = await db.get('SELECT * FROM settings WHERE key = ?', ['email_settings']);
      if (!emailSettingsRow) return res.status(400).json({ error: 'Impostazioni email non configurate' });
      const settings = JSON.parse(emailSettingsRow.value);
      const port = parseInt(settings.pop_port) || 995;
      const client = getPop3Client(settings);

      try {
        console.log(`Connecting to POP3 server: ${settings.pop_host}:${port} (TLS: ${settings.pop_tls !== undefined ? settings.pop_tls : (port === 995)})`);
        await client.connect();
        console.log('POP3 connected successfully');
        
        // Use STAT to get count quickly
        const stat = await client.STAT();
        console.log('POP3 STAT response:', stat);
        
        // STAT returns "+OK <count> <size>" or "+OK <count> messages (<size> octets)"
        // More robust parsing using regex
        const statMatch = stat.match(/^\+OK\s+(\d+)/i);
        const totalMessages = statMatch ? parseInt(statMatch[1]) : 0;
        console.log(`Total messages in POP3 inbox: ${totalMessages}`);
        
        const messages = [];
        // POP3 list is 1-indexed. We want newest first.
        const endIdx = totalMessages - skip;
        const startIdx = Math.max(1, totalMessages - skip - pageSize + 1);

        console.log(`Fetching messages from ${endIdx} down to ${startIdx}`);

        if (totalMessages > 0 && endIdx >= 1) {
          // Limit the number of messages to fetch to avoid long hangs
          const actualEndIdx = Math.min(totalMessages, endIdx);
          
          for (let i = actualEndIdx; i >= startIdx; i--) {
            try {
              console.log(`Fetching headers and preview for message ${i}...`);
              // Set a shorter timeout for each message fetch
              const fetchPromise = client.TOP(i, 10);
              const timeoutPromise = new Promise<string>((_, reject) => 
                setTimeout(() => reject(new Error('Timeout fetching message headers')), 1500)
              );
              
              const raw = await Promise.race([fetchPromise, timeoutPromise]);
              
              if (raw) {
                const parsed = await simpleParser(raw);
                messages.push({
                  uid: i.toString(),
                  seq: i,
                  from: parsed.from?.value[0] || { name: 'Sconosciuto', address: 'unknown' },
                  subject: parsed.subject || '(Nessun oggetto)',
                  date: parsed.date || new Date(),
                  flags: [],
                  hasAttachments: (parsed.attachments && parsed.attachments.length > 0),
                  preview: parsed.text?.substring(0, 100) || ''
                });
                console.log(`Successfully fetched message ${i}`);
              } else {
                console.warn(`Empty raw response for message ${i}`);
              }
            } catch (err) {
              console.error(`Error fetching message ${i}:`, err);
              // Continue to next message
            }
          }
        }

        const totalPages = Math.ceil(totalMessages / pageSize);

        res.json({
          emails: messages,
          total: totalMessages,
          totalPages,
          page: parseInt(page as string),
          pageSize
        });
      } finally {
        try {
          await client.QUIT();
        } catch (e) {
          // Ignore quit errors
        }
      }
    } catch (error: any) {
      console.error('POP3 Error details:', error);
      res.status(500).json({ error: `Errore POP3: ${error.message}. Verifica le credenziali e che il server POP3 sia raggiungibile.` });
    }
  });

  app.post('/api/emails/test', async (req, res) => {
    try {
      const settings = req.body;
      if (!settings) return res.status(400).json({ error: 'Settings are required' });
      
      const client = getPop3Client(settings);

      console.log(`Testing POP3 connection to ${settings.pop_host}:${parseInt(settings.pop_port) || 995}`);
      await client.connect();
      await client.QUIT();
      res.json({ success: true, message: 'Connessione POP3 riuscita!' });
    } catch (error: any) {
      console.error('POP3 Test Error:', error);
      let errorMessage = error.message;
      if (errorMessage.includes('Username and Password not accepted') || errorMessage.includes('535')) {
        errorMessage = 'Credenziali POP3 non accettate. Se usi Gmail, DEVI attivare la "Verifica in due passaggi" e usare una "Password per le App" (16 caratteri). La tua password normale non funzionerà anche se la verifica in due passaggi è disattivata.';
      }
      res.status(500).json({ error: `Errore POP3: ${errorMessage}` });
    }
  });

  app.post('/api/emails/test-smtp', async (req, res) => {
    try {
      const settings = req.body;
      if (!settings) return res.status(400).json({ error: 'Settings are required' });
      if (!settings.smtp_user || !settings.smtp_pass) {
        return res.status(400).json({ error: 'Username e Password SMTP sono obbligatori' });
      }
      
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        host: settings.smtp_host || 'smtp.gmail.com',
        port: parseInt(settings.smtp_port) || 587,
        secure: parseInt(settings.smtp_port) === 465,
        requireTLS: parseInt(settings.smtp_port) === 587,
        auth: {
          user: settings.smtp_user,
          pass: settings.smtp_pass,
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      console.log(`Testing SMTP connection to ${settings.smtp_host}:${parseInt(settings.smtp_port) || 587}`);
      await transporter.verify();
      res.json({ success: true, message: 'Connessione SMTP riuscita!' });
    } catch (error: any) {
      console.error('SMTP Test Error:', error);
      let errorMessage = error.message;
      if (errorMessage.includes('Username and Password not accepted') || errorMessage.includes('535')) {
        errorMessage = 'Credenziali SMTP non accettate. Se usi Gmail, DEVI attivare la "Verifica in due passaggi" e usare una "Password per le App" (16 caratteri). Google blocca la tua password normale per motivi di sicurezza.';
      }
      res.status(500).json({ error: `Errore SMTP: ${errorMessage}` });
    }
  });

  app.get('/api/emails/folders', async (req, res) => {
    // POP3 only has INBOX
    res.json(['INBOX']);
  });

  app.get('/api/emails/:uid', async (req, res) => {
    const { uid } = req.params;
    try {
      const emailSettingsRow = await db.get('SELECT * FROM settings WHERE key = ?', ['email_settings']);
      if (!emailSettingsRow) return res.status(400).json({ error: 'Email settings not configured' });
      const settings = JSON.parse(emailSettingsRow.value);
      
      const client = getPop3Client(settings);

      try {
        await client.connect();
        const index = parseInt(uid);
        const raw = await client.RETR(index);
        const parsed = await simpleParser(raw);
        
        const getAddressText = (addr: any) => {
          if (!addr) return '';
          if (Array.isArray(addr)) return addr.map((a: any) => a.text).join(', ');
          return addr.text || '';
        };

        res.json({
          uid,
          from: getAddressText(parsed.from),
          to: getAddressText(parsed.to),
          subject: parsed.subject,
          date: parsed.date,
          html: parsed.html || parsed.textAsHtml,
          text: parsed.text,
          attachments: parsed.attachments?.map(att => ({
            filename: att.filename,
            contentType: att.contentType,
            size: att.size
          }))
        });
      } finally {
        await client.QUIT();
      }
    } catch (error: any) {
      console.error('POP3 Fetch Error:', error);
      res.status(500).json({ error: `Errore recupero email POP3: ${error.message}` });
    }
  });

  app.post('/api/emails/send', emailUpload.array('attachments'), async (req: any, res) => {
    const { to, subject, html, replyToUid, forwardFromUid } = req.body;
    const attachments = (req.files as any[])?.map(f => ({
      filename: f.originalname,
      path: f.path
    })) || [];

    try {
      const nodemailer = await import('nodemailer');
      const emailSettingsRow = await db.get('SELECT * FROM settings WHERE key = ?', ['email_settings']);
      const settings = JSON.parse(emailSettingsRow.value);

      const transporter = nodemailer.createTransport({
        host: settings.smtp_host || 'smtp.gmail.com',
        port: parseInt(settings.smtp_port) || 587,
        secure: parseInt(settings.smtp_port) === 465,
        auth: {
          user: settings.smtp_user,
          pass: settings.smtp_pass,
        },
      });

      await transporter.sendMail({
        from: `"${settings.from_name || 'Associazione'}" <${settings.from_email || settings.smtp_user}>`,
        to,
        subject,
        html,
        attachments
      });

      // Cleanup uploaded attachments
      attachments.forEach(a => {
        if (fs.existsSync(a.path)) fs.unlinkSync(a.path);
      });

      res.json({ success: true });
    } catch (error: any) {
      let errorMessage = error.message;
      if (errorMessage.includes('Username and Password not accepted') || errorMessage.includes('535')) {
        errorMessage = 'Credenziali non accettate da Gmail. Assicurati di usare una "Password per le App" (16 caratteri) e non la tua password normale.';
      }
      res.status(500).json({ error: errorMessage });
    }
  });

  app.post('/api/emails/:uid/trash', async (req, res) => {
    const { uid } = req.params;

    try {
      const emailSettingsRow = await db.get('SELECT * FROM settings WHERE key = ?', ['email_settings']);
      const settings = JSON.parse(emailSettingsRow.value);
      
      const client = getPop3Client(settings);

      try {
        await client.connect();
        const index = parseInt(uid);
        await client.DELE(index);
        res.json({ success: true });
      } finally {
        await client.QUIT();
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
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

  const logoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/');
    },
    filename: (req, file, cb) => {
      cb(null, 'logo.png');
    }
  });
  const logoUpload = multer({ storage: logoStorage });

  app.post('/api/upload-logo', logoUpload.single('logo'), (req: any, res) => {
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
