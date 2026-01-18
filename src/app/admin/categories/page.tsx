"use client";
import { useEffect, useState } from 'react';
import AdminGuard from '../../../components/AdminGuard';
import AdminNav from '../../../components/AdminNav';

type Cat = any;

export default function AdminCategories() {
  const [list, setList] = useState<Cat[]>([]);
  const [name, setName] = useState('');
  const [editing, setEditing] = useState<{ id?: string; name?: string } | null>(null);
  const [page, setPage] = useState(1);
  const take = 10;
  const [csrf, setCsrf] = useState('');

  async function load() {
    const r = await fetch('/api/admin/categories');
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
    if (editing?.id) {
      await fetch('/api/admin/categories', { method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf }, body: JSON.stringify({ id: editing.id, name }) });
      setEditing(null);
    } else {
      await fetch('/api/admin/categories', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf }, body: JSON.stringify({ name }) });
    }
    setName('');
    load();
  }

  async function del(id: string) {
    await fetch(`/api/admin/categories?id=${encodeURIComponent(id)}`, { method: 'DELETE', headers: { 'x-csrf-token': csrf } });
    load();
  }

  async function startEdit(c: Cat) {
    setEditing({ id: c.id, name: c.name });
    setName(c.name);
  }

  return (
    <div>
      <AdminGuard>
        <AdminNav />
      </AdminGuard>
      <h1 className="text-xl font-semibold">Categories (Admin)</h1>
      <form className="mt-3" onSubmit={create}>
        <div className="grid grid-cols-3 gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" className="p-2 border rounded" />
          <div />
          <div />
        </div>
        <div className="mt-2"><button className="bg-green-600 text-white px-3 py-1 rounded" type="submit">Create Category</button></div>
      </form>

      <div className="mt-6">
        <ul className="bg-white">
          {list.map((c) => (
            <li key={c.id} className="flex justify-between border-t p-2"><span>{c.name}</span>
              <div>
                <button className="mr-2 text-blue-600" onClick={() => startEdit(c)}>Edit</button>
                <button className="text-red-600" onClick={() => del(c.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 flex gap-2">
        <button onClick={() => setPage((s) => Math.max(1, s - 1))} className="px-3 py-1 border rounded">Prev</button>
        <button onClick={() => setPage((s) => s + 1)} className="px-3 py-1 border rounded">Next</button>
      </div>
    </div>
  );
}
