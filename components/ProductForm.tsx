'use client';

import React, { useState } from 'react';
import { uploadProductImage, addProduct } from '../lib/firestoreProducts';

function formatRupiah(value: string) {
  if (!value) return "";
  const number = value.replace(/\D/g, "");
  return new Intl.NumberFormat("id-ID").format(Number(number));
}

export default function ProductForm({ sellerId, onAdded }: { sellerId: string; onAdded?: () => void }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState(""); 
  const [stock, setStock] = useState<number>(0);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    const formatted = formatRupiah(raw);
    setPrice(formatted);
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!sellerId) return alert("Seller ID missing. Please re-login.");

    const numericPrice = Number(price.replace(/\./g, ""));

    if (name.length < 5) return alert('Name must be at least 5 characters');
    if (numericPrice <= 0) return alert('Price must be > 0');
    if (stock <= 0) return alert('Stock must be > 0');
    if (!category) return alert('Category required');
    if (!description) return alert('Description required');

    setLoading(true);
    try {
      let imageUrl: string | undefined;

      if (file) {
        imageUrl = await uploadProductImage(sellerId, file);
      }

      await addProduct({
        sellerId,
        name,
        price: numericPrice,
        stock,
        category,
        description,
        imageUrl,
      } as any);

      alert('Product added');

      setName('');
      setPrice('');
      setStock(0);
      setCategory('');
      setDescription('');
      setFile(null);
      setPreviewUrl(null);

      onAdded?.();
    } catch (err: any) {
      console.error(err);
      alert('Failed to add product: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* NAME */}
      <div>
        <label className="block font-medium mb-1">Product Name</label>
        <input
          className="w-full bg-white dark:bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Product name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {/* PRICE */}
      <div>
        <label className="block font-medium mb-1">Price (Rp)</label>
        <input
          type="text"
          inputMode="numeric"
          className="w-full bg-white dark:bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="150.000"
          value={price}
          onChange={handlePriceChange}
        />
      </div>

      {/* STOCK */}
      <div>
        <label className="block font-medium mb-1">Stock</label>
        <input
          type="number"
          className="w-full bg-white dark:bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="0"
          value={stock}
          onChange={(e) => setStock(Number(e.target.value))}
        />
      </div>

      {/* CATEGORY */}
      <div>
        <label className="block font-medium mb-1">Category</label>
        <select
          className="w-full bg-white dark:bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">-- Select Category --</option>
          <option value="Electronics">Electronics</option>
          <option value="Beauty">Beauty</option>
          <option value="Fashion">Fashion</option>
          <option value="Home & Living">Home & Living</option>
          <option value="Groceries">Groceries</option>
          <option value="Books">Books</option>
          <option value="Sports">Sports</option>
        </select>
      </div>

      {/* DESCRIPTION */}
      <div>
        <label className="block font-medium mb-1">Description</label>
        <textarea
          className="w-full bg-white dark:bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-900 h-28 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describe your product..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* IMAGE UPLOAD */}
      <div>
        <label className="block font-medium mb-1">Product Image (optional)</label>

        <input
          type="file"
          accept="image/*"
          className="block w-full bg-white dark:bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-900 cursor-pointer"
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            setFile(f);
            if (f) {
              setPreviewUrl(URL.createObjectURL(f));
            } else {
              setPreviewUrl(null);
            }
          }}
        />

        {previewUrl && (
          <div className="mt-3">
            <img src={previewUrl} className="w-40 h-40 object-cover rounded-lg border shadow" />
          </div>
        )}
      </div>

      {/* SUBMIT */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-lg font-medium bg-orange-400 hover:bg-orange-500 text-white disabled:bg-gray-400 disabled:cursor-not-allowed transition"
      >
        {loading ? 'Adding...' : 'Add Product'}
      </button>
    </form>
  );
}
