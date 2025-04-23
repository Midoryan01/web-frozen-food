'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div className="text-center mt-10">Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow-md bg-white">
      <h1 className="text-black text-2xl font-bold mb-4">Dashboard</h1>
      <p className="mb-2 text-black">👤 <strong>Username:</strong> {session?.user.username}</p>
      <p className="mb-2 text-black">🛡️ <strong>Role:</strong> {session?.user.role}</p>
      <p className="text-green-600 font-semibold mt-4">Login berhasil. Selamat datang!</p>
    </div>
  );
}
