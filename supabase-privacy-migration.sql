-- Privacy Control Migration for Creations
-- Run this in Supabase SQL Editor

-- Step 1: Add is_public column to creations table
-- Default TRUE to keep existing creations public (backward compatible)
ALTER TABLE creations 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- Step 2: Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_creations_is_public ON creations(is_public);

-- Step 3: Update existing creations to be public (if column was added without default)
UPDATE creations 
SET is_public = true 
WHERE is_public IS NULL;

-- Step 4: Drop old RLS policy for viewing creations
DROP POLICY IF EXISTS "Users can view own creations" ON creations;

-- Step 5: Create new RLS policies

-- Policy 1: Users can view their OWN creations (both public and private)
CREATE POLICY "Users can view own creations"
  ON creations FOR SELECT
  USING (auth.uid()::text = user_id);

-- Policy 2: Anyone can view PUBLIC creations from ANY user (for community page)
CREATE POLICY "Anyone can view public creations"
  ON creations FOR SELECT
  USING (is_public = true);

-- Policy 3: Users can UPDATE privacy of their own creations
CREATE POLICY "Users can update own creations privacy"
  ON creations FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'creations' 
  AND column_name = 'is_public';

-- Show sample of creations with new column
SELECT 
  id, 
  user_id, 
  type, 
  is_public,
  created_at 
FROM creations 
ORDER BY created_at DESC 
LIMIT 5;
