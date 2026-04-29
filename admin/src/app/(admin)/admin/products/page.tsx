'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, CheckCircle, XCircle, EyeOff, Plus, Search, Edit2, Eye, Leaf } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';
import {
  fetchAllProducts,
  fetchProductStats,
  toggleProductAvailability,
} from '@/store/slices/productSlice';
import { fetchCategories } from '@/store/slices/categorySlice';
import type { IProduct } from '@/types/product';

import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

// ─── Stat Card Component ──────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  color: 'indigo' | 'emerald' | 'red' | 'slate';
  loading?: boolean;
}

function StatCard({ label, value, icon: Icon, color, loading }: StatCardProps) {
  const colorClasses = {
    indigo: 'from-indigo-500/20 to-indigo-600/20 text-indigo-400',
    emerald: 'from-emerald-500/20 to-emerald-600/20 text-emerald-400',
    red: 'from-red-500/20 to-red-600/20 text-red-400',
    slate: 'from-slate-500/20 to-slate-600/20 text-slate-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-5 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p>
          {loading ? (
            <div className="mt-2 h-8 w-16 animate-pulse rounded bg-white/10" />
          ) : (
            <p className="mt-1 text-3xl font-bold text-white">{value}</p>
          )}
        </div>
        <div className={`rounded-xl bg-gradient-to-br p-3 ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Product Card Component ───────────────────────────────────────────────────

interface ProductCardProps {
  product: IProduct;
  index: number;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onToggleList: (id: string, currentStatus: boolean) => void;
}

function ProductCard({ product, index, onView, onEdit, onToggleList }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-6 backdrop-blur-sm hover:border-indigo-500/30 transition-all duration-300 cursor-pointer"
      onClick={() => onView(product._id)}
    >
      {/* Decorative gradient */}
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-500/10 blur-2xl group-hover:bg-indigo-500/20 transition-all" />
      
      <div className="relative z-10 flex flex-col items-center space-y-4">
        {/* Product Image */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/30 to-cyan-500/30 blur-xl" />
          <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-white/20 bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 shadow-2xl">
            {product.thumbnail?.url ? (
              <img
                src={product.thumbnail.url}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Package size={48} className="text-slate-400" />
              </div>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="w-full space-y-3 text-center">
          {/* Name */}
          <h3 className="text-xl font-bold text-white line-clamp-2">{product.name}</h3>

          {/* Category & Veg Badge */}
          <div className="flex items-center justify-center gap-2">
            <Badge variant="slate">
              {typeof product.category === 'object' ? product.category.name : 'Uncategorized'}
            </Badge>
            {product.isVeg ? (
              <div className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5">
                <Leaf size={12} className="text-emerald-400" />
                <span className="text-xs font-medium text-emerald-400">Veg</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5">
                <span className="text-xs font-medium text-red-400">Non-Veg</span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center justify-center gap-2">
            {product.offerPercentage > 0 ? (
              <>
                <span className="text-2xl font-bold text-amber-400">₹{product.finalPrice}</span>
                <span className="text-sm text-slate-500 line-through">₹{product.price}</span>
                <Badge variant="orange">{product.offerPercentage}% OFF</Badge>
              </>
            ) : (
              <span className="text-2xl font-bold text-amber-400">₹{product.price}</span>
            )}
          </div>

          {/* Stock Status */}
          <div>
            {product.stock > 0 ? (
              <Badge variant="green">In Stock ({product.stock})</Badge>
            ) : (
              <Badge variant="red">Out of Stock</Badge>
            )}
          </div>

          {/* Availability Status */}
          {!product.isAvailable && (
            <Badge variant="slate">Unlisted</Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex w-full gap-2 pt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(product._id);
            }}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-400 hover:bg-indigo-500/20 transition-colors"
          >
            <Edit2 size={14} />
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleList(product._id, product.isAvailable);
            }}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
              product.isAvailable
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
            }`}
          >
            {product.isAvailable ? (
              <>
                <EyeOff size={14} />
                Unlist
              </>
            ) : (
              <>
                <Eye size={14} />
                List
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────

export default function ProductsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { products, loading, stats, statsLoading } = useAppSelector(
    (state: RootState) => state.products
  );
  const { categories } = useAppSelector((state: RootState) => state.category);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'unavailable' | 'outofstock'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchAllProducts({}));
    dispatch(fetchProductStats());
    dispatch(fetchCategories());
  }, [dispatch]);

  // Filter products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'available') {
        result = result.filter((p) => p.isAvailable && p.stock > 0);
      } else if (statusFilter === 'unavailable') {
        result = result.filter((p) => !p.isAvailable);
      } else if (statusFilter === 'outofstock') {
        result = result.filter((p) => p.isAvailable && p.stock === 0);
      }
    }

    // Category filter
    if (categoryFilter) {
      result = result.filter((p) => 
        typeof p.category === 'object' ? p.category._id === categoryFilter : p.category === categoryFilter
      );
    }

    return result;
  }, [products, search, statusFilter, categoryFilter]);

  const handleToggleList = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const result = await dispatch(toggleProductAvailability({ id, isAvailable: newStatus }));
    
    if (toggleProductAvailability.fulfilled.match(result)) {
      toast.success(
        newStatus 
          ? 'Product is now visible to customers' 
          : 'Product is now hidden from customers'
      );
      dispatch(fetchProductStats());
    } else {
      toast.error('Failed to update product status');
    }
  };

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
          <div>
            <h1 className="text-2xl font-bold text-white">Products</h1>
            <p className="text-sm text-slate-400">
              {filteredProducts.length} of {products.length} products
            </p>
          </div>
          <Button onClick={() => router.push('/admin/products/create')}>
            <Plus size={16} />
            Add Product
          </Button>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total Products" value={stats.total} icon={Package} color="indigo" loading={statsLoading} />
          <StatCard label="Available" value={stats.available} icon={CheckCircle} color="emerald" loading={statsLoading} />
          <StatCard label="Out of Stock" value={stats.outOfStock} icon={XCircle} color="red" loading={statsLoading} />
          <StatCard label="Unlisted" value={stats.unlisted} icon={EyeOff} color="slate" loading={statsLoading} />
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-4 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="unavailable">Unlisted</option>
            <option value="outofstock">Out of Stock</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </motion.div>

        {/* Products Grid */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-96 animate-pulse rounded-2xl border border-white/10 bg-white/5"
                />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02]">
              <div className="text-center">
                <Package size={48} className="mx-auto mb-4 text-slate-500" />
                <p className="text-lg font-medium text-slate-400">
                  {search || statusFilter !== 'all' || categoryFilter
                    ? 'No products match your filters'
                    : 'No products yet'}
                </p>
                {!search && statusFilter === 'all' && !categoryFilter && (
                  <Button onClick={() => router.push('/admin/products/create')} className="mt-4">
                    <Plus size={16} />
                    Add Your First Product
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <AnimatePresence>
                {filteredProducts.map((product, index) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    index={index}
                    onView={(id) => router.push(`/admin/products/${id}`)}
                    onEdit={(id) => router.push(`/admin/products/${id}/edit`)}
                    onToggleList={handleToggleList}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
}
