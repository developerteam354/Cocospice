'use client';

import React, { useState, useEffect } from 'react';
import { SavedAddress } from '../../types';
import styles from './AddressModal.module.css';

interface AddressModalProps {
  address?: SavedAddress; // If provided, we're editing
  onClose: () => void;
  onSave: (address: SavedAddress) => void;
}

export default function AddressModal({ address, onClose, onSave }: AddressModalProps) {
  const [formData, setFormData] = useState<Omit<SavedAddress, 'id'>>({
    label: '',
    fullName: '',
    line1: '',
    line2: '',
    city: '',
    postcode: '',
    phone: '',
    isDefault: false,
  });

  useEffect(() => {
    if (address) {
      setFormData({
        label: address.label,
        fullName: address.fullName,
        line1: address.line1,
        line2: address.line2 || '',
        city: address.city,
        postcode: address.postcode,
        phone: address.phone,
        isDefault: address.isDefault || false,
      });
    }
  }, [address]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: address?.id || Math.random().toString(36).substr(2, 9),
    });
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        <div className={styles.header}>
          <h2 className={styles.title}>{address ? 'Edit Address' : 'Add New Address'}</h2>
          <p className={styles.subtitle}>Enter your delivery details below</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Address Label (e.g. Home, Office)</label>
            <input
              type="text"
              name="label"
              placeholder="Home"
              className={styles.input}
              value={formData.label}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Full Name</label>
            <input
              type="text"
              name="fullName"
              placeholder="John Doe"
              className={styles.input}
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Address Line 1</label>
            <input
              type="text"
              name="line1"
              placeholder="370 High Street"
              className={styles.input}
              value={formData.line1}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Address Line 2 (Optional)</label>
            <input
              type="text"
              name="line2"
              placeholder="Apartment, suite, etc."
              className={styles.input}
              value={formData.line2}
              onChange={handleChange}
            />
          </div>

          <div className={styles.inputRow}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>City</label>
              <input
                type="text"
                name="city"
                placeholder="Lincoln"
                className={styles.input}
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Postcode</label>
              <input
                type="text"
                name="postcode"
                placeholder="LN5 7RU"
                className={styles.input}
                value={formData.postcode}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Phone Number</label>
            <input
              type="tel"
              name="phone"
              placeholder="+44 7700 900000"
              className={styles.input}
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              id="isDefault"
              name="isDefault"
              className={styles.checkbox}
              checked={formData.isDefault}
              onChange={handleChange}
            />
            <label htmlFor="isDefault" className={styles.checkboxLabel}>Set as default delivery address</label>
          </div>

          <button type="submit" className={styles.submitBtn}>
            {address ? 'Update Address' : 'Save Address'}
          </button>
        </form>
      </div>
    </div>
  );
}
