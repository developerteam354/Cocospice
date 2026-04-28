import React from 'react';
import { FourSquare } from 'react-loading-indicators';
import styles from './SplashScreen.module.css';

export default function SplashScreen() {
  return (
    <div className={styles.splashContainer}>
      <div className={styles.logoContainer}>
        <div className={styles.foodLoader}>
          <div className={styles.clocheWrapper}>
            <div className={styles.clocheHandle}></div>
            <div className={styles.clocheDome}></div>
          </div>
          <div className={styles.plate}></div>
          <div className={styles.food}></div>
          <div className={`${styles.steam} ${styles.steam1}`}></div>
          <div className={`${styles.steam} ${styles.steam2}`}></div>
          <div className={`${styles.steam} ${styles.steam3}`}></div>
        </div>
        <h1 className={styles.logo}>Cocospice</h1>
        <div className={styles.slogan}>A Premium Indian Cuisine</div>
      </div>
    </div>
  );
}
