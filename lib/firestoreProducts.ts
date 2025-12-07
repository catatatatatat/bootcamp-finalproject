import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  writeBatch,
  doc,
  addDoc,
  DocumentData,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import type { Product } from '../app/hooks/useProducts';

export interface FetchOptions {
  sellerId: string;
  pageSize?: number;
  startAfterCreatedAt?: string | null; 
  category?: string | null;
  search?: string | null; 
}

export async function fetchSellerProducts(opts: FetchOptions): Promise<{
  products: Product[];
  lastCreatedAt: string | null;
}> {
  const pageSize = opts.pageSize ?? 10;
  const col = collection(db, 'products');

  let q = query(col, where('sellerId', '==', opts.sellerId), orderBy('createdAt', 'desc'), limit(pageSize));

  if (opts.category) {
    q = query(col, where('sellerId', '==', opts.sellerId), where('category', '==', opts.category), orderBy('createdAt', 'desc'), limit(pageSize));
  }

  if (opts.startAfterCreatedAt) {
    q = query(q, startAfter(opts.startAfterCreatedAt));
  }

  const snaps = await getDocs(q);
  const products: Product[] = snaps.docs.map((d) => {
    const data = d.data() as any;
    return {
      id: d.id,
      name: data.name,
      price: Number(data.price),
      stock: Number(data.stock),
      category: data.category,
      description: data.description,
      sellerId: data.sellerId,
      imageUrl: data.imageUrl,
      createdAt: data.createdAt,
    } as Product;
  });

  const last = snaps.docs[snaps.docs.length - 1];
  const lastCreatedAt = last ? (last.data() as any).createdAt ?? null : null;

  let out = products;
  if (opts.search) {
    const lower = opts.search.toLowerCase();
    out = products.filter((p) => p.name.toLowerCase().includes(lower));
  }

  return { products: out, lastCreatedAt };
}

export async function uploadProductImage(sellerId: string, file: File): Promise<string> {
  const timestamp = Date.now();
  const path = `products/${sellerId}/${timestamp}-${file.name}`;
  const storageRef = ref(storage, path);

  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      undefined,
      (err) => reject(err),
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(url);
      }
    );
  });
}


export async function addProduct(payload: Omit<Product, 'id' | 'createdAt'> & { imageUrl?: string }) {
  const data: DocumentData = {
    ...payload,
    price: Number(payload.price),
    stock: Number(payload.stock),
    imageUrl: payload.imageUrl ?? '/default-image.png',
    createdAt: new Date().toISOString(),
  };
  const refDoc = await addDoc(collection(db, 'products'), data);
  return refDoc.id;
}

export async function deleteProductsBulk(ids: string[]) {
  if (!ids.length) return;
  const batch = writeBatch(db);
  ids.forEach((id) => {
    batch.delete(doc(db, 'products', id));
  });
  await batch.commit();
}
