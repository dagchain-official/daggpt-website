-- ============================================
-- SUPABASE STORAGE SETUP FOR WEBSITE DEPLOYMENT
-- ============================================

-- Step 1: Create the 'websites' bucket (if not exists)
-- Note: You can also create this manually in the Supabase Dashboard
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'websites',
  'websites',
  true,
  52428800, -- 50MB
  ARRAY['text/html', 'text/css', 'text/javascript', 'application/json', 'image/png', 'image/jpeg', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Enable RLS on storage.objects (should already be enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
DROP POLICY IF EXISTS "Public Update" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete" ON storage.objects;

-- Step 4: Create policies for PUBLIC access to 'websites' bucket

-- Allow anyone to SELECT (read) files from websites bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'websites' );

-- Allow anyone to INSERT (upload) files to websites bucket
CREATE POLICY "Public Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'websites' );

-- Allow anyone to UPDATE files in websites bucket
CREATE POLICY "Public Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'websites' );

-- Allow anyone to DELETE files from websites bucket
CREATE POLICY "Public Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'websites' );

-- Step 5: Grant permissions (if needed)
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.objects TO anon;
GRANT ALL ON storage.buckets TO authenticated;
GRANT ALL ON storage.buckets TO anon;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if bucket exists
SELECT * FROM storage.buckets WHERE id = 'websites';

-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- ============================================
-- NOTES
-- ============================================
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Make sure you're in the correct project
-- 3. The bucket will be PUBLIC (anyone can read)
-- 4. Anyone can upload (for MVP - restrict later)
-- 5. For production, add user authentication checks
