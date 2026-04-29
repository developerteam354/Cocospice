'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import styles from './Header.module.css';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
}

const Header: React.FC<HeaderProps> = ({ cartCount, onOpenCart, onOpenAuth }) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <header className={styles.header}>

      {/* ── Marquee Top Bar ── */}
      <div className={styles.topBar}>
        <div className={styles.info}>
          <span>📍 370 High Street, Lincoln LN5 7RU</span>
          <span>📞 01522 534 202</span>
          <span className={styles.statusOpen}>We are now open</span>
        </div>
      </div>

      {/* ── Main Header ── */}
      <div className={styles.mainHeader}>

        {/* Logo */}
        <a href="/" className={styles.logoArea}>
          <div className={styles.logoIcon}>🍛</div>
          <div className={styles.logoText}>
            <h1 className={styles.logo}>
              Coco<span className={styles.logoAccent}>spice</span>
            </h1>
            <p className={styles.subtitle}> Indian Cuisine</p>
          </div>
        </a>

        {/* Desktop Nav */}
        <nav className={styles.nav}>
          <a href="/" className={styles.active}>Menu</a>
          <a href="#">About</a>
          <a href="#">Contact</a>
        </nav>

        {/* Right Actions */}
        <div className={styles.actions}>

          {/* Cart first */}
          <button className={styles.cartButton} onClick={onOpenCart}>
            🛒 Cart
            {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
          </button>

          {/* Account to the right of cart */}
          {user ? (
            <div className={styles.userArea} ref={menuRef}>
              <button
                className={styles.avatarBtn}
                onClick={() => {
                  if (window.innerWidth <= 768) {
                    router.push('/profile');
                  } else {
                    setShowUserMenu(!showUserMenu);
                  }
                }}
                aria-label="User menu"
              >
                <span className={styles.avatarCircle}>{getInitials(user.name)}</span>
              </button>

              {showUserMenu && (
                <div className={styles.userDropdown}>
                  <div className={styles.dropdownHeader}>
                    <span className={styles.dropdownAvatar}>{getInitials(user.name)}</span>
                    <div className={styles.dropdownInfo}>
                      <span className={styles.dropdownName}>{user.name}</span>
                      <span className={styles.dropdownEmail}>{user.email}</span>
                    </div>
                  </div>
                  <div className={styles.dropdownDivider} />
                  <button 
                    className={styles.dropdownItem} 
                    onClick={() => {
                      setShowUserMenu(false);
                      router.push('/profile');
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M2.5 13c0-2.5 2.2-4 5.5-4s5.5 1.5 5.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    My Dashboard
                  </button>
                  <div className={styles.dropdownDivider} />
                  <button
                    className={`${styles.dropdownItem} ${styles.logoutItem}`}
                    onClick={() => { logout(); setShowUserMenu(false); }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M6 2H4a2 2 0 00-2 2v8a2 2 0 002 2h2M10.5 11.5L14 8l-3.5-3.5M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className={styles.loginButton} onClick={() => onOpenAuth('login')}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M2.5 13c0-2.5 2.2-4 5.5-4s5.5 1.5 5.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Sign In
            </button>
          )}

          {/* Hamburger — mobile only */}
          <button
            className={styles.hamburger}
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label="Open menu"
          >
            <span className={`${styles.hamburgerLine} ${showMobileMenu ? styles.hLine1Open : ''}`} />
            <span className={`${styles.hamburgerLine} ${showMobileMenu ? styles.hLine2Open : ''}`} />
            <span className={`${styles.hamburgerLine} ${showMobileMenu ? styles.hLine3Open : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Mobile Dropdown Menu ── */}
      {showMobileMenu && (
        <nav className={styles.mobileNav} onClick={() => setShowMobileMenu(false)}>
          <a href="/" className={styles.mobileNavLink}>🍽️ Menu</a>
          {user && (
            <>
              <button className={styles.mobileNavLink} onClick={() => router.push('/profile')}>
                👤 My Dashboard
              </button>
              <button className={styles.mobileNavLink} onClick={() => router.push('/profile/orders')}>
                📦 My Orders
              </button>
              <button className={styles.mobileNavLink} onClick={() => router.push('/profile/address')}>
                📍 Manage Address
              </button>
              <button className={`${styles.mobileNavLink} ${styles.logoutItem}`} onClick={() => logout()}>
                🚪 Sign Out
              </button>
            </>
          )}
          <a href="#" className={styles.mobileNavLink}>ℹ️ About</a>
          <a href="#" className={styles.mobileNavLink}>📞 Contact</a>
        </nav>
      )}
    </header>
  );
};

export default Header;
