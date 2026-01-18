"use client";
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import PageNav from '../../components/PageNav';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  async function handle(e: any) {
    e.preventDefault();
    const res = await signIn('credentials', { redirect: false, email, password });
    if ((res as any)?.ok) router.push('/');
    else alert('Login failed');
  }

  return (
    <div className="max-w-md">
      <PageNav />
      <h1 className="text-2xl font-bold">Login</h1>
      <form onSubmit={handle} className="mt-4 space-y-3">
        <input className="w-full p-2 border rounded" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" className="w-full p-2 border rounded" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">Login</button>
      </form>
    </div>
  );
}
