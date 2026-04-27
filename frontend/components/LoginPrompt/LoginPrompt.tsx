'use client';

import React from 'react';
import styles from './LoginPrompt.module.css';

interface LoginPromptProps {
  onSignIn: () => void;
  onSignUp: () => void;
  onClose: () => void;
}

export default function LoginPrompt({ onSignIn, onSignUp, onClose }: LoginPromptProps) {
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.prompt}>
        {/* Illustration */}
        <div className={styles.illustration}>
          <div className={styles.lockCircle}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="6" y="14" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="2.5" />
              <path d="M10 14V10a6 6 0 0112 0v4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="16" cy="21" r="2" fill="currentColor" />
              <path d="M16 23v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Message */}
        <h3 className={styles.title}>Login Required</h3>
        <p className={styles.message}>
          Please sign in to your account to proceed with checkout and complete your order.
        </p>

        {/* Actions */}
        <div className={styles.actions}>
          <button className={styles.signInBtn} onClick={onSignIn}>
            Sign In
          </button>
          <button className={styles.signUpBtn} onClick={onSignUp}>
            Create Account
          </button>
        </div>

        {/* Dismiss */}
        <button className={styles.dismissBtn} onClick={onClose}>
          Continue Browsing
        </button>
      </div>
    </div>
  );
}
