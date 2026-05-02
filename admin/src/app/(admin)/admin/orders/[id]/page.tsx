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
import { fetchOrderById, updateOrderStatus } from '@/store/slices/orderSlice';
import type { IOrder, OrderStatus } from '@/types/order';
import Badge from '@/components/ui/Badge';

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const orderId = params.id as string;

  const { currentOrder, loading, updating } = useAppSelector((state: RootState) => state.orders);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('Pending');

  // Fetch order by ID
  useEffect(() => {
    dispatch(fetchOrderById(orderId));
  }, [dispatch, orderId]);

  // Update selected status when order loads
  useEffect(() => {
    if (currentOrder) {
      setSelectedStatus(currentOrder.status);
    }
  }, [currentOrder]);

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
      case 'Confirmed':
        return 'amber';
      case 'On the Way':
        return 'amber';
      case 'Delivered':
        return 'green';
      case 'Cancelled':
        return 'red';
      default:
        return 'amber';
    }
  };

  // Handle status change
  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!currentOrder) return;
    
    try {
      await dispatch(updateOrderStatus({ orderId: currentOrder._id, status: newStatus })).unwrap();
      toast.success(`Order status updated to ${newStatus}`);
      
      // If order is now delivered, redirect to delivered orders page
      if (newStatus === 'Delivered') {
        setTimeout(() => {
          router.push('/admin/orders/delivered');
        }, 1500);
      }
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  // Handle print
  const handlePrint = () => {
    toast.success('Print functionality will be implemented with backend');
  };

  // Loading state
  if (loading || !currentOrder) {
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
              onClick={() => router.push('/admin/orders/new')}
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white">Order {currentOrder.orderId}</h1>
                <Badge variant={getBadgeVariant(currentOrder.status)}>{currentOrder.status}</Badge>
              </div>
              <p className="text-sm text-slate-400">
                Placed on {formatDate(currentOrder.date)} at {formatTime(currentOrder.date)}
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
                  src={currentOrder.user.avatar}
                  alt={currentOrder.user.name}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
              <div>
                <p className="font-semibold text-white">{currentOrder.user.name}</p>
                <p className="text-xs text-slate-400">{currentOrder.user.email}</p>
              </div>
            </div>
            <p className="text-sm text-slate-300">{currentOrder.user.phone}</p>
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
                <p className="text-lg font-semibold text-white">{currentOrder.paymentMethod}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Total Amount</p>
                <p className="text-2xl font-bold text-emerald-400">£{currentOrder.price.toFixed(2)}</p>
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
                <p className="text-sm text-white">{currentOrder.shippingAddress?.street}</p>
                <p className="text-sm text-slate-400">
                  {currentOrder.shippingAddress?.city}, {currentOrder.shippingAddress?.state}{' '}
                  {currentOrder.shippingAddress?.zipCode}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Expected Delivery</p>
                <p className="text-sm font-semibold text-amber-400">
                  {currentOrder.expectedDelivery ? formatDate(currentOrder.expectedDelivery) : 'TBD'}
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
                  disabled={updating}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="On the Way">On the Way</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                {updating && (
                  <div className="flex items-center gap-2 text-indigo-400">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-sm">Updating...</span>
                  </div>
                )}
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
                {currentOrder.items?.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4"
                  >
                    <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-white/10 bg-white/5 flex-shrink-0">
                      {item.thumbnail && item.thumbnail !== '/placeholder-product.jpg' ? (
                        <img
                          src={item.thumbnail}
                          alt={item.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            // Fallback to placeholder if image fails to load
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.innerHTML = `
                              <div class="h-full w-full flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                                <span class="text-2xl">🍽️</span>
                              </div>
                            `;
                          }}
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                          <span className="text-2xl">🍽️</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">{item.name}</p>
                      <p className="text-sm text-slate-400">
                        £{item.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-400">£{item.subtotal.toFixed(2)}</p>
                    </div>
                  </div>
                ))}

                {/* Total */}
                <div className="flex items-center justify-between border-t border-white/10 pt-4">
                  <p className="text-lg font-semibold text-white">Total</p>
                  <p className="text-2xl font-bold text-emerald-400">£{currentOrder.price.toFixed(2)}</p>
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
                {currentOrder.timeline?.map((step, index) => (
                  <div key={index} className="relative flex gap-4">
                    {/* Timeline Line */}
                    {index < (currentOrder.timeline?.length ?? 0) - 1 && (
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
