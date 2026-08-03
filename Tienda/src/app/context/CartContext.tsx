import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ApiProduct } from '../services/api';

export interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  price: number;
  image: string;
  size?: string;
  color?: string;
  quantity: number;
}

interface CartCtx {
  items: CartItem[];
  addItem: (product: ApiProduct, opts?: { size?: string; color?: string; quantity?: number }) => void;
  removeItem: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
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

const CartContext = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  const addItem = useCallback(
    (product: ApiProduct, opts?: { size?: string; color?: string; quantity?: number }) => {
      setItems((prev) => {
        const key = `${product.id}-${opts?.size ?? ''}-${opts?.color ?? ''}`;
        const existing = prev.find(
          (i) => `${i.productId}-${i.size ?? ''}-${i.color ?? ''}` === key,
        );
        let next: CartItem[];
        const qty = opts?.quantity ?? 1;
        if (existing) {
          next = prev.map((i) =>
            i === existing ? { ...i, quantity: i.quantity + qty } : i,
          );
        } else {
          // Find the correct variant based on selected size/color
          const variant = product.variants.find(
            (v) =>
              (!opts?.size || v.size === opts.size) &&
              (!opts?.color || v.color === opts.color) &&
              v.stock > 0,
          ) || product.variants[0];

          next = [
            ...prev,
            {
              productId: product.id,
              variantId: variant?.id ?? product.id,
              name: product.name,
              price: product.price,
              image: product.images[0] ?? '',
              size: opts?.size ?? variant?.size,
              color: opts?.color ?? variant?.color,
              quantity: qty,
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

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
