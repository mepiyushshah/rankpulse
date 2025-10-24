-- Migration: Add content plan fields to articles table
-- Run this in your Supabase SQL Editor to add fields for AI-generated content plans

-- Add new columns to articles table
ALTER TABLE articles
ADD COLUMN IF NOT EXISTS keyword_id UUID REFERENCES keywords(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS target_keyword TEXT,
ADD COLUMN IF NOT EXISTS content_type TEXT,
ADD COLUMN IF NOT EXISTS search_volume INT,
ADD COLUMN IF NOT EXISTS keyword_difficulty INT;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_articles_scheduled_at ON articles(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_articles_keyword_id ON articles(keyword_id);

-- Comment for documentation
COMMENT ON COLUMN articles.keyword_id IS 'Reference to the keyword this article targets';
COMMENT ON COLUMN articles.target_keyword IS 'The actual keyword text (denormalized for performance)';
COMMENT ON COLUMN articles.content_type IS 'Type of content: How-to Guide, Listicle, Tutorial, Comparison, etc.';
COMMENT ON COLUMN articles.search_volume IS 'Monthly search volume for the target keyword';
COMMENT ON COLUMN articles.keyword_difficulty IS 'SEO difficulty score (0-100)';
