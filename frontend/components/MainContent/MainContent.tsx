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
  onSelectItem?: (item: MenuItem) => void;
}

export default function MainContent({ categoryTitle, items, categories, onSelectCategory, onAddToCart, onSelectItem }: MainContentProps) {
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
                <span style={{ color: '#000000', fontSize: '1rem', fontWeight: 'bold' }}>{cat.name}</span>
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
      <h2 style={{ color: '#ffffff', fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '16px', paddingBottom: '8px', borderBottom: '3px solid #004d80', display: 'inline-block' }}>{categoryTitle}</h2>
      <div className={styles.productList}>
        {items.map((item, index) => (
          <div
            key={item.id}
            className={styles.productItem}
            style={{ animationDelay: `${index * 0.08}s`, cursor: onSelectItem ? 'pointer' : 'default' }}
            onClick={() => onSelectItem && onSelectItem(item)}
          >
            <Image
              src={item.image}
              alt={item.name}
              width={100}
              height={100}
              className={styles.productImage}
              priority={index < 4}
            />
            <div className={styles.productInfo}>
              <h3 style={{ color: '#000000', fontWeight: 'bold', margin: '0 0 4px 0', fontSize: '1.1rem' }}>{item.name}</h3>
              {item.description && <p style={{ color: '#000000', margin: '0 0 8px 0', fontSize: '0.85rem' }}>{item.description}</p>}
              <p style={{ color: '#000000', margin: '0', fontSize: '1.1rem', fontWeight: '800' }}>£{item.price.toFixed(2)}</p>
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
