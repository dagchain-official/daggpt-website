# FREEPIK API TEST GUIDE

## Current Status
The UI is working perfectly and showing progress, but Freepik API calls are failing.

## Possible Issues:

### 1. API Endpoint Incorrect
Current: `https://api.freepik.com/v1/ai/text-to-image`
Check: Verify this is the correct endpoint in Freepik docs

### 2. Request Format Wrong
Current format:
```json
{
  "prompt": "...",
  "negative_prompt": "...",
  "num_images": 1,
  "guidance_scale": 7.5,
  "num_inference_steps": 50,
  "seed": null,
  "image": {
    "size": "1024x1024"
  },
  "styling": {
    "style": "photo",
    "color": "vibrant",
    "lighting": "studio"
  }
}
```

### 3. API Key Format
Current: `x-freepik-api-key: FPSX2d150e882ba21dfedb02218dab412204`
Check: Verify header name is correct

## Quick Test

Open browser console on the deployed site and check:
1. Network tab - Look for failed requests to api.freepik.com
2. Console logs - Look for detailed error messages
3. Response body - See what error Freepik is returning

## Next Steps

1. Check the actual error message in browser console
2. Verify API key is valid at https://www.freepik.com/developers/dashboard
3. Check Freepik API documentation for correct endpoint/format
4. Test with a simple curl command first

## Test Curl Command

```bash
curl -X POST https://api.freepik.com/v1/ai/text-to-image \
  -H "Content-Type: application/json" \
  -H "x-freepik-api-key: FPSX2d150e882ba21dfedb02218dab412204" \
  -d '{
    "prompt": "A cat",
    "num_images": 1
  }'
```

Run this to see if the API key and endpoint are correct.
