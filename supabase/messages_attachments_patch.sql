-- ============================================================
-- MESSAGES UPGRADE PATCH: ATTACHMENTS & MEDIA
-- Run this in the Supabase SQL Editor to enable real-world uploads
-- ============================================================

-- 1. Upgrade the messages table to support media and files
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'TEXT',
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS attachment_name TEXT;

-- 2. Create the 'messages' storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('messages', 'messages', true)
ON CONFLICT (id) DO UPDATE SET public = excluded.public;

-- 3. Storage Policy: Allow public reads for the 'messages' bucket
CREATE POLICY "Messages Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'messages' );

-- 4. Storage Policy: Allow inserts for the 'messages' bucket
CREATE POLICY "Messages Public Uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK ( bucket_id = 'messages' );

-- 5. Storage Policy: Allow updates for the 'messages' bucket
CREATE POLICY "Messages Public Updates"
ON storage.objects FOR UPDATE
TO public
USING ( bucket_id = 'messages' );

-- 6. Storage Policy: Allow deletion for the 'messages' bucket
CREATE POLICY "Messages Public Deletion"
ON storage.objects FOR DELETE
TO public
USING ( bucket_id = 'messages' );
