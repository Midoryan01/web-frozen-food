// app/cashier/components/Header.tsx
"use client";

import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { UserCircle, LogOut } from "lucide-react";

// Header sekarang menerima 'session' sebagai prop
interface HeaderProps {
    session: Session | null;
}

export default function Header({ session }: HeaderProps) {
  // Mengambil nama dari sesi, dengan fallback "Kasir" jika tidak ada
  const userName = session?.user?.name || 'Kasir';

  return (
    <header className="bg-sky-700 text-white">
      <div className="mx-auto flex h-[72px] max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">🛒 Kasir Frozen Food</h1>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <UserCircle size={24} />
            {/* Menampilkan nama pengguna dari prop */}
            <span className="text-sm sm:text-base font-medium">{userName}</span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })} // Arahkan ke login setelah keluar
            className="flex items-center gap-1.5 rounded-md bg-sky-600 px-3 py-1.5 text-sm font-medium hover:bg-sky-500 transition-colors"
            title="Keluar"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
