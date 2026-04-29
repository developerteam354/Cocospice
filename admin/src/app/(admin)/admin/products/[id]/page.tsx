'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Edit2, Package, Leaf, 
  ShoppingCart, Tag, ChefHat, Loader2, Plus, Eye, EyeOff
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';
import { fetchProductById, toggleProductAvailability } from '@/store/slices/productSlice';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function ProductDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const productId = params.id as string;

  const { currentProduct, currentProductLoading, error } = useAppSelector(
    (state: RootState) => state.products
  );

  // Fetch product data
  useEffect(() => {
    if (productId) {
      dispatch(fetchProductById(productId));
    }
  }, [dispatch, productId]);

  // Handle toggle list/unlist
  const handleToggleList = async () => {
    if (!currentProduct) return;
    
    const newStatus = !currentProduct.isAvailable;
    const result = await dispatch(toggleProductAvailability({ 
      id: productId, 
      isAvailable: newStatus 
    }));
    
    if (toggleProductAvailability.fulfilled.match(result)) {
      toast.success(
        newStatus 
          ? 'Product is now visible to customers' 
          : 'Product is now hidden from customers'
      );
      // No need to re-fetch - Redux state updates automatically
    } else {
      toast.error('Failed to update product status');
    }
  };

  // Loading state
  if (currentProductLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="mx-auto mb-4 animate-spin text-indigo-400" />
          <p className="text-lg text-slate-400">Loading product details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !currentProduct) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Package size={64} className="mx-auto mb-4 text-slate-600" />
          <h2 className="mb-2 text-2xl font-bold text-white">Product Not Found</h2>
          <p className="mb-6 text-slate-400">{error || 'The product you are looking for does not exist.'}</p>
          <Button onClick={() => router.push('/admin/products')}>
            <ArrowLeft size={16} />
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  const product = currentProduct;
  const categoryName = typeof product.category === 'object' 
    ? product.category.name 
    : 'Uncategorized';

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

      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Product Details</h1>
              <p className="text-sm text-slate-400">View and manage product information</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => router.push(`/admin/products/${productId}/edit`)}
              variant="secondary"
            >
              <Edit2 size={16} />
              Edit
            </Button>
            <button
              onClick={handleToggleList}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                product.isAvailable
                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                  : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
              }`}
            >
              {product.isAvailable ? (
                <>
                  <EyeOff size={16} />
                  Unlist Product
                </>
              ) : (
                <>
                  <Eye size={16} />
                  List Product
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 gap-6 lg:grid-cols-3"
        >
          {/* Left Column - Images */}
          <div className="space-y-4 lg:col-span-1">
            {/* Thumbnail */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-6 backdrop-blur-sm">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 blur-2xl" />
                <div className="relative aspect-square overflow-hidden rounded-2xl border-4 border-white/20 bg-gradient-to-br from-indigo-500/10 to-cyan-500/10">
                  {product.thumbnail?.url ? (
                    <img
                      src={product.thumbnail.url}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Package size={64} className="text-slate-500" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Gallery */}
            {product.gallery && product.gallery.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-4 backdrop-blur-sm">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
                  Gallery
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {product.gallery.map((img, idx) => (
                    <div
                      key={idx}
                      className="aspect-square overflow-hidden rounded-xl border border-white/10 bg-white/5"
                    >
                      <img
                        src={img.url}
                        alt={`Gallery ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="space-y-4 lg:col-span-2">
            {/* Identity Card */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-6 backdrop-blur-sm">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <h2 className="text-3xl font-bold text-white">{product.name}</h2>
                <Badge variant="slate">{categoryName}</Badge>
                {product.isVeg ? (
                  <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1">
                    <Leaf size={14} className="text-emerald-400" />
                    <span className="text-sm font-medium text-emerald-400">Veg</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1">
                    <span className="text-sm font-medium text-red-400">Non-Veg</span>
                  </div>
                )}
                {!product.isAvailable && (
                  <Badge variant="slate">Unlisted</Badge>
                )}
              </div>

              <p className="text-slate-300 leading-relaxed">{product.description}</p>
            </div>

            {/* Pricing Card */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-6 backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-2">
                <Tag size={18} className="text-indigo-400" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                  Pricing
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <p className="mb-1 text-xs text-slate-500">Base Price</p>
                  <p className={`text-2xl font-bold ${product.offerPercentage > 0 ? 'text-slate-500 line-through' : 'text-amber-400'}`}>
                    ₹{product.price}
                  </p>
                </div>

                {product.offerPercentage > 0 && (
                  <div>
                    <p className="mb-1 text-xs text-slate-500">Discount</p>
                    <p className="text-2xl font-bold text-orange-400">
                      {product.offerPercentage}% OFF
                    </p>
                  </div>
                )}

                <div>
                  <p className="mb-1 text-xs text-slate-500">Final Price</p>
                  <p className="text-3xl font-bold text-emerald-400">
                    ₹{product.finalPrice}
                  </p>
                </div>
              </div>
            </div>

            {/* Inventory Card */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-6 backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-2">
                <ShoppingCart size={18} className="text-indigo-400" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                  Inventory
                </h3>
              </div>

              <div className="flex items-center gap-6">
                <div>
                  <p className="mb-1 text-xs text-slate-500">Stock Quantity</p>
                  <p className="text-2xl font-bold text-white">{product.stock}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs text-slate-500">Status</p>
                  {product.stock > 0 ? (
                    <Badge variant="green">In Stock</Badge>
                  ) : (
                    <Badge variant="red">Out of Stock</Badge>
                  )}
                </div>
                {product.soldCount !== undefined && (
                  <div>
                    <p className="mb-1 text-xs text-slate-500">Sold</p>
                    <p className="text-2xl font-bold text-indigo-400">{product.soldCount}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Ingredients */}
            {product.ingredients && product.ingredients.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-6 backdrop-blur-sm">
                <div className="mb-4 flex items-center gap-2">
                  <ChefHat size={18} className="text-indigo-400" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                    Ingredients
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.ingredients.map((ingredient, idx) => (
                    <span
                      key={idx}
                      className="rounded-full border border-slate-500/30 bg-slate-500/10 px-3 py-1 text-sm text-slate-300"
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Extra Options */}
            {product.extraOptions && product.extraOptions.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-6 backdrop-blur-sm">
                <div className="mb-4 flex items-center gap-2">
                  <Plus size={18} className="text-indigo-400" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                    Extra Options
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.extraOptions.map((option, idx) => (
                    <span
                      key={idx}
                      className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-300"
                    >
                      {option}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}
