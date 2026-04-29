'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  User,
  CreditCard,
  MapPin,
  Package,
  Printer,
  CheckCircle2,
  Circle,
  Loader2,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';
import { fetchOrders } from '@/store/slices/orderSlice';
import type { IOrder, OrderStatus } from '@/types/order';
import Badge from '@/components/ui/Badge';

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const orderId = params.id as string;

  const { orders, loading } = useAppSelector((state: RootState) => state.orders);
  const [order, setOrder] = useState<IOrder | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('Pending');

  // Fetch orders if not loaded
  useEffect(() => {
    if (orders.length === 0) {
      dispatch(fetchOrders());
    }
  }, [dispatch, orders.length]);

  // Find order by ID
  useEffect(() => {
    if (orders.length > 0) {
      const foundOrder = orders.find((o) => o._id === orderId);
      if (foundOrder) {
        setOrder(foundOrder);
        setSelectedStatus(foundOrder.status);
      }
    }
  }, [orders, orderId]);

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Format time
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
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

  // Handle status change
  const handleStatusChange = (newStatus: OrderStatus) => {
    setSelectedStatus(newStatus);
    toast.success(`Status will be updated to ${newStatus} (Backend integration pending)`);
  };

  // Handle print
  const handlePrint = () => {
    toast.success('Print functionality will be implemented with backend');
  };

  // Loading state
  if (loading || !order) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="mx-auto mb-4 animate-spin text-indigo-400" />
          <p className="text-lg text-slate-400">Loading order details...</p>
        </div>
      </div>
    );
  }

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
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/admin/orders')}
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white">Order {order.orderId}</h1>
                <Badge variant={getBadgeVariant(order.status)}>{order.status}</Badge>
              </div>
              <p className="text-sm text-slate-400">
                Placed on {formatDate(order.date)} at {formatTime(order.date)}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-400 hover:bg-indigo-500/20 transition-colors"
            >
              <Printer size={16} />
              Print Invoice
            </button>
          </div>
        </motion.div>

        {/* Quick Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          {/* Customer Info */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-2">
              <User size={18} className="text-indigo-400" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                Customer Info
              </h3>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-white/20">
                <Image
                  src={order.user.avatar}
                  alt={order.user.name}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
              <div>
                <p className="font-semibold text-white">{order.user.name}</p>
                <p className="text-xs text-slate-400">{order.user.email}</p>
              </div>
            </div>
            <p className="text-sm text-slate-300">{order.user.phone}</p>
          </div>

          {/* Payment Info */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-2">
              <CreditCard size={18} className="text-indigo-400" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                Payment Info
              </h3>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-slate-500">Payment Method</p>
                <p className="text-lg font-semibold text-white">{order.paymentMethod}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Total Amount</p>
                <p className="text-2xl font-bold text-emerald-400">${order.price.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-indigo-400" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                Delivery Info
              </h3>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-slate-500">Shipping Address</p>
                <p className="text-sm text-white">{order.shippingAddress?.street}</p>
                <p className="text-sm text-slate-400">
                  {order.shippingAddress?.city}, {order.shippingAddress?.state}{' '}
                  {order.shippingAddress?.zipCode}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Expected Delivery</p>
                <p className="text-sm font-semibold text-amber-400">
                  {order.expectedDelivery ? formatDate(order.expectedDelivery) : 'TBD'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 gap-6 lg:grid-cols-3"
        >
          {/* Product List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Status Management */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-6 backdrop-blur-sm">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
                Change Order Status
              </h3>
              <div className="flex gap-2">
                <select
                  value={selectedStatus}
                  onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                >
                  <option value="Pending">Pending</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
            </div>

            {/* Items List */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-6 backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-2">
                <Package size={18} className="text-indigo-400" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                  Order Items
                </h3>
              </div>

              <div className="space-y-3">
                {order.items?.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4"
                  >
                    <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-white/10 bg-white/5 flex-shrink-0">
                      <img
                        src={item.thumbnail}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">{item.name}</p>
                      <p className="text-sm text-slate-400">
                        ${item.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-400">${item.subtotal.toFixed(2)}</p>
                    </div>
                  </div>
                ))}

                {/* Total */}
                <div className="flex items-center justify-between border-t border-white/10 pt-4">
                  <p className="text-lg font-semibold text-white">Total</p>
                  <p className="text-2xl font-bold text-emerald-400">${order.price.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-6 backdrop-blur-sm">
              <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-slate-400">
                Order Timeline
              </h3>

              <div className="space-y-6">
                {order.timeline?.map((step, index) => (
                  <div key={index} className="relative flex gap-4">
                    {/* Timeline Line */}
                    {index < (order.timeline?.length ?? 0) - 1 && (
                      <div
                        className={`absolute left-[11px] top-8 h-full w-0.5 ${
                          step.completed ? 'bg-emerald-500/30' : 'bg-slate-700'
                        }`}
                      />
                    )}

                    {/* Icon */}
                    <div className="relative z-10 flex-shrink-0">
                      {step.completed ? (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 border-2 border-emerald-500">
                          <CheckCircle2 size={14} className="text-emerald-400" />
                        </div>
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-700 border-2 border-slate-600">
                          <Circle size={10} className="text-slate-500" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-2">
                      <p
                        className={`font-semibold ${
                          step.completed ? 'text-white' : 'text-slate-500'
                        }`}
                      >
                        {step.status}
                      </p>
                      {step.timestamp && (
                        <p className="text-xs text-slate-400">
                          {formatDate(step.timestamp)} at {formatTime(step.timestamp)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
