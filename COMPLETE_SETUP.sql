-- ============================================================
-- COMPLETE SETUP SCRIPT FOR SCREENSHOT FEATURE
-- Run this entire script in Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/jbcbrkrrbeerkgtbvvds/sql/new
-- ============================================================

-- STEP 1: Create Storage Bucket for Article Images
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('article-images', 'article-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies to allow public read access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects'
    AND policyname = 'Public Access'
    AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Public Access"
    ON storage.objects FOR SELECT
    USING ( bucket_id = 'article-images' );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects'
    AND policyname = 'Authenticated users can upload'
    AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Authenticated users can upload"
    ON storage.objects FOR INSERT
    WITH CHECK ( bucket_id = 'article-images' AND auth.role() = 'authenticated' );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects'
    AND policyname = 'Authenticated users can update'
    AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Authenticated users can update"
    ON storage.objects FOR UPDATE
    USING ( bucket_id = 'article-images' AND auth.role() = 'authenticated' );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects'
    AND policyname = 'Authenticated users can delete'
    AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Authenticated users can delete"
    ON storage.objects FOR DELETE
    USING ( bucket_id = 'article-images' AND auth.role() = 'authenticated' );
  END IF;
END $$;

-- STEP 2: Create Screenshot Cache Table
-- ============================================================

CREATE TABLE IF NOT EXISTS screenshot_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT UNIQUE NOT NULL,
  image_url TEXT NOT NULL,
  cached_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_screenshot_cache_url ON screenshot_cache(url);
CREATE INDEX IF NOT EXISTS idx_screenshot_cache_cached_at ON screenshot_cache(cached_at);

-- Add RLS policies
ALTER TABLE screenshot_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON screenshot_cache;
CREATE POLICY "Allow public read access"
ON screenshot_cache FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert" ON screenshot_cache;
CREATE POLICY "Allow authenticated insert"
ON screenshot_cache FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated update" ON screenshot_cache;
CREATE POLICY "Allow authenticated update"
ON screenshot_cache FOR UPDATE
USING (auth.role() = 'authenticated');

-- ============================================================
-- SETUP COMPLETE!
-- ============================================================
-- You should see messages like:
-- - "INSERT 0 1" (bucket created)
-- - "CREATE POLICY" (multiple times)
-- - "CREATE TABLE"
-- - "CREATE INDEX" (2 times)
--
-- Now you can generate listicle articles with screenshots! 🎉
-- ============================================================
