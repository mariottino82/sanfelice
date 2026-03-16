import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let db: Database | null = null;

export async function getDb() {
  if (db) return db;

  db = await open({
    filename: path.join(process.cwd(), 'database.sqlite'),
    driver: sqlite3.Database
  });

  // Create tables if they don't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT
    );

    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      phone TEXT,
      address TEXT,
      status TEXT DEFAULT 'attivo',
      role TEXT DEFAULT 'Socio',
      joinDate TEXT
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      date TEXT,
      location TEXT,
      description TEXT,
      image TEXT,
      category TEXT
    );

    CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      date TEXT,
      excerpt TEXT,
      content TEXT,
      image TEXT,
      category TEXT
    );

    CREATE TABLE IF NOT EXISTS gallery (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT,
      title TEXT,
      category TEXT,
      date TEXT
    );

    CREATE TABLE IF NOT EXISTS polls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT,
      options TEXT, -- JSON string
      totalVotes INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS minutes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      date TEXT,
      content TEXT
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
      message TEXT,
      date TEXT
    );

    CREATE TABLE IF NOT EXISTS finances (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_name TEXT,
      type TEXT,
      amount REAL,
      date TEXT
    );

    CREATE TABLE IF NOT EXISTS lottery (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      active INTEGER DEFAULT 0,
      showOnHomepage INTEGER DEFAULT 1,
      name TEXT,
      drawDate TEXT,
      prizes TEXT, -- JSON string
      history TEXT -- JSON string
    );
  `);

  // Seed lottery if not exists
  const lottery = await db.get('SELECT * FROM lottery LIMIT 1');
  if (!lottery) {
    await db.run('INSERT INTO lottery (active, showOnHomepage, name, drawDate, prizes, history) VALUES (?, ?, ?, ?, ?, ?)', 
      [0, 1, '', '', JSON.stringify([]), JSON.stringify([])]);
  }

  return db;
}
