import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function test() {
  const dbPath = path.resolve(__dirname, 'test.sqlite');
  console.log('Opening test database at:', dbPath);
  try {
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    await db.exec('CREATE TABLE test (id INTEGER PRIMARY KEY, val TEXT)');
    await db.run('INSERT INTO test (val) VALUES (?)', ['hello']);
    const row = await db.get('SELECT * FROM test');
    console.log('Read from test database:', row);
    await db.close();
    console.log('Test database closed successfully');
  } catch (err) {
    console.error('Test database failed:', err);
  }
}

test();
