// hooks/useAuth.ts
'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { db, getAuthClient } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export type AppRole = 'customer' | 'seller' | null;

export default function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let auth;
    try {
      auth = getAuthClient(); // ✅ safely get Auth client on client-side
    } catch {
      console.warn('Firebase Auth is not available on the server.');
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      if (!u) {
        setRole(null);
        setLoading(false);
        // clear client cookies used for middleware
        try { document.cookie = 'role=; path=/; max-age=0'; } catch {}
        try { document.cookie = 'token=; path=/; max-age=0'; } catch {}
        return;
      }

      try {
        const snap = await getDoc(doc(db, 'users', u.uid));
        if (snap.exists()) {
          const data = snap.data() as { role?: AppRole };
          setRole(data.role ?? null);

          // set client cookies for middleware UI-level guards
          document.cookie = `role=${data.role ?? ''}; path=/`;
          document.cookie = `token=${u.uid}; path=/`;
        }
      } catch (err) {
        console.error('failed to read user role', err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  return { user, role, loading };
}
