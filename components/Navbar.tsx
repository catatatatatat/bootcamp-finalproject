'use client';
import Link from 'next/link';
import useAuth from '../app/hooks/useAuth';
import { logoutUser } from '../lib/auth';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, role } = useAuth();
  const router = useRouter();

  async function onLogout() {
    await logoutUser();
    document.cookie = 'token=; Max-Age=0; path=/';
    document.cookie = 'role=; Max-Age=0; path=/';
    router.push('/login');
  }

  return (
    <nav className="w-full bg-orange-500 text-white p-4 shadow-md">
      <div className="container flex justify-between items-center">
        <h1 className="logo font-bold text-xl">Shopee Clone</h1>

        <div className="links space-x-4 flex items-center">
          {/* {!user && !loading && (
            <>
              <Link href="/login">Login</Link>
              <Link href="/register">Register</Link>
            </>
          )} */}

          {/* Customer */}
          {user && role === 'customer' && (
            <>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/cart">Cart</Link>
              <Link href="/order-history">Order History</Link>

              <button
                onClick={onLogout}
                className="px-3 py-1 border rounded-lg hover:bg-red-600 hover:text-white transition"
              >
                Logout
              </button>
            </>
          )}

          {/* Seller */}
          {user && role === 'seller' && (
            <>
              <Link href="/products">My Products</Link>
              <Link href="/add-product">Add Product</Link>

              <button
                onClick={onLogout}
                className="px-3 py-1 border rounded-lg hover:bg-red-600 hover:text-white transition"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
