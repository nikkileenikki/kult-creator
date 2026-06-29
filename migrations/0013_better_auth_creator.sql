-- Creator portal accounts (lightweight, no better-auth dependency)
CREATE TABLE IF NOT EXISTS ca_user (
  id             TEXT PRIMARY KEY,
  name           TEXT NOT NULL,
  email          TEXT NOT NULL UNIQUE,
  email_verified INTEGER NOT NULL DEFAULT 1,
  password_hash  TEXT NOT NULL,
  creator_id     TEXT,
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
);
