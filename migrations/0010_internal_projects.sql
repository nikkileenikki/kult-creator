-- Standalone internal project management tables (not linked to creator campaigns)
CREATE TABLE IF NOT EXISTS internal_projects (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status      TEXT NOT NULL DEFAULT 'Active',
  priority    TEXT NOT NULL DEFAULT 'Medium',
  due_date    TEXT NOT NULL DEFAULT '',
  color       TEXT NOT NULL DEFAULT '#6C5CE7',
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at  TEXT DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS internal_tasks (
  id          TEXT PRIMARY KEY,
  project_id  TEXT NOT NULL,
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status      TEXT NOT NULL DEFAULT 'To Do',
  priority    TEXT NOT NULL DEFAULT 'Medium',
  assignee    TEXT NOT NULL DEFAULT '',
  due_date    TEXT NOT NULL DEFAULT '',
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at  TEXT DEFAULT NULL
);
