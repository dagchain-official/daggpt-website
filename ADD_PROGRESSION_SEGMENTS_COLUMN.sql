-- Add progression_segments column to video_generation_scenes table
-- This stores the progressive 8-second segment prompts from Grok

ALTER TABLE video_generation_scenes 
ADD COLUMN IF NOT EXISTS progression_segments JSONB;

COMMENT ON COLUMN video_generation_scenes.progression_segments IS 'Array of progressive 8-second segment descriptions from Grok for natural video flow';

-- Example data structure:
-- progression_segments: [
--   "Segment 1 (0-8s): Close-up of Pepsi can with water droplets",
--   "Segment 2 (8-16s): Can opens with mist bursting out in slow motion",
--   "Segment 3 (16-24s): Ice cubes fall and splash with light beams"
-- ]
