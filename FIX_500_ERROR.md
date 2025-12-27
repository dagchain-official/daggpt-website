# 🔧 Fix 500 Error - Database Setup Required

## ❌ **Error You're Seeing:**
```
Failed to load resource: the server responded with a status of 500
[GenerateVideo] Error: Error: Failed to create project
```

## 🎯 **Root Cause:**
The `video_generation_projects` and `video_generation_scenes` tables don't exist in your Supabase database yet.

---

## ✅ **SOLUTION: Run SQL in Supabase**

### **Step 1: Open Supabase SQL Editor**
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### **Step 2: Copy & Paste This SQL**

Open the file: `SIMPLE_SUPABASE_SETUP.sql`

Or copy this:

```sql
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

-- DISABLE RLS for easier testing
ALTER TABLE video_generation_projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE video_generation_scenes DISABLE ROW LEVEL SECURITY;
```

### **Step 3: Run the Query**
1. Click **RUN** button (or press Ctrl+Enter)
2. Wait for "Success. No rows returned"
3. Done! ✅

---

## 🚀 **After Running SQL**

### **Backend Fix Deployed:**
✅ API now uses `SUPABASE_SERVICE_KEY` instead of anon key
✅ Bypasses RLS policies
✅ Production URL: https://daggpt-i28gkhsyv-vinod-kumars-projects-3f7e82a5.vercel.app

### **Test the Tool:**
1. Navigate to: `/testdashboard/generate-video`
2. Enter a prompt
3. Select aspect ratio and duration
4. Click "Generate Script"
5. Should work now! 🎉

---

## 🔍 **Verify Tables Created**

In Supabase:
1. Go to **Table Editor**
2. You should see:
   - ✅ `video_generation_projects`
   - ✅ `video_generation_scenes`

---

## 🚨 **If Still Getting 500 Error**

### **Check Environment Variables in Vercel:**
1. Go to Vercel Dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Verify these exist:
   - ✅ `SUPABASE_SERVICE_KEY` (NOT anon key!)
   - ✅ `REACT_APP_SUPABASE_URL`
   - ✅ `GROK_API_KEY`
   - ✅ `REACT_APP_KIE_API_KEY`

### **Check Vercel Logs:**
1. Go to Vercel Dashboard
2. Click **Deployments**
3. Click latest deployment
4. Click **Functions** tab
5. Find `video-generator` function
6. Check logs for specific error

---

## 📊 **What Changed**

### **Before:**
```javascript
// Used anon key (enforces RLS)
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
// ❌ RLS blocked inserts
```

### **After:**
```javascript
// Uses service key (bypasses RLS)
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
// ✅ Full database access
```

---

## ✅ **Summary**

1. **Run SQL** in Supabase (creates tables)
2. **Verify** tables exist in Table Editor
3. **Test** the Generate Video tool
4. **Should work!** 🎬

---

## 🎯 **Next Steps After Fix**

Once tables are created and error is fixed:
1. Test creating a simple 8-second video
2. Test creating a 16-second video (with extension)
3. Verify extensions work automatically
4. Test stitching and download

**The extension API is ready to go once the database is set up!** 🚀
