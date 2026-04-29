# S3 Image Access Issue - Solution Guide

## Problem
The profile image is uploaded to S3 successfully, but it cannot be loaded in the browser because the S3 bucket is private by default.

## Error Details
- **Image URL**: `https://hokz-media-storage.s3.eu-north-1.amazonaws.com/admin/profiles/3fac5e5f-0a29-43ec-9fbf-268b036ff633.jpeg`
- **Status**: Image exists in S3 (verified)
- **Issue**: Access Denied (403) - Bucket is private

## Solution 1: Make S3 Bucket Public (Recommended for Development)

### Step 1: Configure Bucket Public Access

1. Go to **AWS S3 Console**: https://s3.console.aws.amazon.com/
2. Select bucket: **hokz-media-storage**
3. Go to **"Permissions"** tab
4. Click **"Edit"** under "Block public access (bucket settings)"
5. **Uncheck** "Block all public access"
6. Click **"Save changes"**
7. Type **"confirm"** when prompted

### Step 2: Add Bucket Policy

1. Still in **"Permissions"** tab
2. Scroll to **"Bucket policy"**
3. Click **"Edit"**
4. Paste this policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::hokz-media-storage/*"
        }
    ]
}
```

5. Click **"Save changes"**

### Step 3: Test

1. Open this URL in your browser:
   ```
   https://hokz-media-storage.s3.eu-north-1.amazonaws.com/admin/profiles/3fac5e5f-0a29-43ec-9fbf-268b036ff633.jpeg
   ```
2. The image should now load successfully!
3. Refresh your admin profile page - the image should display

---

## Solution 2: Configure CORS (If images still don't load)

If images load when you open the URL directly but not in your app, you need to configure CORS:

### Add CORS Configuration

1. In S3 Console, select bucket: **hokz-media-storage**
2. Go to **"Permissions"** tab
3. Scroll to **"Cross-origin resource sharing (CORS)"**
4. Click **"Edit"**
5. Paste this configuration:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "HEAD"
        ],
        "AllowedOrigins": [
            "http://localhost:3001",
            "http://localhost:3000",
            "https://yourdomain.com"
        ],
        "ExposeHeaders": [
            "ETag"
        ],
        "MaxAgeSeconds": 3000
    }
]
```

6. Click **"Save changes"**

---

## Solution 3: Use Pre-Signed URLs (Most Secure - For Production)

If you don't want to make your bucket public, you can use pre-signed URLs that expire after a certain time.

### Implementation (Already Added to Code)

I've added a `getSignedImageUrl()` function to `Backend/src/utils/s3.utils.ts`. To use it:

1. **Backend**: Create an endpoint to generate signed URLs
2. **Frontend**: Request signed URL before displaying image

This is more complex but more secure for production use.

---

## Quick Test Commands

### Test if image is accessible:
```bash
curl -I https://hokz-media-storage.s3.eu-north-1.amazonaws.com/admin/profiles/3fac5e5f-0a29-43ec-9fbf-268b036ff633.jpeg
```

**Expected Response (After Fix)**:
```
HTTP/1.1 200 OK
Content-Type: image/jpeg
Content-Length: 9065
```

**Current Response (Before Fix)**:
```
HTTP/1.1 403 Forbidden
```

---

## Recommended Approach

**For Development**: Use **Solution 1** (Make bucket public)
- ✅ Simple and fast
- ✅ No code changes needed
- ✅ Works immediately
- ⚠️ Not recommended for production with sensitive data

**For Production**: Use **Solution 3** (Pre-signed URLs)
- ✅ Secure
- ✅ Fine-grained access control
- ✅ URLs expire automatically
- ⚠️ Requires additional backend endpoint

---

## After Applying Solution 1

Once you've made the bucket public:

1. **Refresh your browser** (Ctrl+F5 or Cmd+Shift+R)
2. **Navigate to Profile page**: http://localhost:3001/admin/profile
3. **Verify**:
   - ✅ Profile image displays in profile page
   - ✅ Profile image displays in sidebar
   - ✅ Profile image displays in header
4. **Test upload**:
   - Click "Edit Profile"
   - Upload a new image
   - Save changes
   - New image should display immediately

---

## Troubleshooting

### Image still doesn't load after making bucket public?

1. **Clear browser cache**: Ctrl+Shift+Delete (Chrome/Edge)
2. **Check browser console**: Look for CORS errors
3. **Verify bucket policy**: Make sure it was saved correctly
4. **Test URL directly**: Open image URL in new tab
5. **Check Next.js config**: Verify S3 hostname in `next.config.ts`

### Getting "Access Denied" error?

- Your IAM user needs these permissions:
  - `s3:PutObject` (to upload)
  - `s3:GetObject` (to read)
  - `s3:DeleteObject` (to delete)
  - `s3:PutObjectAcl` (to set ACL - optional)

### Images work in development but not production?

- Update CORS configuration to include your production domain
- Update Next.js config to include production S3 hostname
- Ensure environment variables are set in production

---

## Summary

**Immediate Action Required**: Apply **Solution 1** to make your S3 bucket public for development.

This will fix the image loading issue immediately without any code changes!

🚀 **After applying Solution 1, your profile images will work perfectly!**
