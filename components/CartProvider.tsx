"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type CartItem = {
  variantId: string;
  slug: string;
  name: string;
  price: number;
  size: string | null;
  color: string | null;
  stock: number;
  quantity: number;
};

type CartContext = {
  items: CartItem[];
  ready: boolean;
  count: number;
  subtotal: number;
  add: (item: Omit<CartItem, "quantity">) => void;
  remove: (variantId: string) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  clear: () => void;
};

const KEY = "mira-cart-v1";
const Ctx = createContext<CartContext | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items, ready]);

  const add: CartContext["add"] = (item) =>
    setItems((prev) => {
      const found = prev.find((i) => i.variantId === item.variantId);
      if (!found) return [...prev, { ...item, quantity: 1 }];
      return prev.map((i) =>
        i.variantId === item.variantId ? { ...i, quantity: Math.min(i.quantity + 1, i.stock) } : i
      );
    });

  const remove: CartContext["remove"] = (variantId) =>
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));

  const setQuantity: CartContext["setQuantity"] = (variantId, quantity) =>
    setItems((prev) =>
      quantity < 1
        ? prev.filter((i) => i.variantId !== variantId)
        : prev.map((i) =>
            i.variantId === variantId ? { ...i, quantity: Math.min(quantity, i.stock) } : i
          )
    );

  const clear = () => setItems([]);

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <Ctx.Provider value={{ items, ready, count, subtotal, add, remove, setQuantity, clear }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart doit être utilisé dans un CartProvider");
  return ctx;
}
