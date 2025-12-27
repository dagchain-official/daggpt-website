# 🐛 Debug: Polling Not Detecting Completed Video

## 🎯 **Issue**
- Video completes on KIE.AI (visible in their console)
- Our app keeps polling and showing "Generating..."
- Video URL format: `https://tempfile.aiquickdraw.com/v/...mp4`

## 🔍 **What to Check**

### **1. Vercel Function Logs**
Look for these logs in Vercel:
```
[checkVideoProgress] Scene 1 status: { ... }
[checkVideoProgress] Scene 1 - code: 200, successFlag: 1, videoUrl: https://...
[checkVideoProgress] Scene 1 complete! Video URL: https://...
```

**If you DON'T see these logs:**
- The polling function isn't being called
- Or it's failing silently

**If you see "still generating":**
- The API response structure is different than expected
- Need to see the actual JSON response

### **2. Supabase Database**
Check the `video_generation_scenes` table:

```sql
SELECT 
  scene_number,
  base_status,
  base_task_id,
  base_video_url,
  duration,
  updated_at
FROM video_generation_scenes
WHERE project_id = 'YOUR_PROJECT_ID'
ORDER BY scene_number;
```

**Expected values:**
- `base_status`: Should change from "generating" → "complete"
- `base_video_url`: Should have the video URL
- `duration`: Should be 24 (not 8!)

**If base_status is stuck on "generating":**
- The checkVideoProgress function isn't updating the database
- The API response isn't being parsed correctly

### **3. KIE.AI API Response**
The actual response structure from:
```
GET https://api.kie.ai/api/v1/veo/record-info?taskId=veo_task_...
```

**Expected structure (need to verify):**
```json
{
  "code": 200,
  "data": {
    "successFlag": 1,
    "response": {
      "resultUrls": ["https://tempfile.aiquickdraw.com/v/...mp4"],
      "originUrls": ["https://..."]
    }
  }
}
```

**Or possibly:**
```json
{
  "code": 200,
  "data": {
    "successFlag": 1,
    "resultUrls": ["https://tempfile.aiquickdraw.com/v/...mp4"]
  }
}
```

## 🔧 **Fixes Applied**

### **Fix 1: Better Response Parsing**
```javascript
// Try multiple possible paths for video URL
const videoUrl = 
  statusData.data?.response?.resultUrls?.[0] || 
  statusData.data?.response?.originUrls?.[0] ||
  statusData.data?.resultUrls?.[0] ||
  statusData.data?.originUrls?.[0] ||
  statusData.data?.videoUrl ||
  statusData.data?.url;
```

### **Fix 2: Detailed Logging**
```javascript
console.log(`[checkVideoProgress] Scene ${scene.scene_number} status:`, JSON.stringify(statusData, null, 2));
console.log(`[checkVideoProgress] Scene ${scene.scene_number} - code: ${code}, successFlag: ${successFlag}, videoUrl: ${videoUrl}`);
```

### **Fix 3: Multiple Success Conditions**
```javascript
if (successFlag === 1 || (code === 200 && videoUrl)) {
  // Mark as complete
}
```

## 📋 **Next Steps**

### **Step 1: Deploy Updated Code**
```bash
vercel --prod
```

### **Step 2: Test Again**
1. Create a new video project
2. Wait for generation
3. Check Vercel logs for detailed output

### **Step 3: Share Logs**
From Vercel function logs, share:
1. The full `[checkVideoProgress] Scene 1 status: {...}` log
2. Any error messages
3. The final status message

### **Step 4: Check Database**
Run the SQL query above and share:
- `base_status` value
- `base_video_url` value
- `duration` value

## 🎯 **Possible Issues**

### **Issue 1: Wrong API Response Structure**
**Symptom:** Logs show response but no video URL extracted
**Fix:** Need to see actual response to adjust parsing

### **Issue 2: Polling Stopped**
**Symptom:** No logs after initial generation
**Fix:** Check frontend polling interval

### **Issue 3: Database Not Updating**
**Symptom:** Logs show "complete" but database still "generating"
**Fix:** Check Supabase permissions

### **Issue 4: Wrong Task ID**
**Symptom:** API returns 404 or error
**Fix:** Verify task_id is saved correctly

## 🚀 **Quick Test**

### **Manual API Test:**
```bash
curl -X GET \
  "https://api.kie.ai/api/v1/veo/record-info?taskId=YOUR_TASK_ID" \
  -H "Authorization: Bearer YOUR_KIE_API_KEY"
```

Replace:
- `YOUR_TASK_ID`: Get from Supabase `base_task_id` column
- `YOUR_KIE_API_KEY`: From your `.env` file

**This will show the exact response structure!**

## ✅ **Success Indicators**

When working correctly, you should see:

**Vercel Logs:**
```
[checkVideoProgress] Scene 1 status: {"code":200,"data":{"successFlag":1,...}}
[checkVideoProgress] Scene 1 - code: 200, successFlag: 1, videoUrl: https://tempfile.aiquickdraw.com/v/...mp4
[checkVideoProgress] Scene 1 complete! Video URL: https://...
```

**Browser Console:**
```
[GenerateVideo] Progress: {total: 1, generating: 0, complete: 1, failed: 0}
[GenerateVideo] Scene details: [{sceneNumber: 1, duration: 24, needsExtension: true}]
[GenerateVideo] Starting extensions for scene 1
```

**Supabase:**
```
base_status: "complete"
base_video_url: "https://tempfile.aiquickdraw.com/v/...mp4"
duration: 24
```

---

## 🔑 **Key Questions to Answer**

1. **What does the Vercel log show for the API response?**
2. **What's the current value of `base_status` in Supabase?**
3. **Is the polling function being called repeatedly?**
4. **What's the exact response from KIE.AI API?**

**Once we have these answers, we can fix the exact issue!** 🎯
