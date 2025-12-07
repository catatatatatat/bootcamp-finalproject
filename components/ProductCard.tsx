'use client';

import Image from 'next/image';
import Link from 'next/link';
import useAuth from '../app/hooks/useAuth';
import type { Product } from '../app/hooks/useProducts';

export default function ProductCard({ product }: { product: Product }) {
  const { user } = useAuth();
  const isSeller = user?.uid === product.sellerId;

  return (
    <div
      className="
        group flex flex-col bg-white 
        rounded-2xl shadow-sm border border-gray-200
        hover:shadow-xl hover:-translate-y-1 
        transition-all duration-300 
        overflow-hidden
      "
    >
      {/* IMAGE */}
      <div className="relative w-full h-52 bg-gray-100 overflow-hidden">
        <Image
          src={product.imageUrl || '/default-image.png'}
          alt={product.name}
          fill
          className="
            object-cover transition-transform duration-500
            group-hover:scale-110
          "
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-70"></div>

        {product.stock !== undefined && (
          <span
            className="
              absolute top-3 left-3 
              bg-white/90 text-gray-800
              text-xs px-3 py-1 rounded-full shadow 
              font-medium backdrop-blur-sm
            "
          >
            Stock: {product.stock}
          </span>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
          {product.name}
        </h3>

        <p className="text-orange-500 text-xl font-bold mt-1">
          Rp {product.price.toLocaleString('id-ID')}
        </p>

        <p className="text-sm text-gray-500 line-clamp-2 mt-2">
          {product.description || 'No description'}
        </p>

        {/* If seller, disable view — else show link */}
        {!isSeller ? (
          <Link
            href={`/product/${product.id}`}
            className="
              mt-auto w-full text-center 
              bg-orange-500 hover:bg-orange-600 
              text-white py-2 rounded-xl 
              font-medium text-sm transition shadow 
              hover:shadow-md
            "
          >
            View Product
          </Link>
        ) : (
          <button
            disabled
            className="
              mt-auto w-full text-center 
              bg-gray-300 text-gray-500
              py-2 rounded-xl font-medium text-sm cursor-not-allowed
            "
          >
            Seller Cannot View Details
          </button>
        )}
      </div>
    </div>
  );
}
