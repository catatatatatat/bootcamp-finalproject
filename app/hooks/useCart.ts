'use client';
import { useEffect, useState, useCallback } from 'react';
import type { Product } from './useProducts';
import { getCart, setCart, clearCart } from '../../lib/firestoreCart';
import type { CartItem } from '../../lib/firestoreCart';

export default function useCart(userId?: string) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(!!userId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setItems([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const serverItems = await getCart(userId);
        if (!cancelled) setItems(serverItems);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError('Failed to load cart');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  const save = useCallback(async (nextItems: CartItem[]) => {
    if (!userId) {
      setItems(nextItems);
      return;
    }
    setItems(nextItems);
    try {
      await setCart(userId, nextItems);
    } catch (err) {
      console.error(err);
      setError('Failed to persist cart');
    }
  }, [userId]);

  const addToCart = useCallback(async (product: Product, qty: number) => {
    if (qty <= 0) throw new Error('Quantity must be > 0');
    const found = items.find((i) => i.productId === product.id);
    let next: CartItem[];
    if (found) {
      next = items.map((i) => (i.productId === product.id ? { ...i, quantity: i.quantity + qty } : i));
    } else {
      next = [
        ...items,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          quantity: qty,
        },
      ];
    }
    await save(next);
  }, [items, save]);

  const updateQuantity = useCallback(async (productId: string, qty: number) => {
    let next = items.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i)).filter((i) => i.quantity > 0);
    await save(next);
  }, [items, save]);

  const remove = useCallback(async (productId: string) => {
    const next = items.filter((i) => i.productId !== productId);
    await save(next);
  }, [items, save]);

  const clear = useCallback(async () => {
    setItems([]);
    if (userId) await clearCart(userId);
  }, [userId]);

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return { items, loading, error, addToCart, updateQuantity, remove, clear, total, setItems, save };
}
