"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import PageNav from '../../components/PageNav';

export default function CartPage() {
  const [cart, setCart] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const r = await fetch('/api/cart');
      const j = await r.json();
      setCart(j);
    }
    load();
  }, []);

  useEffect(() => {
    // listen for cart updates
    function onUpdated() {
      fetch('/api/cart').then((r) => r.json()).then((j) => setCart(j)).catch(() => {});
    }
    window.addEventListener('cart:updated', onUpdated);
    return () => window.removeEventListener('cart:updated', onUpdated);
  }, []);

  if (!cart) return <div>Loading cart...</div>;
  const items = cart.items || [];
   const subtotal = cart.subtotal ?? items.reduce((s: number, it: any) => s + (it.price || it.product?.price || 0) * it.quantity, 0);
   const shipping = cart.shipping ?? 0;
   const total = cart.total ?? subtotal + shipping;

   async function updateQty(itemId: string, q: number) {
     const r = await fetch('/api/cart', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ itemId, quantity: Number(q) }) });
     if (r.ok) {
       // refresh cart
       const j = await fetch('/api/cart').then((r) => r.json());
       setCart(j);
       window.dispatchEvent(new CustomEvent('cart:updated'));
     } else {
       alert('Update failed');
     }
   }

   async function removeItem(itemId: string) {
     const r = await fetch(`/api/cart?itemId=${encodeURIComponent(itemId)}`, { method: 'DELETE' });
     if (r.ok) {
       const j = await fetch('/api/cart').then((r) => r.json());
       setCart(j);
       window.dispatchEvent(new CustomEvent('cart:updated'));
     } else {
       alert('Remove failed');
     }
   }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <PageNav />
      <h1 className="text-xl font-semibold">Cart</h1>
      <div className="mt-4 space-y-3">
        {items.length === 0 && <p>Your cart is empty.</p>}
        {items.map((it: any) => (
          <div key={it.id} className="bg-white p-3 rounded flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <Image
              src={it.product?.images?.[0]?.url || '/placeholder.png'}
              alt={it.product?.name || 'Product image'}
              width={80}
              height={80}
              className="w-full sm:w-20 h-40 sm:h-20 object-cover rounded"
            />
            <div className="flex-1 w-full">
              <div className="font-medium break-words">{it.product?.name}</div>
              <div className="text-sm text-gray-600">Quantity: {it.quantity}</div>
                <input type="number" min={1} value={it.quantity} onChange={(e) => updateQty(it.id, Number(e.target.value || 1))} className="ml-2 w-20 p-1 border rounded" />
            </div>
            <div className="w-full sm:w-auto mt-2 sm:mt-0 text-right">
              ${(((it.price || it.product?.price) * it.quantity) / 100).toFixed(2)}
                <div className="mt-2"><button className="text-red-600" onClick={() => removeItem(it.id)}>Remove</button></div>
              </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-white p-4 rounded">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div className="text-sm">Subtotal</div>
          <div className="text-lg font-semibold mt-2 sm:mt-0">${(subtotal / 100).toFixed(2)}</div>
        </div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-2">
            <div className="text-sm">Shipping</div>
            <div className="text-lg font-semibold mt-2 sm:mt-0">${(shipping / 100).toFixed(2)}</div>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-2">
            <div className="text-sm">Total</div>
            <div className="text-lg font-semibold mt-2 sm:mt-0">${(total / 100).toFixed(2)}</div>
          </div>
        <div className="mt-3">
          <Link href="/checkout" className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded mt-2 sm:inline-block sm:w-auto">
            Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
