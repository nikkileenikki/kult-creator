-- Run this against your existing D1 database if you initialized from the 0001 schema
-- wrangler d1 execute kult-creator-db --file=migrations/0002_add_notes_and_secondary_niche.sql

ALTER TABLE tasks    ADD COLUMN notes           TEXT NOT NULL DEFAULT '';
ALTER TABLE creators ADD COLUMN secondary_niche TEXT NOT NULL DEFAULT '';
