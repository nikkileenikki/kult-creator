ALTER TABLE recruit_requests ADD COLUMN email            TEXT NOT NULL DEFAULT '';
ALTER TABLE recruit_requests ADD COLUMN contact_number   TEXT NOT NULL DEFAULT '';
ALTER TABLE recruit_requests ADD COLUMN tiktok_username  TEXT NOT NULL DEFAULT '';
ALTER TABLE recruit_requests ADD COLUMN follower_range   TEXT NOT NULL DEFAULT '';
ALTER TABLE recruit_requests ADD COLUMN live_experience  TEXT NOT NULL DEFAULT '';
ALTER TABLE recruit_requests ADD COLUMN collab_preference TEXT NOT NULL DEFAULT '[]';
