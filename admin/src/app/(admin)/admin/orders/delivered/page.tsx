'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Eye, Package } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';
import { fetchDeliveredOrders } from '@/store/slices/orderSlice';
import Badge from '@/components/ui/Badge';

// ─── Row Animation Variants ───────────────────────────────────────────────────

const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.03, duration: 0.3 },
  }),
  exit: { opacity: 0, x: -16, transition: { duration: 0.2 } },
};

// ─── Main Page Component ──────────────────────────────────────────────────────

export default function DeliveredOrdersPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { deliveredOrders, deliveredLoading } = useAppSelector((state: RootState) => state.orders);

  const [search, setSearch] = useState('');

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchDeliveredOrders());
  }, [dispatch]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    let result = [...deliveredOrders];

    // Filter by search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (order) =>
          order.user.name.toLowerCase().includes(q) ||
          order.orderId.toLowerCase().includes(q) ||
          order.user.email.toLowerCase().includes(q)
      );
    }

    return result;
  }, [deliveredOrders, search]);

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Delivered Orders</h1>
          <p className="text-sm text-slate-400">
            {filteredOrders.length} completed order{filteredOrders.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => router.push('/admin/orders/new')}
          className="rounded-xl bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-400 hover:bg-indigo-500/20 transition-colors"
        >
          View New Orders
        </button>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          placeholder="Search by name, email, or order ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-4 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
        />
      </motion.div>

      {/* Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]"
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-left text-xs uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3">Order ID</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3 hidden md:table-cell">Delivered On</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {deliveredLoading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-white/5">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-8 animate-pulse rounded-lg bg-white/5" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-slate-500">
                  <div className="flex flex-col items-center gap-3">
                    <Package size={48} className="text-slate-600" />
                    <p>
                      {search
                        ? 'No orders match your search'
                        : 'No delivered orders yet'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              <AnimatePresence>
                {filteredOrders.map((order, i) => (
                  <motion.tr
                    key={order._id}
                    custom={i}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Order ID */}
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-indigo-400">
                        {order.orderId}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-white">
                          {order.user.name}
                        </p>
                        <p className="truncate text-xs text-slate-400">
                          {order.user.email}
                        </p>
                      </div>
                    </td>

                    {/* Delivered Date */}
                    <td className="hidden px-4 py-3 text-slate-400 md:table-cell">
                      {formatDate(order.updatedAt || order.date)}
                    </td>

                    {/* Total */}
                    <td className="px-4 py-3 font-semibold text-emerald-400">
                      £{order.price.toFixed(2)}
                    </td>

                    {/* Payment Method */}
                    <td className="px-4 py-3">
                      <Badge variant={order.paymentMethod === 'Cash on Delivery' ? 'amber' : 'blue'}>
                        {order.paymentMethod}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => router.push(`/admin/orders/${order._id}`)}
                          title="View Details"
                          className="rounded-lg p-2 text-slate-400 hover:bg-indigo-500/20 hover:text-indigo-400 transition-colors"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
