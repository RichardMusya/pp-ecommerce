"use client";
import { useEffect, useState } from 'react';

import AdminNav from '../../../components/AdminNav';
import AdminGuard from '../../../components/AdminGuard';

export default function AdminOrders() {
  const [list, setList] = useState<any[]>([]);

  async function load() {
    const r = await fetch('/api/admin/orders');
    const j = await r.json();
    setList(j.data || []);
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: string) {
    await fetch('/api/admin/orders', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
    load();
  }

  return (
    <div>
      <AdminGuard>
        <AdminNav />
      </AdminGuard>
      <h1 className="text-xl font-semibold">Orders</h1>
      <div className="mt-4 space-y-3">
        {list.map((o) => (
          <div key={o.id} className="bg-white p-3 rounded">
            <div className="flex justify-between">
              <div>
                <div className="font-medium">{o.orderNumber} — {o.status}</div>
                <div className="text-sm text-gray-600">Total: ${(o.total/100).toFixed(2)}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateStatus(o.id, 'PROCESSING')} className="px-3 py-1 bg-yellow-500 rounded">Process</button>
                <button onClick={() => updateStatus(o.id, 'COMPLETED')} className="px-3 py-1 bg-green-600 text-white rounded">Complete</button>
              </div>
            </div>
            <div className="mt-2">
              {o.items?.map((it: any) => (
                <div key={it.id} className="text-sm">{it.name} x{it.quantity} — ${(it.price/100).toFixed(2)}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
