import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db: Database | null = null;

export async function getDb() {
  if (db) return db;

  const dbPath = path.resolve(__dirname, 'database.sqlite');
  console.log('Opening database at:', dbPath);

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Create tables if they don't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      email TEXT,
      password TEXT,
      role TEXT,
      lastLogin TEXT
    );

    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      phone TEXT,
      address TEXT,
      password TEXT,
      status TEXT DEFAULT 'attivo',
      role TEXT DEFAULT 'Socio',
      joinDate TEXT,
      payments TEXT DEFAULT '{}' -- JSON string of {year: boolean}
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      date TEXT,
      location TEXT,
      description TEXT,
      image TEXT,
      video TEXT,
      category TEXT
    );

    CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      date TEXT,
      excerpt TEXT,
      content TEXT,
      image TEXT,
      video TEXT,
      category TEXT,
      showOnHomepage INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS gallery (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT,
      title TEXT,
      type TEXT DEFAULT 'image',
      category TEXT,
      date TEXT
    );

    CREATE TABLE IF NOT EXISTS polls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT,
      options TEXT, -- JSON string
      votes TEXT DEFAULT '[]', -- JSON string of {email, phone, date, optionId}
      totalVotes INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1,
      showOnHomepage INTEGER DEFAULT 0,
      endDate TEXT, -- ISO date string
      type TEXT DEFAULT 'poll' -- 'poll' or 'election'
    );

    CREATE TABLE IF NOT EXISTS minutes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      date TEXT,
      content TEXT,
      file_path TEXT
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      date TEXT,
      location TEXT,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT,
      phone TEXT,
      password TEXT,
      message TEXT,
      date TEXT
    );

    CREATE TABLE IF NOT EXISTS finances (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_name TEXT,
      type TEXT,
      amount REAL,
      date TEXT,
      company_details TEXT, -- JSON string
      receipt_number TEXT,
      social_year INTEGER,
      receipt_path TEXT
    );

    CREATE TABLE IF NOT EXISTS contests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      type TEXT,
      description TEXT,
      image TEXT,
      startDate TEXT,
      endDate TEXT,
      cost REAL,
      prizes TEXT, -- JSON string
      showOnHomepage INTEGER DEFAULT 0,
      winners TEXT DEFAULT '[]' -- JSON string of {year, winnerName, prize}
    );

    CREATE TABLE IF NOT EXISTS contest_registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contestId INTEGER,
      name TEXT,
      email TEXT,
      phone TEXT,
      isMinor INTEGER DEFAULT 0,
      parentName TEXT,
      parentEmail TEXT,
      parentPhone TEXT,
      privacyAccepted INTEGER DEFAULT 0,
      status TEXT DEFAULT 'pending',
      date TEXT,
      FOREIGN KEY(contestId) REFERENCES contests(id)
    );

    CREATE TABLE IF NOT EXISTS lottery (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      active INTEGER DEFAULT 0,
      showOnHomepage INTEGER DEFAULT 1,
      name TEXT,
      drawDate TEXT,
      ticketsCount INTEGER DEFAULT 1000,
      ticketPrice REAL DEFAULT 2.50,
      prizes TEXT, -- JSON string
      history TEXT, -- JSON string
      regulations_path TEXT,
      municipality_request_path TEXT,
      minutes_path TEXT
    );

    CREATE TABLE IF NOT EXISTS sponsors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      image TEXT,
      startDate TEXT,
      endDate TEXT,
      active INTEGER DEFAULT 1,
      position INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS booking_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      description TEXT,
      date TEXT,
      time TEXT,
      location TEXT,
      image TEXT,
      price REAL,
      totalTickets INTEGER,
      soldTickets INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1,
      showOnHomepage INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      eventId INTEGER,
      name TEXT,
      email TEXT,
      phone TEXT,
      ticketNumber TEXT,
      purchaseDate TEXT,
      status TEXT DEFAULT 'confirmed',
      FOREIGN KEY(eventId) REFERENCES booking_events(id)
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS visits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ip TEXT,
      deviceType TEXT,
      timestamp TEXT
    );

    CREATE TABLE IF NOT EXISTS donations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT,
      lastName TEXT,
      email TEXT,
      amount REAL,
      date TEXT,
      status TEXT DEFAULT 'pending'
    );

    CREATE TABLE IF NOT EXISTS contest_communications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contestId INTEGER,
      title TEXT,
      message TEXT,
      attachmentPath TEXT,
      recipients TEXT, -- JSON string of email addresses
      sentAt TEXT,
      FOREIGN KEY(contestId) REFERENCES contests(id)
    );
  `);

  // Migrations
  const migrations = [
    'ALTER TABLE polls ADD COLUMN votes TEXT DEFAULT "[]"',
    'ALTER TABLE polls ADD COLUMN active INTEGER DEFAULT 1',
    'ALTER TABLE polls ADD COLUMN showOnHomepage INTEGER DEFAULT 0',
    'ALTER TABLE polls ADD COLUMN totalVotes INTEGER DEFAULT 0',
    'ALTER TABLE polls ADD COLUMN endDate TEXT',
    'ALTER TABLE polls ADD COLUMN type TEXT DEFAULT "poll"',
    'ALTER TABLE users ADD COLUMN email TEXT',
    'ALTER TABLE users ADD COLUMN lastLogin TEXT',
    'ALTER TABLE members ADD COLUMN password TEXT',
    'ALTER TABLE registrations ADD COLUMN password TEXT',
    'ALTER TABLE minutes ADD COLUMN file_path TEXT',
    'ALTER TABLE finances ADD COLUMN company_details TEXT',
    'ALTER TABLE finances ADD COLUMN receipt_number TEXT',
    'ALTER TABLE finances ADD COLUMN social_year INTEGER',
    'ALTER TABLE finances ADD COLUMN receipt_path TEXT',
    'ALTER TABLE members ADD COLUMN payments TEXT DEFAULT "{}"',
    'ALTER TABLE news ADD COLUMN video TEXT',
    'ALTER TABLE events ADD COLUMN video TEXT',
    'ALTER TABLE gallery ADD COLUMN type TEXT DEFAULT "image"',
    'ALTER TABLE lottery ADD COLUMN ticketsCount INTEGER DEFAULT 1000',
    'ALTER TABLE lottery ADD COLUMN ticketPrice REAL DEFAULT 2.50',
    'ALTER TABLE lottery ADD COLUMN regulations_path TEXT',
    'ALTER TABLE lottery ADD COLUMN municipality_request_path TEXT',
    'ALTER TABLE lottery ADD COLUMN minutes_path TEXT',
    'CREATE TABLE IF NOT EXISTS sponsors (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, image TEXT, startDate TEXT, endDate TEXT, active INTEGER DEFAULT 1, position INTEGER DEFAULT 0)',
    'ALTER TABLE sponsors ADD COLUMN position INTEGER DEFAULT 0',
    'CREATE TABLE IF NOT EXISTS booking_events (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT, date TEXT, time TEXT, location TEXT, image TEXT, price REAL, totalTickets INTEGER, soldTickets INTEGER DEFAULT 0, active INTEGER DEFAULT 1, showOnHomepage INTEGER DEFAULT 0)',
    'CREATE TABLE IF NOT EXISTS bookings (id INTEGER PRIMARY KEY AUTOINCREMENT, eventId INTEGER, name TEXT, email TEXT, phone TEXT, ticketNumber TEXT, purchaseDate TEXT, status TEXT DEFAULT "confirmed", FOREIGN KEY(eventId) REFERENCES booking_events(id))',
    'CREATE TABLE IF NOT EXISTS visits (id INTEGER PRIMARY KEY AUTOINCREMENT, ip TEXT, deviceType TEXT, timestamp TEXT)',
    'CREATE TABLE IF NOT EXISTS donations (id INTEGER PRIMARY KEY AUTOINCREMENT, firstName TEXT, lastName TEXT, email TEXT, amount REAL, date TEXT, status TEXT DEFAULT "pending")',
    'CREATE TABLE IF NOT EXISTS contest_communications (id INTEGER PRIMARY KEY AUTOINCREMENT, contestId INTEGER, title TEXT, message TEXT, attachmentPath TEXT, recipients TEXT, sentAt TEXT, FOREIGN KEY(contestId) REFERENCES contests(id))'
  ];

  for (const migration of migrations) {
    try {
      await db.run(migration);
      console.log('Migration successful:', migration);
    } catch (e) {
      // Column might already exist or other error
    }
  }

  // Seed lottery if not exists
  const lottery = await db.get('SELECT * FROM lottery LIMIT 1');
  if (!lottery) {
    await db.run('INSERT INTO lottery (active, showOnHomepage, name, drawDate, ticketsCount, ticketPrice, prizes, history) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
      [0, 1, '', '', 1000, 2.50, JSON.stringify([]), JSON.stringify([])]);
  }

  // Seed default admin if no users exist
  const adminUser = await db.get('SELECT * FROM users LIMIT 1');
  if (!adminUser) {
    await db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', 
      ['admin', 'admin', 'Amministratore']);
  }

  // Seed social links if not exists
  const socialLinks = await db.get('SELECT * FROM settings WHERE key = ?', ['social_links']);
  if (!socialLinks) {
    const defaultLinks = {
      facebook: 'https://www.facebook.com/p/Associazione-Pro-San-Felice-61550793063179/',
      instagram: 'https://instagram.com',
      youtube: 'https://youtube.com',
      twitter: 'https://twitter.com'
    };
    await db.run('INSERT INTO settings (key, value) VALUES (?, ?)', ['social_links', JSON.stringify(defaultLinks)]);
  }

  // Seed membership fees if not exists
  const membershipFees = await db.get('SELECT * FROM settings WHERE key = ?', ['membership_fees']);
  if (!membershipFees) {
    const defaultFees = { 2024: 100, 2025: 100, 2026: 100 };
    await db.run('INSERT INTO settings (key, value) VALUES (?, ?)', ['membership_fees', JSON.stringify(defaultFees)]);
  }

  // Seed email settings if not exists
  const emailSettings = await db.get('SELECT * FROM settings WHERE key = ?', ['email_settings']);
  if (!emailSettings) {
    const defaultEmailSettings = {
      smtp_host: 'smtp.gmail.com',
      smtp_port: 587,
      smtp_user: '',
      smtp_pass: '',
      imap_host: 'imap.gmail.com',
      imap_port: 993,
      imap_user: '',
      imap_pass: '',
      protocol: 'imap',
      from_email: '',
      from_name: ''
    };
    await db.run('INSERT INTO settings (key, value) VALUES (?, ?)', ['email_settings', JSON.stringify(defaultEmailSettings)]);
  }

  // Seed live_stream if not exists
  const liveStream = await db.get('SELECT * FROM settings WHERE key = ?', ['live_stream']);
  if (!liveStream) {
    const defaultLiveStream = {
      active: false,
      url: '',
      type: 'youtube'
    };
    await db.run('INSERT INTO settings (key, value) VALUES (?, ?)', ['live_stream', JSON.stringify(defaultLiveStream)]);
  }

  // Seed association_details if not exists
  const associationDetails = await db.get('SELECT * FROM settings WHERE key = ?', ['association_details']);
  if (!associationDetails) {
    const defaultDetails = {
      name: 'Associazione Pro San Felice',
      address: 'Via San Felice, 1',
      municipality: 'San Felice sul Panaro',
      province: 'MO',
      cf: '',
      legalRepresentative: '',
      email: '',
      phone: ''
    };
    await db.run('INSERT INTO settings (key, value) VALUES (?, ?)', ['association_details', JSON.stringify(defaultDetails)]);
  }

  console.log('Database initialized successfully');
  return db;
}
