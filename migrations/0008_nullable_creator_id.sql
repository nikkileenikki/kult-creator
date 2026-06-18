-- Make creator_id nullable so tasks can be unassigned (no creator)
-- D1/SQLite enforces FK constraints by default, so empty string '' fails.
-- SQLite cannot ALTER COLUMN, so we recreate the tasks table.

PRAGMA foreign_keys = OFF;

BEGIN TRANSACTION;

CREATE TABLE tasks_new (
  id            TEXT PRIMARY KEY,
  creator_id    TEXT,
  creator_name  TEXT NOT NULL,
  platform      TEXT NOT NULL,
  task          TEXT NOT NULL,
  project       TEXT NOT NULL DEFAULT '',
  status        TEXT NOT NULL DEFAULT 'Not Started',
  priority      TEXT NOT NULL DEFAULT 'Medium',
  pic           TEXT NOT NULL,
  due_date      TEXT NOT NULL,
  coins         INTEGER NOT NULL DEFAULT 0,
  notes         TEXT NOT NULL DEFAULT '',
  rating        INTEGER NOT NULL DEFAULT 0,
  review        TEXT    NOT NULL DEFAULT ''
);

INSERT INTO tasks_new
  SELECT id,
         NULLIF(creator_id, '') AS creator_id,
         creator_name, platform, task, project, status,
         priority, pic, due_date, coins, notes, rating, review
  FROM tasks;

DROP TABLE tasks;
ALTER TABLE tasks_new RENAME TO tasks;

COMMIT;

PRAGMA foreign_keys = ON;
