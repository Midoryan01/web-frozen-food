"use client";

import React from 'react';
import { LayoutDashboard, Package, ListOrdered, Users, Settings, LogOut } from 'lucide-react'; // Tambahkan ikon jika perlu

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: 'dashboard' | 'products' | 'transactions') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage }) => {
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, page: 'dashboard' as const },
    { name: 'Produk', icon: Package, page: 'products' as const },
    { name: 'Transaksi', icon: ListOrdered, page: 'transactions' as const },
    // { name: 'Pengguna', icon: Users, page: 'users' as const },
    // { name: 'Pengaturan', icon: Settings, page: 'settings' as const },
  ];

  return (
    <aside className="w-60 md:w-64 bg-gradient-to-b from-sky-700 to-sky-800 text-sky-100 p-4 sm:p-5 space-y-6 flex flex-col print:hidden shadow-lg">
      <div className="text-2xl md:text-3xl font-bold text-white text-center py-3 border-b border-sky-600">
        FrozenPOS
      </div>
      <nav className="flex-1">
        <ul className="space-y-1.5">
          {navItems.map(item => (
            <li key={item.name}>
              <button
                onClick={() => setCurrentPage(item.page)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 md:px-4 md:py-3 rounded-lg transition-all duration-200 ease-in-out transform
                  ${currentPage === item.page
                    ? 'bg-sky-600 text-white shadow-lg scale-105'
                    : 'hover:bg-sky-600/80 hover:text-white hover:translate-x-1'
                  }`}
              >
                <item.icon className="h-5 w-5 md:h-6 md:w-6 flex-shrink-0" />
                <span className="text-sm md:text-base font-medium">{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto">
        <button
            // onClick={() => {/* TODO: Handle logout */} alert("Logout!")}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 md:px-4 md:py-3 rounded-lg transition-all duration-200 ease-in-out transform hover:bg-red-600/80 hover:text-white hover:translate-x-1 text-red-200`}
          >
            <LogOut className="h-5 w-5 md:h-6 md:w-6 flex-shrink-0" />
            <span className="text-sm md:text-base font-medium">Logout</span>
        </button>
        <div className="text-center text-xs text-sky-400 pt-4 mt-4 border-t border-sky-700">
          © {new Date().getFullYear()} FrozenFood POS
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
