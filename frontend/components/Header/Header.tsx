'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Header.module.css';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
}

export default function Header({ cartCount, onOpenCart, onOpenAuth }: HeaderProps) {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className={styles.header}>
      <div className={styles.topBar}>
        <div className={styles.info}>
          <span>📍 370 High Street, Lincoln LN5 7RU</span>
          <span>📞 01522 534 202</span>
          <span className={styles.statusOpen}>Open</span>
        </div>
      </div>
      <div className={styles.mainHeader}>
        <div className={styles.logoArea}>
          <h1 className={styles.logo}>Cocospice</h1>
          <p className={styles.subtitle}>Premium Indian Cuisine</p>
        </div>
        <nav className={styles.nav}>
          <a href="#" className={styles.active}>Home</a>
          <a href="#">Menu</a>
          <a href="#">Contact</a>

          {/* User Auth Area */}
          {user ? (
            <div className={styles.userArea} ref={menuRef}>
              <button
                className={styles.avatarBtn}
                onClick={() => setShowUserMenu(!showUserMenu)}
                aria-label="User menu"
              >
                <span className={styles.avatarCircle}>
                  {getInitials(user.name)}
                </span>
              </button>

              {showUserMenu && (
                <div className={styles.userDropdown}>
                  <div className={styles.dropdownHeader}>
                    <span className={styles.dropdownAvatar}>
                      {getInitials(user.name)}
                    </span>
                    <div className={styles.dropdownInfo}>
                      <span className={styles.dropdownName}>{user.name}</span>
                      <span className={styles.dropdownEmail}>{user.email}</span>
                    </div>
                  </div>
                  <div className={styles.dropdownDivider} />
                  <button className={styles.dropdownItem} onClick={() => { setShowUserMenu(false); }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M2.5 13c0-2.5 2.2-4 5.5-4s5.5 1.5 5.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    My Profile
                  </button>
                  <button className={styles.dropdownItem} onClick={() => { setShowUserMenu(false); }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M2 6h12" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                    My Orders
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

          <button className={styles.cartButton} onClick={onOpenCart}>
            🛒 Cart
            {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
          </button>
        </nav>
      </div>
    </header>
  );
}
