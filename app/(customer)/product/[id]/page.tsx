'use client';

import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import useCart from '../../../hooks/useCart';
import useAuth from '../../../hooks/useAuth';

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  description?: string;
  imageUrl?: string;
  sellerId?: string;
};

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState<number>(1);

  const { user } = useAuth();
  const userId = user?.uid;
  const { addToCart } = useCart(userId);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const snap = await getDoc(doc(db, 'products', id));
      if (snap.exists()) {
        setProduct({ id: snap.id, ...(snap.data() as any) });
      }

      setLoading(false);
    }

    if (id) load();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!product) return <div className="p-6 text-red-500">Product not found.</div>;

  const p = product;

  async function onAdd() {
    if (qty <= 0) return alert('Quantity must be greater than zero.');
    if (qty > p.stock) return alert('Insufficient stock');

    try {
      await addToCart(p as any, qty);
      alert('Added to cart');
    } catch (err: any) {
      console.error(err);
      alert('Failed to add to cart: ' + (err?.message ?? String(err)));
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="flex justify-center">
        <img
          src={p.imageUrl || '/default-image.png'}
          alt={p.name}
          className="rounded-xl w-full max-w-sm shadow"
        />
      </div>

      <div>
        <h1 className="text-2xl font-bold mb-2">{p.name}</h1>
        <p className="text-xl text-green-600 font-semibold mb-1">
          Rp {p.price.toLocaleString()}
        </p>
        <p className="text-gray-600 mb-4">Stock: {p.stock}</p>
        <p className="text-gray-700 leading-relaxed mb-6">
          {p.description || 'No description.'}
        </p>

        <div className="flex items-center gap-3 mb-5">
          <span className="font-medium">Qty:</span>
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            className="w-20 px-2 py-1 border rounded-md"
          />
        </div>

        <button
          onClick={onAdd}
          className="bg-orange-400 text-white px-5 py-2 rounded-md hover:bg-orange-500 transition"
        >
          Add to Cart
        </button>

        <div className="mt-6">
          <a href="/dashboard" className="text-orange-500 hover:underline">
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
