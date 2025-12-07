// lib/firestoreCart.ts
import {
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  runTransaction,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  imageUrl?: string;
  quantity: number;
}

export async function getCart(userId: string): Promise<CartItem[]> {
  const snap = await getDoc(doc(db, 'carts', userId));
  if (!snap.exists()) return [];
  const data = snap.data();
  return (data?.items ?? []) as CartItem[];
}

export async function setCart(userId: string, items: CartItem[]) {
  await setDoc(doc(db, 'carts', userId), { items });
}

export async function clearCart(userId: string) {
  await deleteDoc(doc(db, 'carts', userId));
}

/**
 * createOrderTransaction
 * - checks each product stock
 * - fails if any qty > stock
 * - deducts stock and creates order document
 * - returns orderId
 */
export async function createOrderTransaction(userId: string, items: CartItem[]) {
  if (!items.length) throw new Error('Cart is empty');

  return await runTransaction(db, async (tx) => {
    // prepare order payload
    const orderRef = doc(collection(db, 'orders'));
    const orderPayload = {
      userId,
      items,
      createdAt: new Date().toISOString(),
    };

    // verify stock for each product and decrement
    for (const item of items) {
      const prodRef = doc(db, 'products', item.productId);
      const prodSnap = await tx.get(prodRef);
      if (!prodSnap.exists()) throw new Error(`Product ${item.productId} not found`);
      const prodData = prodSnap.data() as any;
      const stock = Number(prodData.stock ?? 0);
      if (item.quantity > stock) throw new Error(`Insufficient stock for ${item.name}`);
      // update stock
      tx.update(prodRef, { stock: stock - item.quantity });
    }

    // create order
    tx.set(orderRef, orderPayload);

    // clear cart document
    const cartRef = doc(db, 'carts', userId);
    tx.delete(cartRef);

    return orderRef.id;
  });
}

/**
 * fetchUserOrders - fetch all orders for user (ordered desc)
 */
export async function fetchUserOrders(userId: string) {
  const q = query(collection(db, 'orders'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const snaps = await getDocs(q);
  return snaps.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}
