-- Activity feed: add creator linkage and soft-delete support
ALTER TABLE activity_feed ADD COLUMN creator_id TEXT;
ALTER TABLE activity_feed ADD COLUMN deleted_at TEXT;

-- Backfill creator_id for seeded activity entries
UPDATE activity_feed SET creator_id = '3' WHERE id = 'a1'; -- Aina Nadia
UPDATE activity_feed SET creator_id = '2' WHERE id = 'a2'; -- Hafiz Zaki
UPDATE activity_feed SET creator_id = '6' WHERE id = 'a3'; -- Nur Zulaikha
UPDATE activity_feed SET creator_id = '4' WHERE id = 'a4'; -- Farah Hana
UPDATE activity_feed SET creator_id = '1' WHERE id = 'a5'; -- Siti Rania
