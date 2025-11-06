-- Add config column to cms_connections table
ALTER TABLE cms_connections
ADD COLUMN IF NOT EXISTS config JSONB;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
