'use client';

import React, { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import { fetchUserOrders } from '../../../lib/firestoreCart';
import { groupOrders } from '../../utils/groupOrders';

export default function OrdersPage() {
  const { user, role, loading: authLoading } = useAuth();
  const userId = user?.uid;
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      setLoading(true);
      const result = await fetchUserOrders(userId);
      setOrders(result);
      setLoading(false);
    })();
  }, [userId]);

  if (authLoading) return <div className="p-6">Loading...</div>;
  if (!user || role !== 'customer') return <div className="p-6">Not authorized</div>;

  const grouped = groupOrders(
    orders.map((o) => ({
      orderId: o.id,
      products: o.items,
      createdAt: o.createdAt,
    }))
  );

  const groupedList = Object.values(grouped);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Order History</h2>

      {loading && (
        <p className="text-center py-10 text-gray-600">Loading...</p>
      )}

      {!loading && groupedList.length === 0 && (
        <p className="text-gray-500 text-center py-10">You haven’t placed any orders yet.</p>
      )}

      {groupedList.map((order: any) => {
        const orderTotal = order.products.reduce(
          (sum: number, p: any) => sum + (p.price || 0) * p.quantity,
          0
        );

        return (
          <div
            key={order.orderId}
            className="bg-white shadow-xl rounded-xl shadow p-5 mb-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">Order #{order.orderId}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt ?? '').toLocaleString()}
                </p>
              </div>

              <span className="px-3 py-1 text-sm rounded-full bg-orange-100 text-orange-500">
                Completed
              </span>
            </div>

            <div className="divide-y">
              {order.products.map((p: any, idx: number) => (
                <div
                  key={idx}
                  className="py-3 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={p.imageUrl || '/default-product.png'}
                      className="w-14 h-14 rounded object-cover border"
                      alt={p.name}
                    />
                    <div>
                      <div className="font-medium">{p.name ?? p.productId}</div>
                      <div className="text-gray-500 text-sm">
                        Rp {(p.price || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="text-gray-700 font-medium">
                    Qty: {p.quantity}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 mt-4 border-t flex justify-between items-center">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-xl font-bold text-orange-500">
                Rp {orderTotal.toLocaleString()}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
