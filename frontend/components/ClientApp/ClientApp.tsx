'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Category, MenuItem, CartItem } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import Header from '../Header/Header';
import MainContent from '../MainContent/MainContent';
import CartSidebar from '../CartSidebar/CartSidebar';
import SplashScreen from '../SplashScreen/SplashScreen';
import AuthModal from '../AuthModal/AuthModal';
import LoginPrompt from '../LoginPrompt/LoginPrompt';
import ItemDetailModal from '../ItemDetailModal/ItemDetailModal';
import OrderTypeModal from '../OrderTypeModal/OrderTypeModal';
import ItemOptionsModal from '../ItemOptionsModal/ItemOptionsModal';
import styles from './ClientApp.module.css';
import { useRouter } from 'next/navigation';

// Global to track splash screen across internal navigations (resets on refresh)
let hasShownSplashGlobal = false;

interface ClientAppProps {
  categories: Category[];
  menuItems: MenuItem[];
}

export default function ClientApp({ categories, menuItems }: ClientAppProps) {
  const { user } = useAuth();
  const { cart, addToCart: addItemToCart, updateQuantity: handleUpdateQuantity, clearCart, cartTotal, totalItems: totalItemsInCart, orderType, setOrderType } = useCart();
  const router = useRouter();
  
  const [showSplash, setShowSplash] = useState(!hasShownSplashGlobal);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastKey, setToastKey] = useState(0);
  const [toasts, setToasts] = useState<{ id: number, message: string }[]>([]);

  // Auth modal state
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  // Checkout page
  const [showOrderTypeModal, setShowOrderTypeModal] = useState(false);
  const [itemWithOptions, setItemWithOptions] = useState<MenuItem | null>(null);

  useEffect(() => {
    if (!hasShownSplashGlobal) {
      const timer = setTimeout(() => {
        setShowSplash(false);
        hasShownSplashGlobal = true;
      }, 2500);
      return () => clearTimeout(timer);
    } else {
      setShowSplash(false);
    }
  }, []);

  const handleAddToCart = (item: MenuItem) => {
    if (item.options && item.options.length > 0) {
      setItemWithOptions(item);
      setSelectedItem(null); // Close detail modal if open
      return;
    }
    addItemToCart(item);
    showToast(`${item.name} added to cart`);
  };

  const showToast = (message: string) => {
    const newToastId = Date.now();
    setToasts(prev => [...prev, { id: newToastId, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToastId));
    }, 3000);

    setToastKey(prev => prev + 1);
  };

  const handleConfirmOptions = (options: Record<string, string>) => {
    if (itemWithOptions) {
      addItemToCart(itemWithOptions, options);
      setItemWithOptions(null);
      showToast(`${itemWithOptions.name} added to cart`);
    }
  };

  // Checkout handler — checks auth before proceeding
  const handleCheckout = () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    setIsCartOpen(false);
    setShowOrderTypeModal(true);
  };

  const handleOrderTypeSelected = (type: 'delivery' | 'collection') => {
    setOrderType(type);
    setShowOrderTypeModal(false);
    router.push('/checkout/review');
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

      {/* Floating Cart Bouncing Banner */}
      {cart.length > 0 && !isCartOpen && (
        <div key={toastKey} className={styles.floatingCartBanner} onClick={() => setIsCartOpen(true)}>
          {/* Item Thumbnails */}
          <div className={styles.floatingCartThumbsWrap}>
            {cart.slice(0, 3).map((item, i) => (
              <Image
                key={item.id}
                src={item.image}
                alt={item.name}
                width={36}
                height={36}
                className={styles.floatingCartThumb}
                style={{ zIndex: 3 - i, marginLeft: i === 0 ? 0 : -10 }}
              />
            ))}
            {cart.length > 3 && (
              <div className={styles.floatingCartThumbMore}>+{cart.length - 3}</div>
            )}
          </div>
 
          {/* Item count + total */}
          <div className={styles.floatingCartInfo}>
            <span className={styles.floatingCartCount}>{totalItemsInCart} item{totalItemsInCart > 1 ? 's' : ''}</span>
            <span className={styles.floatingCartTotal}>£{cartTotal.toFixed(2)}</span>
          </div>
 
          {/* Order Now CTA */}
          <button className={styles.floatingCheckoutBtn}>
            Order Now
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
      )}

      <main className={styles.mainLayout}>
        <div className={`${styles.sidebarWrapper} ${isSidebarOpen ? '' : styles.sidebarClosed}`}>
          <div className={styles.sidebarHeader}>
            <h3 className={styles.sidebarTitle} style={{ color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Menu</h3>
            <div className={styles.sidebarBadge} style={{ background: '#ffffff', color: 'var(--primary-color)' }}>{categories.length + 1}</div>
          </div>
          <div className={styles.categoryScrollContainer}>
            <button
              className={`${styles.categoryPill} ${selectedCategoryId === null ? styles.activePill : ''}`}
              onClick={() => setSelectedCategoryId(null)}
            >
              <span className={styles.categoryIcon}>🍽️</span>
              <span className={styles.categoryText}>All Categories</span>
            </button>
            {categories.map((c, index) => {
              const catImage = menuItems.find(item => item.categoryId === c.id)?.image || '/images/default.png';
              return (
                <button
                  key={c.id}
                  className={`${styles.categoryPill} ${selectedCategoryId === c.id ? styles.activePill : ''}`}
                  onClick={() => setSelectedCategoryId(c.id)}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <Image src={catImage} alt={c.name} width={36} height={36} className={styles.categoryImg} />
                  <span className={styles.categoryText}>{c.name}</span>
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
            onSelectItem={setSelectedItem}
          />
        </div>
      </main>

      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {isCartOpen && (
        <CartSidebar
          cart={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onClearCart={clearCart}
          onClose={() => setIsCartOpen(false)}
          onCheckout={handleCheckout}
        />
      )}

      {showOrderTypeModal && (
        <OrderTypeModal 
          onSelectType={handleOrderTypeSelected}
          onClose={() => setShowOrderTypeModal(false)}
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

      {itemWithOptions && (
        <ItemOptionsModal
          item={itemWithOptions}
          onConfirm={handleConfirmOptions}
          onClose={() => setItemWithOptions(null)}
        />
      )}
    </div>
  );
}
