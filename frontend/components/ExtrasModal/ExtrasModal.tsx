'use client';

import React, { useState } from 'react';
import { MenuItem, ExtraOption } from '../../types';
import styles from './ExtrasModal.module.css';

interface ExtrasModalProps {
  item: MenuItem;
  onConfirm: (item: MenuItem, selectedExtras: ExtraOption[]) => void;
  onClose: () => void;
}

export default function ExtrasModal({ item, onConfirm, onClose }: ExtrasModalProps) {
  const [selected, setSelected] = useState<ExtraOption[]>([]);

  // Normalize extras — handle old string[] format gracefully
  const extraOptions: ExtraOption[] = (item.extraOptions ?? []).map((opt) =>
    typeof opt === 'string' ? { name: opt as string, price: 0 } : opt
  );

  const extrasTotal = selected.reduce((sum, e) => sum + e.price, 0);
  const liveTotal   = item.price + extrasTotal;

  const toggle = (opt: ExtraOption) => {
    setSelected((prev) => {
      const exists = prev.some((e) => e.name === opt.name);
      return exists ? prev.filter((e) => e.name !== opt.name) : [...prev, opt];
    });
  };

  const isChecked = (opt: ExtraOption) => selected.some((e) => e.name === opt.name);

  const handleConfirm = () => {
    onConfirm(item, selected);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className={styles.header}>
          <div className={styles.headerText}>
            <p className={styles.headerLabel}>Customise your order</p>
            <h2 className={styles.headerTitle}>{item.name}</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Divider ── */}
        <div className={styles.divider} />

        {/* ── Options List ── */}
        <div className={styles.optionsList}>
          <p className={styles.optionsLabel}>Select extras (optional)</p>
          {extraOptions.map((opt) => {
            const checked = isChecked(opt);
            return (
              <label key={opt.name} className={`${styles.optionRow} ${checked ? styles.optionRowChecked : ''}`}>
                {/* Custom checkbox */}
                <span className={`${styles.checkbox} ${checked ? styles.checkboxChecked : ''}`}>
                  {checked && (
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="2,6 5,9 10,3" />
                    </svg>
                  )}
                </span>

                <input
                  type="checkbox"
                  className={styles.hiddenInput}
                  checked={checked}
                  onChange={() => toggle(opt)}
                />

                <span className={styles.optionName}>{opt.name}</span>
                <span className={styles.optionPrice}>+£{opt.price.toFixed(2)}</span>
              </label>
            );
          })}
        </div>

        {/* ── Live Total ── */}
        <div className={styles.totalRow}>
          <div className={styles.totalBreakdown}>
            <span className={styles.totalLabel}>Base price</span>
            <span className={styles.totalBase}>£{item.price.toFixed(2)}</span>
          </div>
          {extrasTotal > 0 && (
            <div className={styles.totalBreakdown}>
              <span className={styles.totalLabel}>Extras ({selected.length})</span>
              <span className={styles.totalExtras}>+£{extrasTotal.toFixed(2)}</span>
            </div>
          )}
          <div className={styles.totalFinal}>
            <span>Total</span>
            <span className={styles.totalAmount}>£{liveTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className={styles.actions}>
          <button className={styles.skipBtn} onClick={() => { onConfirm(item, []); onClose(); }}>
            Add without extras
          </button>
          <button className={styles.confirmBtn} onClick={handleConfirm}>
            {selected.length > 0
              ? `Confirm — £${liveTotal.toFixed(2)}`
              : `Add to Cart — £${item.price.toFixed(2)}`}
          </button>
        </div>

      </div>
    </div>
  );
}
