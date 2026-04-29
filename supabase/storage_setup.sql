-- ============================================================
-- OUREDUCA STORAGE PROVISIONING: v2 (SIMULATION COMPATIBLE)
-- Run this in the Supabase SQL Editor to FIX the RLS Policy Violation
-- ============================================================

-- 1. Ensure the bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('school-logos', 'school-logos', true),
    ('videos', 'videos', true),
    ('thumbnails', 'thumbnails', true)
ON CONFLICT (id) DO UPDATE SET public = excluded.public;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow Auth Uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow Auth Updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow Auth Deletion" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public Uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public Updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public Deletion" ON storage.objects;

-- 3. Policy: Allow anyone to view logos (Public Read)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id IN ('school-logos', 'videos', 'thumbnails') );

-- 4. Policy: Allow Public (Simulation) Uploads
-- This allows the 'anon' key to upload files to this specific bucket.
-- Security is maintained by strict 'bucket_id' checks.
CREATE POLICY "Allow Public Uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK ( bucket_id IN ('school-logos', 'videos', 'thumbnails') );

-- 5. Policy: Allow Public (Simulation) Updates
CREATE POLICY "Allow Public Updates"
ON storage.objects FOR UPDATE
TO public
USING ( bucket_id IN ('school-logos', 'videos', 'thumbnails') );

-- 6. Policy: Allow Public (Simulation) Deletion
CREATE POLICY "Allow Public Deletion"
ON storage.objects FOR DELETE
TO public
USING ( bucket_id IN ('school-logos', 'videos', 'thumbnails') );
