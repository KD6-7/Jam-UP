"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  fetchCart,
  mergeCartApi,
  setCartItemApi,
  type CartEntry,
  type Product,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";

const LOCAL_KEY = "jamup_cart";
const MAX_QTY = 99;

function readLocal(): CartEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocal(items: CartEntry[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
}

function upsert(items: CartEntry[], product: Product, quantity: number): CartEntry[] {
  if (quantity <= 0) return items.filter((e) => e.product.id !== product.id);
  const existing = items.find((e) => e.product.id === product.id);
  if (existing) {
    return items.map((e) =>
      e.product.id === product.id ? { ...e, quantity } : e
    );
  }
  return [...items, { product, quantity }];
}

interface CartState {
  items: CartEntry[];
  count: number;
  subtotalPaise: number;
  ready: boolean;
  syncError: string | null;
  add: (product: Product) => void;
  setQuantity: (product: Product, quantity: number) => void;
}

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { token, ready: authReady } = useAuth();
  const [items, setItems] = useState<CartEntry[]>([]);
  const [ready, setReady] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Load cart when auth state settles: guests read localStorage; signed-in
  // users load the server cart, merging any local guest cart in first.
  useEffect(() => {
    if (!authReady) return;
    let cancelled = false;

    async function load() {
      if (!token) {
        setItems(readLocal());
        setReady(true);
        return;
      }
      try {
        const local = readLocal();
        const cart =
          local.length > 0
            ? await mergeCartApi(
                token,
                local.map((e) => ({ product_id: e.product.id, quantity: e.quantity }))
              )
            : await fetchCart(token);
        if (cancelled) return;
        if (local.length > 0) localStorage.removeItem(LOCAL_KEY);
        setItems(cart.items);
        setSyncError(null);
      } catch {
        if (!cancelled) setSyncError("Couldn't load your saved cart.");
      }
      if (!cancelled) setReady(true);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [token, authReady]);

  const setQuantity = useCallback(
    (product: Product, quantity: number) => {
      const qty = Math.max(0, Math.min(MAX_QTY, Math.round(quantity)));
      // Optimistic local update either way; server response reconciles.
      setItems((prev) => {
        const next = upsert(prev, product, qty);
        if (!token) writeLocal(next);
        return next;
      });
      if (token) {
        setCartItemApi(token, product.id, qty)
          .then((cart) => {
            setItems(cart.items);
            setSyncError(null);
          })
          .catch(() => setSyncError("Couldn't sync your cart — retrying on next change."));
      }
    },
    [token]
  );

  const add = useCallback(
    (product: Product) => {
      const current = items.find((e) => e.product.id === product.id)?.quantity ?? 0;
      setQuantity(product, current + 1);
    },
    [items, setQuantity]
  );

  const count = items.reduce((sum, e) => sum + e.quantity, 0);
  const subtotalPaise = items.reduce(
    (sum, e) => sum + e.product.price_paise * e.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{ items, count, subtotalPaise, ready, syncError, add, setQuantity }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
