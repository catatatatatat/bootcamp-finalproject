import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getStorageClient } from './firebase'; // ✅ use the client-only getter

export async function uploadImage(file: File): Promise<string> {
  const storage = getStorageClient(); // ✅ initialize client-side Storage
  const path = `products/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
  const storageRef = ref(storage, path);

  const snap = await uploadBytes(storageRef, file);
  const url = await getDownloadURL(snap.ref);
  return url;
}
