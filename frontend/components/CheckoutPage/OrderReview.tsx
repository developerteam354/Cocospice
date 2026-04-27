'use client';

import React from 'react';
import { CartItem } from '../../types';
import styles from './CheckoutPage.module.css';

const DELIVERY_FEE = 2.99;

interface OrderReviewProps {
  cart: CartItem[];
}

export default function OrderReview({ cart }: OrderReviewProps) {
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = subtotal + DELIVERY_FEE;

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Your Order</h2>

      <div className={styles.itemList}>
        {cart.map(item => (
          <div key={item.id} className={styles.orderItem}>
            <div className={styles.itemImgWrap}>
              {item.image
                ? <img src={item.image} alt={item.name} className={styles.itemImg} />
                : <div className={styles.itemImgPlaceholder}>🍽️</div>
              }
              <span className={styles.qtyBadge}>{item.quantity}</span>
            </div>
            <div className={styles.itemDetails}>
              <span className={styles.itemName}>{item.name}</span>
              <span className={styles.itemDesc}>{item.description}</span>
              <span className={styles.itemUnit}>£{item.price.toFixed(2)} each</span>
            </div>
            <div className={styles.itemTotal}>£{(item.price * item.quantity).toFixed(2)}</div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className={styles.totalsCard}>
        <div className={styles.totalRow}>
          <span>Subtotal</span>
          <span>£{subtotal.toFixed(2)}</span>
        </div>
        <div className={styles.totalRow}>
          <span>Delivery fee</span>
          <span>£{DELIVERY_FEE.toFixed(2)}</span>
        </div>
        <div className={`${styles.totalRow} ${styles.grandTotal}`}>
          <span>Total</span>
          <span>£{total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
