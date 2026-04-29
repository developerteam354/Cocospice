'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import Header from '@/components/Header/Header';
import CartSidebar from '@/components/CartSidebar/CartSidebar';
import AuthModal from '@/components/AuthModal/AuthModal';
import OrderTypeModal from '@/components/OrderTypeModal/OrderTypeModal';
import SplashScreen from '@/components/SplashScreen/SplashScreen';
import styles from './ProfilePage.module.css';
import { useRouter, usePathname } from 'next/navigation';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading: authLoading } = useAuth();
  const { totalItems, cart, updateQuantity, clearCart, setOrderType } = useCart();
  const router = useRouter();
  const pathname = usePathname();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [showOrderTypeModal, setShowOrderTypeModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const hasShownSplash = sessionStorage.getItem('hasShownSplash');
    if (!hasShownSplash) {
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
        sessionStorage.setItem('hasShownSplash', 'true');
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!loading && !authLoading && !user) {
      setAuthModalMode('login');
      setShowAuthModal(true);
    }
  }, [loading, authLoading, user]);

  if (loading) return <SplashScreen />;

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const handleOrderTypeSelected = (type: 'delivery' | 'collection') => {
    setOrderType(type);
    setShowOrderTypeModal(false);
    router.push('/checkout/review');
  };

  const activeTab = pathname === '/profile' ? 'profile' : pathname.includes('orders') ? 'orders' : 'address';

  return (
    <div className={styles.profileContainer}>
      <Header 
        cartCount={totalItems} 
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={(mode) => {
          setAuthModalMode(mode);
          setShowAuthModal(true);
        }}
      />

      <main className={styles.mainLayout}>
        {/* Left Sidebar - Shared across sub-pages */}
        <aside className={styles.sidebar}>
          <div className={styles.userBrief}>
            <div className={styles.avatar}>{user ? getInitials(user.name) : '?'}</div>
            <h2 className={styles.userName}>{user?.name || 'Guest User'}</h2>
            <p className={styles.userEmail}>{user?.email || 'Sign in to see details'}</p>
          </div>

          <nav className={styles.navMenu}>
            <button 
              className={styles.navItem} 
              onClick={() => router.push('/')}
              style={{ color: 'var(--primary-color)', marginBottom: '10px' }}
            >
              <span className={styles.navIcon}>←</span>
              Back to Menu
            </button>
            <button 
              className={`${styles.navItem} ${activeTab === 'profile' ? styles.navItemActive : ''}`}
              onClick={() => router.push('/profile')}
            >
              <span className={styles.navIcon}>👤</span>
              My Profile
            </button>
            <button 
              className={`${styles.navItem} ${activeTab === 'orders' ? styles.navItemActive : ''}`}
              onClick={() => router.push('/profile/orders')}
            >
              <span className={styles.navIcon}>📦</span>
              My Orders
            </button>
            <button 
              className={`${styles.navItem} ${activeTab === 'address' ? styles.navItemActive : ''}`}
              onClick={() => router.push('/profile/address')}
            >
              <span className={styles.navIcon}>📍</span>
              Manage Address
            </button>
            
            <div className={styles.sidebarDivider}>
              <button 
                className={styles.navItem}
                style={{ color: '#ef4444' }}
                onClick={() => {
                  logout();
                  router.push('/');
                }}
              >
                <span className={styles.navIcon}>🚪</span>
                Sign Out
              </button>
            </div>
          </nav>
        </aside>

        {/* Content area where sub-pages will render */}
        <section className={styles.contentArea}>
          {children}
        </section>
      </main>

      {/* Shared Overlays */}
      {isCartOpen && (
        <CartSidebar 
          cart={cart}
          onUpdateQuantity={updateQuantity}
          onClearCart={clearCart}
          onClose={() => setIsCartOpen(false)}
          onCheckout={() => {
            setIsCartOpen(false);
            setShowOrderTypeModal(true);
          }}
        />
      )}

      {showAuthModal && (
        <AuthModal 
          initialMode={authModalMode}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {showOrderTypeModal && (
        <OrderTypeModal 
          onSelectType={handleOrderTypeSelected}
          onClose={() => setShowOrderTypeModal(false)}
        />
      )}
    </div>
  );
}
