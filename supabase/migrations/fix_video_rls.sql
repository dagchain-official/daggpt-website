-- Fix RLS policies for video generation tables
-- Allow backend (using anon key) to insert and read data

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own image options" ON video_image_options;
DROP POLICY IF EXISTS "Users can insert their own image options" ON video_image_options;
DROP POLICY IF EXISTS "Users can update their own image options" ON video_image_options;

-- Create permissive policies for backend operations
-- Allow anyone to insert (backend will use anon key)
CREATE POLICY "Allow backend to insert image options"
ON video_image_options
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow anyone to read (backend needs to query)
CREATE POLICY "Allow backend to read image options"
ON video_image_options
FOR SELECT
TO anon, authenticated
USING (true);

-- Allow anyone to update (for image selection)
CREATE POLICY "Allow backend to update image options"
ON video_image_options
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Also fix video_scenes table
DROP POLICY IF EXISTS "Users can view their own scenes" ON video_scenes;
DROP POLICY IF EXISTS "Users can insert their own scenes" ON video_scenes;
DROP POLICY IF EXISTS "Users can update their own scenes" ON video_scenes;

CREATE POLICY "Allow backend to insert scenes"
ON video_scenes
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow backend to read scenes"
ON video_scenes
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow backend to update scenes"
ON video_scenes
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Fix video_projects table
DROP POLICY IF EXISTS "Users can view their own projects" ON video_projects;
DROP POLICY IF EXISTS "Users can insert their own projects" ON video_projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON video_projects;

CREATE POLICY "Allow backend to insert projects"
ON video_projects
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow backend to read projects"
ON video_projects
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow backend to update projects"
ON video_projects
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);
