"use client";
import { useEffect, useState } from 'react';
import AdminNav from '../../../components/AdminNav';
import AdminGuard from '../../../components/AdminGuard';

type Product = any;

export default function AdminProducts() {
  const [list, setList] = useState<Product[]>([]);
  const [form, setForm] = useState({ id: '', name: '', price: 1000, stock: 0, sku: '', description: '', categoryId: '' });
  const [page, setPage] = useState(1);
  const [csrf, setCsrf] = useState('');
  const take = 10;

  async function load(p = page) {
    const r = await fetch(`/api/admin/products?page=${p}&take=${take}`);
    const j = await r.json();
    setList(j.data || []);
  }

  useEffect(() => { load(page); }, [page]);

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

  async function submit(e: any) {
    e.preventDefault();
    const method = form.id ? 'PUT' : 'POST';
    await fetch('/api/admin/products', { method, headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf }, body: JSON.stringify(form) });
    setForm({ id: '', name: '', price: 1000, stock: 0, sku: '', description: '', categoryId: '' });
    load();
  }

  async function edit(p: Product) {
    setForm({ id: p.id, name: p.name, price: p.price, stock: p.stock, sku: p.sku || '', description: p.description || '', categoryId: p.categoryId || '' });
  }

  async function del(id: string) {
    await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`, { method: 'DELETE', headers: { 'x-csrf-token': csrf } });
    load();
  }

  return (
    <div>
      <AdminGuard>
        <AdminNav />
      </AdminGuard>
      <h1 className="text-xl font-semibold">Products (Admin)</h1>
      <form className="mt-3" onSubmit={submit}>
        <div className="grid grid-cols-3 gap-2">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="p-2 border rounded" />
          <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="p-2 border rounded" />
          <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} className="p-2 border rounded" />
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="SKU" className="p-2 border rounded" />
          <input value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} placeholder="Category ID" className="p-2 border rounded" />
        </div>
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full p-2 border rounded mt-2" placeholder="Description" />
        <div className="mt-2"><button className="bg-green-600 text-white px-3 py-1 rounded" type="submit">{form.id ? 'Update' : 'Create'} Product</button></div>
      </form>

      <div className="mt-6">
        <table className="w-full bg-white">
          <thead><tr><th>Name</th><th>Price</th><th>Stock</th><th></th></tr></thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className="border-t"><td>{p.name}</td><td>${(p.price/100).toFixed(2)}</td><td>{p.stock}</td><td>
                <button className="mr-2 text-blue-600" onClick={() => edit(p)}>Edit</button>
                <button className="text-red-600" onClick={() => del(p.id)}>Delete</button>
              </td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex gap-2">
        <button onClick={() => setPage((s) => Math.max(1, s - 1))} className="px-3 py-1 border rounded">Prev</button>
        <button onClick={() => setPage((s) => s + 1)} className="px-3 py-1 border rounded">Next</button>
      </div>
    </div>
  );
}
