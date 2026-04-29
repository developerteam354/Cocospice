'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Clock, XCircle, Search, Eye } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';
import { fetchOrders, fetchOrderStats } from '@/store/slices/orderSlice';
import type { IOrder, OrderStatus } from '@/types/order';
import Badge from '@/components/ui/Badge';

// ─── Stat Card Component ──────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  color: 'indigo' | 'amber' | 'red';
  loading?: boolean;
}

function StatCard({ label, value, icon: Icon, color, loading }: StatCardProps) {
  const colorClasses = {
    indigo: 'from-indigo-500/20 to-indigo-600/20 text-indigo-400',
    amber: 'from-amber-500/20 to-amber-600/20 text-amber-400',
    red: 'from-red-500/20 to-red-600/20 text-red-400',
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

export default function OrdersPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { orders, stats, loading, statsLoading } = useAppSelector(
    (state: RootState) => state.orders
  );

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All');

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchOrders());
    dispatch(fetchOrderStats());
  }, [dispatch]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    let result = [...orders];

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
  }, [orders, search, statusFilter]);

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Get badge variant
  const getBadgeVariant = (status: OrderStatus): 'amber' | 'green' | 'red' => {
    switch (status) {
      case 'Pending':
        return 'amber';
      case 'Delivered':
        return 'green';
      case 'Failed':
        return 'red';
      default:
        return 'amber';
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
            <h1 className="text-2xl font-bold text-white">Orders Management</h1>
            <p className="text-sm text-slate-400">
              {filteredOrders.length} of {orders.length} orders
            </p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Total Orders"
            value={stats.total}
            icon={ShoppingBag}
            color="indigo"
            loading={statsLoading}
          />
          <StatCard
            label="Pending Orders"
            value={stats.pending}
            icon={Clock}
            color="amber"
            loading={statsLoading}
          />
          <StatCard
            label="Failed Orders"
            value={stats.failed}
            icon={XCircle}
            color="red"
            loading={statsLoading}
          />
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
            <option value="Delivered">Delivered</option>
            <option value="Failed">Failed</option>
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
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3 hidden md:table-cell">Date</th>
                <th className="px-4 py-3 hidden lg:table-cell">Item</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-8 animate-pulse rounded-lg bg-white/5" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500">
                    {search || statusFilter !== 'All'
                      ? 'No orders match your filters'
                      : 'No orders yet'}
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
                      {/* User */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 overflow-hidden rounded-full border border-white/10">
                            <Image
                              src={order.user.avatar}
                              alt={order.user.name}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-white">
                              {order.user.name}
                            </p>
                            <p className="truncate text-xs text-slate-400">
                              {order.user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Order ID */}
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-indigo-400">
                          {order.orderId}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="hidden px-4 py-3 text-slate-400 md:table-cell">
                        {formatDate(order.date)}
                      </td>

                      {/* Item */}
                      <td className="hidden px-4 py-3 text-white lg:table-cell">
                        {order.item}
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3 font-semibold text-emerald-400">
                        ${order.price.toFixed(2)}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <Badge variant={getBadgeVariant(order.status)}>
                          {order.status}
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
    </>
  );
}
