# How to Upload Product Images

## Problem
Your "samoosa" product (and possibly other products) don't have thumbnail images in the database, causing broken images on the user frontend.

## Solution
You need to upload images for your products via the admin panel.

## Steps to Upload Product Images

### 1. Access Admin Panel
- Open your browser and go to: `http://localhost:3001/admin/products`
- Login with your admin credentials:
  - Email: `devteamadmin@gmail.com`
  - Password: `devadmin123`

### 2. Find the Product
- In the products list, locate the "samoosa" product
- Click the "Edit" button (pencil icon) next to it

### 3. Upload Thumbnail Image
- In the edit form, find the "Images" section
- Under "Thumbnail (required)", click the "Upload" button
- Select a high-quality image of the samoosa from your computer
  - Recommended: JPG, PNG, or WebP format
  - Recommended size: At least 800x600 pixels
  - The image will be automatically uploaded to AWS S3

### 4. Upload Gallery Images (Optional)
- Under "Gallery (up to 5)", you can upload additional images
- These will appear in the product detail modal carousel
- Click "Upload" and select up to 5 additional images

### 5. Save Changes
- Wait for all images to finish uploading (you'll see a loading spinner)
- Once uploads are complete, click "Update Product" button
- You'll see a success message

### 6. Verify on User Frontend
- Open the user frontend: `http://localhost:3000`
- Navigate to the category containing the samoosa
- The product image should now be visible!
- Click on the product to see the detail modal with all images

## Repeat for Other Products
Follow the same steps for any other products that don't have images.

## Technical Details

### What Happens Behind the Scenes
1. When you upload an image, it's sent to your backend API
2. The backend uploads it to AWS S3 bucket: `hokz-media-storage`
3. S3 returns a permanent URL for the image
4. The URL is saved in MongoDB in the product's `thumbnail` field
5. The frontend fetches this URL and displays the image

### Image Storage Structure
```javascript
thumbnail: {
  url: "https://hokz-media-storage.s3.eu-north-1.amazonaws.com/products/thumbnails/...",
  key: "products/thumbnails/..."
}
```

### Fallback Behavior
If a product doesn't have an image:
- The product grid shows a gradient placeholder with a 🍽️ emoji
- The detail modal shows the same fallback
- Console warnings help you identify which products need images

## Troubleshooting

### Images Not Showing After Upload
1. Check browser console for errors (F12 → Console tab)
2. Verify the S3 URL is accessible by copying it and opening in a new tab
3. Ensure `next.config.ts` has the S3 hostname configured:
   ```typescript
   remotePatterns: [
     {
       protocol: 'https',
       hostname: 'hokz-media-storage.s3.eu-north-1.amazonaws.com',
     },
   ]
   ```
4. Restart the frontend server after config changes

### Upload Fails
1. Check backend console for error messages
2. Verify AWS credentials in `Backend/.env`:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION=eu-north-1`
   - `AWS_S3_BUCKET=hokz-media-storage`
3. Ensure your AWS IAM user has S3 upload permissions

### Image Quality Issues
- Use high-resolution images (at least 800x600px)
- Compress images before upload to reduce file size
- Use JPG for photos, PNG for graphics with transparency
- Avoid images larger than 5MB

## Best Practices

1. **Consistent Image Sizes**: Use similar aspect ratios for all product images
2. **Good Lighting**: Ensure food photos are well-lit and appetizing
3. **Clean Background**: Use plain or blurred backgrounds
4. **Multiple Angles**: Upload 3-5 gallery images showing different views
5. **Optimize File Size**: Compress images to 200-500KB for faster loading

## Next Steps

After uploading images for all products:
1. Test the user frontend thoroughly
2. Check product detail modals
3. Verify images load quickly
4. Test on mobile devices
5. Consider adding image optimization/CDN if needed
