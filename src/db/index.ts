import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, 'money.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    acct            TEXT PRIMARY KEY,
    balance         REAL NOT NULL DEFAULT 0,
    last_daily      TEXT,
    streak          INTEGER NOT NULL DEFAULT 0,
    quiz_id         INTEGER,
    quiz_expires_at TEXT
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    from_acct  TEXT NOT NULL,
    to_acct    TEXT NOT NULL,
    amount     REAL NOT NULL,
    created_at TEXT NOT NULL
  );
`);

export default db;
