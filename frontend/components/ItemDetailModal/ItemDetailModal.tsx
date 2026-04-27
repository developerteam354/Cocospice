import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { MenuItem } from '../../types';
import styles from './ItemDetailModal.module.css';

interface ItemDetailModalProps {
  item: MenuItem;
  onClose: () => void;
  onAddToCart: (item: MenuItem) => void;
}

export default function ItemDetailModal({ item, onClose, onAddToCart }: ItemDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = item.images && item.images.length > 0 ? item.images : [item.image];

  useEffect(() => {
    if (images.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3000); // Auto-scroll every 3 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>×</button>
        
        <div className={styles.imageCarousel}>
          <Image 
            src={images[currentImageIndex]} 
            alt={`${item.name} image ${currentImageIndex + 1}`} 
            width={400} 
            height={300} 
            className={styles.mainImage} 
            priority
          />
          
          {images.length > 1 && (
            <>
              <button className={styles.navBtn} style={{ left: '10px' }} onClick={handlePrevImage}>‹</button>
              <button className={styles.navBtn} style={{ right: '10px' }} onClick={handleNextImage}>›</button>
              
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
        </div>

        <div className={styles.detailsContainer}>
          <div className={styles.header}>
            <h2 className={styles.title}>{item.name}</h2>
            <span className={styles.price}>£{item.price.toFixed(2)}</span>
          </div>
          
          <p className={styles.description}>{item.description}</p>
          
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

          <button 
            className={styles.addToCartBtn} 
            onClick={() => {
              onAddToCart(item);
              onClose();
            }}
          >
            Add to Cart - £{item.price.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
}
