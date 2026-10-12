"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CartSnapshot = {
  variantId: string;
  productId: string;
  productTitle: string;
  productSlug: string;
  variantTitle: string;
  price: number;
  image?: string;
};

export type CartLine = CartSnapshot & { quantity: number };

type CartContextValue = {
  lines: CartLine[];
  count: number;
  estimate: number;
  add: (item: CartSnapshot, quantity?: number) => void;
  remove: (variantId: string) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "tayeb-cart-v1";

function load(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    return Array.isArray(parsed)
      ? parsed.filter((l) => l?.variantId && l.quantity >= 1 && l.quantity <= 99)
      : [];
  } catch {
    return [];
  }
}

/** السلة في المتصفح فقط — السيرفر يعيد حساب كل حاجة عند الطلب. */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLines(load());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
      } catch {
        /* التخزين ممتلئ — السلة تبقى في الذاكرة */
      }
    }
  }, [lines, ready]);

  const add = useCallback((item: CartSnapshot, quantity = 1) => {
    setLines((prev) => {
      const found = prev.find((l) => l.variantId === item.variantId);
      if (found) {
        return prev.map((l) =>
          l.variantId === item.variantId
            ? { ...l, quantity: Math.min(99, l.quantity + quantity) }
            : l
        );
      }
      return [...prev, { ...item, quantity: Math.min(99, Math.max(1, quantity)) }];
    });
  }, []);

  const remove = useCallback((variantId: string) => {
    setLines((prev) => prev.filter((l) => l.variantId !== variantId));
  }, []);

  const setQuantity = useCallback((variantId: string, quantity: number) => {
    setLines((prev) =>
      quantity < 1
        ? prev.filter((l) => l.variantId !== variantId)
        : prev.map((l) =>
            l.variantId === variantId ? { ...l, quantity: Math.min(99, quantity) } : l
          )
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((s, l) => s + l.quantity, 0);
    const estimate = lines.reduce((s, l) => s + l.price * l.quantity, 0);
    return { lines, count, estimate, add, remove, setQuantity, clear };
  }, [lines, add, remove, setQuantity, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart يُستخدم داخل CartProvider فقط");
  return ctx;
}
