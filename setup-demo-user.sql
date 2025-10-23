-- Setup Demo User for RankPulse
-- Run this in your Supabase SQL Editor to create a demo user profile

-- First, ensure the profiles table exists (if you haven't run the main schema yet)
-- If the table doesn't exist, run supabase-schema.sql first

-- Insert demo user profile
INSERT INTO public.profiles (id, email, full_name, organization_name, created_at)
VALUES (
  'demo-user-123-456-789',
  'demo@rankpulse.app',
  'Demo User',
  'Demo Organization',
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Update RLS policies to allow demo user access
-- This allows the demo user to bypass authentication checks

-- Drop existing policies and recreate with demo user support
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "Users can create their own projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;

-- Recreate policies with demo user exception
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id OR user_id = 'demo-user-123-456-789');

CREATE POLICY "Users can create their own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id = 'demo-user-123-456-789');

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id OR user_id = 'demo-user-123-456-789');

CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id OR user_id = 'demo-user-123-456-789');
