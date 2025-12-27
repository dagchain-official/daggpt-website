-- Create website_sessions table for storing user-specific website builder sessions
-- This fixes the privacy issue where all users were seeing the same sessions

CREATE TABLE IF NOT EXISTS website_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL DEFAULT 'Untitled Project',
  files JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  chat_history JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_website_sessions_user_id ON website_sessions(user_id);

-- Create index on updated_at for sorting
CREATE INDEX IF NOT EXISTS idx_website_sessions_updated_at ON website_sessions(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE website_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own sessions
CREATE POLICY "Users can view own sessions" ON website_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy: Users can insert their own sessions
CREATE POLICY "Users can insert own sessions" ON website_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own sessions
CREATE POLICY "Users can update own sessions" ON website_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy: Users can delete their own sessions
CREATE POLICY "Users can delete own sessions" ON website_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_website_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function
CREATE TRIGGER update_website_sessions_updated_at_trigger
  BEFORE UPDATE ON website_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_website_sessions_updated_at();
