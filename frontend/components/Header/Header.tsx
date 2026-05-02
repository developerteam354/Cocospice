'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';
import styles from './Header.module.css';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
}

// ─── Proxy URL helper ─────────────────────────────────────────────────────────
// NEXT_PUBLIC_API_URL = "http://localhost:5000/api"
// Proxy endpoint:      GET /api/user/upload/image?key=...

const toProxyUrl = (urlOrKey: string): string => {
  if (!urlOrKey) return '';
  if (urlOrKey.includes('/upload/image')) return urlOrKey;
  const s3Match = urlOrKey.match(/amazonaws\.com\/(.+)$/);
  const key = s3Match ? s3Match[1] : urlOrKey;
  return `${process.env.NEXT_PUBLIC_API_URL}/user/upload/image?key=${encodeURIComponent(key)}`;
};

// ─── Avatar sub-component ─────────────────────────────────────────────────────
// Renders profile image if available, falls back to initials

interface AvatarProps {
  name: string;
  profileImage?: string;
  size?: number;
  fontSize?: string;
  className?: string;
}

function Avatar({ name, profileImage, size = 40, fontSize = '0.85rem', className = '' }: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const proxyUrl = profileImage ? toProxyUrl(profileImage) : '';

  // Reset error state when profileImage changes (new upload)
  useEffect(() => { setImgError(false); }, [profileImage]);

  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const baseStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: 'white',
    fontWeight: 800,
    fontSize,
    boxShadow: '0 3px 10px rgba(16,185,129,0.3)',
    border: '2px solid #ffffff',
  };

  return (
    <div style={baseStyle} className={className}>
      {proxyUrl && !imgError ? (
        <img
          src={proxyUrl}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={() => setImgError(true)}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

const Header: React.FC<HeaderProps> = ({ cartCount, onOpenCart, onOpenAuth }) => {
  const { logout } = useAuth();
  const router = useRouter();

  // Read directly from Redux — always reflects the latest updateProfile.fulfilled
  const reduxUser = useAppSelector((s: RootState) => s.userAuth.user);

  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu,   setShowUserMenu]   = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

          {/* Cart */}
          <button className={styles.cartButton} onClick={onOpenCart}>
            🛒 Cart
            {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
          </button>

          {/* User area */}
          {reduxUser ? (
            <div className={styles.userArea} ref={menuRef}>
              <button
                className={styles.avatarBtn}
                onClick={() => {
                  if (window.innerWidth <= 768) {
                    router.push('/profile');
                  } else {
                    setShowUserMenu(prev => !prev);
                  }
                }}
                aria-label="User menu"
              >
                {/* Avatar — image-aware, updates instantly on profile save */}
                <Avatar
                  name={reduxUser.name}
                  profileImage={reduxUser.profileImage}
                  size={40}
                  fontSize="0.85rem"
                />
              </button>

              {showUserMenu && (
                <div className={styles.userDropdown}>
                  {/* Dropdown header with avatar */}
                  <div className={styles.dropdownHeader}>
                    <Avatar
                      name={reduxUser.name}
                      profileImage={reduxUser.profileImage}
                      size={44}
                      fontSize="1rem"
                    />
                    <div className={styles.dropdownInfo}>
                      <span className={styles.dropdownName}>{reduxUser.name}</span>
                      <span className={styles.dropdownEmail}>{reduxUser.email}</span>
                    </div>
                  </div>

                  <div className={styles.dropdownDivider} />

                  <button
                    className={styles.dropdownItem}
                    onClick={() => { setShowUserMenu(false); router.push('/profile'); }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M2.5 13c0-2.5 2.2-4 5.5-4s5.5 1.5 5.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    My Dashboard
                  </button>

                  <button
                    className={styles.dropdownItem}
                    onClick={() => { setShowUserMenu(false); router.push('/profile/orders'); }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
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

          {/* Hamburger — mobile only */}
          <button
            className={styles.hamburger}
            onClick={() => setShowMobileMenu(prev => !prev)}
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
          {reduxUser && (
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
              <button
                className={`${styles.mobileNavLink} ${styles.logoutItem}`}
                onClick={() => logout()}
              >
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
