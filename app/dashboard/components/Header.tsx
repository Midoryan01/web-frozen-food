// app/dashboard/components/Header.tsx
"use client";

import React from 'react';
import { UserCircle, Bell } from 'lucide-react'; // Menggunakan UserCircle sebagai contoh

interface HeaderProps {
  userName?: string; // Opsional, jika ada info user login
}

const Header: React.FC<HeaderProps> = ({ userName = "Admin" }) => {
  return (
    <header className="bg-white shadow-md p-4 print:hidden">
      <div className="container mx-auto flex justify-between items-center">
        {/* Bagian kiri bisa untuk breadcrumbs atau judul halaman dinamis */}
        <div>
          {/* <h1 className="text-xl font-semibold text-slate-700">Dashboard</h1> */}
        </div>
        
        {/* Bagian kanan untuk profil user, notifikasi, dll. */}
        <div className="flex items-center space-x-4">
          <button className="relative p-2 rounded-full hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50">
            <Bell className="h-6 w-6 text-slate-600" />
            {/* Contoh badge notifikasi */}
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500"></span>
          </button>
          <div className="flex items-center space-x-2">
            <UserCircle className="h-8 w-8 text-slate-500" /> {/* Atau <Image /> jika ada avatar */}
            <span className="text-sm font-medium text-slate-700 hidden sm:block">{userName}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
