import React from 'react';
import { Category } from '../../types';
import styles from './MenuSidebar.module.css';

interface MenuSidebarProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
}

export default function MenuSidebar({ categories, selectedCategoryId, onSelectCategory }: MenuSidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <h2 className={styles.title}>Menu</h2>
      <ul className={styles.categoryList}>
        {categories.map((category) => (
          <li key={category.id} className={styles.categoryItem}>
            <button
              className={`${styles.categoryBtn} ${selectedCategoryId === category.id ? styles.active : ''}`}
              onClick={() => onSelectCategory(category.id)}
            >
              {category.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
