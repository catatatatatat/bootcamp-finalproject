'use client';
import React, { useMemo, useState } from 'react';
import useSellerProducts from '../../hooks/useSellerProducts';
import useAuth from '../../hooks/useAuth';
import ProductCard from '../../../components/ProductCard';
import ConfirmModal from '../../../components/ConfirmModal';

export default function SellerProductsPageClient() {
  const { user, role, loading: authLoading } = useAuth();
  const sellerId = user?.uid;

  const {
    products,
    loading,
    hasMore,
    loadMore,
    setFilterCategory,
    setFilterSearch,
    bulkDelete,
    refresh,
  } = useSellerProducts(sellerId);

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilterLocal] = useState<string>('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.category));
    return Array.from(set);
  }, [products]);

  if (authLoading) return <div>Loading...</div>;
  if (!user || role !== 'seller') return <div className="text-red-500">Not authorized</div>;

  function toggleSelect(id: string) {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  }

  function selectAll() {
    const all = products.reduce(
      (acc, p) => ({ ...acc, [p.id]: true }),
      {} as Record<string, boolean>
    );
    setSelected(all);
  }

  function clearSelection() {
    setSelected({});
  }

  function onSearch() {
    setFilterSearch(searchText || null);
  }

  function onCategoryChange() {
    setFilterCategory(categoryFilter || null);
  }

  async function onDeleteConfirm() {
    const ids = Object.entries(selected)
      .filter(([, v]) => v)
      .map(([k]) => k);

    await bulkDelete(ids);
    setConfirmOpen(false);
    clearSelection();
    await refresh();
  }

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold mb-6">My Products</h2>

      {/* Controls — Borderless UI */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-white shadow-md rounded-xl mb-6">

        <input
          placeholder="Search products..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="px-4 py-2 rounded-xl bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-300 outline-none w-64"
        />

        <button
          onClick={onSearch}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Search
        </button>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilterLocal(e.target.value)}
          className="px-4 py-2 rounded-xl bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-300 outline-none w-48"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <button
          onClick={onCategoryChange}
          className="px-4 py-2 rounded-xl bg-gray-700 text-white hover:bg-gray-800 transition"
        >
          Filter
        </button>

        <button
          onClick={selectAll}
          className="px-4 py-2 rounded-xl bg-yellow-500 text-white hover:bg-yellow-600 transition"
        >
          Select All
        </button>

        <button
          onClick={clearSelection}
          className="px-4 py-2 rounded-xl bg-gray-400 text-white hover:bg-gray-500 transition"
        >
          Clear
        </button>

        <button
          onClick={() => setConfirmOpen(true)}
          disabled={Object.values(selected).every((v) => !v)}
          className={`px-4 py-2 rounded-xl transition ${
            Object.values(selected).every((v) => !v)
              ? 'bg-red-300 cursor-not-allowed text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          Delete Selected
        </button>
      </div>

      {/* Product Grid */}
      {products.length === 0 ? (
        <div className="w-full py-20 flex flex-col items-center text-gray-500">
          <p className="text-xl font-medium">No products found</p>
          <p className="text-sm">Try adding a new product or adjusting filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className="relative bg-white p-3 rounded-xl shadow hover:shadow-lg transition"
            >
              <label className="absolute top-3 left-3 bg-white px-2 py-1 rounded-md shadow">
                <input
                  type="checkbox"
                  checked={!!selected[p.id]}
                  onChange={() => toggleSelect(p.id)}
                />
              </label>

              <ProductCard product={p} />
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 flex justify-center">
        {hasMore && (
          <button
            onClick={() => loadMore()}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300"
          >
            {loading ? 'Loading…' : 'Load more'}
          </button>
        )}
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Delete selected products?"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={onDeleteConfirm}
      >
        <p className="text-sm text-gray-700">
          Are you sure you want to permanently delete the selected products?
        </p>
      </ConfirmModal>
    </div>
  );
}
