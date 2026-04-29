'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import styles from './SuccessPage.module.css';

export default function SuccessPage() {
  const { user } = useAuth();
  const { orderType } = useCart();
  const router = useRouter();
  const [showDetails, setShowDetails] = useState(false);
  const [orderId, setOrderId] = useState<string>('');

  useEffect(() => {
    // Generate order ID on client side to prevent hydration mismatch
    setOrderId(`CS-${Math.floor(1000 + Math.random() * 9000)}`);

    // Play a clear happy bell success sound immediately
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/601/601-preview.mp3');
    audio.volume = 1.0;
    audio.play()
      .then(() => console.log('Order success sound played!'))
      .catch(err => console.log('Audio play failed:', err));

    // Reveal details after the simple animation
    const timer = setTimeout(() => {
      setShowDetails(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {!showDetails && (
          <div className={styles.simpleAnimation}>
            <div className={styles.checkmarkWrapper}>
              <div className={styles.checkmarkRing}></div>
              <svg className={styles.checkmark} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                <circle className={styles.checkmarkCircle} cx="26" cy="26" r="25" fill="none" />
                <path className={styles.checkmarkCheck} fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
              </svg>
            </div>
            <div className={styles.loadingText}>Processing your order...</div>
          </div>
        )}

        {/* Success Details - Revealed after animation */}
        <div className={`${styles.detailsReveal} ${showDetails ? styles.visible : ''}`}>
          {showDetails && (
            <div className={styles.confettiPopper}>
              {[...Array(40)].map((_, i) => (
                <div
                  key={i}
                  className={styles.popperPiece}
                  style={{
                    '--delay': `${Math.random() * 0.4}s`,
                    '--x': `${(Math.random() - 0.5) * 800}px`,
                    '--y': `${-Math.random() * 500}px`,
                    '--rot': `${Math.random() * 360}deg`,
                    '--color': ['#10b981', '#fbbf24', '#3b82f6', '#f43f5e'][Math.floor(Math.random() * 4)]
                  } as any}
                />
              ))}
            </div>
          )}

          <div className={styles.staggeredContent}>
            <div className={styles.successIcon} style={{ '--order': 1 } as any}>✨</div>
            <h1 className={styles.title} style={{ '--order': 2 } as any}>Order Confirmed!</h1>
            <p className={styles.message} style={{ '--order': 3 } as any}>
              Thank you for choosing <strong>CocoSpice</strong>, {user?.name.split(' ')[0] || 'Guest'}!
              {orderType === 'delivery'
                ? ' Your order is now on its way to you.'
                : ' Your order is being prepared for pickup.'}
            </p>

            <div className={styles.orderInfo} style={{ '--order': 4 } as any}>
              <div className={styles.infoRow}>
                <span>Order Number:</span>
                <strong>#{orderId || '...'}</strong>
              </div>
              <div className={styles.infoRow}>
                <span>{orderType === 'delivery' ? 'Estimated Time:' : 'Ready In:'}</span>
                <strong>{orderType === 'delivery' ? '30 - 45 Mins' : '15 - 20 Mins'}</strong>
              </div>
            </div>

            <div className={styles.actions} style={{ '--order': 5 } as any}>
              <Link href="/" className={styles.continueBtn}>
                Continue Shopping
              </Link>
              <button className={styles.viewOrderBtn} onClick={() => alert('Order tracking feature coming soon!')}>
                View My Order
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDetails && (
        <p className={styles.support}>
          Need help? <Link href="/contact">Contact Support</Link>
        </p>
      )}
    </div>
  );
}
