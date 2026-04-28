'use client';

import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import type { IProduct } from '@/types/product';

interface ProductTableProps {
  products: IProduct[];
  loading: boolean;
  onToggle: (id: string, current: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

function StockBadge({ stock, isAvailable }: { stock: number; isAvailable: boolean }) {
  if (!isAvailable) return <Badge variant="slate">Unlisted</Badge>;
  if (stock === 0)   return <Badge variant="red">Sold Out</Badge>;
  if (stock <= 5)    return <Badge variant="orange">Low Stock</Badge>;
  return <Badge variant="green">In Stock</Badge>;
}

const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.04, duration: 0.3, ease: 'easeOut' as const },
  }),
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

export default function ProductTable({ products, loading, onToggle, onDelete, onEdit }: ProductTableProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-white/5" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <p className="text-lg font-medium">No products found</p>
        <p className="text-sm">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/5 text-left text-xs text-slate-500 uppercase tracking-wider">
            <th className="pb-3 pr-4">Item</th>
            <th className="pb-3 pr-4">Category</th>
            <th className="pb-3 pr-4">Price</th>
            <th className="pb-3 pr-4">Stock</th>
            <th className="pb-3 pr-4">Status</th>
            <th className="pb-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {products.map((product, i) => (
              <motion.tr
                key={product._id}
                custom={i}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
              >
                {/* Thumbnail + Name */}
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-white/10">
                      <Image
                        src={product.thumbnail.url}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-white line-clamp-1">{product.name}</p>
                      <p className="text-xs text-slate-500">
                        {product.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="py-3 pr-4 text-slate-400">
                  {product.category?.name ?? '—'}
                </td>

                {/* Price */}
                <td className="py-3 pr-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">
                      ₹{product.finalPrice.toFixed(2)}
                    </span>
                    {product.offerPercentage > 0 && (
                      <span className="text-xs text-slate-500 line-through">
                        ₹{product.price.toFixed(2)}
                      </span>
                    )}
                    {product.offerPercentage > 0 && (
                      <span className="text-xs text-emerald-400">
                        {product.offerPercentage}% off
                      </span>
                    )}
                  </div>
                </td>

                {/* Stock count */}
                <td className="py-3 pr-4 text-slate-300">{product.stock}</td>

                {/* Status badge */}
                <td className="py-3 pr-4">
                  <StockBadge stock={product.stock} isAvailable={product.isAvailable} />
                </td>

                {/* Actions */}
                <td className="py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onToggle(product._id, product.isAvailable)}
                      title={product.isAvailable ? 'Hide product' : 'Show product'}
                      className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      {product.isAvailable ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                    <button
                      onClick={() => onEdit(product._id)}
                      title="Edit product"
                      className="rounded-lg p-2 text-slate-400 hover:bg-indigo-500/20 hover:text-indigo-400 transition-colors"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => onDelete(product._id)}
                      title="Delete product"
                      className="rounded-lg p-2 text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}
