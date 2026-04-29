'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Loader2, Camera, Save, X, Edit } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';
import { getMe, updateProfile } from '@/store/slices/authSlice';
import productService, { toProxyUrl } from '@/services/productService';

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { admin, isRefreshing, loading } = useAppSelector((state: RootState) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [profileImageKey, setProfileImageKey] = useState(''); // Store the S3 key separately
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch profile if not already loaded
  useEffect(() => {
    if (!admin) {
      dispatch(getMe());
    }
  }, [admin, dispatch]);

  // Initialize form when admin data loads
  useEffect(() => {
    if (admin) {
      setFullName(admin.fullName);
      // Convert stored S3 URL → proxy URL so the private bucket is never
      // accessed directly from the browser.
      setProfileImage(admin.profileImage ? toProxyUrl(admin.profileImage) : '');
    }
  }, [admin]);

  // Handle image upload
  const handleImageClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsUploadingImage(true);
    const uploadToast = toast.loading('Uploading image to S3...');

    try {
      const result = await productService.uploadImage(file, 'admin/profiles');
      console.log('[Profile] S3 upload result:', result);
      
      // Store the proxy URL for display and the original S3 URL for saving
      setProfileImage(result.url); // This is the proxy URL for display
      setProfileImageKey(result.key); // Store the S3 key
      
      toast.success('Image uploaded successfully', { id: uploadToast });
    } catch (error) {
      console.error('[Profile] Upload error:', error);
      toast.error('Failed to upload image', { id: uploadToast });
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!fullName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    const updateToast = toast.loading('Updating profile...');

    // Construct the S3 URL from the key if we have a new upload
    // Otherwise, extract the S3 URL from the existing proxy URL or use the stored admin.profileImage
    let s3Url = admin?.profileImage || '';
    
    if (profileImageKey) {
      // New upload - construct S3 URL from key
      const bucket = 'hokz-media-storage';
      const region = 'eu-north-1';
      s3Url = `https://${bucket}.s3.${region}.amazonaws.com/${profileImageKey}`;
    }

    console.log('[Profile] Saving with data:', {
      fullName: fullName.trim(),
      profileImage: s3Url || undefined,
    });

    try {
      const result = await dispatch(updateProfile({
        fullName: fullName.trim(),
        profileImage: s3Url || undefined,
      })).unwrap();

      console.log('[Profile] Update successful:', result);
      toast.success('Profile updated successfully!', { id: updateToast });
      setIsEditing(false);
      setProfileImageKey(''); // Clear the key after successful save
    } catch (error) {
      console.error('[Profile] Update error:', error);
      toast.error('Failed to update profile', { id: updateToast });
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (admin) {
      setFullName(admin.fullName);
      setProfileImage(admin.profileImage ? toProxyUrl(admin.profileImage) : '');
      setProfileImageKey(''); // Clear any pending upload
    }
    setIsEditing(false);
  };

  // Show loading state
  if (isRefreshing || !admin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-indigo-400" />
          <p className="text-sm text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(15,23,42,0.95)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
          },
        }}
      />

      <div className="flex min-h-[60vh] items-center justify-center py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          {/* Profile Card */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-8 shadow-2xl backdrop-blur-xl">
            {/* Decorative gradient orbs */}
            <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-cyan-500/20 blur-3xl" />

            {/* Content */}
            <div className="relative z-10 space-y-8">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center justify-between"
              >
                <div>
                  <h1 className="text-3xl font-bold text-white">Admin Profile</h1>
                  <p className="mt-2 text-sm text-slate-400">
                    {isEditing ? 'Edit your account information' : 'View your account information'}
                  </p>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-400 hover:bg-indigo-500/20 transition-colors"
                  >
                    <Edit size={16} />
                    Edit Profile
                  </button>
                )}
              </motion.div>

              {/* Avatar Section */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex justify-center"
              >
                <div className="relative">
                  {/* Glow effect */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/30 to-cyan-500/30 blur-xl" />
                  
                  {/* Avatar */}
                  <div 
                    className={`relative h-32 w-32 overflow-hidden rounded-full border-4 border-white/20 bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 shadow-2xl ${isEditing ? 'cursor-pointer' : ''}`}
                    onClick={handleImageClick}
                  >
                    {isUploadingImage ? (
                      <div className="flex h-full w-full items-center justify-center bg-slate-900/50">
                        <Loader2 size={32} className="animate-spin text-indigo-400" />
                      </div>
                    ) : profileImage ? (
                      <img
                        src={profileImage}
                        alt={fullName}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          console.error('[Profile] Image load error:', profileImage);
                          // Fallback to initials on error
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.innerHTML = `<div class="flex h-full w-full items-center justify-center"><span class="text-5xl font-bold text-white">${fullName.charAt(0).toUpperCase()}</span></div>`;
                          }
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-5xl font-bold text-white">
                          {fullName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}

                    {/* Camera overlay when editing */}
                    {isEditing && !isUploadingImage && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                        <Camera size={32} className="text-white" />
                      </div>
                    )}
                  </div>

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
              </motion.div>

              {isEditing && (
                <p className="text-center text-xs text-slate-400">
                  Click on the profile picture to upload a new image
                </p>
              )}

              {/* Details Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-5"
              >
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                    <User size={16} className="text-indigo-400" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                      <p className="text-white">{admin.fullName}</p>
                    </div>
                  )}
                </div>

                {/* Email Address - Always Read Only */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                    <Mail size={16} className="text-cyan-400" />
                    Email Address
                    <span className="ml-auto text-xs text-slate-500">(Read Only)</span>
                  </label>
                  <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 opacity-60">
                    <p className="text-slate-400">{admin.email}</p>
                  </div>
                </div>

                {/* Role - Always Read Only */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                    <Shield size={16} className="text-emerald-400" />
                    Role
                    <span className="ml-auto text-xs text-slate-500">(Read Only)</span>
                  </label>
                  <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 opacity-60">
                    <p className="text-slate-400 capitalize">{admin.role}</p>
                  </div>
                </div>
              </motion.div>

              {/* Action Buttons */}
              {isEditing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex gap-3"
                >
                  <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white transition-all hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading || isUploadingImage}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-700 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Save Changes
                      </>
                    )}
                  </button>
                </motion.div>
              )}

              {/* Info Note */}
              {!isEditing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-4"
                >
                  <p className="text-center text-xs text-slate-400">
                    Email and Role fields are managed by the system and cannot be changed.
                    <br />
                    Contact support if you need to update these details.
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
