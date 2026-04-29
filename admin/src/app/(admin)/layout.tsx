'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader  from '@/components/admin/AdminHeader';
import AdminFooter  from '@/components/admin/AdminFooter';

export default function AdminGroupLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();

  const { isAuthenticated, isInitialized } = useAppSelector(
    (s: RootState) => s.auth
  );

  const [collapsed,   setCollapsed]   = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Auth guard — wait for initialization before redirecting
  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated) router.replace('/admin/login');
  }, [isAuthenticated, isInitialized, router]);

  // Show spinner while auth is being verified
  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-indigo-400" />
          <p className="text-sm text-slate-400">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950/20 to-slate-900">
      <AdminSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggle={() => setCollapsed((c) => !c)}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader onMobileMenuOpen={() => setMobileOpen(true)} />

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto max-w-7xl">
            {/* Content card */}
            <div className="min-h-[70vh] rounded-3xl border border-white/10 bg-white/[0.03] p-4 shadow-2xl shadow-black/20 backdrop-blur-sm lg:p-6">
              {children}
            </div>
          </div>
        </main>

        <AdminFooter />
      </div>
    </div>
  );
}
