'use client';

import './globals.css';
import Navbar from '../components/Navbar';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const noNavbar = pathname === '/login' || pathname === '/register';

  return (
    <html lang="en">
      <body className="min-h-screen bg-orange-300">
        {!noNavbar && <Navbar />}

        <main
          className={
            noNavbar
              ? "flex items-center justify-center min-h-screen bg-orange-300"    
              : "container mx-auto p-4"
          }
        >
          {children}
        </main>
      </body>
    </html>
  );
}
