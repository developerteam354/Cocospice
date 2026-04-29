'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import styles from './ProfilePage.module.css';

export default function ProfileDetailsPage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '07890 123456',
    postcode: 'LN5 7RU'
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name,
        email: user.email
      }));
    }
  }, [user]);

  const handleSave = () => {
    setIsEditing(false);
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>Profile Information</h3>
        {!isEditing && (
          <button className={styles.editBtn} onClick={() => setIsEditing(true)}>
            Edit Profile
          </button>
        )}
      </div>

      <div className={styles.profileForm}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Full Name</label>
          <input 
            type="text" 
            className={`${styles.input} ${!isEditing ? styles.inputDisabled : ''}`}
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            readOnly={!isEditing}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Email Address</label>
          <input 
            type="email" 
            className={`${styles.input} ${!isEditing ? styles.inputDisabled : ''}`}
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            readOnly={!isEditing}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Phone Number</label>
          <input 
            type="text" 
            className={`${styles.input} ${!isEditing ? styles.inputDisabled : ''}`}
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            readOnly={!isEditing}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Default Postcode</label>
          <input 
            type="text" 
            className={`${styles.input} ${!isEditing ? styles.inputDisabled : ''}`}
            value={formData.postcode}
            onChange={(e) => setFormData({...formData, postcode: e.target.value})}
            readOnly={!isEditing}
          />
        </div>

        {isEditing && (
          <div className={styles.saveActions}>
            <button className={styles.saveBtn} onClick={handleSave}>Save Changes</button>
            <button className={styles.cancelBtn} onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}
