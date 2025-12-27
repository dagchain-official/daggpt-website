-- Create deployments table to track website deployments
CREATE TABLE IF NOT EXISTS public.deployments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  project_id TEXT NOT NULL UNIQUE,
  project_name TEXT NOT NULL,
  website_url TEXT NOT NULL,
  file_count INTEGER NOT NULL DEFAULT 0,
  deployed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for faster queries
  CONSTRAINT deployments_project_id_key UNIQUE (project_id)
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_deployments_user_id ON public.deployments(user_id);

-- Create index on deployed_at for sorting
CREATE INDEX IF NOT EXISTS idx_deployments_deployed_at ON public.deployments(deployed_at DESC);

-- Enable Row Level Security
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can view their own deployments
CREATE POLICY "Users can view own deployments"
  ON public.deployments
  FOR SELECT
  USING (true); -- Public read for now, can restrict to user_id later

-- Create policy: Users can insert their own deployments
CREATE POLICY "Users can create deployments"
  ON public.deployments
  FOR INSERT
  WITH CHECK (true); -- Allow all inserts for now

-- Create policy: Users can update their own deployments
CREATE POLICY "Users can update own deployments"
  ON public.deployments
  FOR UPDATE
  USING (true); -- Allow all updates for now

-- Create policy: Users can delete their own deployments
CREATE POLICY "Users can delete own deployments"
  ON public.deployments
  FOR DELETE
  USING (true); -- Allow all deletes for now

-- Add comment
COMMENT ON TABLE public.deployments IS 'Stores metadata for deployed websites';
