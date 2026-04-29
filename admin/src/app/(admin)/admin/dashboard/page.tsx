'use client';

import { useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';
import { LayoutDashboard, Package, ShoppingCart, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const stats = [
  { label: 'Total Products', value: '—', icon: Package,         color: 'indigo' },
  { label: 'Total Orders',   value: '—', icon: ShoppingCart,    color: 'emerald' },
  { label: 'Total Users',    value: '—', icon: Users,           color: 'purple' },
  { label: 'Revenue',        value: '—', icon: LayoutDashboard, color: 'amber' },
] as const;

const colorMap = {
  indigo:  'border-indigo-500/20 bg-indigo-500/10 text-indigo-400',
  emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
  purple:  'border-purple-500/20 bg-purple-500/10 text-purple-400',
  amber:   'border-amber-500/20 bg-amber-500/10 text-amber-400',
};

export default function DashboardPage() {
  const admin = useAppSelector((state: RootState) => state.auth.admin);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/30 to-slate-900 p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-white">
            Welcome back{admin?.fullName ? `, ${admin.fullName}` : ''} 👋
          </h1>
          <p className="text-sm text-slate-400">Here's what's happening today.</p>
        </motion.div>

        {/* Stat Cards */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-4 lg:grid-cols-4"
        >
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className={`rounded-2xl border ${colorMap[color]} backdrop-blur-sm p-5 flex items-center gap-4`}
            >
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${colorMap[color]} bg-white/5`}>
                <Icon size={22} />
              </div>
              <div>
                <p className="text-xs text-slate-400">{label}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Placeholder content */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 text-center"
        >
          <LayoutDashboard size={40} className="mx-auto mb-3 text-slate-600" />
          <p className="text-slate-400">Dashboard widgets coming soon.</p>
        </motion.div>

      </div>
    </div>
  );
}
