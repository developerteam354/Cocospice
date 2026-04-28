'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import AddressForm, { Address, EMPTY_ADDRESS } from '@/components/CheckoutPage/AddressForm';
import styles from '@/components/CheckoutPage/CheckoutPage.module.css';

export default function AddressPage() {
  const { user } = useAuth();
  const { orderType, shippingAddress, setShippingAddress } = useCart();
  const router = useRouter();
  
  const [address, setAddress] = useState<Address>(shippingAddress.fullName ? shippingAddress : { ...EMPTY_ADDRESS, fullName: user?.name || '' });
  const [addressErrors, setAddressErrors] = useState<Partial<Address>>({});

  const validateAddress = (): boolean => {
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

  const handleNext = () => {
    if (validateAddress()) {
      setShippingAddress(address);
      router.push('/checkout/payment');
    }
  };

  if (orderType !== 'delivery') {
    router.replace('/checkout/payment');
    return null;
  }

  return (
    <>
      <AddressForm
        address={address}
        errors={addressErrors}
        onChange={handleAddressChange}
      />
      
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
