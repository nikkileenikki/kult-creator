-- Add brands table and brand columns to campaigns

CREATE TABLE IF NOT EXISTS brands (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  industry   TEXT NOT NULL DEFAULT '',
  color      TEXT NOT NULL DEFAULT '#6C5CE7',
  website    TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

ALTER TABLE campaigns ADD COLUMN brand_id   TEXT NOT NULL DEFAULT '';
ALTER TABLE campaigns ADD COLUMN brand_name TEXT NOT NULL DEFAULT '';
