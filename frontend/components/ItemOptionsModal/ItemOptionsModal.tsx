'use client';

import React, { useState } from 'react';
import { MenuItem } from '../../types';
import styles from './ItemOptionsModal.module.css';

interface ItemOptionsModalProps {
  item: MenuItem;
  onConfirm: (selectedOptions: Record<string, string>) => void;
  onClose: () => void;
}

export default function ItemOptionsModal({ item, onConfirm, onClose }: ItemOptionsModalProps) {
  const [selections, setSelections] = useState<Record<string, string>>(() => {
    // Pre-select first choice for required options
    const initial: Record<string, string> = {};
    item.options?.forEach(opt => {
      if (opt.required && opt.choices.length > 0) {
        initial[opt.name] = opt.choices[0];
      }
    });
    return initial;
  });

  const handleSelect = (optionName: string, choice: string) => {
    setSelections(prev => ({ ...prev, [optionName]: choice }));
  };

  const handleConfirm = () => {
    // Ensure all required options are selected
    const missing = item.options?.find(opt => opt.required && !selections[opt.name]);
    if (missing) {
      alert(`Please select an option for ${missing.name}`);
      return;
    }
    onConfirm(selections);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleWrap}>
            <h2 className={styles.title}>Customize {item.name}</h2>
            <p className={styles.subtitle}>Select your preferences below</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>

        <div className={styles.content}>
          {item.options?.map((option) => (
            <div key={option.name} className={styles.optionGroup}>
              <h3 className={styles.optionName}>
                {option.name}
                {option.required && <span className={styles.required}>* Required</span>}
              </h3>
              <div className={styles.choices}>
                {option.choices.map((choice) => (
                  <button
                    key={choice}
                    className={`${styles.choiceBtn} ${selections[option.name] === choice ? styles.activeChoice : ''}`}
                    onClick={() => handleSelect(option.name, choice)}
                  >
                    <div className={styles.radio}>
                      <div className={styles.radioInner} />
                    </div>
                    {choice}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={styles.confirmBtn} onClick={handleConfirm}>
            Add to Cart — £{item.price.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
}
