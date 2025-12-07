'use client';
import ProductForm from '../../../components/ProductForm';
import useAuth from '../../hooks/useAuth';

export default function AddProductPage() {
  const { user, role, loading } = useAuth();

  if (loading) return <div className="text-center py-10">Loading…</div>;
  if (!user || role !== 'seller')
    return <div className="text-center py-10 text-red-500">Not authorized</div>;

  return (
    <div className="flex justify-center px-4 py-10">
      <div
        className="
          w-full max-w-3xl 
          bg-white dark:bg-white 
          text-gray-900 dark:text-gray-900
          shadow-lg rounded-xl 
          p-8 border border-gray-200
        "
      >
        <h2 className="text-3xl font-bold mb-8">Add New Product</h2>
        <ProductForm sellerId={user.uid} />
      </div>
    </div>
  );
}
