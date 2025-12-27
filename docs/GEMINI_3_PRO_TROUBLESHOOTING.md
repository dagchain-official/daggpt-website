# Gemini 3 Pro Preview Troubleshooting Guide

## 🔍 Issue: 429 Quota Error

You're getting a 429 error even though you have credits. Here's how to fix it:

---

## ✅ Step 1: Verify Model Access

### Check if Gemini 3 Pro Preview is enabled:

1. Go to: https://aistudio.google.com
2. Click on "Get API Key" in the top right
3. Look for **"gemini-3-pro-preview"** in the available models list
4. If you don't see it, you may need to:
   - Request access to the preview program
   - Wait for Google to enable it for your account
   - Check if there's a waitlist

---

## ✅ Step 2: Check Quota Limits

### View your current quota:

1. Go to: https://aistudio.google.com
2. Click on your profile/account
3. Navigate to "Quotas" or "Usage"
4. Check the limits for **gemini-3-pro-preview**:
   - **RPM (Requests Per Minute):** Should show available requests
   - **TPM (Tokens Per Minute):** Should show available tokens
   - **RPD (Requests Per Day):** Should show available requests

### Common Quota Issues:

- **Preview models** often have lower quotas than stable models
- You might have hit the **per-minute** limit even if daily quota is fine
- Wait 1-2 minutes and try again

---

## ✅ Step 3: Verify API Key Permissions

### Ensure your API key has access:

1. Go to: https://aistudio.google.com/app/apikey
2. Find your API key
3. Check if it has permissions for:
   - ✅ Gemini 3 Pro Preview
   - ✅ Text generation
   - ✅ Long context (1M+ tokens)

### If not, create a new API key:

1. Click "Create API Key"
2. Select "Enable all models"
3. Copy the new key
4. Update your `.env` file:
   ```
   REACT_APP_GEMINI_API_KEY=your_new_key_here
   ```

---

## ✅ Step 4: Check Model Availability

### Test if the model is accessible:

Run this test in your browser console or Node.js:

```javascript
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI('YOUR_API_KEY');

async function testModel() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3-pro-preview' });
    const result = await model.generateContent('Hello, test!');
    console.log('✅ Model accessible:', result.response.text());
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testModel();
```

---

## ✅ Step 5: Alternative Solutions

### If Gemini 3 Pro Preview is not accessible:

#### Option A: Use Gemini 2.5 Pro (Stable)
```javascript
model: 'gemini-2.5-pro'
```
- Stable release (no preview issues)
- Higher quota limits
- Still excellent for website generation

#### Option B: Use Gemini 2.0 Flash Thinking
```javascript
model: 'gemini-2.0-flash-thinking-exp'
```
- Fast and reliable
- Good for website generation
- Higher availability

#### Option C: Wait for Gemini 3 Pro Stable Release
- Preview models can have access restrictions
- Stable release will have better availability
- Check Google's announcements

---

## 🔧 Quick Fix: Use Gemini 2.5 Pro Instead

If you want to use a stable, high-quality model right now:

1. Open: `src/services/geminiWebsiteBuilderService.js`
2. Change line 24 from:
   ```javascript
   model: 'gemini-3-pro-preview',
   ```
   To:
   ```javascript
   model: 'gemini-2.5-pro',
   ```

3. Deploy:
   ```bash
   vercel --prod
   ```

**Gemini 2.5 Pro Benefits:**
- ✅ Stable (no preview restrictions)
- ✅ Higher quota limits
- ✅ Excellent for website generation
- ✅ 1M+ token context window
- ✅ Better availability

---

## 📊 Model Comparison

| Model | Status | Quota | Website Quality | Availability |
|-------|--------|-------|-----------------|--------------|
| **gemini-3-pro-preview** | Preview | Low | Excellent | Limited |
| **gemini-2.5-pro** | Stable | High | Excellent | High |
| **gemini-2.0-flash-thinking** | Experimental | Medium | Very Good | Medium |
| **gemini-1.5-pro** | Stable | High | Good | High |

---

## 🎯 Recommended Action

**Use Gemini 2.5 Pro for now:**

1. It's stable and production-ready
2. Higher quota limits (no 429 errors)
3. Excellent website generation quality
4. Better availability than preview models

**Switch to Gemini 3 Pro when:**
- It's out of preview
- Your account gets access
- Quota limits are increased

---

## 📞 Contact Google Support

If you believe you should have access:

1. Go to: https://support.google.com/ai-studio
2. Report the issue with:
   - Your API key (first/last 4 characters only)
   - The 429 error message
   - Confirmation that you have credits
3. Ask about:
   - Gemini 3 Pro Preview access
   - Quota limits for your account
   - When stable release is expected

---

## ✨ Summary

**The 429 error is likely because:**
1. Gemini 3 Pro Preview has restricted access
2. Preview models have lower quotas
3. Your account may not be in the preview program

**Best solution:**
Use **Gemini 2.5 Pro** instead - it's stable, has high quotas, and generates excellent websites!

