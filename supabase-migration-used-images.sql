-- Create used_images table to track images used in articles
-- This prevents duplicate images across the same project

CREATE TABLE IF NOT EXISTS used_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_id TEXT,  -- Pixabay image ID
  search_query TEXT,
  orientation TEXT DEFAULT 'horizontal',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_project_image UNIQUE(project_id, image_url)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_used_images_project_id ON used_images(project_id);
CREATE INDEX IF NOT EXISTS idx_used_images_article_id ON used_images(article_id);

-- Add comment
COMMENT ON TABLE used_images IS 'Tracks all images used in articles to prevent duplicates within a project';
