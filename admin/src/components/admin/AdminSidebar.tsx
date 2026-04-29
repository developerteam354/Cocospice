'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, Tag, Users, ShoppingCart,
  UserCircle, LogOut, ChevronLeft, ChevronRight, X,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';
import { logoutAdmin } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import { toProxyUrl } from '@/services/productService';

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
  
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutModal(false);
    await dispatch(logoutAdmin());
    router.replace('/admin/login');
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Admin Profile Header - Clickable to toggle */}
      <div 
        className="relative flex items-center gap-3 border-b border-white/10 px-4 py-4 transition-colors"
      >
        {/* Profile Image - Always visible, clickable */}
        <div 
          className={`relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-indigo-500/30 bg-indigo-600/20 cursor-pointer hover:border-indigo-500/50 transition-all ${collapsed ? 'mx-auto' : ''}`}
          onClick={onToggle}
          title={collapsed ? 'Click to expand sidebar' : 'Click to collapse sidebar'}
        >
          {admin?.profileImage ? (
            <img
              src={toProxyUrl(admin.profileImage)}
              alt={admin.fullName}
              className="h-full w-full object-cover"
              onError={(e) => {
                // Fallback to initials on error
                const target = e.currentTarget;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `<span class="text-sm font-bold text-indigo-300">${admin?.fullName?.[0]?.toUpperCase() ?? 'A'}</span>`;
                }
              }}
            />
          ) : (
            <span className="text-sm font-bold text-indigo-300">
              {admin?.fullName?.[0]?.toUpperCase() ?? 'A'}
            </span>
          )}
        </div>
        
        {/* Name and Role - Hidden when collapsed */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 overflow-hidden"
            >
              <p className="whitespace-nowrap text-sm font-semibold text-white truncate">
                {admin?.fullName ?? 'Admin'}
              </p>
              <p className="whitespace-nowrap text-xs text-slate-400 capitalize">
                {admin?.role ?? 'Administrator'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Mobile close button - Always visible on mobile */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMobileClose();
          }}
          className="lg:hidden shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
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

      {/* Sign Out Button - Bottom */}
      <div className="border-t border-white/10 p-3">
        <button
          onClick={handleLogoutClick}
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
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar with toggle arrow */}
      <div className="hidden lg:block relative shrink-0">
        <motion.aside
          animate={{ width: collapsed ? 68 : 240 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="flex flex-col h-full border-r border-white/10 bg-slate-900/80 backdrop-blur-xl"
        >
          {sidebarContent}
        </motion.aside>
        
        {/* Dedicated Toggle Arrow - Positioned outside sidebar, glassmorphic theme */}
        <button
          onClick={onToggle}
          className="absolute top-20 -right-3.5 z-[100] w-7 h-7 rounded-full bg-[#1E2EDE]/20 border border-[#1E2EDE]/40 text-[#1E2EDE] flex items-center justify-center backdrop-blur-sm hover:bg-[#1E2EDE] hover:text-white transition-all duration-200 shadow-lg"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

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

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleLogoutCancel}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md"
            />

            {/* Modal */}
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur-xl p-8 shadow-2xl"
              >
                <div className="text-center">
                  {/* Icon */}
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 border border-red-500/30">
                    <LogOut size={32} className="text-red-400" />
                  </div>

                  {/* Title */}
                  <h3 className="mb-2 text-2xl font-bold text-white">
                    Sign Out?
                  </h3>

                  {/* Description */}
                  <p className="mb-8 text-slate-400">
                    Are you sure you want to sign out of your account?
                  </p>

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleLogoutCancel}
                      className="flex-1 rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white transition-all hover:bg-white/10"
                    >
                      No, Stay
                    </button>
                    <button
                      onClick={handleLogoutConfirm}
                      className="flex-1 rounded-xl bg-red-600 px-6 py-3 font-semibold text-white shadow-lg shadow-red-600/30 transition-all hover:bg-red-700 hover:shadow-xl"
                    >
                      Yes, Logout
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
