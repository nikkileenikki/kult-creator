-- Soft delete support: records are marked deleted_at rather than hard-removed
ALTER TABLE creators  ADD COLUMN deleted_at TEXT;
ALTER TABLE tasks     ADD COLUMN deleted_at TEXT;
ALTER TABLE campaigns ADD COLUMN deleted_at TEXT;
ALTER TABLE brands    ADD COLUMN deleted_at TEXT;
