'use client';

import React, { useState } from 'react';
import { CartItem } from '../../types';
import { Address as CartAddress } from '../../contexts/CartContext';
import { useCart } from '../../contexts/CartContext';
import styles from './CheckoutPage.module.css';

/* ─── Types ─────────────────────────────────── */
export type PaymentMethod = 'card' | 'cash' | 'paypal';

const DELIVERY_FEE = 2.99;

interface PaymentStepProps {
  cart: CartItem[];
  address: CartAddress;
  payment: PaymentMethod;
  onPaymentChange: (method: PaymentMethod) => void;
  codCharge?: number;
}

/* ── Helpers ── */
const formatCard = (v: string) =>
  v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

const formatExpiry = (v: string) =>
  v.replace(/\D/g, '').slice(0, 4).replace(/^(\d{2})(\d)/, '$1/$2');

export default function PaymentStep({ cart, address, payment, onPaymentChange, codCharge = 0 }: PaymentStepProps) {
  const { orderType } = useCart();
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryFee = orderType === 'delivery' ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee + codCharge;
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);

  const METHODS: { id: PaymentMethod; icon: string; label: string }[] = [
    { id: 'card',   icon: '💳', label: 'Credit / Debit Card' },
    { id: 'paypal', icon: '🅿️', label: 'PayPal' },
    { id: 'cash',   icon: '💵', label: 'Cash on Delivery' },
  ];

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Payment Method</h2>

      {/* ── Method selector ── */}
      <div className={styles.methodGrid}>
        {METHODS.map(m => (
          <button
            key={m.id}
            className={`${styles.methodCard} ${payment === m.id ? styles.methodCardActive : ''}`}
            onClick={() => onPaymentChange(m.id)}
          >
            <span className={styles.methodIcon}>{m.icon}</span>
            <span className={styles.methodLabel}>{m.label}</span>
            {payment === m.id && <span className={styles.methodCheck}>✓</span>}
          </button>
        ))}
      </div>

      {/* ── Card fields ── */}
      {payment === 'card' && (
        <div className={`${styles.form} ${styles.cardForm}`}>
          <div className={styles.cardPreview}>
            <div className={styles.cardChip} />
            <div className={styles.cardNumber}>{cardNumber || '•••• •••• •••• ••••'}</div>
            <div className={styles.cardMeta}>
              <span>{cardName || 'CARDHOLDER'}</span>
              <span>{cardExpiry || 'MM/YY'}</span>
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Card Number</label>
            <input
              className={styles.input}
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={e => setCardNumber(formatCard(e.target.value))}
              maxLength={19}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Name on Card</label>
            <input
              className={styles.input}
              placeholder="Jane Smith"
              value={cardName}
              onChange={e => setCardName(e.target.value.toUpperCase())}
            />
          </div>

          <div className={styles.row2}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Expiry</label>
              <input
                className={styles.input}
                placeholder="MM/YY"
                value={cardExpiry}
                onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                maxLength={5}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>CVV</label>
              <input
                className={styles.input}
                placeholder="•••"
                type="password"
                value={cardCvv}
                onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                maxLength={3}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── PayPal info ── */}
      {payment === 'paypal' && (
        <div className={styles.paypalInfo}>
          <div className={styles.paypalLogo}>PayPal</div>
          <p>You&apos;ll be redirected to PayPal to complete your payment after placing your order.</p>
        </div>
      )}

      {/* ── Cash info ── */}
      {payment === 'cash' && (
        <div className={styles.cashInfo}>
          <span className={styles.cashIcon}>💵</span>
          <p>Please have <strong>£{total.toFixed(2)}</strong> ready when {orderType === 'delivery' ? 'your rider arrives' : 'you arrive for collection'}. Exact change is appreciated!</p>
          {codCharge > 0 && (
            <div className={styles.codNotice}>
              <strong>Note:</strong> A £{codCharge.toFixed(2)} Cash on Delivery charge has been added to your order.
            </div>
          )}
        </div>
      )}

      {/* ── Order mini-summary ── */}
      <div className={styles.miniSummary}>
        <div className={styles.miniRow}>
          <span>Items ({itemCount})</span>
          <span>£{subtotal.toFixed(2)}</span>
        </div>
        {orderType === 'delivery' && (
          <div className={styles.miniRow}>
            <span>Delivery</span>
            <span>£{DELIVERY_FEE.toFixed(2)}</span>
          </div>
        )}
        {codCharge > 0 && (
          <div className={styles.miniRow}>
            <span>COD Charge</span>
            <span>£{codCharge.toFixed(2)}</span>
          </div>
        )}
        <div className={`${styles.miniRow} ${styles.miniTotal}`}>
          <span>Total</span>
          <span>£{total.toFixed(2)}</span>
        </div>
      </div>

      {/* ── Deliver-to summary ── */}
      {orderType === 'delivery' && address.line1 && (
        <div className={styles.addressSummary}>
          <span className={styles.addressIcon}>📍</span>
          <div>
            <div className={styles.addressName}>{address.fullName}</div>
            <div className={styles.addressText}>
              {[address.line1, address.line2, address.city, address.postcode].filter(Boolean).join(', ')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
