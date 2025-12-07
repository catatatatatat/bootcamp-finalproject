// hooks/useAuth.ts
'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export type AppRole = 'customer' | 'seller' | null;

export default function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (!u) {
        setRole(null);
        setLoading(false);
        // clear client cookies used for middleware
        try { document.cookie = 'role=; path=/; max-age=0'; } catch {}
        return;
      }

      try {
        const snap = await getDoc(doc(db, 'users', u.uid));
        if (snap.exists()) {
          const data = snap.data() as { role?: AppRole };
          setRole(data.role ?? null);
          // set a client-side cookie to allow middleware UI-level guards
          // NOTE: this cookie is not secure; for production use server-set httpOnly cookies
          document.cookie = `role=${data.role ?? ''}; path=/`;
          // optionally set a lightweight token cookie (uid) for middleware routing
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
