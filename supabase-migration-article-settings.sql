-- Migration: Add article_settings table for comprehensive article preferences
-- This table stores all user preferences for AI-generated content

CREATE TABLE IF NOT EXISTS article_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Content & AI Settings
  brand_voice TEXT DEFAULT 'professional',
  tone_attributes TEXT[] DEFAULT ARRAY['informative', 'engaging'],
  writing_perspective TEXT DEFAULT 'first_person',
  complexity_level TEXT DEFAULT 'intermediate',
  min_word_count INTEGER DEFAULT 1500,
  max_word_count INTEGER DEFAULT 2500,
  temperature DECIMAL(3,2) DEFAULT 0.7,
  custom_instructions TEXT,

  -- SEO Settings
  keyword_density_min DECIMAL(4,2) DEFAULT 1.5,
  keyword_density_max DECIMAL(4,2) DEFAULT 2.5,
  auto_generate_meta BOOLEAN DEFAULT true,
  auto_internal_links BOOLEAN DEFAULT true,
  min_internal_links INTEGER DEFAULT 3,
  max_internal_links INTEGER DEFAULT 7,
  enable_schema_markup BOOLEAN DEFAULT true,

  -- Structure Settings
  include_sections TEXT[] DEFAULT ARRAY['introduction', 'key_takeaways', 'main_content', 'faq', 'conclusion'],
  heading_structure TEXT DEFAULT 'hierarchical',
  include_elements TEXT[] DEFAULT ARRAY['bullets', 'lists', 'blockquotes'],

  -- Automation Settings
  auto_generate BOOLEAN DEFAULT false,
  articles_per_week INTEGER DEFAULT 3,
  preferred_days INTEGER[] DEFAULT ARRAY[1, 3, 5], -- 0=Sunday, 1=Monday, etc.
  publish_time TIME DEFAULT '09:00:00',
  auto_publish BOOLEAN DEFAULT false,
  generate_ahead_days INTEGER DEFAULT 14,

  -- Content Mix Strategy (stored as JSONB for flexibility)
  content_mix JSONB DEFAULT '{
    "how_to": 30,
    "listicle": 25,
    "tutorial": 20,
    "comparison": 15,
    "case_study": 10
  }'::jsonb,

  -- Difficulty Distribution
  difficulty_distribution JSONB DEFAULT '{
    "easy": 40,
    "medium": 40,
    "hard": 20
  }'::jsonb,

  -- Quality Control
  enable_grammar_check BOOLEAN DEFAULT true,
  enable_plagiarism_check BOOLEAN DEFAULT true,
  target_readability_score INTEGER DEFAULT 60,
  auto_fix_issues BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  UNIQUE(project_id) -- One settings record per project
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_article_settings_project_id ON article_settings(project_id);

-- Enable Row Level Security
ALTER TABLE article_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only view their own project's settings
CREATE POLICY "Users can view own article settings"
  ON article_settings FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Users can insert settings for their own projects
CREATE POLICY "Users can insert own article settings"
  ON article_settings FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Users can update their own project's settings
CREATE POLICY "Users can update own article settings"
  ON article_settings FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Users can delete their own project's settings
CREATE POLICY "Users can delete own article settings"
  ON article_settings FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_article_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function
CREATE TRIGGER update_article_settings_timestamp
  BEFORE UPDATE ON article_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_article_settings_updated_at();

-- Add comment to table
COMMENT ON TABLE article_settings IS 'Stores user preferences for AI article generation including content style, SEO settings, automation rules, and quality control';
