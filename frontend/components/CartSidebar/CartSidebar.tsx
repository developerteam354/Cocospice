import React, { useState } from 'react';
import { CartItem } from '../../types';
import styles from './CartSidebar.module.css';

interface CartSidebarProps {
  cart: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onClearCart: () => void;
  onClose: () => void;
}

export default function CartSidebar({ cart, onUpdateQuantity, onClearCart, onClose }: CartSidebarProps) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Dragging state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only drag on header
    if ((e.target as HTMLElement).tagName === 'BUTTON') return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div 
      className={styles.popup}
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
    >
      <div 
        className={styles.header}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
      >
        <h2 className={styles.title}>Your Cart</h2>
        <div className={styles.headerActions}>
          {cart.length > 0 && (
            <button className={styles.clearBtn} onClick={onClearCart} title="Clear Cart">
              Clear
            </button>
          )}
          <button className={styles.closeBtn} onClick={onClose} title="Close Cart">&times;</button>
        </div>
      </div>
      
      <div className={styles.cartItems}>
        {cart.length === 0 ? (
          <div className={styles.empty}>Your cart is empty</div>
        ) : (
          cart.map((item) => (
            <div key={item.id} className={styles.cartItem}>
              <div className={styles.itemInfo}>
                <span className={styles.itemName}>{item.name}</span>
                <span className={styles.itemPrice}>£{(item.price * item.quantity).toFixed(2)}</span>
              </div>
              <div className={styles.quantityControls}>
                <button className={styles.qtyBtn} onClick={() => onUpdateQuantity(item.id, -1)}>-</button>
                <span className={styles.quantity}>{item.quantity}</span>
                <button className={styles.qtyBtn} onClick={() => onUpdateQuantity(item.id, 1)}>+</button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className={styles.summary}>
        <div className={styles.summaryRow}>
          <span>Subtotal</span>
          <span>£{subtotal.toFixed(2)}</span>
        </div>
        <div className={styles.totalRow}>
          <span>Total</span>
          <span>£{subtotal.toFixed(2)}</span>
        </div>
        <button className={styles.checkoutBtn} disabled={cart.length === 0}>
          Checkout
        </button>
      </div>
    </div>
  );
}
