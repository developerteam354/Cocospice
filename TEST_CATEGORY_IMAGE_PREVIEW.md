# Quick Test Guide - Category Image Preview Fix

## ✅ What Was Fixed

**Problem:** When editing a category, the existing image wasn't showing in the modal preview.

**Solution:** Separated state for existing S3 URLs and new file uploads, with proper handling for both.

---

## 🧪 How to Test

### Test 1: Edit Category With Image

1. **Go to:** `http://localhost:3001/admin/category`

2. **Find a category that has an image** (you should see it in the list)

3. **Click the edit button** (pencil icon) on that category

4. **Expected Result:**
   - ✅ Modal opens with category name and description filled
   - ✅ **Existing image is visible in the preview box** (80x80px)
   - ✅ Button says "Change Image"
   - ✅ Image loads from S3 URL

5. **Try changing the image:**
   - Click "Change Image"
   - Select a new image file
   - ✅ New image preview should replace the old one
   - Click "Save Changes"
   - ✅ New image should upload successfully

---

### Test 2: Edit Category Without Image

1. **Find a category without an image** (shows placeholder in list)

2. **Click edit button**

3. **Expected Result:**
   - ✅ Modal opens
   - ✅ Shows placeholder icon (no image)
   - ✅ Button says "Upload Image"

4. **Upload an image:**
   - Click "Upload Image"
   - Select an image
   - ✅ Preview should show the selected image
   - Click "Save Changes"
   - ✅ Image should upload to S3

---

### Test 3: Create New Category

1. **Click "Add Category"**

2. **Expected Result:**
   - ✅ Modal opens
   - ✅ Shows placeholder icon
   - ✅ Button says "Upload Image"

3. **Upload image and create:**
   - Fill in name and description
   - Upload an image
   - ✅ Preview shows uploaded image
   - Click "Create Category"
   - ✅ Category created with image

---

## 🎯 Key Improvements

### Before:
- ❌ Edit modal: Placeholder icon (no existing image)
- ❌ User confused: "Where's my image?"
- ❌ Mixed state for data URLs and S3 URLs

### After:
- ✅ Edit modal: Shows existing S3 image
- ✅ Clear visual feedback
- ✅ Separate state for existing vs new images
- ✅ Proper handling for both types

---

## 🔍 Visual Checklist

When you click "Edit" on a category with an image, you should see:

```
┌─────────────────────────────────┐
│  Edit Category              [X] │
├─────────────────────────────────┤
│                                 │
│  Category Name                  │
│  [Balti Dishes            ]     │
│                                 │
│  Description (Optional)         │
│  [Traditional Balti...    ]     │
│                                 │
│  Category Image                 │
│  ┌────┐  ┌──────────────┐      │
│  │ 📷 │  │ Change Image │      │ ← Image visible!
│  └────┘  └──────────────┘      │
│  Recommended: Square image...   │
│                                 │
│  [Cancel]  [Save Changes]       │
└─────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### Image Not Showing?

**Check 1: Browser Console**
```
Open DevTools (F12) → Console tab
Look for errors like:
- "Invalid src prop"
- "Failed to load resource"
```

**Check 2: Network Tab**
```
Open DevTools (F12) → Network tab
Filter: Img
Look for S3 image request
- Status should be 200
- Preview should show image
```

**Check 3: Category Data**
```
Open DevTools (F12) → Console tab
When you click edit, check:
console.log(category.categoryImage)
Should show S3 URL like:
"https://hokz-media-storage.s3.eu-north-1.amazonaws.com/categories/..."
```

**Check 4: Next.js Config**
```
Verify admin/next.config.ts has:
{
  protocol: 'https',
  hostname: 'hokz-media-storage.s3.eu-north-1.amazonaws.com',
}
```

---

### Still Not Working?

**Restart Admin Panel:**
```bash
cd admin
# Press Ctrl+C to stop
npm run dev
```

**Check Backend:**
```bash
# Verify category has image in database
# Check backend logs for errors
```

**Clear Browser Cache:**
```
Ctrl+Shift+R (hard refresh)
Or clear cache in DevTools
```

---

## ✅ Success Criteria

**The fix is working when:**

1. ✅ Click edit on category with image
2. ✅ Modal opens
3. ✅ **Existing image is visible in preview box**
4. ✅ Button says "Change Image"
5. ✅ Can upload new image to replace it
6. ✅ Save works correctly

---

## 📊 Technical Details

### State Management:
```typescript
// Separate states for different image sources
const [imageFile, setImageFile] = useState<File | null>(null);
const [imagePreview, setImagePreview] = useState<string>('');        // Data URL
const [existingImageUrl, setExistingImageUrl] = useState<string>(''); // S3 URL

// Display priority: new preview > existing URL
const displayImage = imagePreview || existingImageUrl;
```

### Image Component:
```tsx
<Image 
  src={displayImage} 
  alt="Category preview" 
  fill
  className="object-cover"
  unoptimized={imagePreview ? true : false}  // Data URLs need unoptimized
/>
```

---

## 📝 Files Modified

1. ✅ `admin/src/components/admin/category/CategoryModal.tsx`
   - Added `existingImageUrl` state
   - Separated new vs existing image handling
   - Updated Image component props
   - Fixed button text logic

---

**Ready to test!** 🚀

Try editing a category with an image - you should see the existing image in the preview box!
