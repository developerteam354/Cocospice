# Profile Image Upload - Final Fix

## Problem
The profile image upload was failing because:
1. The `uploadImage` function returns a **proxy URL** (e.g., `http://localhost:5000/api/admin/upload/image?key=...`)
2. The profile page was saving this proxy URL to the database
3. The backend couldn't handle proxy URLs as profile images

## Solution
Store the **S3 URL** in the database, but display using the **proxy URL** in the frontend.

### Changes Made

#### 1. Profile Page State Management
Added `profileImageKey` state to track the S3 key separately:

```typescript
const [profileImage, setProfileImage] = useState('');        // For display (proxy URL)
const [profileImageKey, setProfileImageKey] = useState('');  // For saving (S3 key)
```

#### 2. Upload Handler
When image is uploaded, store both the proxy URL (for display) and the S3 key (for saving):

```typescript
const result = await productService.uploadImage(file, 'admin/profiles');
setProfileImage(result.url);  // Proxy URL for display
setProfileImageKey(result.key); // S3 key for database
```

#### 3. Save Handler
Construct the proper S3 URL from the key before saving:

```typescript
let s3Url = admin?.profileImage || '';

if (profileImageKey) {
  // New upload - construct S3 URL from key
  const bucket = 'hokz-media-storage';
  const region = 'eu-north-1';
  s3Url = `https://${bucket}.s3.${region}.amazonaws.com/${profileImageKey}`;
}

// Save the S3 URL to database
await dispatch(updateProfile({
  fullName: fullName.trim(),
  profileImage: s3Url || undefined,
}));
```

#### 4. Display Logic
When displaying images, convert S3 URLs to proxy URLs using `toProxyUrl()`:

```typescript
// Profile page initialization
setProfileImage(admin.profileImage ? toProxyUrl(admin.profileImage) : '');

// Sidebar
<img src={toProxyUrl(admin.profileImage)} />

// Header
<img src={toProxyUrl(admin.profileImage)} />
```

## How It Works Now

### Upload Flow:
1. User selects image
2. Frontend uploads to backend `/api/admin/upload`
3. Backend uploads to S3 and returns `{ url: "s3://...", key: "admin/profiles/uuid.jpg" }`
4. Frontend stores:
   - `profileImage` = proxy URL (for immediate display)
   - `profileImageKey` = S3 key (for saving later)

### Save Flow:
1. User clicks "Save Changes"
2. Frontend constructs S3 URL from key: `https://hokz-media-storage.s3.eu-north-1.amazonaws.com/admin/profiles/uuid.jpg`
3. Backend saves S3 URL to database
4. Redux updates state with new admin data

### Display Flow:
1. Component receives admin data from Redux
2. `admin.profileImage` contains S3 URL
3. `toProxyUrl()` converts it to proxy URL
4. Browser requests: `http://localhost:5000/api/admin/upload/image?key=admin/profiles/uuid.jpg`
5. Backend streams image from S3 → Browser

## Benefits

✅ **Database stores S3 URLs** (portable, can change proxy logic later)
✅ **S3 bucket stays private** (no public access needed)
✅ **No AWS console changes** (works out of the box)
✅ **Images display correctly** (proxy handles authentication)
✅ **Consistent with products** (same pattern everywhere)

## Testing

1. **Navigate to Profile**: http://localhost:3001/admin/profile
2. **Click "Edit Profile"**
3. **Click on profile image** to upload
4. **Select an image** (JPEG, PNG, WebP, or AVIF)
5. **Verify**:
   - ✅ Loading spinner appears
   - ✅ Success toast shows
   - ✅ Image displays immediately
6. **Click "Save Changes"**
7. **Verify**:
   - ✅ Profile saves successfully
   - ✅ Image persists after page refresh
   - ✅ Image shows in sidebar
   - ✅ Image shows in header

## Summary

The fix ensures that:
- **Database** stores proper S3 URLs
- **Frontend** displays images via proxy
- **Upload** works without errors
- **Display** works across all components

**Status**: ✅ Ready to test!
