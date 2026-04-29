'use client';

import { usePathname } from 'next/navigation';
import { Menu, Bell, ChevronRight } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';
import { toProxyUrl } from '@/services/productService';
import Image from 'next/image';

interface AdminHeaderProps {
  onMobileMenuOpen: () => void;
}

// Build breadcrumbs from pathname
function useBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  return segments.map((seg, i) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1),
    href:  '/' + segments.slice(0, i + 1).join('/'),
    isLast: i === segments.length - 1,
  }));
}

export default function AdminHeader({ onMobileMenuOpen }: AdminHeaderProps) {
  const breadcrumbs = useBreadcrumbs();
  const admin       = useAppSelector((s: RootState) => s.auth.admin);

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-white/10 bg-slate-900/60 backdrop-blur-xl px-4 lg:px-6">
      {/* Mobile hamburger */}
      <button
        onClick={onMobileMenuOpen}
        className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 hover:text-white transition-colors lg:hidden"
      >
        <Menu size={18} />
      </button>

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm">
        {breadcrumbs.map(({ label, href, isLast }) => (
          <span key={href} className="flex items-center gap-1">
            {!isLast ? (
              <>
                <span className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">
                  {label}
                </span>
                <ChevronRight size={14} className="text-slate-600" />
              </>
            ) : (
              <span className="font-medium text-white">{label}</span>
            )}
          </span>
        ))}
      </nav>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-3">
        <button className="relative rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 hover:text-white transition-colors">
          <Bell size={18} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-indigo-500" />
        </button>

        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5">
          <div className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-600/30 text-xs font-bold text-indigo-300">
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
                    parent.innerHTML = `<span class="text-xs font-bold text-indigo-300">${admin?.fullName?.[0]?.toUpperCase() ?? 'A'}</span>`;
                  }
                }}
              />
            ) : (
              <span>{admin?.fullName?.[0]?.toUpperCase() ?? 'A'}</span>
            )}
          </div>
          <span className="hidden text-sm font-medium text-white sm:block">
            {admin?.fullName ?? 'Admin'}
          </span>
        </div>
      </div>
    </header>
  );
}
