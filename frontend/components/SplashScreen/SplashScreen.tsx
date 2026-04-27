import React from 'react';
import styles from './SplashScreen.module.css';

export default function SplashScreen() {
  return (
    <div className={styles.splashContainer}>
      <div className={styles.logoContainer}>
        <h1 className={styles.logo}>Cocospice</h1>
        <div className={styles.slogan}>A Premium Indian Cuisine</div>
        <div className={styles.loader}></div>
      </div>
    </div>
  );
}
