'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  description: string;
  sellerId: string;
  imageUrl?: string;
  createdAt?: string;
}

export default function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      try {
        const snaps = await getDocs(collection(db, 'products'));
        const arr = snaps.docs.map(d => {
          const raw = d.data() as any;

          // Remove any id field coming from Firestore
          const { id: _unused, ...data } = raw;

          const createdAt =
            data.createdAt instanceof Timestamp
              ? data.createdAt.toDate().toISOString()
              : data.createdAt;

          return {
            id: d.id,
            ...data,
            createdAt,
          } as Product;
        });

        setProducts(arr);
      } catch (e) {
        console.error(e);
        setError('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { products, loading, error };
}
