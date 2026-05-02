'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import type { ICategory } from '@/types/category';
import Image from 'next/image';

const schema = z.object({
  name:        z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

interface CategoryModalProps {
  open:     boolean;
  onClose:  () => void;
  onSave:   (data: { name: string; description: string; categoryImage?: File }) => Promise<void>;
  initial?: ICategory | null;
}

export default function CategoryModal({ open, onClose, onSave, initial }: CategoryModalProps) {
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [existingImageUrl, setExistingImageUrl] = useState<string>('');
  const [imageError, setImageError] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  // Populate form when editing
  useEffect(() => {
    if (initial) {
      console.log('🔍 Edit Category Modal - Initial Data:', {
        name: initial.name,
        categoryImage: initial.categoryImage,
        hasImage: !!initial.categoryImage,
        imageLength: initial.categoryImage?.length || 0
      });
      
      reset({ name: initial.name, description: initial.description });
      // Set existing image URL from backend
      const imageUrl = initial.categoryImage || '';
      console.log('🖼️ Setting existingImageUrl to:', imageUrl);
      setExistingImageUrl(imageUrl);
      // Clear preview and file when editing (show existing image)
      setImagePreview('');
      setImageFile(null);
      setImageError(false);
    } else {
      reset({ name: '', description: '' });
      setExistingImageUrl('');
      setImagePreview('');
      setImageFile(null);
      setImageError(false);
    }
  }, [initial, open, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageError(false); // Reset error state
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      await onSave({ 
        name: data.name, 
        description: data.description ?? '',
        categoryImage: imageFile || undefined
      });
      // Only close modal on success
      reset({ name: '', description: '' });
      setImagePreview('');
      setImageFile(null);
      setExistingImageUrl('');
      onClose();
    } catch (error) {
      // Error is handled by parent component, modal stays open
      console.error('Category save error:', error);
    } finally {
      setSaving(false);
    }
  };

  // Determine which image to show: new preview or existing image
  const displayImage = imagePreview || existingImageUrl;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
              {/* Header */}
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                  {initial ? 'Edit Category' : 'Add Category'}
                </h2>
                <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input 
                  label="Category Name" 
                  placeholder="e.g. Starters, Main Course, Desserts" 
                  error={errors.name?.message} 
                  {...register('name')} 
                />
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-300">Description (Optional)</label>
                  <textarea 
                    rows={3} 
                    placeholder="Brief description of this category..."
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-indigo-500/60 resize-none transition-all"
                    {...register('description')} 
                  />
                  {errors.description && (
                    <span className="text-xs text-red-400">{errors.description.message}</span>
                  )}
                </div>

                {/* Category Image Upload */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-300">Category Image</label>
                  <div className="flex items-center gap-4">
                    {/* Image Preview */}
                    <div className="flex-shrink-0">
                      {displayImage ? (
                        <div className="relative h-20 w-20 rounded-lg overflow-hidden border-2 border-white/10 bg-slate-800">
                          {!imageError ? (
                            imagePreview ? (
                              // New upload - use Next Image with unoptimized
                              <Image 
                                src={displayImage} 
                                alt="Category preview" 
                                fill
                                className="object-cover"
                                unoptimized={true}
                                onError={() => {
                                  console.error('❌ Image load error:', displayImage);
                                  setImageError(true);
                                }}
                              />
                            ) : (
                              // Existing S3 URL - use regular img tag for better compatibility
                              <img 
                                src={displayImage} 
                                alt="Category preview" 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  console.error('❌ Image load error:', displayImage);
                                  setImageError(true);
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            )
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-700">
                              <ImageIcon size={24} className="text-slate-500" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="h-20 w-20 rounded-lg border-2 border-dashed border-white/20 bg-white/5 flex items-center justify-center">
                          <ImageIcon size={24} className="text-slate-500" />
                        </div>
                      )}
                    </div>

                    {/* Upload Button */}
                    <label className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 hover:bg-white/10 transition-colors">
                        <Upload size={16} />
                        <span>{displayImage ? 'Change Image' : 'Upload Image'}</span>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                  {displayImage && !imageError && (
                    <p className="text-xs text-slate-400">Current: {displayImage.substring(0, 50)}...</p>
                  )}
                  {imageError && (
                    <p className="text-xs text-red-400">⚠️ Image failed to load. Please upload a new one.</p>
                  )}
                  <p className="text-xs text-slate-500">Recommended: Square image, at least 300x300px</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" loading={saving} className="flex-1">
                    {initial ? 'Save Changes' : 'Create Category'}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
