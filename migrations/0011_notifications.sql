CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_display_name TEXT NOT NULL,
  task_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  task_title TEXT NOT NULL,
  message TEXT NOT NULL,
  read_at TEXT DEFAULT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
