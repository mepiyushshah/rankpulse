-- Migration: Enhance articles table for full feature support
-- Adds fields for schema markup, keyword tracking, and content type

-- Add new columns if they don't exist
ALTER TABLE articles ADD COLUMN IF NOT EXISTS keyword TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS content_type TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS difficulty TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS schema_markup JSONB;

-- Update status check constraint to include 'generating'
ALTER TABLE articles DROP CONSTRAINT IF EXISTS articles_status_check;
ALTER TABLE articles ADD CONSTRAINT articles_status_check
  CHECK (status IN ('draft', 'generating', 'scheduled', 'published'));

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_articles_project_id ON articles(project_id);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_keyword ON articles(keyword);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);

-- Add comments
COMMENT ON COLUMN articles.keyword IS 'Target SEO keyword for the article';
COMMENT ON COLUMN articles.content_type IS 'Type of content (e.g., how_to, listicle, tutorial)';
COMMENT ON COLUMN articles.difficulty IS 'Keyword difficulty level (easy, medium, hard)';
COMMENT ON COLUMN articles.schema_markup IS 'JSON-LD schema markup for SEO';
