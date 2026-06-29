-- Add creator_id to users table for creator portal multi-tenancy
ALTER TABLE users ADD COLUMN creator_id TEXT DEFAULT NULL;
