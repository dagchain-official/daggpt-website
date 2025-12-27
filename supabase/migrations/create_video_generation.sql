-- Video Generation Tool Tables
-- This is separate from the Content Creation tool

-- Main video generation projects
CREATE TABLE IF NOT EXISTS video_generation_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  title TEXT,
  original_prompt TEXT NOT NULL,
  enhanced_prompt TEXT,
  aspect_ratio TEXT NOT NULL CHECK (aspect_ratio IN ('16:9', '9:16')),
  target_duration INTEGER NOT NULL, -- In seconds (multiple of 8)
  total_scenes INTEGER NOT NULL, -- Number of 8-second scenes needed
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'extending', 'stitching', 'complete', 'failed')),
  final_video_url TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual scenes for each project
CREATE TABLE IF NOT EXISTS video_generation_scenes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES video_generation_projects(id) ON DELETE CASCADE,
  scene_number INTEGER NOT NULL,
  script_text TEXT NOT NULL,
  visual_description TEXT NOT NULL, -- Detailed prompt with camera angles, lighting, etc.
  duration INTEGER NOT NULL DEFAULT 8, -- Each scene is 8 seconds
  
  -- Video generation tracking
  base_task_id TEXT, -- Original Veo task ID
  base_video_url TEXT,
  base_status TEXT DEFAULT 'pending' CHECK (base_status IN ('pending', 'generating', 'complete', 'failed')),
  
  -- Extension tracking (if scene needs to be longer than 8s)
  extension_task_ids TEXT[], -- Array of extension task IDs
  extension_video_urls TEXT[], -- Array of extension video URLs
  extension_status TEXT DEFAULT 'not_needed' CHECK (extension_status IN ('not_needed', 'pending', 'extending', 'complete', 'failed')),
  
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(project_id, scene_number)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_video_gen_projects_user_id ON video_generation_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_video_gen_projects_status ON video_generation_projects(status);
CREATE INDEX IF NOT EXISTS idx_video_gen_scenes_project_id ON video_generation_scenes(project_id);
CREATE INDEX IF NOT EXISTS idx_video_gen_scenes_base_task_id ON video_generation_scenes(base_task_id);

-- Row Level Security (RLS)
ALTER TABLE video_generation_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_generation_scenes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own video generation projects"
  ON video_generation_projects FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can insert their own video generation projects"
  ON video_generation_projects FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can update their own video generation projects"
  ON video_generation_projects FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can delete their own video generation projects"
  ON video_generation_projects FOR DELETE
  USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can view scenes from their projects"
  ON video_generation_scenes FOR SELECT
  USING (project_id IN (
    SELECT id FROM video_generation_projects 
    WHERE user_id = current_setting('app.current_user_id', true)
  ));

CREATE POLICY "Users can insert scenes to their projects"
  ON video_generation_scenes FOR INSERT
  WITH CHECK (project_id IN (
    SELECT id FROM video_generation_projects 
    WHERE user_id = current_setting('app.current_user_id', true)
  ));

CREATE POLICY "Users can update scenes in their projects"
  ON video_generation_scenes FOR UPDATE
  USING (project_id IN (
    SELECT id FROM video_generation_projects 
    WHERE user_id = current_setting('app.current_user_id', true)
  ));

CREATE POLICY "Users can delete scenes from their projects"
  ON video_generation_scenes FOR DELETE
  USING (project_id IN (
    SELECT id FROM video_generation_projects 
    WHERE user_id = current_setting('app.current_user_id', true)
  ));
