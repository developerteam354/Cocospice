'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchUserOrders } from '@/store/slices/orderSlice';
import { formatDate, formatCurrency, mapOrderStatus } from '@/lib/utils';
import type { RootState } from '@/store/store';

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderStatus = 'pending' | 'confirmed' | 'on-the-way' | 'delivered' | 'cancelled';

interface OrderExtra { name: string; price: number; }
interface OrderItem  { name: string; quantity: number; price: number; selectedExtras?: OrderExtra[]; }
interface Order {
  id: string; date: string; status: OrderStatus; totalAmount: number;
  orderType: 'delivery' | 'collection'; paymentMethod: string;
  address?: string; items: OrderItem[];
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<OrderStatus, { label: string; emoji: string; color: string; bg: string; border: string }> = {
  pending:      { label: 'Pending',    emoji: '\u{1F550}', color: '#d97706', bg: 'rgba(217,119,6,0.12)',   border: 'rgba(217,119,6,0.35)'   },
  confirmed:    { label: 'Confirmed',  emoji: '\u2705',    color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.35)'  },
  'on-the-way': { label: 'On the Way', emoji: '\u{1F6F5}', color: '#06b6d4', bg: 'rgba(6,182,212,0.12)',  border: 'rgba(6,182,212,0.35)'   },
  delivered:    { label: 'Delivered',  emoji: '\u{1F389}', color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.35)'  },
  cancelled:    { label: 'Cancelled',  emoji: '\u274C',    color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.35)'   },
};

const PROGRESS_STEPS: OrderStatus[] = ['pending', 'confirmed', 'on-the-way', 'delivered'];

function getStepIndex(status: OrderStatus) {
  if (status === 'cancelled') return -1;
  return PROGRESS_STEPS.indexOf(status);
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className="inline-flex items-center gap-[5px] px-[11px] py-1 rounded-full text-[0.78rem] font-bold whitespace-nowrap"
      style={{ color: cfg.color, background: cfg.bg, border: `1.5px solid ${cfg.border}` }}
    >
      {cfg.emoji} {cfg.label}
    </span>
  );
}

// ─── ProgressBar ─────────────────────────────────────────────────────────────

function ProgressBar({ status }: { status: OrderStatus }) {
  if (status === 'cancelled') return null;
  const current = getStepIndex(status);
  return (
    <div className="flex items-center py-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {PROGRESS_STEPS.map((step, idx) => {
        const cfg    = STATUS_CONFIG[step];
        const done   = idx <= current;
        const active = idx === current;
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-white font-extrabold transition-all duration-[220ms]"
                style={{
                  background: done ? cfg.color : '#e2e8f0',
                  border:     `2px solid ${done ? cfg.color : '#d1d5db'}`,
                  boxShadow:  active ? `0 0 0 4px ${cfg.color}33` : 'none',
                  transform:  active ? 'scale(1.25)' : 'scale(1)',
                }}
              >
                {done && <span className="text-[0.6rem]">&#10003;</span>}
              </div>
              <span
                className="text-[0.62rem] font-semibold whitespace-nowrap transition-colors duration-[220ms] max-sm:text-[0.56rem]"
                style={{ color: done ? cfg.color : '#9ca3af', fontWeight: active ? 700 : 500 }}
              >
                {cfg.label}
              </span>
            </div>
            {idx < PROGRESS_STEPS.length - 1 && (
              <div
                className="flex-1 h-[2px] min-w-4 rounded-sm mb-4 transition-colors duration-[220ms]"
                style={{ background: idx < current ? STATUS_CONFIG[PROGRESS_STEPS[idx]].color : '#e2e8f0' }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── OrderCard ────────────────────────────────────────────────────────────────

function OrderCard({ order, index }: { order: Order; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const cfg          = STATUS_CONFIG[order.status];
  const itemsPreview = order.items.map(it => `${it.quantity}x ${it.name}`).join(', ');

  return (
    <motion.div
      className="bg-white border-[1.5px] rounded-[20px] px-[22px] py-5 flex flex-col gap-3 shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all duration-[220ms] hover:shadow-[0_6px_24px_rgba(0,0,0,0.1)] hover:-translate-y-px max-sm:px-[14px] max-sm:py-4 max-sm:gap-[10px] max-sm:rounded-2xl"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      style={{ borderColor: expanded ? cfg.border : '#e2e8f0' }}
    >
      {/* Header */}
      <div className="flex justify-between items-start gap-3 flex-wrap max-sm:flex-col max-sm:gap-2">
        <div className="flex flex-col gap-1">
          <div className="text-base font-extrabold text-[#111827] tracking-[-0.01em]">#{order.id}</div>
          <div className="flex items-center gap-[5px] text-[0.8rem] text-[#6b7280] font-medium">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            {order.date}
          </div>
        </div>
        <div className="flex flex-col items-end gap-[5px] max-sm:flex-row max-sm:items-center max-sm:justify-between max-sm:w-full">
          <StatusBadge status={order.status} />
          <div className="text-[1.2rem] font-black text-[#111827] tracking-[-0.02em] max-sm:text-base">
            &#163;{order.totalAmount.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Items preview */}
      <p className="text-[0.86rem] text-[#4b5563] m-0 leading-[1.5] font-medium line-clamp-2">
        {itemsPreview}
      </p>

      {/* Tags */}
      <div className="flex gap-[7px] flex-wrap">
        {[
          order.orderType === 'delivery' ? '🚚 Delivery' : '🏪 Collection',
          `💳 ${order.paymentMethod}`,
          `🛍️ ${order.items.length} item${order.items.length !== 1 ? 's' : ''}`,
        ].map(tag => (
          <span key={tag} className="px-[9px] py-[3px] rounded-[7px] bg-[#f1f5f9] border border-[#e2e8f0] text-[0.76rem] font-semibold text-[#4b5563] whitespace-nowrap">
            {tag}
          </span>
        ))}
      </div>

      {/* Progress */}
      <ProgressBar status={order.status} />

      {/* Toggle */}
      <button
        className="self-start px-4 py-[7px] rounded-[10px] text-[0.8rem] font-bold cursor-pointer transition-all duration-[180ms] hover:brightness-110 hover:-translate-y-px"
        onClick={() => setExpanded(p => !p)}
        style={{ color: cfg.color, borderColor: cfg.border, background: cfg.bg, border: `1.5px solid ${cfg.border}` }}
      >
        {expanded ? 'Hide Details ▲' : 'View Details ▼'}
      </button>

      {/* Accordion */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="overflow-hidden flex flex-col gap-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="h-px bg-[#e2e8f0] my-[2px]" />

            {/* Items table */}
            <div className="flex flex-col bg-[#f8fafc] rounded-xl overflow-hidden border border-[#e2e8f0]">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_44px_68px] px-[14px] py-[9px] text-[0.7rem] font-bold uppercase tracking-[0.07em] text-[#9ca3af] border-b border-[#e2e8f0] max-sm:grid-cols-[1fr_34px_56px] max-sm:px-[10px] max-sm:py-2">
                <span>Item</span><span>Qty</span><span className="text-right">Price</span>
              </div>
              {order.items.map((item, idx) => {
                const extrasTotal = (item.selectedExtras ?? []).reduce((s, e) => s + e.price, 0);
                const lineTotal   = (item.price + extrasTotal) * item.quantity;
                return (
                  <div
                    key={idx}
                    className="grid grid-cols-[1fr_44px_68px] items-start px-[14px] py-[10px] border-b border-[#f1f5f9] bg-white last:border-b-0 hover:bg-[#f8fafc] transition-colors duration-[120ms] max-sm:grid-cols-[1fr_34px_56px] max-sm:px-[10px] max-sm:py-2"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-[0.88rem] font-bold text-[#111827]">{item.name}</span>
                      {item.selectedExtras && item.selectedExtras.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.selectedExtras.map((ex, ei) => (
                            <span key={ei} className="text-[0.7rem] font-semibold text-[#6366f1] bg-[rgba(99,102,241,0.08)] border border-[rgba(99,102,241,0.2)] rounded-[5px] px-[6px] py-[2px]">
                              + {ex.name} {ex.price > 0 ? `(+£${ex.price.toFixed(2)})` : '(+£0.00)'}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-[0.86rem] font-bold text-[#6b7280] text-center pt-px">x{item.quantity}</span>
                    <span className="text-[0.88rem] font-extrabold text-[#10b981] text-right pt-px">&#163;{lineTotal.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>

            {/* Address */}
            {order.address && (
              <div className="flex flex-col gap-[3px] px-[13px] py-[9px] bg-[#f8fafc] rounded-[10px] border border-[#e2e8f0]">
                <span className="text-[0.72rem] font-bold uppercase tracking-[0.06em] text-[#9ca3af]">📍 Delivery Address</span>
                <span className="text-[0.88rem] font-semibold text-[#374151]">{order.address}</span>
              </div>
            )}

            {/* Total */}
            <div className="flex justify-between items-center px-[14px] py-[11px] bg-[rgba(16,185,129,0.06)] border-[1.5px] border-[rgba(16,185,129,0.2)] rounded-xl">
              <span className="text-[0.88rem] font-bold text-[#374151]">Order Total</span>
              <span className="text-[1.3rem] font-black text-[#059669] tracking-[-0.02em] max-sm:text-[1.1rem]">
                &#163;{order.totalAmount.toFixed(2)}
              </span>
            </div>

            {/* Reorder */}
            {order.status !== 'cancelled' && (
              <button className="w-full py-3 rounded-xl bg-gradient-to-br from-[#10b981] to-[#059669] text-white text-[0.92rem] font-extrabold border-none cursor-pointer transition-all duration-200 shadow-[0_4px_14px_rgba(16,185,129,0.28)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] active:scale-[0.98]">
                🔄 Reorder
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

function EmptyState() {
  const router = useRouter();
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-[60px] px-6 text-center bg-white border-[1.5px] border-[#e2e8f0] rounded-3xl gap-3 shadow-[0_2px_12px_rgba(0,0,0,0.05)]"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="text-[3.5rem] leading-none">🛍️</div>
      <h2 className="text-[1.35rem] font-black text-[#111827] m-0">No orders yet</h2>
      <p className="text-[0.9rem] text-[#6b7280] m-0 max-w-[300px] leading-[1.55]">
        Looks like you have not placed any orders. Browse our menu and treat yourself!
      </p>
      <button
        className="mt-[6px] px-7 py-3 rounded-[14px] bg-gradient-to-br from-[#10b981] to-[#059669] text-white text-[0.95rem] font-extrabold border-none cursor-pointer transition-all duration-200 shadow-[0_4px_14px_rgba(16,185,129,0.28)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(16,185,129,0.42)]"
        onClick={() => router.push('/')}
      >
        Go to Menu
      </button>
    </motion.div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-[14px]">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="bg-white border-[1.5px] border-[#e2e8f0] rounded-[20px] px-[22px] py-5 flex flex-col gap-3 animate-pulse"
        >
          <div className="flex justify-between items-start gap-3">
            <div className="flex flex-col gap-2">
              <div className="h-5 w-24 bg-slate-200 rounded" />
              <div className="h-4 w-32 bg-slate-200 rounded" />
            </div>
            <div className="flex flex-col gap-2 items-end">
              <div className="h-6 w-20 bg-slate-200 rounded-full" />
              <div className="h-6 w-16 bg-slate-200 rounded" />
            </div>
          </div>
          <div className="h-4 w-full bg-slate-200 rounded" />
          <div className="flex gap-2">
            <div className="h-6 w-20 bg-slate-200 rounded-lg" />
            <div className="h-6 w-16 bg-slate-200 rounded-lg" />
            <div className="h-6 w-20 bg-slate-200 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfileOrdersPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { orders: backendOrders, loading } = useAppSelector((state: RootState) => state.order);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');

  // Fetch orders on mount
  useEffect(() => {
    dispatch(fetchUserOrders());
  }, [dispatch]);

  // Transform backend orders to frontend format
  const transformedOrders: Order[] = backendOrders.map(order => ({
    id: order.orderId,
    date: formatDate(order.createdAt),
    status: mapOrderStatus(order.orderStatus),
    totalAmount: order.totalAmount,
    orderType: order.orderType,
    paymentMethod: order.paymentMethod,
    address: order.shippingAddress 
      ? `${order.shippingAddress.line1}${order.shippingAddress.line2 ? ', ' + order.shippingAddress.line2 : ''}, ${order.shippingAddress.city}, ${order.shippingAddress.postcode}`
      : undefined,
    items: order.items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      selectedExtras: item.selectedExtraOptions,
    })),
  }));

  const filtered = filter === 'all' ? transformedOrders : transformedOrders.filter(o => o.status === filter);

  const filterOptions: Array<{ value: OrderStatus | 'all'; label: string }> = [
    { value: 'all',        label: 'All Orders' },
    { value: 'pending',    label: 'Pending' },
    { value: 'confirmed',  label: 'Confirmed' },
    { value: 'on-the-way', label: 'On the Way' },
    { value: 'delivered',  label: 'Delivered' },
    { value: 'cancelled',  label: 'Cancelled' },
  ];

  return (
    <div className="flex flex-col gap-5 w-full">

      {/* Page Header */}
      <motion.div
        className="flex items-center gap-[14px]"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div>
          <h1 className="text-[1.7rem] font-black text-[#111827] m-0 tracking-[-0.03em] max-sm:text-[1.35rem]">
            My Orders
          </h1>
          <p className="text-[0.85rem] text-[#6b7280] mt-[3px] mb-0 font-medium">
            {loading ? 'Loading...' : `${transformedOrders.length} order${transformedOrders.length !== 1 ? 's' : ''} · Manage and track your recent orders`}
          </p>
        </div>
      </motion.div>

      {/* Filter Pills */}
      <motion.div
        className="flex gap-2 flex-wrap"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.08 }}
      >
        {filterOptions.map(opt => {
          const isActive = filter === opt.value;
          const count = opt.value === 'all' ? transformedOrders.length : transformedOrders.filter(o => o.status === opt.value).length;
          return (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={[
                'flex items-center gap-[6px] px-[13px] py-[6px] rounded-full border-[1.5px] text-[0.8rem] font-semibold cursor-pointer transition-all duration-[180ms] whitespace-nowrap shadow-[0_1px_3px_rgba(0,0,0,0.05)] max-sm:px-[10px] max-sm:py-[5px] max-sm:text-[0.76rem]',
                isActive
                  ? 'bg-[rgba(16,185,129,0.1)] border-[#10b981] text-[#059669] shadow-[0_0_0_3px_rgba(16,185,129,0.1)]'
                  : 'bg-white border-[#e2e8f0] text-[#4b5563] hover:border-[#10b981] hover:text-[#10b981] hover:bg-[rgba(16,185,129,0.05)]',
              ].join(' ')}
            >
              {opt.label}
              {opt.value !== 'all' && (
                <span className={`rounded-full px-[6px] py-px text-[0.72rem] font-bold ${isActive ? 'bg-[rgba(16,185,129,0.18)] text-[#059669]' : 'bg-[#f1f5f9] text-[#6b7280]'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </motion.div>

      {/* Order List */}
      <div className="flex flex-col gap-[14px]">
        {loading ? (
          <LoadingSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          filtered.map((order, i) => (
            <OrderCard key={order.id} order={order} index={i} />
          ))
        )}
      </div>

    </div>
  );
}
