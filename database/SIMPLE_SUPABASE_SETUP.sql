-- ========================================
-- SIMPLE SUPABASE SETUP (NO RLS)
-- ========================================
-- Run this in Supabase SQL Editor
-- This creates tables WITHOUT Row Level Security for easier testing

-- Drop existing tables if they exist
DROP TABLE IF EXISTS video_generation_scenes CASCADE;
DROP TABLE IF EXISTS video_generation_projects CASCADE;

-- Main video generation projects
CREATE TABLE video_generation_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  title TEXT,
  original_prompt TEXT NOT NULL,
  enhanced_prompt TEXT,
  aspect_ratio TEXT NOT NULL CHECK (aspect_ratio IN ('16:9', '9:16')),
  target_duration INTEGER NOT NULL,
  total_scenes INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'extending', 'stitching', 'complete', 'failed')),
  final_video_url TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual scenes for each project
CREATE TABLE video_generation_scenes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES video_generation_projects(id) ON DELETE CASCADE,
  scene_number INTEGER NOT NULL,
  script_text TEXT NOT NULL,
  visual_description TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 8,
  
  -- Video generation tracking
  base_task_id TEXT,
  base_video_url TEXT,
  base_status TEXT DEFAULT 'pending' CHECK (base_status IN ('pending', 'generating', 'complete', 'failed')),
  
  -- Extension tracking
  extension_task_ids TEXT[],
  extension_video_urls TEXT[],
  extension_status TEXT DEFAULT 'not_needed' CHECK (extension_status IN ('not_needed', 'pending', 'extending', 'complete', 'failed')),
  
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(project_id, scene_number)
);

-- Indexes for performance
CREATE INDEX idx_video_gen_projects_user_id ON video_generation_projects(user_id);
CREATE INDEX idx_video_gen_projects_status ON video_generation_projects(status);
CREATE INDEX idx_video_gen_scenes_project_id ON video_generation_scenes(project_id);
CREATE INDEX idx_video_gen_scenes_base_task_id ON video_generation_scenes(base_task_id);

-- DISABLE RLS for easier testing (API uses service key anyway)
ALTER TABLE video_generation_projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE video_generation_scenes DISABLE ROW LEVEL SECURITY;

-- ========================================
-- DONE! Tables created (NO RLS)
-- ========================================
-- Now the API can insert/update without RLS issues
