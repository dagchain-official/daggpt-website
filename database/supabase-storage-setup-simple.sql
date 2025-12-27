-- ============================================
-- SIMPLIFIED SUPABASE STORAGE SETUP
-- Run this in Supabase SQL Editor
-- ============================================

-- This creates the deployments table only
-- The storage bucket must be created manually in the UI

-- Create deployments table to track website deployments
CREATE TABLE IF NOT EXISTS public.deployments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  project_id TEXT NOT NULL UNIQUE,
  project_name TEXT NOT NULL,
  website_url TEXT NOT NULL,
  file_count INTEGER NOT NULL DEFAULT 0,
  deployed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_deployments_user_id ON public.deployments(user_id);
CREATE INDEX IF NOT EXISTS idx_deployments_deployed_at ON public.deployments(deployed_at DESC);

-- Enable Row Level Security
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access" ON public.deployments;
DROP POLICY IF EXISTS "Public insert access" ON public.deployments;
DROP POLICY IF EXISTS "Public update access" ON public.deployments;
DROP POLICY IF EXISTS "Public delete access" ON public.deployments;

-- Create policies (allow all for MVP)
CREATE POLICY "Public read access" 
  ON public.deployments FOR SELECT 
  USING (true);

CREATE POLICY "Public insert access" 
  ON public.deployments FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Public update access" 
  ON public.deployments FOR UPDATE 
  USING (true);

CREATE POLICY "Public delete access" 
  ON public.deployments FOR DELETE 
  USING (true);

-- Verify table was created
SELECT 'Deployments table created successfully!' as status;
