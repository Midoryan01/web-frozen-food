"use client"; 
import React from 'react';
import { Users, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

interface HeaderProps {
    userName: string;
}

const Header: React.FC<HeaderProps> = ({ userName }) => {
    
    const handleSignOut = async () => {
        // Panggil signOut dengan callbackUrl untuk mengarahkan pengguna setelah logout
        await signOut({ callbackUrl: '/login' });
    };

    return (
        <header className="bg-white shadow-md p-4 flex justify-between items-center print:hidden sticky top-0 z-40">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-700">Selamat Datang, {userName}!</h2>
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
        </header>
    );
};

export default Header;