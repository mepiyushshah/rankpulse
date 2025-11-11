-- Migration: Add featured image settings to article_settings table
-- This adds columns for storing featured image preferences

-- Add featured image columns to article_settings table
ALTER TABLE article_settings
ADD COLUMN IF NOT EXISTS featured_image_style TEXT DEFAULT 'gradient_modern',
ADD COLUMN IF NOT EXISTS featured_image_primary_color TEXT DEFAULT '#00AA45',
ADD COLUMN IF NOT EXISTS featured_image_secondary_color TEXT DEFAULT '#008837',
ADD COLUMN IF NOT EXISTS featured_image_font_style TEXT DEFAULT 'bold',
ADD COLUMN IF NOT EXISTS featured_image_text_position TEXT DEFAULT 'center',
ADD COLUMN IF NOT EXISTS featured_image_include_logo BOOLEAN DEFAULT false;

-- Add featured_image_url column to articles table
ALTER TABLE articles
ADD COLUMN IF NOT EXISTS featured_image_url TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_articles_featured_image ON articles(featured_image_url) WHERE featured_image_url IS NOT NULL;

-- Add comment
COMMENT ON COLUMN article_settings.featured_image_style IS 'Style template for featured images (gradient_modern, solid_bold, minimalist, etc.)';
COMMENT ON COLUMN article_settings.featured_image_primary_color IS 'Primary brand color for featured images (hex format)';
COMMENT ON COLUMN article_settings.featured_image_secondary_color IS 'Secondary color for gradients (hex format)';
COMMENT ON COLUMN article_settings.featured_image_font_style IS 'Font style for text overlay (bold, normal, etc.)';
COMMENT ON COLUMN article_settings.featured_image_text_position IS 'Position of text on image (center, left, right)';
COMMENT ON COLUMN article_settings.featured_image_include_logo IS 'Whether to include logo on featured images';
COMMENT ON COLUMN articles.featured_image_url IS 'URL of the generated featured image for this article';
