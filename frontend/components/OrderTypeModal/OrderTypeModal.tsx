import React from 'react';
import styles from './OrderTypeModal.module.css';

interface OrderTypeModalProps {
  onSelectType: (type: 'delivery' | 'collection') => void;
  onClose: () => void;
}

export default function OrderTypeModal({ onSelectType, onClose }: OrderTypeModalProps) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>How would you like your order?</h2>
        
        <div className={styles.options}>
          <button className={`${styles.optionBtn} ${styles.delivery}`} onClick={() => onSelectType('delivery')}>
            <div className={styles.icon}>🛵</div>
            <div className={styles.textWrap}>
              <span className={styles.mainText}>Delivery</span>
              <span className={styles.subText}>Delivered fresh to your door</span>
            </div>
          </button>
          
          <button className={`${styles.optionBtn} ${styles.collection}`} onClick={() => onSelectType('collection')}>
            <div className={styles.icon}>🛍️</div>
            <div className={styles.textWrap}>
              <span className={styles.mainText}>Collection</span>
              <span className={styles.subText}>Pick up at 370 High Street</span>
            </div>
          </button>
        </div>

        <button className={styles.closeBtn} onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
