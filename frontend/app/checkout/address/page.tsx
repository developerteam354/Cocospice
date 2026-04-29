'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import AddressForm, { Address, EMPTY_ADDRESS } from '@/components/CheckoutPage/AddressForm';
import styles from '@/components/CheckoutPage/CheckoutPage.module.css';
import { getSavedAddresses } from '@/services/userService';
import { SavedAddress } from '@/types';

export default function AddressPage() {
  const { user } = useAuth();
  const { orderType, shippingAddress, setShippingAddress } = useCart();
  const router = useRouter();
  
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | 'new'>(shippingAddress.id || 'new');
  const [address, setAddress] = useState<Address>(shippingAddress.fullName ? shippingAddress : { ...EMPTY_ADDRESS, fullName: user?.name || '' });
  const [addressErrors, setAddressErrors] = useState<Partial<Address>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const addresses = await getSavedAddresses();
        setSavedAddresses(addresses);
        
        // If we don't have a shipping address in cart yet, try to pre-select default
        if (!shippingAddress.fullName && addresses.length > 0) {
          const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
          setSelectedAddressId(defaultAddr.id);
          setAddress({
            ...defaultAddr,
            instructions: '',
            line2: defaultAddr.line2 || ''
          });
        }
      } catch (error) {
        console.error('Failed to fetch addresses', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAddresses();
  }, [shippingAddress.fullName]);

  const validateAddress = (): boolean => {
    // Only validate if 'new' is selected or if we somehow have no selection
    if (selectedAddressId !== 'new' && selectedAddressId !== '') return true;

    const errors: Partial<Address> = {};
    if (!address.fullName.trim())  errors.fullName  = 'Required';
    if (!address.line1.trim())     errors.line1     = 'Required';
    if (!address.city.trim())      errors.city      = 'Required';
    if (!address.postcode.trim())  errors.postcode  = 'Required';
    if (!address.phone.trim())     errors.phone     = 'Required';
    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddressChange = (field: keyof Address, value: string) => {
    setAddress(prev => ({ ...prev, [field]: value }));
    if (addressErrors[field]) setAddressErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSelectSaved = (addr: SavedAddress) => {
    setSelectedAddressId(addr.id);
    setAddress({
      ...addr,
      instructions: address.instructions || '',
      line2: addr.line2 || ''
    });
    setAddressErrors({});
  };

  const handleSelectNew = () => {
    setSelectedAddressId('new');
    setAddress({ ...EMPTY_ADDRESS, fullName: user?.name || '' });
    setAddressErrors({});
  };

  const handleNext = () => {
    if (validateAddress()) {
      setShippingAddress({
        ...address,
        id: selectedAddressId === 'new' ? undefined : selectedAddressId
      });
      router.push('/checkout/payment');
    }
  };

  if (orderType !== 'delivery') {
    router.replace('/checkout/payment');
    return null;
  }

  return (
    <>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Delivery Address</h2>

        {!isLoading && savedAddresses.length > 0 && (
          <div className={styles.addressSelection}>
            <p className={styles.label} style={{ marginBottom: '12px' }}>Choose a delivery location:</p>
            <div className={styles.addressGrid}>
              {savedAddresses.map(addr => (
                <div 
                  key={addr.id} 
                  className={`${styles.addressOption} ${selectedAddressId === addr.id ? styles.addressOptionActive : ''}`}
                  onClick={() => handleSelectSaved(addr)}
                >
                  <div className={styles.addressCheck}>
                    {selectedAddressId === addr.id && <span>✓</span>}
                  </div>
                  <div className={styles.addressInfo}>
                    <p className={styles.addressLabel}>
                      <strong>{addr.label}</strong>
                      {addr.isDefault && <span className={styles.defaultBadge}>Default</span>}
                    </p>
                    <p className={styles.addressTextSmall}>{addr.fullName}</p>
                    <p className={styles.addressTextSmall}>{addr.line1}, {addr.postcode}</p>
                  </div>
                </div>
              ))}
              <div 
                className={`${styles.addressOption} ${selectedAddressId === 'new' ? styles.addressOptionActive : ''}`}
                onClick={handleSelectNew}
              >
                <div className={styles.addressCheck}>
                  {selectedAddressId === 'new' && <span>✓</span>}
                </div>
                <div className={styles.addressInfo}>
                  <p className={styles.addressLabel}><strong>+ Add New Address</strong></p>
                  <p className={styles.addressTextSmall}>Use a different address</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {(selectedAddressId === 'new' || savedAddresses.length === 0) && !isLoading && (
          <div className={styles.newAddressForm} style={{ marginTop: savedAddresses.length > 0 ? '24px' : '0' }}>
            {savedAddresses.length > 0 && <h3 className={styles.subTitle}>New Address Details</h3>}
            <AddressForm
              address={address}
              errors={addressErrors}
              onChange={handleAddressChange}
            />
          </div>
        )}

        {selectedAddressId !== 'new' && selectedAddressId !== '' && !isLoading && (
          <div className={styles.fieldGroup} style={{ marginTop: '20px' }}>
            <label className={styles.label}>Delivery Instructions (optional)</label>
            <textarea
              className={`${styles.input} ${styles.textarea}`}
              placeholder="Leave at door, ring bell twice…"
              rows={3}
              value={address.instructions}
              onChange={e => handleAddressChange('instructions', e.target.value)}
            />
          </div>
        )}

        {isLoading && (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Loading your addresses...</p>
          </div>
        )}
      </div>
      
      <footer className={styles.footer}>
        <button className={styles.ctaBtn} onClick={handleNext}>
          Continue to Payment
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </footer>
    </>
  );
}
