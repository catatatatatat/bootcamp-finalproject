// lib/auth.ts
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  Auth,
} from 'firebase/auth';
import { db } from './firebase';
import { getAuthClient } from './firebase'; // new getter function

export type Role = 'customer' | 'seller';

export interface UserMeta {
  email?: string;
  role?: Role;
  createdAt?: string;
}

export async function registerUser(
  email: string,
  password: string,
  role: Role
): Promise<User> {
  const auth: Auth = getAuthClient(); // guaranteed non-null
  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  const uid = userCred.user.uid;

  await setDoc(doc(db, 'users', uid), {
    email,
    role,
    createdAt: new Date().toISOString(),
  });

  return userCred.user;
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ user: User; meta: UserMeta | null }> {
  const auth: Auth = getAuthClient(); // guaranteed non-null
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const uid = cred.user.uid;
  const snap = await getDoc(doc(db, 'users', uid));
  const meta = snap.exists() ? (snap.data() as UserMeta) : null;
  return { user: cred.user, meta };
}

export async function logoutUser(): Promise<void> {
  const auth: Auth = getAuthClient(); // guaranteed non-null
  await signOut(auth);
}
