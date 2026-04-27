'use client';

import React, { useState, useEffect } from 'react';
import { Category, MenuItem, CartItem } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../Header/Header';
import MainContent from '../MainContent/MainContent';
import CartSidebar from '../CartSidebar/CartSidebar';
import SplashScreen from '../SplashScreen/SplashScreen';
import AuthModal from '../AuthModal/AuthModal';
import LoginPrompt from '../LoginPrompt/LoginPrompt';
import CheckoutPage from '../CheckoutPage/CheckoutPage';
import styles from './ClientApp.module.css';

interface ClientAppProps {
  categories: Category[];
  menuItems: MenuItem[];
}

export default function ClientApp({ categories, menuItems }: ClientAppProps) {
  const { user } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastKey, setToastKey] = useState(0);
  const [toasts, setToasts] = useState<{id: number, message: string}[]>([]);

  // Auth modal state
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  // Checkout page
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleAddToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) => (c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    
    // Add toast
    const newToastId = Date.now();
    setToasts(prev => [...prev, { id: newToastId, message: `${item.name} added to cart` }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToastId));
    }, 3000);

    if (window.innerWidth > 768) {
      setIsCartOpen(true);
    } else {
      setToastKey(prev => prev + 1);
    }
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCart((prev) => {
      return prev.map((c) => {
        if (c.id === id) {
          return { ...c, quantity: Math.max(0, c.quantity + delta) };
        }
        return c;
      }).filter(c => c.quantity > 0);
    });
  };

  // Checkout handler — checks auth before proceeding
  const handleCheckout = () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    setIsCartOpen(false);
    setShowCheckout(true);
  };

  // Login prompt → open auth modal
  const handlePromptSignIn = () => {
    setShowLoginPrompt(false);
    setAuthModalMode('login');
    setShowAuthModal(true);
  };

  const handlePromptSignUp = () => {
    setShowLoginPrompt(false);
    setAuthModalMode('signup');
    setShowAuthModal(true);
  };

  // Open auth modal from header
  const handleOpenAuth = (mode: 'login' | 'signup') => {
    setAuthModalMode(mode);
    setShowAuthModal(true);
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (showSplash) {
    return <SplashScreen />;
  }

  const totalItemsInCart = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const filteredItems = selectedCategoryId === null 
    ? menuItems 
    : menuItems.filter(item => item.categoryId === selectedCategoryId);

  const selectedCategoryName = selectedCategoryId === null 
    ? 'All Categories' 
    : categories.find(c => c.id === selectedCategoryId)?.name || 'Menu';

  return (
    <div className={styles.appContainer}>
      <Header
        cartCount={totalItemsInCart}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={handleOpenAuth}
      />
      
      {/* Toast Notification Container */}
      <div className={styles.toastContainer}>
        {toasts.map(t => (
          <div key={t.id} className={styles.toast}>
            <span className={styles.toastIcon}>✅</span>
            <span className={styles.toastMessage}>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Mobile Cart Bouncing Banner */}
      {cart.length > 0 && (
        <div key={toastKey} className={styles.mobileCartBanner} onClick={() => setIsCartOpen(true)}>
           <div className={styles.mobileCartInfo}>
             <span className={styles.mobileCartToastText}>⚡ Fast Delivery!</span>
             <span className={styles.mobileCartTotal}>{totalItemsInCart} items • £{cartTotal.toFixed(2)}</span>
           </div>
           <button className={styles.mobileCheckoutBtn}>
             Order Now
           </button>
        </div>
      )}

      <main className={styles.mainLayout}>
        <div className={`${styles.sidebarWrapper} ${isSidebarOpen ? '' : styles.sidebarClosed}`}>
          <div className={styles.sidebarHeader}>
            <h3 className={styles.sidebarTitle}>Menu</h3>
            <div className={styles.sidebarBadge}>{categories.length + 1}</div>
          </div>
          <div className={styles.categoryScrollContainer}>
            <button 
              className={`${styles.categoryPill} ${selectedCategoryId === null ? styles.activePill : ''}`}
              onClick={() => setSelectedCategoryId(null)}
            >
              <span className={styles.categoryIcon}>🍽️</span>
              <span className={styles.categoryText}>All Categories</span>
              {selectedCategoryId === null && <span className={styles.activeIndicator} />}
            </button>
            {categories.map((c, i) => {
              const icons = ['🍛', '🥘', '🍗', '🥬', '🍚', '🥖', '🍨', '🍹'];
              const icon = icons[i % icons.length];
              return (
                <button 
                  key={c.id}
                  className={`${styles.categoryPill} ${selectedCategoryId === c.id ? styles.activePill : ''}`}
                  onClick={() => setSelectedCategoryId(c.id)}
                >
                  <span className={styles.categoryIcon}>{icon}</span>
                  <span className={styles.categoryText}>{c.name}</span>
                  {selectedCategoryId === c.id && <span className={styles.activeIndicator} />}
                </button>
              );
            })}
          </div>
        </div>

        <div className={styles.contentWrapper}>
          <div className={styles.contentHeader}>
            <button 
              className={`${styles.sidebarToggle} ${!isSidebarOpen ? styles.toggleClosed : ''}`}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Toggle Categories"
              title="Toggle Sidebar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {isSidebarOpen ? (
                  <>
                    <path d="M9 18l-6-6 6-6" />
                    <path d="M21 12H3" />
                  </>
                ) : (
                  <>
                    <path d="M15 18l6-6-6-6" />
                    <path d="M3 12h18" />
                  </>
                )}
              </svg>
            </button>
          </div>
          
          <MainContent 
            categoryTitle={selectedCategoryName}
            items={filteredItems} 
            categories={selectedCategoryId === null ? categories : undefined}
            onSelectCategory={(id) => setSelectedCategoryId(id)}
            onAddToCart={handleAddToCart} 
          />
        </div>
      </main>

      {isCartOpen && (
        <CartSidebar 
          cart={cart} 
          onUpdateQuantity={handleUpdateQuantity} 
          onClearCart={() => setCart([])}
          onClose={() => setIsCartOpen(false)}
          onCheckout={handleCheckout}
        />
      )}

      {/* Login Prompt Popup */}
      {showLoginPrompt && (
        <LoginPrompt
          onSignIn={handlePromptSignIn}
          onSignUp={handlePromptSignUp}
          onClose={() => setShowLoginPrompt(false)}
        />
      )}

      {/* Auth Modal (Login/Signup form) */}
      {showAuthModal && (
        <AuthModal
          initialMode={authModalMode}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {/* Checkout Page */}
      {showCheckout && user && (
        <CheckoutPage
          cart={cart}
          userName={user.name}
          onClose={() => setShowCheckout(false)}
          onOrderPlaced={() => {
            setCart([]);
            setShowCheckout(false);
          }}
        />
      )}
    </div>
  );
}
