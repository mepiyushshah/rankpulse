-- Migration: Add business detail fields to projects table
-- Run this in your Supabase SQL Editor if you already have the database set up

ALTER TABLE projects ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS description TEXT;

-- Update existing projects to have default values if needed
UPDATE projects SET country = 'US' WHERE country IS NULL;
UPDATE projects SET description = '' WHERE description IS NULL;
