import React from 'react';
import Image from 'next/image';
import { MenuItem, Category } from '../../types';
import styles from './MainContent.module.css';

interface MainContentProps {
  categoryTitle: string;
  items: MenuItem[];
  categories?: Category[];
  onSelectCategory?: (id: string) => void;
  onAddToCart: (item: MenuItem) => void;
}

export default function MainContent({ categoryTitle, items, categories, onSelectCategory, onAddToCart }: MainContentProps) {
  // Category Grid View
  if (categories && onSelectCategory) {
    return (
      <div className={styles.mainContent}>
        <div className={styles.categoryGrid}>
          {categories.map((cat, index) => {
            const catImage = items.find(i => i.categoryId === cat.id)?.image || '/images/default.png';
            return (
              <div 
                key={cat.id} 
                className={styles.categoryItem} 
                onClick={() => onSelectCategory(cat.id)} 
              >
                <Image src={catImage} alt={cat.name} width={100} height={100} className={styles.categoryItemImage} priority={index < 4} />
                <span className={styles.categoryItemName}>{cat.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Product List View
  return (
    <div className={styles.mainContent}>
      <h2 className={styles.categoryTitle}>{categoryTitle}</h2>
      <div className={styles.productList}>
        {items.map((item, index) => (
          <div key={item.id} className={styles.productItem}>
            <Image 
              src={item.image} 
              alt={item.name} 
              width={100} 
              height={100} 
              className={styles.productImage} 
              priority={index < 4}
            />
            <div className={styles.productInfo}>
              <h3 className={styles.productName}>{item.name}</h3>
              {item.description && <p className={styles.productDesc}>{item.description}</p>}
              <p className={styles.productPrice}>£{item.price.toFixed(2)}</p>
            </div>
            <button className={styles.addBtn} onClick={(e) => { e.stopPropagation(); onAddToCart(item); }} title="Add to Cart">
              +
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
