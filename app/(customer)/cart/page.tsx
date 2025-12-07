'use client';
import React, { useMemo, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import useCart from '../../hooks/useCart';
import { createOrderTransaction } from '../../../lib/firestoreCart';

export default function CartPage() {
  const { user, role, loading: authLoading } = useAuth();
  const userId = user?.uid;

  const { items, loading, updateQuantity, remove, clear, total } = useCart(userId);
  const [processing, setProcessing] = useState(false);

  const ineligible = useMemo(
    () => items.filter((i) => i.quantity > ((i as any).stock ?? Infinity)),
    [items]
  );

  if (authLoading) return <div>Loading...</div>;
  if (!user || role !== 'customer') return <div>Not authorized</div>;

  async function onPurchase() {
    if (!items.length) return alert('Cart is empty');
    if (items.some((i) => i.quantity <= 0)) return alert('Invalid quantities');

    setProcessing(true);
    try {
      const orderId = await createOrderTransaction(userId!, items as any);
      alert('Purchase successful. Order id: ' + orderId);
    } catch (err: any) {
      alert('Purchase failed: ' + (err?.message ?? String(err)));
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Your Cart</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          {items.length === 0 && <p>Your cart is empty.</p>}

          {items.map((i) => (
            <div
              key={i.productId}
              className={`
                flex gap-4 p-4 mb-4 
                rounded-2xl shadow-xl bg-white 
                ${i.quantity > (i as any).stock ? 'ring-2 ring-red-400' : ''}
              `}
            >
              <img
                src={i.imageUrl || '/default-product.png'}
                alt={i.name}
                className="w-24 h-24 rounded-xl object-cover shadow"
              />

              <div className="flex-1 flex flex-col">
                <div className="font-semibold text-lg text-gray-900">{i.name}</div>

                <div className="text-gray-700 mt-1">
                  Rp {i.price.toLocaleString()}
                </div>

                <div className="flex items-center gap-3 mt-3">
                  <button
                    className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200"
                    onClick={() => updateQuantity(i.productId, Math.max(1, i.quantity - 1))}
                  >
                    –
                  </button>

                  <input
                    className="w-14 rounded-lg bg-gray-100 px-2 py-1 text-center outline-none"
                    value={i.quantity}
                    onChange={(e) => updateQuantity(i.productId, Number(e.target.value))}
                  />

                  <button
                    className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200"
                    onClick={() => updateQuantity(i.productId, i.quantity + 1)}
                  >
                    +
                  </button>
                </div>

                <div className="text-gray-500 text-sm mt-2">
                  Line Total: <span className="font-medium">Rp {(i.price * i.quantity).toLocaleString()}</span>
                </div>

                {i.quantity > (i as any).stock && (
                  <div className="text-red-600 text-sm font-medium mt-1">
                    Insufficient stock available
                  </div>
                )}

                <button
                  className="text-red-500 text-sm mt-3 hover:underline self-start"
                  onClick={() => remove(i.productId)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          {/* TOTAL SUMMARY */}
          <div className="mt-8 p-6 rounded-2xl shadow-xl bg-white">
            <div className="text-xl font-semibold mb-4">
              Total: Rp {total.toLocaleString()}
            </div>

            <button
              onClick={onPurchase}
              disabled={processing || items.length === 0 || ineligible.length > 0}
              className="
                w-full py-3 rounded-xl 
                bg-orange-500 hover:bg-orange-600 
                text-white font-medium transition 
                disabled:bg-gray-400
              "
            >
              {processing ? 'Processing...' : 'Purchase'}
            </button>

            <button
              className="w-full text-gray-500 mt-3 hover:underline"
              onClick={() => clear()}
            >
              Clear Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
