-- Video Projects Table
CREATE TABLE IF NOT EXISTS video_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  prompt TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scripting' CHECK (status IN ('scripting', 'awaiting_selection', 'rendering', 'done', 'error')),
  final_video_url TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scenes Table
CREATE TABLE IF NOT EXISTS video_scenes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES video_projects(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  script_text TEXT NOT NULL,
  visual_prompt TEXT NOT NULL,
  selected_image_url TEXT,
  video_clip_url TEXT,
  audio_url TEXT,
  duration_seconds DECIMAL(5,2) DEFAULT 5.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Image Options Table
CREATE TABLE IF NOT EXISTS video_image_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scene_id UUID NOT NULL REFERENCES video_scenes(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_selected BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_video_projects_user_id ON video_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_video_projects_status ON video_projects(status);
CREATE INDEX IF NOT EXISTS idx_video_scenes_project_id ON video_scenes(project_id);
CREATE INDEX IF NOT EXISTS idx_video_image_options_scene_id ON video_image_options(scene_id);

-- Row Level Security (RLS)
ALTER TABLE video_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_image_options ENABLE ROW LEVEL SECURITY;

-- Policies for video_projects
CREATE POLICY "Users can view their own projects"
  ON video_projects FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can insert their own projects"
  ON video_projects FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can update their own projects"
  ON video_projects FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', true));

-- Policies for video_scenes
CREATE POLICY "Users can view scenes of their projects"
  ON video_scenes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM video_projects
      WHERE video_projects.id = video_scenes.project_id
      AND video_projects.user_id = current_setting('app.current_user_id', true)
    )
  );

CREATE POLICY "Users can insert scenes for their projects"
  ON video_scenes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM video_projects
      WHERE video_projects.id = video_scenes.project_id
      AND video_projects.user_id = current_setting('app.current_user_id', true)
    )
  );

CREATE POLICY "Users can update scenes of their projects"
  ON video_scenes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM video_projects
      WHERE video_projects.id = video_scenes.project_id
      AND video_projects.user_id = current_setting('app.current_user_id', true)
    )
  );

-- Policies for video_image_options
CREATE POLICY "Users can view image options for their scenes"
  ON video_image_options FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM video_scenes
      JOIN video_projects ON video_projects.id = video_scenes.project_id
      WHERE video_scenes.id = video_image_options.scene_id
      AND video_projects.user_id = current_setting('app.current_user_id', true)
    )
  );

CREATE POLICY "Users can insert image options for their scenes"
  ON video_image_options FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM video_scenes
      JOIN video_projects ON video_projects.id = video_scenes.project_id
      WHERE video_scenes.id = video_image_options.scene_id
      AND video_projects.user_id = current_setting('app.current_user_id', true)
    )
  );

CREATE POLICY "Users can update image options for their scenes"
  ON video_image_options FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM video_scenes
      JOIN video_projects ON video_projects.id = video_scenes.project_id
      WHERE video_scenes.id = video_image_options.scene_id
      AND video_projects.user_id = current_setting('app.current_user_id', true)
    )
  );
