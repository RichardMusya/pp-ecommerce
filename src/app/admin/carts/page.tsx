"use client";
import { useEffect, useState } from 'react';
import AdminNav from '../../../components/AdminNav';
import AdminGuard from '../../../components/AdminGuard';
export default function AdminCarts() {
  const [list, setList] = useState<any[]>([]);

  async function load() {
    const r = await fetch('/api/admin/carts');
    const j = await r.json();
    setList(j.data || []);
  }

  useEffect(() => { load(); }, []);

  async function del(id: string) {
    if (!confirm('Delete cart?')) return;
    await fetch(`/api/admin/carts?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    load();
  }

  return (
    <div>
      <AdminGuard>
        <AdminNav />
      </AdminGuard>
      <h1 className="text-xl font-semibold">Carts</h1>
      <div className="mt-4 space-y-3">
        {list.map((c) => (
          <div key={c.id} className="bg-white p-3 rounded">
            <div className="flex justify-between">
              <div>
                <div className="font-medium">Cart {c.id}</div>
                <div className="text-sm text-gray-600">Items: {c.items?.length || 0}</div>
              </div>
              <div>
                <button onClick={() => del(c.id)} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
              </div>
            </div>
            <div className="mt-2">
              {c.items?.map((it: any) => (
                <div key={it.id} className="text-sm">{it.product?.name} x{it.quantity} — ${(it.price/100).toFixed(2)}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
