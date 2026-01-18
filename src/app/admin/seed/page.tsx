"use client";
import { useState } from 'react';

export default function SeedPage() {
  const [status, setStatus] = useState('Idle');
  const [loading, setLoading] = useState(false);

  const runSeed = async () => {
    setLoading(true);
    setStatus('Seeding...');
    try {
      const res = await fetch('/api/admin/seed', { method: 'POST' });
      const data = await res.json();
      setStatus(data.message || 'Seed complete!');
    } catch (e) {
      setStatus(`Error: ${(e as any).message}`);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Database Seeder</h1>
      <p>Status: {status}</p>
      <button onClick={runSeed} disabled={loading} style={{ padding: '10px 20px', cursor: 'pointer' }}>
        {loading ? 'Seeding...' : 'Run Seed'}
      </button>
    </div>
  );
}
