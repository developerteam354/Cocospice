'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChefHat, Plus, X, Loader2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';
import { fetchProductById, updateProduct } from '@/store/slices/productSlice';
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

// Helper: normalize extraOptions from backend (may be old string[] or new object[])
function normalizeExtraOptions(raw: unknown): IExtraOption[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((opt) => {
    if (typeof opt === 'string') return { name: opt, price: 0 };
    return { name: opt.name ?? '', price: Number(opt.price ?? 0) };
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const productId = params.id as string;

  const { currentProduct, currentProductLoading, loading } = useAppSelector(
    (state: RootState) => state.products
  );

  const [categories, setCategories]   = useState<IProductCategory[]>([]);
  const [thumbnail, setThumbnail]     = useState<IUploadedAsset[]>([]);
  const [gallery, setGallery]         = useState<IUploadedAsset[]>([]);
  const [dataLoaded, setDataLoaded]   = useState(false);

  // Refs for extra option inputs
  const optionNameRef  = useRef<HTMLInputElement>(null);
  const optionPriceRef = useRef<HTMLInputElement>(null);

  const isUploading = thumbnail.some((a) => a.uploading) || gallery.some((a) => a.uploading);

  const {
    register, handleSubmit, watch, setValue, control, reset,
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

  // Fetch product data and categories
  useEffect(() => {
    dispatch(fetchProductById(productId));
    productService.getCategories().then(setCategories).catch(() => {});
  }, [dispatch, productId]);

  // Pre-fill form when product data loads
  useEffect(() => {
    if (currentProduct && !dataLoaded) {
      reset({
        name: currentProduct.name,
        description: currentProduct.description,
        ingredients: currentProduct.ingredients?.join(', ') ?? '',
        price: String(currentProduct.price),
        offerPercentage: String(currentProduct.offerPercentage ?? 0),
        stock: String(currentProduct.stock ?? 0),
        category: typeof currentProduct.category === 'object'
          ? currentProduct.category._id
          : currentProduct.category,
        isVeg: currentProduct.isVeg,
        isAvailable: currentProduct.isAvailable,
        extraOptions: normalizeExtraOptions(currentProduct.extraOptions),
      });

      // Set existing images
      if (currentProduct.thumbnail) {
        setThumbnail([{ url: currentProduct.thumbnail.url, key: currentProduct.thumbnail.key }]);
      }
      if (currentProduct.gallery && currentProduct.gallery.length > 0) {
        setGallery(currentProduct.gallery.map(g => ({ url: g.url, key: g.key })));
      }

      setDataLoaded(true);
    }
  }, [currentProduct, dataLoaded, reset]);

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

    const uploadToast = toast.loading('Uploading to S3...');

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

    toast.success('Images uploaded to S3', { id: uploadToast });
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

    const updateToast = toast.loading('Updating database...');

    try {
      await dispatch(updateProduct({
        id: productId,
        payload: {
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
        },
      })).unwrap();

      toast.success('Product updated successfully!', { id: updateToast });
      router.push('/admin/products');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update product';
      toast.error(msg, { id: updateToast });
    }
  };

  // ─── Loading State ───────────────────────────────────────────────────────────

  if (currentProductLoading || !dataLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950/30 to-slate-900">
        <div className="text-center">
          <Loader2 size={48} className="mx-auto mb-4 animate-spin text-indigo-400" />
          <p className="text-lg text-slate-400">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!currentProduct) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950/30 to-slate-900">
        <div className="text-center">
          <p className="text-lg text-red-400">Product not found</p>
          <Button onClick={() => router.push('/admin/products')} className="mt-4">
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <Toaster position="top-right" toastOptions={{
        style: { background: 'rgba(15,23,42,0.95)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
      }} />

      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/30 to-slate-900 p-6">
        <div className="mx-auto max-w-3xl space-y-6">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4">
            <button onClick={() => router.back()}
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 border border-indigo-500/30">
                <ChefHat size={20} className="text-indigo-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Edit Product</h1>
                <p className="text-xs text-slate-400">Update product details and images</p>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])}
            className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 space-y-6"
          >

            {/* ── Basic Info ── */}
            <section className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Basic Info</h2>
              <Input label="Product Name" placeholder="e.g. Chicken Biryani"
                error={errors.name?.message} {...register('name')} />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">Description</label>
                <textarea rows={3} placeholder="Describe the dish..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-indigo-500/60 resize-none"
                  {...register('description')} />
                {errors.description && <p className="text-xs text-red-400">{errors.description.message}</p>}
              </div>
              <Input label="Ingredients (comma separated)" placeholder="Chicken, Rice, Spices"
                {...register('ingredients')} />
            </section>

            {/* ── Pricing & Stock ── */}
            <section className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Pricing & Stock</h2>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Price (£)" type="number" placeholder="2.99"
                  error={errors.price?.message} {...register('price')} />
                <Input label="Offer %" type="number" placeholder="0"
                  {...register('offerPercentage')} />
              </div>

              {/* Final price display */}
              <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
                <div>
                  <p className="text-xs text-slate-400">Final Price</p>
                  <p className="text-2xl font-bold text-emerald-400">£{finalPrice}</p>
                </div>
                {offerNum > 0 && (
                  <div className="text-right">
                    <p className="text-xs text-slate-500 line-through">£{priceNum.toFixed(2)}</p>
                    <p className="text-sm font-semibold text-emerald-500">{offerNum}% off</p>
                  </div>
                )}
              </div>

              <Input label="Stock" type="number" placeholder="50" {...register('stock')} />
            </section>

            {/* ── Extra Options ── */}
            <Controller
              name="extraOptions"
              control={control}
              render={({ field }) => (
                <section className="space-y-3">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                    Extra Options
                    <span className="ml-2 text-xs font-normal normal-case text-slate-500">
                      Add name + price — press Enter or click +
                    </span>
                  </h2>

                  {/* Two-input row: name + price */}
                  <div className="flex gap-2">
                    <input
                      ref={optionNameRef}
                      type="text"
                      placeholder="Option name (e.g. Extra Cheese)"
                      onKeyDown={(e) => handleOptionKeyDown(e, field.value, field.onChange)}
                      className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    />
                    <input
                      ref={optionPriceRef}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="£0.00"
                      onKeyDown={(e) => handleOptionKeyDown(e, field.value, field.onChange)}
                      className="w-24 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => field.onChange(addOption(field.value))}
                      className="flex items-center justify-center rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-4 text-indigo-400 hover:bg-indigo-500/20 active:scale-95 transition-all"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* Badge list */}
                  <AnimatePresence>
                    {field.value.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex flex-wrap gap-2"
                      >
                        {field.value.map((option, i) => (
                          <motion.span
                            key={i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.15 }}
                            className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 pl-3 pr-2 py-1 text-sm text-indigo-300"
                          >
                            <span className="font-medium">{option.name}</span>
                            {option.price > 0 && (
                              <span className="text-xs text-indigo-400/70">(+£{option.price.toFixed(2)})</span>
                            )}
                            <button
                              type="button"
                              onClick={() => field.onChange(removeOption(field.value, i))}
                              className="ml-0.5 rounded-full p-0.5 text-indigo-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                            >
                              <X size={12} />
                            </button>
                          </motion.span>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {field.value.length === 0 && (
                    <p className="text-xs text-slate-500 italic">
                      No extra options added. Leave empty if not applicable.
                    </p>
                  )}
                </section>
              )}
            />

            {/* ── Category & Toggles ── */}
            <section className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Category & Options</h2>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">Category</label>
                <select {...register('category')}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/60"
                  style={{ background: '#1e293b', color: '#fff' }}>
                  <option value="" style={{ background: '#1e293b', color: '#fff' }}>Select category</option>
                  {categories.map((c) => <option key={c._id} value={c._id} style={{ background: '#1e293b', color: '#fff' }}>{c.name}</option>)}
                </select>
                {errors.category && <p className="text-xs text-red-400">{errors.category.message}</p>}
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setValue('isVeg', !isVeg)}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${isVeg ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' : 'border-red-500/40 bg-red-500/10 text-red-400'}`}>
                  <span className={`h-3 w-3 rounded-full ${isVeg ? 'bg-emerald-400' : 'bg-red-400'}`} />
                  {isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                </button>
                <button type="button" onClick={() => setValue('isAvailable', !isAvailable)}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${isAvailable ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-400' : 'border-slate-500/40 bg-slate-500/10 text-slate-400'}`}>
                  {isAvailable ? '👁 Listed' : '🚫 Unlisted'}
                </button>
              </div>
            </section>

            {/* ── Images ── */}
            <section className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                Images
                {isUploading && (
                  <span className="ml-2 text-xs font-normal text-indigo-400 animate-pulse">Uploading...</span>
                )}
              </h2>
              <ImageUpload label="Thumbnail (required)" assets={thumbnail}
                onFiles={handleThumbnail} onRemove={removeThumbnail} maxFiles={1} />
              <ImageUpload label="Gallery (up to 5)" multiple maxFiles={5}
                assets={gallery} onFiles={handleGallery} onRemove={removeGallery} />
            </section>

            {/* ── Submit ── */}
            <Button type="submit" loading={loading} disabled={isUploading} className="w-full">
              {isUploading ? 'Waiting for uploads...' : 'Update Product'}
            </Button>

          </motion.form>
        </div>
      </div>
    </>
  );
}
