'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, Tag, Users, ShoppingCart,
  UserCircle, LogOut, ChevronRight, X, Menu,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';
import { logoutAdmin } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';

const NAV_ITEMS = [
  { label: 'Dashboard',  href: '/admin/dashboard',  icon: LayoutDashboard },
  { label: 'Products',   href: '/admin/products',   icon: Package },
  { label: 'Categories', href: '/admin/category', icon: Tag },
  { label: 'Orders',     href: '/admin/orders',     icon: ShoppingCart },
  { label: 'Users',      href: '/admin/users',      icon: Users },
  { label: 'Profile',    href: '/admin/profile',    icon: UserCircle },
];

interface AdminSidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggle: () => void;
  onMobileClose: () => void;
}

export default function AdminSidebar({
  collapsed, mobileOpen, onToggle, onMobileClose,
}: AdminSidebarProps) {
  const pathname  = usePathname();
  const dispatch  = useAppDispatch();
  const router    = useRouter();
  const admin     = useAppSelector((s: RootState) => s.auth.admin);

  const handleLogout = async () => {
    await dispatch(logoutAdmin());
    router.replace('/admin/login');
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600">
          <span className="text-sm font-bold text-white">C</span>
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden whitespace-nowrap text-sm font-bold text-white"
            >
              Cocospice Admin
            </motion.span>
          )}
        </AnimatePresence>
        {/* Desktop collapse toggle */}
        <button
          onClick={onToggle}
          className="ml-auto hidden rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors lg:flex"
        >
          <motion.div animate={{ rotate: collapsed ? 0 : 180 }} transition={{ duration: 0.2 }}>
            <ChevronRight size={16} />
          </motion.div>
        </button>
        {/* Mobile close */}
        <button
          onClick={onMobileClose}
          className="ml-auto rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors lg:hidden"
        >
          <X size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              onClick={onMobileClose}
              className={[
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                active
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white',
              ].join(' ')}
            >
              <Icon size={18} className="shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
              {active && !collapsed && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Admin profile + logout */}
      <div className="border-t border-white/10 p-3 space-y-1">
        <div className={`flex items-center gap-3 rounded-xl px-3 py-2 ${collapsed ? 'justify-center' : ''}`}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600/30 text-xs font-bold text-indigo-300">
            {admin?.fullName?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden"
              >
                <p className="whitespace-nowrap text-xs font-medium text-white">{admin?.fullName}</p>
                <p className="whitespace-nowrap text-xs text-slate-500">{admin?.role}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <LogOut size={18} className="shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 68 : 240 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="hidden lg:flex flex-col shrink-0 border-r border-white/10 bg-slate-900/80 backdrop-blur-xl overflow-hidden"
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r border-white/10 bg-slate-900 lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
