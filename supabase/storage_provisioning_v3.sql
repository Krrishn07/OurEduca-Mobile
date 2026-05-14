-- ============================================================
-- OUREDUCA STORAGE PROVISIONING: v3 (MATERIALS & VIDEOS FIX)
-- Run this in the Supabase SQL Editor to provision all buckets and policies
-- ============================================================

-- 1. Ensure all required buckets exist and are public
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('school-logos', 'school-logos', true),
    ('videos', 'videos', true),
    ('thumbnails', 'thumbnails', true),
    ('messages', 'messages', true),
    ('materials', 'materials', true)
ON CONFLICT (id) DO UPDATE SET public = excluded.public;

-- 2. Drop existing policies to avoid "already exists" errors
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public Uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public Updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public Deletion" ON storage.objects;

-- 3. Policy: Public Select (Allow everyone to view files in these buckets)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id IN ('school-logos', 'videos', 'thumbnails', 'messages', 'materials') );

-- 4. Policy: Institutional Uploads (Allow all users to upload to these buckets)
CREATE POLICY "Allow Public Uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK ( bucket_id IN ('school-logos', 'videos', 'thumbnails', 'messages', 'materials') );

-- 5. Policy: Institutional Updates
CREATE POLICY "Allow Public Updates"
ON storage.objects FOR UPDATE
TO public
USING ( bucket_id IN ('school-logos', 'videos', 'thumbnails', 'messages', 'materials') );

-- 6. Policy: Institutional Deletion
CREATE POLICY "Allow Public Deletion"
ON storage.objects FOR DELETE
TO public
USING ( bucket_id IN ('school-logos', 'videos', 'thumbnails', 'messages', 'materials') );
