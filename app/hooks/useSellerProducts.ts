// hooks/useSellerProducts.ts
'use client';
import { useEffect, useState, useCallback } from 'react';
import type { Product } from '../hooks/useProducts';
import { fetchSellerProducts, deleteProductsBulk } from '../../lib/firestoreProducts';

export default function useSellerProducts(sellerId?: string, pageSize = 10) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastCreatedAt, setLastCreatedAt] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // filters
  const [category, setCategory] = useState<string | null>(null);
  const [search, setSearch] = useState<string | null>(null);

  const load = useCallback(
    async (reset = false) => {
      if (!sellerId) return;
      setLoading(true);
      setError(null);
      try {
        const startCursor = reset ? null : lastCreatedAt;
        const res = await fetchSellerProducts({
          sellerId,
          pageSize,
          startAfterCreatedAt: startCursor ?? undefined,
          category: category ?? undefined,
          search: search ?? undefined,
        });
        if (reset) {
          setProducts(res.products);
        } else {
          setProducts((prev) => [...prev, ...res.products]);
        }
        setLastCreatedAt(res.lastCreatedAt);
        setHasMore(res.products.length >= pageSize);
      } catch (err) {
        console.error(err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    },
    [sellerId, lastCreatedAt, category, search, pageSize]
  );

  // refresh (reset pagination)
  const refresh = useCallback(async () => {
    setLastCreatedAt(null);
    setHasMore(true);
    await load(true);
  }, [load]);

  // load more page
  const loadMore = useCallback(async () => {
    if (!hasMore) return;
    await load(false);
  }, [hasMore, load]);

  // set filters that trigger refresh
  const setFilterCategory = useCallback(
    (c: string | null) => {
      setCategory(c);
      // reset page
      setLastCreatedAt(null);
      setHasMore(true);
    },
    [setCategory]
  );

  const setFilterSearch = useCallback(
    (s: string | null) => {
      setSearch(s);
      setLastCreatedAt(null);
      setHasMore(true);
    },
    [setSearch]
  );

  // bulk delete wrapper
  const bulkDelete = useCallback(
    async (ids: string[]) => {
      setLoading(true);
      try {
        await deleteProductsBulk(ids);
        // remove locally
        setProducts((prev) => prev.filter((p) => !ids.includes(p.id)));
      } catch (err) {
        console.error(err);
        setError('Failed to delete products');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    // initial load
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellerId, category, search]);

  return {
    products,
    loading,
    error,
    refresh,
    loadMore,
    hasMore,
    setFilterCategory,
    setFilterSearch,
    bulkDelete,
    setCategory,
    setSearch,
  };
}
