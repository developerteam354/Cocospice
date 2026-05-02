'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import Header from '@/components/Header/Header';
import CartSidebar from '@/components/CartSidebar/CartSidebar';
import OrderTypeModal from '@/components/OrderTypeModal/OrderTypeModal';
import { useRouter, usePathname } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute';
import { useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';

// Proxy helper — same logic as profile page
const toProxyUrl = (urlOrKey: string): string => {
  if (!urlOrKey) return '';
  if (urlOrKey.includes('/upload/image')) return urlOrKey;
  const s3Match = urlOrKey.match(/amazonaws\.com\/(.+)$/);
  const key = s3Match ? s3Match[1] : urlOrKey;
  return `${process.env.NEXT_PUBLIC_API_URL}/user/upload/image?key=${encodeURIComponent(key)}`;
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const reduxUser = useAppSelector((s: RootState) => s.userAuth.user);
  const { totalItems, cart, updateQuantity, clearCart, setOrderType } = useCart();
  const router   = useRouter();
  const pathname = usePathname();

  const [isCartOpen,         setIsCartOpen]         = useState(false);
  const [showOrderTypeModal, setShowOrderTypeModal]  = useState(false);
  const [imgError,           setImgError]            = useState(false);

  // Use Redux user (always up-to-date after profile save) with AuthContext as fallback
  const currentUser = reduxUser ?? user;

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const profileImageUrl = currentUser?.profileImage
    ? toProxyUrl(currentUser.profileImage)
    : '';

  const handleOrderTypeSelected = (type: 'delivery' | 'collection') => {
    setOrderType(type);
    setShowOrderTypeModal(false);
    router.push('/checkout/review');
  };

  const activeTab = pathname === '/profile' ? 'profile'
    : pathname.includes('orders')  ? 'orders'
    : 'address';

  // ── Shared nav button classes ──────────────────────────────────────────────
  const navBase    = 'flex items-center gap-4 px-5 py-4 rounded-[20px] bg-transparent border-none cursor-pointer text-left font-semibold text-[#4a4a4a] transition-all duration-300 w-full hover:bg-[#f1f5f9] hover:text-[#10b981]';
  const navActive  = 'bg-[#10b981] !text-white shadow-[0_10px_20px_rgba(16,185,129,0.2)] hover:bg-[#059669] hover:!text-white';

  return (
    <ProtectedRoute>
    {/* profileContainer */}
    <div className="min-h-screen flex flex-col bg-transparent text-[#1a1a1a]">
      <Header
        cartCount={totalItems}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={(_mode) => {}}
      />

      {/* mainLayout — 350px sidebar + 1fr content, collapses to 1 col on ≤1024px */}
      <main className="w-full max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-3 lg:gap-10 p-3 pt-3 lg:p-10 lg:pt-5">

        {/* ── Sidebar ── hidden on mobile */}
        <aside className="hidden lg:block bg-[rgba(255,255,255,0.7)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.5)] rounded-[32px] px-8 py-10 h-fit shadow-[0_15px_50px_rgba(0,0,0,0.03)] sticky top-[120px] z-10">

          {/* User brief */}
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-[100px] h-[100px] bg-[#10b981] rounded-full overflow-hidden flex items-center justify-center text-[2.5rem] text-white font-extrabold mb-4 shadow-[0_8px_20px_rgba(16,185,129,0.3)]">
              {profileImageUrl && !imgError ? (
                <img
                  src={profileImageUrl}
                  alt={currentUser?.name ?? 'Profile'}
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                currentUser ? getInitials(currentUser.name) : '?'
              )}
            </div>
            <h2 className="text-[1.4rem] font-extrabold mb-1">{currentUser?.name || 'Guest User'}</h2>
            <p className="text-[0.9rem] text-[#4a4a4a]">{currentUser?.email || 'Sign in to see details'}</p>
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-3">
            <button
              className={`${navBase} text-[#10b981] mb-[10px]`}
              onClick={() => router.push('/')}
            >
              <span className="text-[1.25rem]">←</span>
              Back to Menu
            </button>

            <button
              className={`${navBase} ${activeTab === 'profile' ? navActive : ''}`}
              onClick={() => router.push('/profile')}
            >
              <span className="text-[1.25rem]">👤</span>
              My Profile
            </button>

            <button
              className={`${navBase} ${activeTab === 'orders' ? navActive : ''}`}
              onClick={() => router.push('/profile/orders')}
            >
              <span className="text-[1.25rem]">📦</span>
              My Orders
            </button>

            <button
              className={`${navBase} ${activeTab === 'address' ? navActive : ''}`}
              onClick={() => router.push('/profile/address')}
            >
              <span className="text-[1.25rem]">📍</span>
              Manage Address
            </button>

            {/* Divider + sign out */}
            <div className="mt-5 pt-5 border-t border-[#e2e8f0]">
              <button
                className={`${navBase} text-[#ef4444]`}
                onClick={() => { logout(); router.push('/'); }}
              >
                <span className="text-[1.25rem]">🚪</span>
                Sign Out
              </button>
            </div>
          </nav>
        </aside>

        {/* ── Content area ── */}
        <section className="flex flex-col gap-8 lg:gap-8 w-full">
          {children}
        </section>
      </main>

      {/* Overlays */}
      {isCartOpen && (
        <CartSidebar
          cart={cart}
          onUpdateQuantity={updateQuantity}
          onClearCart={clearCart}
          onClose={() => setIsCartOpen(false)}
          onCheckout={() => { setIsCartOpen(false); setShowOrderTypeModal(true); }}
        />
      )}
      {showOrderTypeModal && (
        <OrderTypeModal onSelectType={handleOrderTypeSelected} onClose={() => setShowOrderTypeModal(false)} />
      )}
    </div>
    </ProtectedRoute>
  );
}
