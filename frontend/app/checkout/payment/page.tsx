'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import PaymentStep, { PaymentMethod } from '@/components/CheckoutPage/PaymentStep';
import styles from '@/components/CheckoutPage/CheckoutPage.module.css';

const DELIVERY_FEE = 2.99;

export default function PaymentPage() {
  const { cart, orderType, clearCart, cartTotal, shippingAddress } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  
  const [payment, setPayment] = useState<PaymentMethod>('card');
  const [placing, setPlacing] = useState(false);

  const total = cartTotal + (orderType === 'delivery' ? DELIVERY_FEE : 0);

  const handlePlaceOrder = async () => {
    setPlacing(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 2000));
    setPlacing(false);
    
    // Clear cart and redirect to success page
    clearCart();
    router.push('/checkout/success');
  };

  return (
    <>
      <PaymentStep
        cart={cart}
        address={shippingAddress}
        payment={payment}
        onPaymentChange={setPayment}
      />
      
      <footer className={styles.footer}>
        <button
          className={`${styles.ctaBtn} ${styles.ctaBtnGold}`}
          onClick={handlePlaceOrder}
          disabled={placing}
        >
          {placing
            ? <><span className={styles.spinner} /> Placing Order…</>
            : <>Place Order · £{total.toFixed(2)}</>
          }
        </button>
      </footer>
    </>
  );
}
