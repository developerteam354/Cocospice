'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import styles from './SuccessPage.module.css';

export default function SuccessPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [showDetails, setShowDetails] = useState(false);
  const [orderId, setOrderId] = useState<string>('');

  useEffect(() => {
    // Generate order ID on client side to prevent hydration mismatch
    setOrderId(`CS-${Math.floor(1000 + Math.random() * 9000)}`);

    // Reveal details after the complex packing & dispatch sequence
    const timer = setTimeout(() => {
      setShowDetails(true);
      // Play a 'Tada' win sound
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
      audio.volume = 0.4;
      audio.play().catch(err => console.log('Audio play failed:', err));
    }, 5500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Enhanced Innovative Packing & Dispatch Animation */}
        {!showDetails && (
          <div className={styles.dispatchScene}>
            {/* Background Environment */}
            <div className={styles.clouds}>
              <div className={styles.cloud}></div>
              <div className={styles.cloud}></div>
            </div>
            <div className={styles.building}>
              <div className={styles.restaurantDoor}></div>
              <div className={styles.buildingWindow}></div>
              <div className={styles.buildingWindow}></div>
              <div className={styles.restaurantSign}>COCOSPICE</div>
              <div className={styles.awning}></div>
            </div>

            <div className={styles.road}>
              <div className={styles.roadMarkings}></div>
            </div>

            {/* The Delivery Van */}
            <div className={styles.van}>
              <div className={styles.vanBody}>
                <div className={styles.vanDoor}></div>
                <div className={styles.vanWindow}></div>
                <div className={styles.exhaust}></div>
              </div>
              <div className={styles.vanWheel1}></div>
              <div className={styles.vanWheel2}></div>
            </div>

            {/* The Human Character with walking legs */}
            <div className={styles.human}>
              <div className={styles.head}></div>
              <div className={styles.body}></div>
              <div className={styles.arm}></div>
              <div className={styles.leg1}></div>
              <div className={styles.leg2}></div>

              {/* The Package */}
              <div className={styles.packageItem}></div>
            </div>

            <div className={styles.dispatchText}>Packing your fresh order...</div>
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
              Your order is now on its way.
            </p>

            <div className={styles.orderInfo} style={{ '--order': 4 } as any}>
              <div className={styles.infoRow}>
                <span>Order Number:</span>
                <strong>#{orderId || '...'}</strong>
              </div>
              <div className={styles.infoRow}>
                <span>Estimated Time:</span>
                <strong>30 - 45 Mins</strong>
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
