"use client";
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function PageNav() {
  const { data: session, status } = useSession();

  return (
    <nav className="bg-white p-3 rounded mb-4 flex gap-3 items-center">
      <Link href="/" className="text-sm">Home</Link>
      <Link href="/products" className="text-sm">Products</Link>
      <Link href="/cart" className="text-sm">Cart</Link>

      <div className="ml-auto flex items-center gap-3">
        {status === 'loading' ? (
          <span className="text-sm">...</span>
        ) : session ? (
          <>
            <span className="text-sm">Hello, {(session as any).user?.name || (session as any).user?.email}</span>
            <button onClick={() => signOut()} className="text-sm text-red-600">Sign out</button>
          </>
        ) : (
          <>
            <button onClick={() => signIn()} className="text-sm">Login</button>
          </>
        )}
      </div>
    </nav>
  );
}
