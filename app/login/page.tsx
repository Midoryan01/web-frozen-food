// app/login/page.tsx
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, getSession } from 'next-auth/react'; 
import { LogIn, User, KeyRound, AlertTriangle, Snowflake } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Logika login tidak diubah
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false, 
        username,
        password,
      });

      if (result?.error) {
        setError('Login gagal. Periksa kembali username dan password Anda.');
        setIsLoading(false);
      } else if (result?.ok) {
        const session = await getSession();
        
        if (session?.user?.role === 'ADMIN') {
          router.push('/dashboard');
        } else if (session?.user?.role === 'KASIR') {
          router.push('/cashier');
        } else {
          router.push('/');
        }
      }
    } catch (err) {
      setError('Terjadi kesalahan yang tidak terduga.');
      setIsLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen w-full bg-gradient-to-br from-sky-100 via-white to-slate-200 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-800 tracking-tight">FrozenPOS</h1>
            <p className="mt-2 text-slate-500">Selamat datang kembali!</p>
        </div>
        
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-200/80 p-8">
          <form className="space-y-6" onSubmit={handleLogin}>
            {/* Input Username */}
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-4 pl-12 border border-slate-300 rounded-lg shadow-sm bg-slate-50/50 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                placeholder="Username"
              />
            </div>
            
            {/* Input Password */}
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 pl-12 border border-slate-300 rounded-lg shadow-sm bg-slate-50/50 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                placeholder="Password"
              />
            </div>

            {/* Pesan Error */}
            {error && (
              <div className="flex items-center p-3 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200">
                <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Tombol Login */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-100"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <div className="flex items-center gap-2">
                    <LogIn size={20} />
                    <span>Masuk</span>
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
        <p className="text-center text-xs text-slate-500 mt-8">© 2025 FrozenPOS. All Rights Reserved.</p>
      </div>
    </main>
  );
}
