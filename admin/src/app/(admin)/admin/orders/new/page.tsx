'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Search, Eye, CheckCircle, XCircle, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';
import { fetchNewOrders, updateOrderStatus, fetchOrderStats } from '@/store/slices/orderSlice';
import type { IOrder, OrderStatus } from '@/types/order';
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

export default function NewOrdersPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { newOrders, loading, updating } = useAppSelector((state: RootState) => state.orders);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All');

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchNewOrders());
    dispatch(fetchOrderStats());
  }, [dispatch]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    let result = [...newOrders];

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

    // Filter by status
    if (statusFilter !== 'All') {
      result = result.filter((order) => order.status === statusFilter);
    }

    return result;
  }, [newOrders, search, statusFilter]);

  // Handle status update
  const handleStatusUpdate = async (orderId: string, status: OrderStatus) => {
    try {
      await dispatch(updateOrderStatus({ orderId, status })).unwrap();
      toast.success(`Order status updated to ${status}`);
      
      // Refresh stats
      dispatch(fetchOrderStats());
      
      // If delivered, refresh the list
      if (status === 'Delivered') {
        dispatch(fetchNewOrders());
      }
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

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

  // Get badge variant
  const getBadgeVariant = (status: OrderStatus): 'amber' | 'blue' | 'purple' | 'green' | 'red' => {
    switch (status) {
      case 'Pending':
        return 'amber';
      case 'Confirmed':
        return 'blue';
      case 'On the Way':
        return 'purple';
      case 'Delivered':
        return 'green';
      case 'Cancelled':
        return 'red';
      default:
        return 'amber';
    }
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
          <h1 className="text-2xl font-bold text-white">New Orders</h1>
          <p className="text-sm text-slate-400">
            {filteredOrders.length} active order{filteredOrders.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => router.push('/admin/orders/delivered')}
          className="rounded-xl bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors"
        >
          View Delivered Orders
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        {/* Search */}
        <div className="relative flex-1">
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
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'All')}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="On the Way">On the Way</option>
        </select>
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
              <th className="px-4 py-3 hidden md:table-cell">Date</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
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
                  {search || statusFilter !== 'All'
                    ? 'No orders match your filters'
                    : 'No new orders'}
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

                    {/* Date */}
                    <td className="hidden px-4 py-3 text-slate-400 md:table-cell">
                      {formatDate(order.date)}
                    </td>

                    {/* Total */}
                    <td className="px-4 py-3 font-semibold text-emerald-400">
                      £{order.price.toFixed(2)}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <Badge variant={getBadgeVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {/* View Details */}
                        <button
                          onClick={() => router.push(`/admin/orders/${order._id}`)}
                          title="View Details"
                          className="rounded-lg p-2 text-slate-400 hover:bg-indigo-500/20 hover:text-indigo-400 transition-colors"
                        >
                          <Eye size={16} />
                        </button>

                        {/* Quick Actions based on status */}
                        {order.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(order._id, 'Confirmed')}
                              disabled={updating}
                              title="Confirm Order"
                              className="rounded-lg p-2 text-slate-400 hover:bg-emerald-500/20 hover:text-emerald-400 transition-colors disabled:opacity-50"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(order._id, 'Cancelled')}
                              disabled={updating}
                              title="Cancel Order"
                              className="rounded-lg p-2 text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-colors disabled:opacity-50"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}

                        {order.status === 'Confirmed' && (
                          <button
                            onClick={() => handleStatusUpdate(order._id, 'On the Way')}
                            disabled={updating}
                            title="Mark as On the Way"
                            className="rounded-lg p-2 text-slate-400 hover:bg-purple-500/20 hover:text-purple-400 transition-colors disabled:opacity-50"
                          >
                            <Truck size={16} />
                          </button>
                        )}

                        {order.status === 'On the Way' && (
                          <button
                            onClick={() => handleStatusUpdate(order._id, 'Delivered')}
                            disabled={updating}
                            title="Mark as Delivered"
                            className="rounded-lg p-2 text-slate-400 hover:bg-emerald-500/20 hover:text-emerald-400 transition-colors disabled:opacity-50"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
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
