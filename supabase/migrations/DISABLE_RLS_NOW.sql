-- DISABLE RLS IMMEDIATELY
-- Copy and paste this into Supabase SQL Editor and run it

ALTER TABLE video_image_options DISABLE ROW LEVEL SECURITY;
ALTER TABLE video_scenes DISABLE ROW LEVEL SECURITY;
ALTER TABLE video_projects DISABLE ROW LEVEL SECURITY;

-- Verify it worked
SELECT 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('video_projects', 'video_scenes', 'video_image_options');

-- Should show rowsecurity = false for all three tables
