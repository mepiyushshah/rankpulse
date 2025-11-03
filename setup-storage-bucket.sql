-- Run this SQL in your Supabase SQL Editor to create the storage bucket
-- Go to: https://supabase.com/dashboard/project/jbcbrkrrbeerkgtbvvds/sql/new

-- Create the storage bucket for article images
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-images', 'article-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies to allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'article-images' );

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'article-images' AND auth.role() = 'authenticated' );

CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'article-images' AND auth.role() = 'authenticated' );

CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'article-images' AND auth.role() = 'authenticated' );
