// SQLite connection + automatic schema creation.
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const dbPath = path.resolve(__dirname, process.env.DB_PATH || './data/app.db');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  passwordHash TEXT NOT NULL,
  name TEXT DEFAULT '',
  createdAt TEXT
);

CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  title TEXT NOT NULL,
  notes TEXT DEFAULT '',
  completed INTEGER DEFAULT 0,
  dueDate TEXT,
  remindAt TEXT,
  contactId INTEGER,
  completedAt TEXT,
  status TEXT DEFAULT 'todo',
  recurrence TEXT,
  recurrenceDone INTEGER DEFAULT 0,
  timeLogged INTEGER DEFAULT 0,
  gcalEventId TEXT,
  gcalHash TEXT,
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  name TEXT DEFAULT '',
  company TEXT DEFAULT '',
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  tags TEXT DEFAULT '[]',
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS pipeline_stages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  name TEXT NOT NULL,
  position INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS pipeline_cards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  title TEXT NOT NULL,
  stageId INTEGER,
  contactId INTEGER,
  taskId INTEGER,
  notes TEXT DEFAULT '',
  position INTEGER DEFAULT 0,
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS time_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  taskId INTEGER,
  startedAt TEXT NOT NULL,
  seconds INTEGER NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('manual','pomodoro'))
);

CREATE TABLE IF NOT EXISTS settings (
  userId INTEGER PRIMARY KEY,
  pomoFocusMin INTEGER DEFAULT 25,
  pomoBreakMin INTEGER DEFAULT 5,
  pomoLongBreakMin INTEGER DEFAULT 15,
  pomoCycles INTEGER DEFAULT 4,
  notifEnabled INTEGER DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(userId);
CREATE INDEX IF NOT EXISTS idx_contacts_user ON contacts(userId);
CREATE INDEX IF NOT EXISTS idx_stages_user ON pipeline_stages(userId);
CREATE INDEX IF NOT EXISTS idx_cards_user ON pipeline_cards(userId);
CREATE INDEX IF NOT EXISTS idx_time_user ON time_entries(userId);
`);

module.exports = db;
module.exports.dbPath = dbPath;
