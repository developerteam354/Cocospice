'use client';

import React, { useState } from 'react';
import styles from '../ProfilePage.module.css';
import { SavedAddress } from '../../../types';
import AddressModal from '../../../components/AddressModal/AddressModal';

export default function AddressPage() {
  const [addresses, setAddresses] = useState<SavedAddress[]>([
    {
      id: '1',
      label: 'Home',
      fullName: 'John Doe',
      line1: '370 High Street',
      city: 'Lincoln',
      postcode: 'LN5 7RU',
      phone: '07700 900000',
      isDefault: true,
    },
    {
      id: '2',
      label: 'Office',
      fullName: 'John Doe',
      line1: '123 Business Park',
      city: 'Lincoln',
      postcode: 'LN1 1AB',
      phone: '07700 900111',
      isDefault: false,
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | undefined>(undefined);

  const handleAddNew = () => {
    setEditingAddress(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (address: SavedAddress) => {
    setEditingAddress(address);
    setIsModalOpen(true);
  };

  const handleSave = (address: SavedAddress) => {
    if (editingAddress) {
      // Update existing
      setAddresses(prev => {
        const updated = prev.map(a => a.id === address.id ? address : a);
        if (address.isDefault) {
          return updated.map(a => a.id === address.id ? a : { ...a, isDefault: false });
        }
        return updated;
      });
    } else {
      // Add new
      setAddresses(prev => {
        const newList = [...prev, address];
        if (address.isDefault) {
          return newList.map(a => a.id === address.id ? a : { ...a, isDefault: false });
        }
        return newList;
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      setAddresses(prev => prev.filter(a => a.id !== id));
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>My Addresses</h3>
        <button className={styles.editBtn} onClick={handleAddNew}>+ Add New</button>
      </div>

      <div className={styles.addressList}>
        {addresses.length === 0 ? (
          <div className={styles.noAddresses}>
            <span className={styles.emptyIcon}>📍</span>
            <p>You haven't saved any addresses yet.</p>
          </div>
        ) : (
          addresses.map(addr => (
            <div key={addr.id} className={styles.addressCard}>
              <div className={styles.addressDetails}>
                <p>
                  <strong>
                    {addr.label}
                    {addr.isDefault && <span className={styles.defaultBadge}>Default</span>}
                  </strong>
                </p>
                <p>{addr.fullName}</p>
                <p>{addr.line1}</p>
                {addr.line2 && <p>{addr.line2}</p>}
                <p>{addr.city}, {addr.postcode}</p>
                <p>{addr.phone}</p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  className={styles.editBtn} 
                  style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                  onClick={() => handleEdit(addr)}
                >
                  Edit
                </button>
                <button 
                  className={styles.cancelBtn} 
                  style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                  onClick={() => handleDelete(addr.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <AddressModal
          address={editingAddress}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

