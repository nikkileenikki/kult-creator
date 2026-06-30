-- Add follower requirement range to tasks
ALTER TABLE tasks ADD COLUMN follower_min INTEGER NOT NULL DEFAULT 0;
ALTER TABLE tasks ADD COLUMN follower_max INTEGER NOT NULL DEFAULT 0;
