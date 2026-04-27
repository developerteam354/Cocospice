import React from 'react';
import styles from './Header.module.css';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
}

export default function Header({ cartCount, onOpenCart }: HeaderProps) {
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
          <button className={styles.cartButton} onClick={onOpenCart}>
            🛒 Cart
            {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
          </button>
        </nav>
      </div>
    </header>
  );
}
