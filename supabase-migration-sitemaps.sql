-- Migration: Add Sitemap Support for Internal Linking
-- This allows users to provide their sitemap URL and automatically parse existing articles for interlinking

-- Table to store sitemap URLs per project
CREATE TABLE IF NOT EXISTS project_sitemaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  sitemap_url TEXT NOT NULL,
  last_parsed_at TIMESTAMP WITH TIME ZONE,
  article_count INT DEFAULT 0,
  status TEXT DEFAULT 'pending', -- pending, parsing, active, error
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, sitemap_url)
);

-- Table to store parsed articles from sitemap
CREATE TABLE IF NOT EXISTS sitemap_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  sitemap_id UUID NOT NULL REFERENCES project_sitemaps(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT,
  last_modified TIMESTAMP WITH TIME ZONE,
  change_frequency TEXT, -- always, hourly, daily, weekly, monthly, yearly, never
  priority DECIMAL(2,1), -- 0.0 to 1.0
  discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, url)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_sitemaps_project_id ON project_sitemaps(project_id);
CREATE INDEX IF NOT EXISTS idx_sitemap_articles_project_id ON sitemap_articles(project_id);
CREATE INDEX IF NOT EXISTS idx_sitemap_articles_sitemap_id ON sitemap_articles(sitemap_id);
CREATE INDEX IF NOT EXISTS idx_sitemap_articles_url ON sitemap_articles(url);

-- Enable Row Level Security
ALTER TABLE project_sitemaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE sitemap_articles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_sitemaps
CREATE POLICY "Users can view their own project sitemaps"
  ON project_sitemaps FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert sitemaps for their projects"
  ON project_sitemaps FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own project sitemaps"
  ON project_sitemaps FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own project sitemaps"
  ON project_sitemaps FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for sitemap_articles
CREATE POLICY "Users can view sitemap articles from their projects"
  ON sitemap_articles FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert sitemap articles for their projects"
  ON sitemap_articles FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update sitemap articles from their projects"
  ON sitemap_articles FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete sitemap articles from their projects"
  ON sitemap_articles FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for project_sitemaps
CREATE TRIGGER update_project_sitemaps_updated_at
  BEFORE UPDATE ON project_sitemaps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
