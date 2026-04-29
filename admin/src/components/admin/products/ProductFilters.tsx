'use client';

import { Search } from 'lucide-react';
import type { IProductFilters, IProductCategory } from '@/types/product';

interface ProductFiltersProps {
  filters: IProductFilters;
  categories: IProductCategory[];
  onChange: (filters: Partial<IProductFilters>) => void;
}

const selectClass =
  'rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all';

export default function ProductFilters({ filters, categories, onChange }: ProductFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search products..."
          value={filters.search ?? ''}
          onChange={(e) => onChange({ search: e.target.value })}
          className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-4 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
        />
      </div>

      {/* Status */}
      <select
        value={filters.status ?? 'all'}
        onChange={(e) => onChange({ status: e.target.value as IProductFilters['status'] })}
        className={selectClass}
      >
        <option value="all">All Status</option>
        <option value="available">Listed</option>
        <option value="unavailable">Unlisted</option>
        <option value="outofstock">Out of Stock</option>
      </select>

      {/* Category */}
      <select
        value={filters.category ?? ''}
        onChange={(e) => onChange({ category: e.target.value || undefined })}
        className={selectClass}
      >
        <option value="">All Categories</option>
        {categories.map((cat) => (
          <option key={cat._id} value={cat._id}>{cat.name}</option>
        ))}
      </select>

      {/* Price range */}
      <div className="flex items-center gap-2">
        <input
          type="number"
          placeholder="Min ₹"
          value={filters.minPrice ?? ''}
          onChange={(e) => onChange({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
          className="w-24 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-indigo-500/50"
        />
        <span className="text-slate-500">—</span>
        <input
          type="number"
          placeholder="Max ₹"
          value={filters.maxPrice ?? ''}
          onChange={(e) => onChange({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
          className="w-24 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-indigo-500/50"
        />
      </div>

      {/* Sort */}
      <select
        value={filters.sortBy ?? 'newest'}
        onChange={(e) => onChange({ sortBy: e.target.value as IProductFilters['sortBy'] })}
        className={selectClass}
      >
        <option value="newest">Newest First</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
      </select>
    </div>
  );
}
