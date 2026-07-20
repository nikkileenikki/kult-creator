CREATE TABLE IF NOT EXISTS activity_log (
  id          TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id   TEXT NOT NULL,
  entity_name TEXT NOT NULL DEFAULT '',
  action      TEXT NOT NULL,
  from_status TEXT NOT NULL DEFAULT '',
  to_status   TEXT NOT NULL DEFAULT '',
  actor       TEXT NOT NULL DEFAULT '',
  meta        TEXT NOT NULL DEFAULT '{}',
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_activity_log_entity  ON activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at);
