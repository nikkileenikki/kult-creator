CREATE TABLE IF NOT EXISTS report_templates (
  id           TEXT PRIMARY KEY,
  title        TEXT NOT NULL,
  report_type  TEXT NOT NULL DEFAULT 'summary',
  file_type    TEXT NOT NULL DEFAULT 'csv',
  date_range   TEXT NOT NULL DEFAULT 'all',
  range_start  TEXT NOT NULL DEFAULT '',
  range_end    TEXT NOT NULL DEFAULT '',
  campaign_ids TEXT NOT NULL DEFAULT '[]',
  brand_names  TEXT NOT NULL DEFAULT '[]',
  creator_ids  TEXT NOT NULL DEFAULT '[]',
  pics         TEXT NOT NULL DEFAULT '[]',
  levels       TEXT NOT NULL DEFAULT '["campaign","creator"]',
  metrics      TEXT NOT NULL DEFAULT '[]',
  created_by   TEXT NOT NULL DEFAULT '',
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at   TEXT
);

CREATE INDEX IF NOT EXISTS idx_report_templates_created ON report_templates(created_at);
