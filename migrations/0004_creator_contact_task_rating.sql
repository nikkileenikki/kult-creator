-- Add contact/profile fields to creators and rating/review to tasks

ALTER TABLE creators ADD COLUMN contact_number    TEXT NOT NULL DEFAULT '';
ALTER TABLE creators ADD COLUMN email             TEXT NOT NULL DEFAULT '';
ALTER TABLE creators ADD COLUMN platform_username TEXT NOT NULL DEFAULT '';
ALTER TABLE creators ADD COLUMN date_of_birth     TEXT NOT NULL DEFAULT '';

ALTER TABLE tasks ADD COLUMN rating INTEGER NOT NULL DEFAULT 0;
ALTER TABLE tasks ADD COLUMN review TEXT    NOT NULL DEFAULT '';
