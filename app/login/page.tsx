// app/login/page.tsx
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react'; // Impor signIn dari next-auth/react
import { LogIn, User, KeyRound, AlertTriangle } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Gunakan fungsi signIn dari NextAuth
      const result = await signIn('credentials', {
        // Opsi redirect: false memungkinkan kita menangani error atau sukses secara manual di sini
        redirect: false, 
        username,
        password,
      });

      if (result?.error) {
        // Jika NextAuth mengembalikan error (misalnya, kredensial salah), tampilkan pesan
        setError('Login gagal. Periksa kembali username dan password Anda.');
        setIsLoading(false);
      } else if (result?.ok) {
        // Jika login berhasil dan tidak ada error
        // Arahkan ke halaman utama. NextAuth akan mengatur sesi.
        // Logika pengalihan berdasarkan role (ADMIN/KASIR) sebaiknya ditangani di
        // halaman tujuan (misalnya /dashboard) atau menggunakan middleware.
        router.push('/dashboard'); 
      }
    } catch (err) {
      // Menangani error tak terduga
      setError('Terjadi kesalahan yang tidak terduga.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-xl border border-slate-200">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-sky-700">FrozenPOS</h1>
          <p className="mt-2 text-slate-600">Silakan login untuk melanjutkan</p>
        </div>

        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 pl-10 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
              placeholder="Username"
            />
          </div>
          
          <div className="relative">
             <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 pl-10 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
              placeholder="Password"
            />
          </div>

          {error && (
            <div className="flex items-center p-3 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200">
              <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300 ease-in-out"
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
    </div>
  );
}
