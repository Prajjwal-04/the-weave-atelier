-- ==============================================================================
-- PRASRI RUGS — SUPABASE STORAGE SETUP FOR RUG PHOTOGRAPHY
-- Migration: 20260926_setup_storage_bucket.sql
-- Run this in your Supabase Dashboard -> SQL Editor to enable cloud image hosting
-- ==============================================================================

-- 1. Create the public 'rug-images' storage bucket if it does not already exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'rug-images',
  'rug-images',
  true,
  10485760, -- 10MB per image
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

-- 2. Drop any previous conflicting policies for rug-images
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public view for rug-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow upload to rug-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow update to rug-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete to rug-images" ON storage.objects;

-- 3. Public read policy: Anyone can view rug photos via CDN
CREATE POLICY "Allow public view for rug-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'rug-images');

-- 4. Upload policy: Allow inserting images into rug-images bucket
CREATE POLICY "Allow upload to rug-images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'rug-images');

-- 5. Update policy
CREATE POLICY "Allow update to rug-images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'rug-images');

-- 6. Delete policy
CREATE POLICY "Allow delete to rug-images"
ON storage.objects FOR DELETE
USING (bucket_id = 'rug-images');
