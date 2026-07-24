CREATE TABLE IF NOT EXISTS agreement_sheets (
  id           TEXT PRIMARY KEY,
  creator_id   TEXT NOT NULL,
  data         TEXT NOT NULL DEFAULT '{}',
  archived     INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_agreement_sheets_creator_id ON agreement_sheets(creator_id);
