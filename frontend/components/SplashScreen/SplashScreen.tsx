import React from 'react';
import { FourSquare } from 'react-loading-indicators';
import styles from './SplashScreen.module.css';

export default function SplashScreen() {
  return (
    <div className={styles.splashContainer}>
      <div className={styles.logoContainer}>
        <div className={styles.loaderWrapper}>
          <FourSquare color="#10b981" size="medium" text="" textColor="" />
        </div>
        <h1 className={styles.logo}>Cocospice</h1>
        <div className={styles.slogan}>A Premium Indian Cuisine</div>
      </div>
    </div>
  );
}
