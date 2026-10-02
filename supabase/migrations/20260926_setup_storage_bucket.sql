-- ==============================================================================
-- PRASRI RUGS — SUPABASE STORAGE SETUP FOR RUG PHOTOGRAPHY (HARDENED)
-- Migration: 20260926_setup_storage_bucket.sql
-- Run this in your Supabase Dashboard -> SQL Editor to enable secure cloud image hosting
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

-- 2. Drop any previous conflicting or insecure policies for rug-images
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public view for rug-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow upload to rug-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow update to rug-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete to rug-images" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload to rug-images" ON storage.objects;
DROP POLICY IF EXISTS "Admin update to rug-images" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete from rug-images" ON storage.objects;

-- 3. Public read policy: Anyone can view rug photos via CDN
CREATE POLICY "Allow public view for rug-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'rug-images');

-- 4. Upload policy: Only authenticated atelier administrator can upload images
CREATE POLICY "Admin upload to rug-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'rug-images'
  AND (
    LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'prasrirugs@gmail.com'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR auth.role() = 'service_role'
  )
);

-- 5. Update policy: Only authenticated atelier administrator can update image files
CREATE POLICY "Admin update to rug-images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'rug-images'
  AND (
    LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'prasrirugs@gmail.com'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR auth.role() = 'service_role'
  )
);

-- 6. Delete policy: Only authenticated atelier administrator can delete images
CREATE POLICY "Admin delete from rug-images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'rug-images'
  AND (
    LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'prasrirugs@gmail.com'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR auth.role() = 'service_role'
  )
);
