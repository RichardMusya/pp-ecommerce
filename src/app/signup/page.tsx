"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageNav from '../../components/PageNav';
import { signIn } from 'next-auth/react';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  async function handle(e: any) {
    e.preventDefault();
    const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    if (res.ok) {
      // use NextAuth client signIn for reliable auto-login
      const r2 = await signIn('credentials', { redirect: false, email, password });
      if ((r2 as any)?.ok) router.push('/');
      else router.push('/login');
    } else alert('Signup failed');
  }

  return (
    <div className="max-w-md">
      <PageNav />
      <h1 className="text-2xl font-bold">Sign up</h1>
      <form onSubmit={handle} className="mt-4 space-y-3">
        <input className="w-full p-2 border rounded" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" className="w-full p-2 border rounded" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">Create account</button>
      </form>
    </div>
  );
}
