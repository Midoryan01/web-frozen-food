"use client";

// 1. Impor useState, useEffect dari React dan createPortal dari react-dom
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { UserCircle, LogOut, LayoutDashboard, AlertTriangle } from "lucide-react";

interface HeaderProps {
    session: Session | null;
}

export default function Header({ session }: HeaderProps) {
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const user = session?.user as any;
    const userName = user?.fullName || 'Kasir';
    const userRole = user?.role;

    const handleSignOut = async () => {
        await signOut({ callbackUrl: '/login' });
    };

    // 2. Bungkus dialog dalam komponen terpisah untuk kejelasan
    const ConfirmationDialog = () => (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[9999]">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4 text-slate-800 animate-fade-in-up">
                <div className="flex items-start mb-4">
                    <div className="bg-red-100 p-3 rounded-full mr-4">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900">Konfirmasi Logout</h3>
                        <p className="text-sm text-slate-600 mt-1">
                            Apakah Anda yakin ingin keluar dari sesi kasir?
                        </p>
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={() => setShowConfirmDialog(false)}
                        className="px-4 py-2 bg-slate-100 text-slate-800 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSignOut}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                    >
                        Ya, Keluar
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <header className="bg-sky-700 text-white">
                <div className="mx-auto flex h-[72px] max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight">🛒 Kasir Frozen Food</h1>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <UserCircle size={24} />
                            <span className="text-sm sm:text-base font-medium">{userName}</span>
                        </div>

                        {userRole === 'ADMIN' && (
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-1.5 rounded-md bg-sky-600 px-3 py-1.5 text-sm font-medium hover:bg-sky-500 transition-colors"
                                title="Dashboard"
                            >
                                <LayoutDashboard className="h-4 w-4" />
                                <span className="hidden sm:inline">Dashboard</span>
                            </Link>
                        )}

                        <button
                            onClick={() => setShowConfirmDialog(true)}
                            className="flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium hover:bg-red-500 transition-colors"
                            title="Keluar"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* 3. Gunakan Portal untuk merender dialog */}
            {isMounted && showConfirmDialog
                ? createPortal(<ConfirmationDialog />, document.body)
                : null}
        </>
    );
}