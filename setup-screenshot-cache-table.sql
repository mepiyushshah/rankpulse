-- Run this SQL in your Supabase SQL Editor to create the screenshot cache table
-- Go to: https://supabase.com/dashboard/project/jbcbrkrrbeerkgtbvvds/sql/new

-- Create screenshot_cache table
CREATE TABLE IF NOT EXISTS screenshot_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT UNIQUE NOT NULL,
  image_url TEXT NOT NULL,
  cached_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_screenshot_cache_url ON screenshot_cache(url);
CREATE INDEX IF NOT EXISTS idx_screenshot_cache_cached_at ON screenshot_cache(cached_at);

-- Add RLS policies
ALTER TABLE screenshot_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
ON screenshot_cache FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated insert"
ON screenshot_cache FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update"
ON screenshot_cache FOR UPDATE
USING (auth.role() = 'authenticated');
