-- Migration: Add target_audiences and competitors fields to projects table
-- Run this in your Supabase SQL Editor

-- Add target_audiences column (JSONB array for flexibility)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS target_audiences JSONB DEFAULT '[]'::jsonb;

-- Add competitors column (JSONB array for flexibility)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS competitors JSONB DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN projects.target_audiences IS 'Array of target audience descriptions for content optimization';
COMMENT ON COLUMN projects.competitors IS 'Array of competitor websites/domains for keyword analysis';
