'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Package, CheckCircle, XCircle, EyeOff, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';
import {
  fetchAllProducts,
  fetchProductStats,
  toggleProductAvailability,
  deleteProduct,
} from '@/store/slices/productSlice';
import { fetchCategories } from '@/store/slices/categorySlice';
import type { IProductFilters } from '@/types/product';

import StatCard from '@/components/admin/products/StatCard';
import ProductFilters from '@/components/admin/products/ProductFilters';
import ProductTable from '@/components/admin/products/ProductTable';
import Button from '@/components/ui/Button';

// ─── Debounce hook ────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProductsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { products, total, loading, stats, statsLoading } = useAppSelector(
    (state: RootState) => state.products
  );
  const { categories } = useAppSelector((state: RootState) => state.category);

  const [filters, setFilters] = useState<IProductFilters>({ sortBy: 'newest' });
  const debouncedSearch = useDebounce(filters.search, 400);

  // Fetch categories once
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Fetch stats once
  useEffect(() => {
    dispatch(fetchProductStats());
  }, [dispatch]);

  // Fetch products when filters change
  useEffect(() => {
    dispatch(fetchAllProducts({ ...filters, search: debouncedSearch }));
  }, [dispatch, debouncedSearch, filters.status, filters.category, filters.minPrice, filters.maxPrice, filters.sortBy]);

  const handleFilterChange = useCallback((partial: Partial<IProductFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  }, []);

  const handleToggle = async (id: string, current: boolean) => {
    const result = await dispatch(toggleProductAvailability({ id, isAvailable: !current }));
    if (toggleProductAvailability.fulfilled.match(result)) {
      toast.success(current ? 'Product hidden' : 'Product listed');
    } else {
      toast.error('Failed to update visibility');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const result = await dispatch(deleteProduct(id));
    if (deleteProduct.fulfilled.match(result)) {
      toast.success('Product deleted');
      dispatch(fetchProductStats());
    } else {
      toast.error('Failed to delete product');
    }
  };

  return (
    <>
      <Toaster position="top-right" toastOptions={{
        style: { background: 'rgba(15,23,42,0.95)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
      }} />

      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/30 to-slate-900 p-6">
        <div className="mx-auto max-w-7xl space-y-6">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-2xl font-bold text-white">Products</h1>
              <p className="text-sm text-slate-400">
                {total} item{total !== 1 ? 's' : ''} total
              </p>
            </div>
            <Button onClick={() => router.push('/admin/products/create')}>
              <Plus size={16} />
              Add New Product
            </Button>
          </motion.div>

          {/* Stat Cards */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="grid grid-cols-2 gap-4 lg:grid-cols-4"
          >
            <StatCard label="Total Products" value={stats.total}     icon={Package}     color="indigo"  loading={statsLoading} />
            <StatCard label="Available"       value={stats.available} icon={CheckCircle} color="emerald" loading={statsLoading} />
            <StatCard label="Out of Stock"    value={stats.outOfStock}icon={XCircle}     color="red"     loading={statsLoading} />
            <StatCard label="Unlisted"        value={stats.unlisted}  icon={EyeOff}      color="slate"   loading={statsLoading} />
          </motion.div>

          {/* Filters + Table Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 space-y-5"
          >
            <ProductFilters
              filters={filters}
              categories={categories}
              onChange={handleFilterChange}
            />

            <div className="border-t border-white/5 pt-5">
              <ProductTable
                products={products}
                loading={loading}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onEdit={(id) => router.push(`/admin/products/${id}/edit`)}
              />
            </div>
          </motion.div>

        </div>
      </div>
    </>
  );
}
