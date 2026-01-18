"use client";
import Link from 'next/link';
import { useSession, signOut, signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function Header() {
  const { data: session, status } = useSession();
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function loadCart() {
      try {
        const r = await fetch('/api/cart');
        const j = await r.json();
        setCount((j.items || []).length);
      } catch (e) {
        setCount(0);
      }
    }
    loadCart();
  }, [status]);

  useEffect(() => {
    function onUpdated() {
      const detail = (window as unknown as CustomEvent)?.detail;
      if (detail && typeof detail.count === 'number') setCount(detail.count);
      else {
        // fallback: re-fetch
        fetch('/api/cart').then((r) => r.json()).then((j) => setCount((j.items || []).length)).catch(() => {});
      }
    }

    window.addEventListener('cart:updated', onUpdated);
    return () => window.removeEventListener('cart:updated', onUpdated);
  }, []);

  const isAdmin = (session as any)?.user?.role === 'ADMIN';

  return (
    <header className="border-b bg-white">
      <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-extrabold text-lg">PP E-commerce</Link>
        </div>

        <nav className="flex items-center gap-4">
          <Link href="/products" className="text-sm">Products</Link>
          <Link href="/cart" className="text-sm">Cart{count > 0 ? ` (${count})` : ''}</Link>
          {status === 'loading' ? (
            <span className="text-sm">...</span>
          ) : session ? (
            <>
              <span className="text-sm">Hello, {(session as any).user?.email || (session as any).user?.name}</span>
              <button onClick={() => signOut()} className="text-sm text-red-600">Sign out</button>
            </>
          ) : (
            <>
              <button onClick={() => signIn('credentials')} className="text-sm">Login</button>
              <Link href="/signup" className="text-sm">Sign up</Link>
            </>
          )}

          {isAdmin && (
            <Link href="/admin" className="ml-4 px-3 py-1 bg-gray-800 text-white rounded text-sm">Admin</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
