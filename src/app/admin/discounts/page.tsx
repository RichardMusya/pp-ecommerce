"use client";
import { useEffect, useState } from 'react';
import AdminNav from '../../../components/AdminNav';
import AdminGuard from '../../../components/AdminGuard';

type Discount = { code: string; type: string; amount: number };

export default function DiscountsAdminPage() {
  const [list, setList] = useState<Discount[]>([]);
  const [form, setForm] = useState({ code: '', type: 'PERCENT', amount: 0 });
  const [csrf, setCsrf] = useState('');

  async function load() {
    const r = await fetch('/api/admin/discounts');
    const j = await r.json();
    setList(j.data || j || []);
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    async function fetchCsrf() {
      try {
        const r = await fetch('/api/csrf');
        const j = await r.json();
        setCsrf(j.csrfToken || '');
      } catch (e) {
        console.error('Failed to fetch CSRF token', e);
      }
    }
    fetchCsrf();
  }, []);

  async function create(e: any) {
    e.preventDefault();
    await fetch('/api/admin/discounts', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf }, body: JSON.stringify(form) });
    setForm({ code: '', type: 'PERCENT', amount: 0 });
    load();
  }

  async function del(code: string) {
    await fetch(`/api/admin/discounts?code=${encodeURIComponent(code)}`, { method: 'DELETE', headers: { 'x-csrf-token': csrf } });
    load();
  }

  return (
    <div>
      <AdminGuard>
        <AdminNav />
      </AdminGuard>
      <h1 className="text-xl font-semibold">Discount Codes</h1>
      <form className="mt-4" onSubmit={create}>
        <div className="grid grid-cols-3 gap-2">
          <input placeholder="CODE" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="p-2 border rounded" />
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="p-2 border rounded">
            <option value="PERCENT">Percent</option>
            <option value="FIXED">Fixed</option>
          </select>
          <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} className="p-2 border rounded" />
        </div>
        <div className="mt-2">
          <button className="bg-green-600 text-white px-3 py-1 rounded" type="submit">Create</button>
        </div>
      </form>

      <div className="mt-6">
        <table className="w-full bg-white">
          <thead><tr><th>Code</th><th>Type</th><th>Amount</th><th></th></tr></thead>
          <tbody>
            {list.map((d) => (
              <tr key={d.code} className="border-t"><td>{d.code}</td><td>{d.type}</td><td>{d.amount}</td><td><button className="text-red-600" onClick={() => del(d.code)}>Delete</button></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
