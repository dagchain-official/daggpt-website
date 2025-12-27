# 🚀 Deploy Instructions

## Changes Made:
1. Fixed extension progress tracking in `checkVideoProgress`
2. Now polls KIE.AI directly for extension status
3. Automatically updates database with extension URLs when complete
4. Progress counter correctly waits for all extensions

## To Deploy:
```bash
vercel --prod
```

## What This Fixes:
- ✅ Extension video URLs will be saved to database
- ✅ extension_status will update to "complete"
- ✅ Progress will show "1/1 complete" when all extensions done
- ✅ Final 24-second video URL will be available

## Expected Behavior:
1. Base video (8s) generates → Saved
2. Extension 1 (16s total) generates → Saved to extension_video_urls[0]
3. Extension 2 (24s total) generates → Saved to extension_video_urls[1]
4. extension_status updates to "complete"
5. Frontend shows "All scenes generated!"

## Important Note:
The LAST extension URL (extension_video_urls[1]) contains the FULL 24-second video.
You don't need to stitch - just use the last URL!
