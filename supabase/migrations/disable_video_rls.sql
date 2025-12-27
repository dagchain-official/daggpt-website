-- TEMPORARY: Disable RLS for video generation tables
-- This allows the backend to insert/update without restrictions
-- Run this in Supabase SQL Editor

ALTER TABLE video_projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE video_scenes DISABLE ROW LEVEL SECURITY;
ALTER TABLE video_image_options DISABLE ROW LEVEL SECURITY;

-- Note: This is for testing only. In production, you should use proper RLS policies
-- that allow the backend service role to access these tables.
