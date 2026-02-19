"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { CartItem, CartItemModifier } from "@/types/database";

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  total: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "beanie-cart";

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function itemPrice(item: CartItem) {
  const modifierTotal = item.modifiers.reduce(
    (sum, m) => sum + m.price_adjustment,
    0
  );
  return (item.base_price + modifierTotal) * item.quantity;
}

function modifiersMatch(a: CartItemModifier[], b: CartItemModifier[]) {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort((x, y) => x.option_id.localeCompare(y.option_id));
  const sortedB = [...b].sort((x, y) => x.option_id.localeCompare(y.option_id));
  return sortedA.every((m, i) => m.option_id === sortedB[i].option_id);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {}
    setHydrated(true);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, hydrated]);

  const addItem = useCallback((newItem: Omit<CartItem, "id">) => {
    setItems((prev) => {
      // Check if the same product with the same modifiers already exists
      const existing = prev.find(
        (i) =>
          i.product_id === newItem.product_id &&
          modifiersMatch(i.modifiers, newItem.modifiers)
      );
      if (existing) {
        return prev.map((i) =>
          i.id === existing.id
            ? { ...i, quantity: i.quantity + newItem.quantity }
            : i
        );
      }
      return [...prev, { ...newItem, id: generateId() }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => sum + itemPrice(i), 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, itemCount, total }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
