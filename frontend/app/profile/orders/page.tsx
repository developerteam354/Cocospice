'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import styles from '../ProfilePage.module.css';

export default function OrdersPage() {
  const { user } = useAuth();

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>Recent Orders</h3>
      </div>
      <div className={styles.orderList}>
        {/* Mock Orders */}
        <div className={styles.orderItem}>
          <div className={styles.orderInfo}>
            <h4>Order #CS-2931</h4>
            <p className={styles.orderMeta}>Ordered on: 29 April 2026 • 3 items • £42.50</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: '700', marginTop: '4px' }}>Chicken Tikka, Garlic Naan, Pilau Rice</p>
          </div>
          <span className={styles.orderStatus}>In Kitchen</span>
        </div>
        <div className={styles.orderItem}>
          <div className={styles.orderInfo}>
            <h4>Order #CS-2854</h4>
            <p className={styles.orderMeta}>Ordered on: 24 April 2026 • 1 item • £12.00</p>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>Lamb Rogan Josh</p>
          </div>
          <span className={styles.orderStatus} style={{ background: '#f1f5f9', color: '#64748b' }}>Delivered</span>
        </div>
        {!user && <div className={styles.emptyState}><span className={styles.emptyIcon}>📦</span>No orders found. Sign in to view your history.</div>}
      </div>
    </div>
  );
}
