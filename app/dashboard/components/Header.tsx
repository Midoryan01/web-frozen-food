// app/dashboard/components/Header.tsx
"use client"; 

import React from 'react';
import { Users, LogOut, Store } from 'lucide-react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

interface HeaderProps {
    userName: string;
}

const Header: React.FC<HeaderProps> = ({ userName }) => {
    
    const handleSignOut = async () => {
        await signOut({ callbackUrl: '/login' });
    };

    return (
        <header className="bg-white shadow-md p-4 flex justify-between items-center print:hidden sticky top-0 z-10 flex-shrink-0">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-700">Selamat Datang, {userName}!</h2>
            
            <div className="flex items-center gap-4">
                <Link 
                    href="/cashier" 
                    className="flex items-center gap-2 bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors text-sm font-medium shadow-sm"
                >
                    <Store size={18} />
                    <span className="hidden sm:inline">Buka Kasir</span>
                </Link>

                <div className="flex items-center gap-2">
                    <button className="p-2 rounded-full hover:bg-slate-200 transition-colors" title="Profil">
                        <Users className="h-5 w-5 sm:h-6 sm:w-6 text-slate-600" />
                    </button>
                    <button 
                        onClick={handleSignOut}
                        className="p-2 rounded-full hover:bg-red-100 text-red-600 transition-colors"
                        title="Logout"
                    >
                        <LogOut className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
