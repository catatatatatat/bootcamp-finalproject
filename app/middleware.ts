// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const guestOnly = ['/login', '/register'];

// pages that require customer
const customerOnlyPrefixes = ['/customer'];

// pages that require seller
const sellerOnlyPrefixes = ['/seller'];

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const path = req.nextUrl.pathname;

  const role = req.cookies.get('role')?.value ?? null;
  const token = req.cookies.get('token')?.value ?? null;

  // If guest-only page and already logged in, redirect to role dashboard
  if (guestOnly.includes(path) && token) {
    if (role === 'seller') url.pathname = '/seller/products';
    else url.pathname = '/customer/dashboard';
    return NextResponse.redirect(url);
  }

  // Customer-only prefixes
  for (const p of customerOnlyPrefixes) {
    if (path.startsWith(p)) {
      if (!token || role !== 'customer') return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // Seller-only prefixes
  for (const p of sellerOnlyPrefixes) {
    if (path.startsWith(p)) {
      if (!token || role !== 'seller') return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/register', '/customer/:path*', '/seller/:path*'],
};
