"use client";
import { useState } from 'react';

export default function AddToCartButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState<number>(1);

  async function handleAdd() {
    setLoading(true);
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: Number(qty) })
      });
      if (res.ok) {
        setAdded(true);
        try {
          const cartRes = await fetch('/api/cart');
          if (cartRes.ok) {
            const cartJson = await cartRes.json();
            const items = cartJson.items || [];
            // notify header and others
            window.dispatchEvent(new CustomEvent('cart:updated', { detail: { count: items.length } }));
          }
        } catch (e) {
          console.warn('Failed to refresh cart after add', e);
        }
      } else {
        console.error('Add to cart failed', await res.text());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value || 1)))} className="w-20 p-2 border rounded" />
      <button
        onClick={handleAdd}
        disabled={loading}
        className={`bg-blue-600 text-white px-4 py-2 rounded ${loading ? 'opacity-60' : ''}`}
      >
        {added ? 'Added' : loading ? 'Adding...' : `Add ${qty} to cart`}
      </button>
    </div>
  );
}
