'use client';
import React from 'react';
import useProducts from '../../hooks/useProducts';
import ProductCard from '../../../components/ProductCard';
import { random10 } from '../../utils/randomSlice';

export default function CustomerDashboard() {
  const { products, loading } = useProducts();
  const recommended = random10(products || []);

  if (loading) {
    return (
      <p className="text-center py-10 text-gray-600">Loading...</p>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">

      {/* Recommended Section */}
      <h2 className="text-2xl font-bold mb-4">Recommended for You</h2>

      {recommended.length === 0 ? (
        <p className="text-gray-500">No recommendations yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mb-10">
          {recommended.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {/* All products */}
      <h2 className="text-2xl font-bold mb-4">All Products</h2>

      {products.length === 0 ? (
        <p className="text-gray-500">No products available.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mb-10">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

    </div>
  );
}
