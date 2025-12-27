-- Fix RLS Policies for Video Generator
-- This allows the backend API to work with the anon key

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own projects" ON video_projects;
DROP POLICY IF EXISTS "Users can insert their own projects" ON video_projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON video_projects;
DROP POLICY IF EXISTS "Users can view scenes of their projects" ON video_scenes;
DROP POLICY IF EXISTS "Users can insert scenes for their projects" ON video_scenes;
DROP POLICY IF EXISTS "Users can update scenes of their projects" ON video_scenes;
DROP POLICY IF EXISTS "Users can view image options for their scenes" ON video_image_options;
DROP POLICY IF EXISTS "Users can insert image options for their scenes" ON video_image_options;
DROP POLICY IF EXISTS "Users can update image options for their scenes" ON video_image_options;

-- Create permissive policies for backend operations
-- These allow the backend to operate on behalf of users

-- video_projects policies
CREATE POLICY "Allow all operations on video_projects"
  ON video_projects
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- video_scenes policies  
CREATE POLICY "Allow all operations on video_scenes"
  ON video_scenes
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- video_image_options policies
CREATE POLICY "Allow all operations on video_image_options"
  ON video_image_options
  FOR ALL
  USING (true)
  WITH CHECK (true);
