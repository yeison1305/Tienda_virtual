import { useState, useCallback } from 'react';
import { ApiProduct } from '../services/api';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  size?: string;
  color?: string;
  quantity: number;
}

const STORAGE_KEY = 'void_cart';

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  const addItem = useCallback(
    (product: ApiProduct, opts?: { size?: string; color?: string }) => {
      setItems((prev) => {
        const key = `${product.id}-${opts?.size ?? ''}-${opts?.color ?? ''}`;
        const existing = prev.find(
          (i) => `${i.productId}-${i.size ?? ''}-${i.color ?? ''}` === key,
        );
        let next: CartItem[];
        if (existing) {
          next = prev.map((i) =>
            i === existing ? { ...i, quantity: i.quantity + 1 } : i,
          );
        } else {
          next = [
            ...prev,
            {
              productId: product.id,
              name: product.name,
              price: product.price,
              image: product.images[0] ?? '',
              size: opts?.size,
              color: opts?.color,
              quantity: 1,
            },
          ];
        }
        saveCart(next);
        return next;
      });
    },
    [],
  );

  const removeItem = useCallback((index: number) => {
    setItems((prev) => {
      const next = prev.filter((_, i) => i !== index);
      saveCart(next);
      return next;
    });
  }, []);

  const updateQuantity = useCallback((index: number, quantity: number) => {
    if (quantity < 1) return;
    setItems((prev) => {
      const next = prev.map((i, idx) => (idx === index ? { ...i, quantity } : i));
      saveCart(next);
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    saveCart([]);
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return { items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice };
}
