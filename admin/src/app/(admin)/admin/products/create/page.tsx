'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChefHat, Plus, X, Loader2, Package, Tag, ShoppingCart, Eye, EyeOff, Leaf } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

import productService from '@/services/productService';
import type { IProductCategory, IExtraOption } from '@/types/product';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import ImageUpload, { type IUploadedAsset } from '@/components/admin/products/ImageUpload';

// ─── Schema ───────────────────────────────────────────────────────────────────

const extraOptionSchema = z.object({
  name:  z.string().min(1),
  price: z.number().min(0).default(0),
});

const schema = z.object({
  name:            z.string().min(2, 'Name is required'),
  description:     z.string().min(10, 'Description must be at least 10 characters'),
  ingredients:     z.string().optional(),
  price:           z.string().min(1, 'Price is required'),
  offerPercentage: z.string().optional(),
  stock:           z.string().optional(),
  category:        z.string().min(1, 'Category is required'),
  isVeg:           z.boolean(),
  isAvailable:     z.boolean(),
  extraOptions:    z.array(extraOptionSchema),
});

type FormData = z.infer<typeof schema>;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CreateProductPage() {
  const router = useRouter();
  const [categories, setCategories]   = useState<IProductCategory[]>([]);
  const [submitting, setSubmitting]   = useState(false);
  const [thumbnail, setThumbnail]     = useState<IUploadedAsset[]>([]);
  const [gallery, setGallery]         = useState<IUploadedAsset[]>([]);

  // Refs for extra option inputs
  const optionNameRef  = useRef<HTMLInputElement>(null);
  const optionPriceRef = useRef<HTMLInputElement>(null);

  const isUploading = thumbnail.some((a) => a.uploading) || gallery.some((a) => a.uploading);

  const {
    register, handleSubmit, watch, setValue, control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      isVeg: true, isAvailable: true,
      offerPercentage: '0', stock: '0',
      extraOptions: [],
    },
  });

  const isVeg       = watch('isVeg');
  const isAvailable = watch('isAvailable');
  const priceNum    = parseFloat(watch('price') ?? '0') || 0;
  const offerNum    = parseFloat(watch('offerPercentage') ?? '0') || 0;
  const finalPrice  = offerNum > 0
    ? (priceNum - (priceNum * offerNum) / 100).toFixed(2)
    : priceNum.toFixed(2);

  useEffect(() => {
    productService.getCategories().then(setCategories).catch(() => {});
  }, []);

  // ─── Extra Option helpers ────────────────────────────────────────────────────

  const addOption = (currentOptions: IExtraOption[]) => {
    const name  = optionNameRef.current?.value.trim() ?? '';
    const price = parseFloat(optionPriceRef.current?.value ?? '0') || 0;
    if (!name) return currentOptions;
    const updated = [...currentOptions, { name, price }];
    if (optionNameRef.current)  optionNameRef.current.value  = '';
    if (optionPriceRef.current) optionPriceRef.current.value = '';
    optionNameRef.current?.focus();
    return updated;
  };

  const removeOption = (currentOptions: IExtraOption[], index: number) =>
    currentOptions.filter((_, i) => i !== index);

  const handleOptionKeyDown = (
    e: React.KeyboardEvent,
    currentOptions: IExtraOption[],
    onChange: (val: IExtraOption[]) => void
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onChange(addOption(currentOptions));
    }
  };

  // ─── Upload helpers ──────────────────────────────────────────────────────────

  const uploadFiles = async (
    files: File[],
    setter: React.Dispatch<React.SetStateAction<IUploadedAsset[]>>,
    folder: string
  ) => {
    const placeholders: IUploadedAsset[] = files.map(() => ({ url: '', key: '', uploading: true }));
    setter((prev) => [...prev, ...placeholders]);

    await Promise.all(
      files.map(async (file, i) => {
        try {
          const asset = await productService.uploadImage(file, folder);
          setter((prev) => {
            const updated = [...prev];
            const idx = updated.findIndex((a) => a.uploading);
            if (idx !== -1) updated[idx] = { ...asset, uploading: false };
            return updated;
          });
        } catch {
          toast.error(`Failed to upload image ${i + 1}`);
          setter((prev) => {
            const idx = prev.findIndex((a) => a.uploading);
            return prev.filter((_, j) => j !== idx);
          });
        }
      })
    );
  };

  const handleThumbnail = (files: File[]) => uploadFiles(files.slice(0, 1), setThumbnail, 'products/thumbnails');
  const handleGallery   = (files: File[]) => uploadFiles(files.slice(0, 5 - gallery.length), setGallery, 'products/gallery');

  const removeThumbnail = async (i: number) => {
    const asset = thumbnail[i];
    if (asset?.key) await productService.deleteImage(asset.key).catch(() => {});
    setThumbnail((p) => p.filter((_, idx) => idx !== i));
  };

  const removeGallery = async (i: number) => {
    const asset = gallery[i];
    if (asset?.key) await productService.deleteImage(asset.key).catch(() => {});
    setGallery((p) => p.filter((_, idx) => idx !== i));
  };

  // ─── Submit ──────────────────────────────────────────────────────────────────

  const onSubmit = async (data: FormData) => {
    const readyThumbnail = thumbnail.find((a) => !a.uploading);
    if (!readyThumbnail) { toast.error('Thumbnail is required'); return; }

    setSubmitting(true);
    const toastId = toast.loading('Creating product...');

    try {
      await productService.create({
        name:            data.name,
        description:     data.description,
        ingredients:     data.ingredients
          ? data.ingredients.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        isVeg:           data.isVeg,
        price:           parseFloat(data.price),
        offerPercentage: parseFloat(data.offerPercentage ?? '0') || 0,
        stock:           parseInt(data.stock ?? '0', 10) || 0,
        isAvailable:     data.isAvailable,
        category:        data.category,
        extraOptions:    data.extraOptions,
        thumbnail:       { url: readyThumbnail.url, key: readyThumbnail.key },
        gallery:         gallery.filter((a) => !a.uploading).map(({ url, key }) => ({ url, key })),
      });

      toast.success('Product created!', { id: toastId });
      router.push('/admin/products');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create product';
      toast.error(msg, { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const inputBaseClass = 
    'w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-[0.95rem] font-bold text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm';

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <Toaster position="top-right" toastOptions={{
        style: { 
          background: '#ffffff', 
          color: '#111827', 
          border: '1px solid #f3f4f6',
          borderRadius: '16px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        },
      }} />

      <div className="space-y-8 pb-20">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -12 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <button 
            onClick={() => router.back()}
            className="h-12 w-12 flex items-center justify-center rounded-2xl border border-gray-100 bg-white text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
          <div>
            <h1 className="text-[1.8rem] font-black text-gray-900 tracking-tight">Add New Product</h1>
            <p className="text-[0.95rem] font-medium text-gray-500 mt-1">
              Create a fresh dish for your digital menu
            </p>
          </div>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 12 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* ── Basic Info ── */}
            <div className="rounded-[32px] border border-gray-100 bg-white p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-600 border border-gray-100">
                  <Package size={20} strokeWidth={2.5} />
                </div>
                <h2 className="text-[0.85rem] font-black uppercase tracking-widest text-gray-400">Basic Information</h2>
              </div>
              
              <Input 
                label="Product Name" 
                placeholder="e.g. Chicken Biryani"
                error={errors.name?.message} 
                {...register('name')} 
              />
              
              <div className="flex flex-col gap-2">
                <label className="text-[0.9rem] font-black text-gray-900 tracking-tight">Description</label>
                <textarea 
                  rows={4} 
                  placeholder="Describe the dish, its preparation, and taste..."
                  className={inputBaseClass}
                  {...register('description')} 
                />
                {errors.description && <p className="text-[0.8rem] font-bold text-red-500">{errors.description.message}</p>}
              </div>
              
              <Input 
                label="Ingredients (comma separated)" 
                placeholder="Chicken, Basmati Rice, Ginger-Garlic, Spices"
                {...register('ingredients')} 
              />
            </div>

            {/* ── Pricing & Inventory ── */}
            <div className="rounded-[32px] border border-gray-100 bg-white p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <Tag size={20} strokeWidth={2.5} />
                </div>
                <h2 className="text-[0.85rem] font-black uppercase tracking-widest text-gray-400">Pricing & Inventory</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input 
                  label="Base Price (₹)" 
                  type="number" 
                  placeholder="299.00"
                  error={errors.price?.message} 
                  {...register('price')} 
                />
                <Input 
                  label="Offer Percentage (%)" 
                  type="number" 
                  placeholder="0"
                  {...register('offerPercentage')} 
                />
              </div>

              {/* Final price display */}
              <div className="flex items-center justify-between rounded-3xl border-2 border-dashed border-emerald-100 bg-emerald-50/30 p-6">
                <div>
                  <p className="text-[0.8rem] font-black text-emerald-600/60 uppercase tracking-wider">Estimated Selling Price</p>
                  <p className="text-[2.2rem] font-black text-emerald-600 tracking-tighter">₹{finalPrice}</p>
                </div>
                {offerNum > 0 && (
                  <div className="text-right">
                    <p className="text-[1rem] font-bold text-gray-400 line-through">₹{priceNum.toFixed(2)}</p>
                    <p className="text-[0.95rem] font-black text-orange-600 bg-orange-100 px-3 py-1 rounded-lg mt-1">{offerNum}% OFF SAVINGS</p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                  <ShoppingCart size={20} strokeWidth={2.5} />
                </div>
                <Input 
                  label="Initial Stock level" 
                  type="number" 
                  placeholder="50" 
                  {...register('stock')} 
                  containerClassName="flex-1"
                />
              </div>
            </div>

            {/* ── Extra Options ── */}
            <Controller
              name="extraOptions"
              control={control}
              render={({ field }) => (
                <div className="rounded-[32px] border border-gray-100 bg-white p-8 shadow-sm space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                      <Plus size={20} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-[0.85rem] font-black uppercase tracking-widest text-gray-400">Extra Add-ons</h2>
                      <p className="text-[0.8rem] font-bold text-gray-400 mt-0.5 normal-case">Add optional extras like toppings or sides</p>
                    </div>
                  </div>

                  <div className="flex gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100 shadow-inner">
                    <input
                      ref={optionNameRef}
                      type="text"
                      placeholder="e.g. Extra Cheese"
                      onKeyDown={(e) => handleOptionKeyDown(e, field.value, field.onChange)}
                      className="flex-1 bg-white rounded-xl border border-gray-200 px-4 py-2.5 text-[0.9rem] font-bold text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
                    />
                    <input
                      ref={optionPriceRef}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="₹0.00"
                      onKeyDown={(e) => handleOptionKeyDown(e, field.value, field.onChange)}
                      className="w-28 bg-white rounded-xl border border-gray-200 px-4 py-2.5 text-[0.9rem] font-bold text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => field.onChange(addOption(field.value))}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all active:scale-95 shadow-md shadow-emerald-200"
                    >
                      <Plus size={20} strokeWidth={3} />
                    </button>
                  </div>

                  {/* Badge list */}
                  <AnimatePresence>
                    {field.value.length > 0 && (
                      <div className="flex flex-wrap gap-2.5 pt-2">
                        {field.value.map((option, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/30 pl-4 pr-2 py-2"
                          >
                            <span className="text-[0.85rem] font-bold text-gray-800">{option.name}</span>
                            <span className="text-[0.8rem] font-black text-emerald-600 bg-white px-2 py-0.5 rounded-lg shadow-sm">
                              +₹{option.price.toFixed(2)}
                            </span>
                            <button
                              type="button"
                              onClick={() => field.onChange(removeOption(field.value, i))}
                              className="h-7 w-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all"
                            >
                              <X size={14} strokeWidth={3} />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </AnimatePresence>

                  {field.value.length === 0 && (
                    <div className="text-center py-6 rounded-2xl border-2 border-dashed border-gray-100">
                      <p className="text-[0.85rem] font-bold text-gray-400 italic">No extra options added.</p>
                    </div>
                  )}
                </div>
              )}
            />
          </div>

          {/* Right Column - Category & Images */}
          <div className="space-y-6">
            {/* ── Category & Visibility ── */}
            <div className="rounded-[32px] border border-gray-100 bg-white p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-orange-50 text-orange-600 border border-orange-100">
                  <ChefHat size={20} strokeWidth={2.5} />
                </div>
                <h2 className="text-[0.85rem] font-black uppercase tracking-widest text-gray-400">Settings</h2>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[0.9rem] font-black text-gray-900 tracking-tight">Category</label>
                <select 
                  {...register('category')}
                  className={inputBaseClass}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
                {errors.category && <p className="text-[0.8rem] font-bold text-red-500">{errors.category.message}</p>}
              </div>

              <div className="space-y-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setValue('isVeg', !isVeg)}
                  className={`w-full flex items-center justify-between rounded-2xl border-2 px-5 py-4 transition-all active:scale-[0.98] ${
                    isVeg 
                      ? 'border-emerald-100 bg-emerald-50 text-emerald-700 shadow-sm' 
                      : 'border-red-100 bg-red-50 text-red-700 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 flex items-center justify-center rounded-full ${isVeg ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                      <Leaf size={16} fill="currentColor" />
                    </div>
                    <span className="font-black uppercase tracking-wider text-[0.8rem]">{isVeg ? 'Pure Veg' : 'Non-Vegetarian'}</span>
                  </div>
                  <div className={`h-6 w-10 rounded-full relative transition-colors ${isVeg ? 'bg-emerald-500' : 'bg-red-500'}`}>
                    <div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${isVeg ? 'right-1' : 'left-1'}`} />
                  </div>
                </button>

                <button 
                  type="button" 
                  onClick={() => setValue('isAvailable', !isAvailable)}
                  className={`w-full flex items-center justify-between rounded-2xl border-2 px-5 py-4 transition-all active:scale-[0.98] ${
                    isAvailable 
                      ? 'border-emerald-100 bg-emerald-50 text-emerald-700 shadow-sm' 
                      : 'border-gray-200 bg-gray-50 text-gray-500 shadow-inner'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 flex items-center justify-center rounded-full ${isAvailable ? 'bg-emerald-500 text-white' : 'bg-gray-400 text-white'}`}>
                      {isAvailable ? <Eye size={16} /> : <EyeOff size={16} />}
                    </div>
                    <span className="font-black uppercase tracking-wider text-[0.8rem]">{isAvailable ? 'Publicly Listed' : 'Private / Hidden'}</span>
                  </div>
                </button>
              </div>
            </div>

            {/* ── Images ── */}
            <div className="rounded-[32px] border border-gray-100 bg-white p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                    <Plus size={20} strokeWidth={2.5} />
                  </div>
                  <h2 className="text-[0.85rem] font-black uppercase tracking-widest text-gray-400">Media Assets</h2>
                </div>
                {isUploading && (
                   <div className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin text-emerald-600" />
                      <span className="text-[0.7rem] font-black uppercase text-emerald-600">Uploading...</span>
                   </div>
                )}
              </div>
              
              <ImageUpload 
                label="Thumbnail (Required)" 
                assets={thumbnail}
                onFiles={handleThumbnail} 
                onRemove={removeThumbnail} 
                maxFiles={1} 
              />
              
              <div className="pt-2">
                <ImageUpload 
                  label="Gallery Photos (up to 5)" 
                  multiple 
                  maxFiles={5}
                  assets={gallery} 
                  onFiles={handleGallery} 
                  onRemove={removeGallery} 
                />
              </div>
            </div>

            {/* ── Submit ── */}
            <Button 
              type="submit" 
              loading={submitting} 
              disabled={isUploading} 
              className="w-full py-5 rounded-[24px] text-[1.1rem] shadow-[0_20px_40px_rgba(16,185,129,0.2)]"
            >
              {isUploading ? 'Finalizing uploads...' : 'Create Product Now'}
            </Button>
          </div>
        </motion.form>
      </div>
    </>
  );
}
