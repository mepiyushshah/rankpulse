-- Migration: Add api_secret column to cms_connections table
-- This is needed for WordPress Application Password authentication

-- Add api_secret column if it doesn't exist
ALTER TABLE cms_connections
ADD COLUMN IF NOT EXISTS api_secret TEXT;

-- Update comment for the column
COMMENT ON COLUMN cms_connections.api_secret IS 'Secret key or application password for authentication';
