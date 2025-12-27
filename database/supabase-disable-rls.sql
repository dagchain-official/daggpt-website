-- QUICK FIX: Disable RLS for testing
-- Run this in Supabase SQL Editor

-- This allows the anon key to read/write without auth checks
-- WARNING: This is for development only. In production, you should:
-- 1. Use proper RLS policies with Supabase Auth, OR
-- 2. Use service role key from backend API routes

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE creations DISABLE ROW LEVEL SECURITY;
