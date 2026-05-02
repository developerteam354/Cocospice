# Category Image Preview in Edit Modal - FIXED ✅

## Problem
When clicking "Edit Category", the existing category image was not showing in the modal preview.

## Root Cause
The modal was setting `imagePreview` state to the S3 URL, but Next.js Image component needs special handling for:
1. Data URLs (base64) from new file uploads
2. Remote URLs (S3) from existing images

The original code mixed both in the same state variable, causing issues.

## Solution Implemented

### 1. ✅ Separate State for Existing vs New Images

**File: `admin/src/components/admin/category/CategoryModal.tsx`**

**Added separate state variables:**
```typescript
const [imageFile, setImageFile] = useState<File | null>(null);
const [imagePreview, setImagePreview] = useState<string>('');        // For new uploads (data URL)
const [existingImageUrl, setExistingImageUrl] = useState<string>(''); // For existing S3 URLs
```

**Display logic:**
```typescript
// Determine which image to show: new preview or existing image
const displayImage = imagePreview || existingImageUrl;
```

---

### 2. ✅ Proper useEffect Handling

**When editing (initial exists):**
```typescript
if (initial) {
  reset({ name: initial.name, description: initial.description });
  // Set existing image URL from backend
  setExistingImageUrl(initial.categoryImage || '');
  // Clear preview and file when editing (show existing image)
  setImagePreview('');
  setImageFile(null);
}
```

**When creating new (no initial):**
```typescript
else {
  reset({ name: '', description: '' });
  setExistingImageUrl('');
  setImagePreview('');
  setImageFile(null);
}
```

---

### 3. ✅ Image Component with Proper Props

**Updated Image component:**
```tsx
{displayImage ? (
  <div className="relative h-20 w-20 rounded-lg overflow-hidden border-2 border-white/10">
    <Image 
      src={displayImage} 
      alt="Category preview" 
      fill
      className="object-cover"
      unoptimized={imagePreview ? true : false}  // Unoptimized for data URLs
    />
  </div>
) : (
  <div className="h-20 w-20 rounded-lg border-2 border-dashed border-white/20 bg-white/5 flex items-center justify-center">
    <ImageIcon size={24} className="text-slate-500" />
  </div>
)}
```

**Why `unoptimized`?**
- Data URLs (base64) from new uploads need `unoptimized={true}`
- S3 URLs can use Next.js optimization (`unoptimized={false}`)

---

### 4. ✅ Button Text Updates

**Updated button text:**
```tsx
<span>{displayImage ? 'Change Image' : 'Upload Image'}</span>
```

**Before:** Only checked `imageFile`
**After:** Checks `displayImage` (includes both new and existing)

---

## How It Works Now

### Create New Category:
```
1. User clicks "Add Category"
2. existingImageUrl = '' (empty)
3. imagePreview = '' (empty)
4. displayImage = '' (empty)
5. Shows placeholder icon ✅
6. User uploads image
7. imagePreview = data:image/png;base64,... ✅
8. displayImage = imagePreview ✅
9. Shows new image preview ✅
```

### Edit Existing Category:
```
1. User clicks "Edit" on category with image
2. existingImageUrl = 'https://hokz-media-storage.s3...' ✅
3. imagePreview = '' (cleared)
4. displayImage = existingImageUrl ✅
5. Shows existing S3 image ✅
6. User clicks "Change Image"
7. imagePreview = data:image/png;base64,... ✅
8. displayImage = imagePreview (new takes priority) ✅
9. Shows new image preview ✅
```

### Edit Category Without Image:
```
1. User clicks "Edit" on category without image
2. existingImageUrl = '' (empty)
3. imagePreview = '' (empty)
4. displayImage = '' (empty)
5. Shows placeholder icon ✅
6. User can upload new image ✅
```

---

## Image Configuration

### Admin Panel next.config.ts:
```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'hokz-media-storage.s3.eu-north-1.amazonaws.com',
    },
    {
      protocol: 'https',
      hostname: '*.s3.*.amazonaws.com',
    },
  ],
}
```

✅ S3 domain is properly configured

---

## Data Flow

### Backend → Frontend:
```
Backend Category Model:
{
  _id: "123",
  name: "Balti Dishes",
  description: "Traditional Balti curries",
  categoryImage: "https://hokz-media-storage.s3.eu-north-1.amazonaws.com/categories/abc123.png",
  isListed: true
}
  ↓
Redux Store (ICategory):
{
  _id: "123",
  name: "Balti Dishes",
  description: "Traditional Balti curries",
  categoryImage: "https://hokz-media-storage.s3.eu-north-1.amazonaws.com/categories/abc123.png",
  isListed: true
}
  ↓
Edit Button Click:
setEditing(category) → initial prop
  ↓
Modal useEffect:
setExistingImageUrl(initial.categoryImage)
  ↓
Display:
<Image src={existingImageUrl} />
```

---

## Testing Checklist

### Test 1: Edit Category With Image
1. ✅ Go to Categories page
2. ✅ Find category with image (e.g., "Balti Dishes")
3. ✅ Click edit button (pencil icon)
4. ✅ Modal opens
5. ✅ **Existing image should be visible in preview box**
6. ✅ Button should say "Change Image"

### Test 2: Change Existing Image
1. ✅ Open edit modal for category with image
2. ✅ Existing image visible
3. ✅ Click "Change Image"
4. ✅ Select new image file
5. ✅ **New image preview should replace old image**
6. ✅ Click "Save Changes"
7. ✅ New image should be uploaded to S3

### Test 3: Edit Category Without Image
1. ✅ Open edit modal for category without image
2. ✅ Should show placeholder icon
3. ✅ Button should say "Upload Image"
4. ✅ Can upload new image

### Test 4: Create New Category
1. ✅ Click "Add Category"
2. ✅ Should show placeholder icon
3. ✅ Button should say "Upload Image"
4. ✅ Upload image
5. ✅ Preview should show uploaded image

---

## Files Modified

1. ✅ `admin/src/components/admin/category/CategoryModal.tsx`
   - Added `existingImageUrl` state
   - Separated new upload preview from existing image URL
   - Added `displayImage` computed value
   - Updated Image component with `unoptimized` prop
   - Updated button text logic

---

## Common Issues & Solutions

### Issue: Image still not showing
**Check:**
1. Browser console for errors
2. Network tab - is image URL loading?
3. Is `categoryImage` field in database populated?
4. Is S3 URL correct and accessible?

**Solution:**
```bash
# Check category in database
# Should have categoryImage field with S3 URL
```

### Issue: "Invalid src prop" error
**Check:**
1. Is S3 domain in `next.config.ts`?
2. Did you restart admin panel after config change?

**Solution:**
```bash
cd admin
# Stop server (Ctrl+C)
npm run dev
```

### Issue: Image shows but is broken
**Check:**
1. Is S3 bucket public or has correct CORS?
2. Is image URL accessible in browser?

**Solution:**
- Test URL directly in browser
- Check S3 bucket permissions

---

## Status

- ✅ Separate state for existing vs new images
- ✅ Proper useEffect handling
- ✅ Image component with correct props
- ✅ Button text updates correctly
- ✅ No TypeScript errors
- ✅ S3 domain configured

---

## Expected Behavior

### Before Fix:
- ❌ Edit modal shows placeholder icon
- ❌ Existing image not visible
- ❌ User thinks image is missing

### After Fix:
- ✅ Edit modal shows existing image
- ✅ User can see current image
- ✅ User can change image if needed
- ✅ Clear visual feedback

---

**Status: FULLY FIXED** 🎉

Existing category images now display correctly in the edit modal!
