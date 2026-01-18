"use client";
import Link from 'next/link';
import { signOut } from 'next-auth/react';

export default function AdminNav() {
  return (
    <div className="bg-white p-3 rounded mb-4 flex items-center justify-between">
      <div className="flex gap-3">
        <Link href="/admin" className="font-semibold">Admin</Link>
        <Link href="/admin/products" className="text-sm">Products</Link>
        <Link href="/admin/categories" className="text-sm">Categories</Link>
        <Link href="/admin/discounts" className="text-sm">Discounts</Link>
        <Link href="/admin/orders" className="text-sm">Orders</Link>
        <Link href="/admin/carts" className="text-sm">Carts</Link>
      </div>
      <div>
        <button onClick={() => signOut()} className="px-3 py-1 border rounded text-sm">Sign out</button>
      </div>
    </div>
  );
}
