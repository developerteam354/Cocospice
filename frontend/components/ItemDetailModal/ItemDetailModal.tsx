'use client';

import React, { useState, useEffect } from 'react';
import { MenuItem, ExtraOption } from '../../types';
import styles from './ItemDetailModal.module.css';

interface ItemDetailModalProps {
  item: MenuItem;
  onClose: () => void;
  /** Called when user confirms — passes selected extras (may be empty array) */
  onAddToCart: (item: MenuItem, selectedExtras?: ExtraOption[]) => void;
}

export default function ItemDetailModal({ item, onClose, onAddToCart }: ItemDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  // Normalize extraOptions — handle both old string[] and new {name,price}[]
  const extraOptions: ExtraOption[] = (item.extraOptions ?? []).map((opt) =>
    typeof opt === 'string' ? { name: opt as string, price: 0 } : opt
  );

  const hasExtras = extraOptions.length > 0;

  const validImages = [item.image, ...(item.images || [])].filter(
    (img) => img && img.trim() !== ''
  );
  const images = validImages.length > 0 ? validImages : [];

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(
      () => setCurrentImageIndex((prev) => (prev + 1) % images.length),
      3000
    );
    return () => clearInterval(interval);
  }, [images.length]);

  const handleNext = () => setCurrentImageIndex((p) => (p + 1) % images.length);
  const handlePrev = () => setCurrentImageIndex((p) => (p - 1 + images.length) % images.length);

  /** If product has extras → let ClientApp open the extras modal; otherwise add directly */
  const handleAddToCartClick = () => {
    onAddToCart(item, undefined); // ClientApp decides whether to open extras modal
    if (!hasExtras) onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">×</button>

        {/* ── Image Carousel ── */}
        <div className={styles.imageCarousel}>
          {images.length > 0 && !imageError ? (
            <>
              <img
                src={images[currentImageIndex]}
                alt={`${item.name} ${currentImageIndex + 1}`}
                className={styles.mainImage}
                onError={() => setImageError(true)}
              />
              {images.length > 1 && (
                <>
                  <button className={styles.navBtn} style={{ left: 10 }} onClick={handlePrev}>‹</button>
                  <button className={styles.navBtn} style={{ right: 10 }} onClick={handleNext}>›</button>
                  <div className={styles.dots}>
                    {images.map((_, idx) => (
                      <span
                        key={idx}
                        className={`${styles.dot} ${idx === currentImageIndex ? styles.activeDot : ''}`}
                        onClick={() => setCurrentImageIndex(idx)}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className={styles.imageFallback}>🍽️</div>
          )}
        </div>

        {/* ── Details ── */}
        <div className={styles.detailsContainer}>
          <div className={styles.header}>
            <h2 className={styles.title}>{item.name}</h2>
            <span className={styles.price}>£{item.price.toFixed(2)}</span>
          </div>

          <p className={styles.description}>{item.description}</p>

          {/* Ingredients */}
          {item.ingredients && item.ingredients.length > 0 && (
            <div className={styles.ingredientsSection}>
              <h3>Ingredients</h3>
              <ul className={styles.ingredientsList}>
                {item.ingredients.map((ing, idx) => (
                  <li key={idx} className={styles.ingredientBadge}>{ing}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Extra Options — VIEW ONLY */}
          {hasExtras && (
            <div className={styles.extrasViewSection}>
              <h3 className={styles.extrasViewTitle}>Available Extras</h3>
              <ul className={styles.extrasViewList}>
                {extraOptions.map((opt) => (
                  <li key={opt.name} className={styles.extrasViewItem}>
                    <span className={styles.extrasViewDot} />
                    <span className={styles.extrasViewName}>{opt.name}</span>
                    <span className={styles.extrasViewPrice}>+£{opt.price.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <p className={styles.extrasHint}>
                ✨ You can customise this item with the extras listed above after clicking Add to Cart.
              </p>
            </div>
          )}

          {/* Add to Cart */}
          <button className={styles.addToCartBtn} onClick={handleAddToCartClick}>
            {hasExtras ? (
              <>
                <span>Customise &amp; Add to Cart</span>
                <span className={styles.addToCartArrow}>→</span>
              </>
            ) : (
              `Add to Cart — £${item.price.toFixed(2)}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
