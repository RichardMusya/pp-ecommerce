"use client";
import { ReactNode } from 'react';
import { useSession, signIn } from 'next-auth/react';

export default function AdminGuard({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  if (status === 'loading') return <div>Loading...</div>;
  if (!session) {
    return (
      <div className="p-4 bg-yellow-50 rounded">
        Admin access requires sign in. <button onClick={() => signIn()} className="ml-2 text-blue-600">Sign in</button>
      </div>
    );
  }
  if ((session as any).user?.role !== 'ADMIN') {
    return <div className="p-4 bg-red-50 rounded">Access denied.</div>;
  }
  return <>{children}</>;
}
