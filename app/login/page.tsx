// app/login/page.tsx
'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await signIn('credentials', {
      username,
      password,
      redirect: false, // pastikan redirect false untuk kontrol manual
    });

    if (res?.ok) {
      router.push('/'); // Redirect ke home atau halaman sesuai role
    } else {
      alert('Login gagal. Cek username dan password.');
    }
  };

  return (
    <form onSubmit={handleLogin} className="max-w-sm mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Login</h1>

      <input
        className="w-full border p-2 mb-2"
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}  // Mengubah state username
        required
      />

      <input
        className="w-full border p-2 mb-2"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}  // Mengubah state password
        required
      />

      <button className="w-full bg-blue-500 text-white p-2" type="submit">
        Login
      </button>
    </form>
  );
}