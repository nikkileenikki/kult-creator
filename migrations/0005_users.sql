CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  username      TEXT NOT NULL UNIQUE,
  display_name  TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'viewer',
  permissions   TEXT NOT NULL DEFAULT '[]',
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
