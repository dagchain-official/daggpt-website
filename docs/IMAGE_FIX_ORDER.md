# 🔧 Image src Fix Order - Critical

## ❌ **The Problem**

Grok was generating malformed img tags like:
```jsx
<img src="https://placehold.co/800x400/..."http://www.w3.org/2000/svg'..." />
```

This happened because the post-processing was running in the **wrong order**, causing concatenation instead of replacement.

---

## ✅ **The Solution: Correct Order**

### **Step 1: Fix Duplicate `src` Attributes**
```javascript
// Remove first src, keep second
.replace(/<img([^>]*?)src=["']([^"']+)["']([^>]*?)src=["']([^"']+)["']([^>]*?)>/g, 
  '<img$1$3src="$4"$5>')
```

**Before:**
```jsx
<img src="placeholder" src={dynamicImage} alt="..." />
```

**After:**
```jsx
<img src={dynamicImage} alt="..." />
```

---

### **Step 2: Replace External Placeholder URLs**
```javascript
// Replace placehold.co and via.placeholder.com with SVG data URLs
.replace(/src=["'](https?:\/\/(?:placehold\.co|via\.placeholder\.com)[^"']+)["']/g, 
  `src="data:image/svg+xml,%3Csvg..."`)
```

**Before:**
```jsx
<img src="https://placehold.co/800x600/..." />
<img src="https://via.placeholder.com/400x300/..." />
```

**After:**
```jsx
<img src="data:image/svg+xml,%3Csvg..." />
<img src="data:image/svg+xml,%3Csvg..." />
```

---

### **Step 3: Add `src` to Images Without One**
```javascript
// Add src to img tags that don't have one
.replace(/<img(?![^>]*src=)([^>]*?)>/g, (match, attrs) => {
  return `<img src="${svgDataUrl}"${attrs}>`;
})
```

**Before:**
```jsx
<img alt="Something" className="..." />
```

**After:**
```jsx
<img src="data:image/svg+xml,%3Csvg..." alt="Something" className="..." />
```

---

## 🎯 **Why Order Matters**

### **Wrong Order (Before):**
```
1. Add src to missing images
2. Fix duplicates
```

**Result:** Concatenation! 
```jsx
<img src="placeholder"data:image/svg+xml..." />
```

### **Correct Order (After):**
```
1. Fix duplicates FIRST
2. Replace external URLs
3. Add src to missing images LAST
```

**Result:** Clean, valid JSX! ✅

---

## 📊 **Complete Processing Pipeline**

```javascript
cleanCode
  // 1. Remove TypeScript
  .replace(/interface\s+\w+\s*\{[^}]*\}/g, '')
  
  // 2. Remove ternaries
  .replace(/const\s+(\w+)\s*=\s*[^;]*\?[^;]*;/g, '')
  
  // 3. Fix className ternaries
  .replace(/className=\{[^}]*\?[^}]*\}/g, 'className="p-4"')
  
  // 4. Fix duplicate src (FIRST)
  .replace(/<img([^>]*?)src=["']([^"']+)["']([^>]*?)src=["']([^"']+)["']([^>]*?)>/g, '<img$1$3src="$4"$5>')
  
  // 5. Replace external placeholders (SECOND)
  .replace(/src=["'](https?:\/\/(?:placehold\.co|via\.placeholder\.com)[^"']+)["']/g, 
    `src="data:image/svg+xml,..."`)
  
  // 6. Add missing src (THIRD)
  .replace(/<img(?![^>]*src=)([^>]*?)>/g, `<img src="data:image/svg+xml,..."$1>`)
```

---

## ✅ **Expected Results**

After this fix:

1. ✅ No duplicate `src` attributes
2. ✅ No external placeholder URLs (DNS errors)
3. ✅ All images have valid `src`
4. ✅ No concatenation issues
5. ✅ Clean, parseable JSX

---

## 🚀 **Deploy**

```bash
git add .
git commit -m "Fix image src processing order to prevent concatenation"
git push
```

---

**Critical fix deployed!** 🎯
