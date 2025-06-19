"use client";

// 1. Impor useState dan ikon baru
import React, { useState } from 'react';
import { Users, LogOut, Store, AlertTriangle } from 'lucide-react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

interface HeaderProps {
    userName: string;
}

const Header: React.FC<HeaderProps> = ({ userName }) => {
    // 2. Tambahkan state untuk mengontrol dialog konfirmasi
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const handleSignOut = async () => {
        await signOut({ callbackUrl: '/login' });
    };

    return (
        <>
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
                            // 3. Ubah onClick untuk menampilkan dialog
                            onClick={() => setShowConfirmDialog(true)}
                            className="p-2 rounded-full hover:bg-red-100 text-red-600 transition-colors"
                            title="Logout"
                        >
                            <LogOut className="h-5 w-5 sm:h-6 sm:w-6" />
                        </button>
                    </div>
                </div>
            </header>

            {/* 4. Tambahkan JSX untuk Dialog Konfirmasi */}
            {showConfirmDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4 transform transition-all duration-300 scale-100">
                        <div className="flex items-center mb-4">
                            <div className="bg-red-100 p-2 rounded-full mr-4">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800">Konfirmasi Logout</h3>
                        </div>
                        <p className="text-slate-600 mb-6">
                            Apakah Anda yakin ingin keluar dari sesi ini?
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setShowConfirmDialog(false)}
                                className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-colors font-medium"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSignOut}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                            >
                                Ya, Keluar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Header;