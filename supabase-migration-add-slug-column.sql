-- Migration: Add slug column to articles table
-- This column is needed for SEO-friendly URLs

-- Add slug column if it doesn't exist
ALTER TABLE articles ADD COLUMN IF NOT EXISTS slug TEXT;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);

-- Add comment
COMMENT ON COLUMN articles.slug IS 'SEO-friendly URL slug generated from the keyword';
