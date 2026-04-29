'use client';

import React from 'react';
import styles from '../ProfilePage.module.css';

export default function AddressPage() {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>My Addresses</h3>
        <button className={styles.editBtn}>+ Add New</button>
      </div>
      <div className={styles.addressList}>
        <div className={styles.addressCard}>
          <div className={styles.addressDetails}>
            <p><strong>Home</strong></p>
            <p>370 High Street</p>
            <p>Lincoln, LN5 7RU</p>
            <p>United Kingdom</p>
          </div>
          <button className={styles.editBtn} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Edit</button>
        </div>
        
        {/* Mock additional address */}
        <div className={styles.addressCard} style={{ marginTop: '16px', opacity: 0.7 }}>
          <div className={styles.addressDetails}>
            <p><strong>Office</strong></p>
            <p>123 Business Park</p>
            <p>Lincoln, LN1 1AB</p>
          </div>
          <button className={styles.editBtn} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Edit</button>
        </div>
      </div>
    </div>
  );
}
