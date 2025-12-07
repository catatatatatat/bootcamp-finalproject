'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '../../../lib/auth';
import { isValidEmail, isNonEmptyString } from '../../../lib/validators';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!isNonEmptyString(email)) return alert('Email must be filled in.');
    if (!isValidEmail(email)) return alert('Email must be valid.');
    if (!isNonEmptyString(password)) return alert('Password must be filled in.');

    setLoading(true);
    try {
        console.log("Logging in with:", email, password);

      const { user, meta } = await loginUser(email, password);

      document.cookie = `token=${user.uid}; path=/`;
      document.cookie = `role=${meta?.role ?? ''}; path=/`;

      if (meta?.role === 'customer') router.push('/dashboard');
      else if (meta?.role === 'seller') router.push('/products');
      else router.push('/');
    } catch (err: any) {
        console.error("AUTH ERROR:", err);

      alert('Login failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>

        <form onSubmit={onSubmit} className="space-y-4">
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-400 transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center mt-4 text-sm">
          Don’t have an account?{' '}
          <a href="/register" className="text-orange-500 hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
