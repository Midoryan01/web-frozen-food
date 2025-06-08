import React from 'react';
import { LayoutDashboard, Package, ListOrdered, FileText, History, Users } from 'lucide-react';
import type {Page}  from './types/navigation';

interface SidebarProps {
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage }) => {
    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, page: 'dashboard' },
        { name: 'Produk', icon: Package, page: 'products' },
        { name: 'Transaksi', icon: ListOrdered, page: 'transactions' },
        { name: 'Laporan Penjualan', icon: FileText, page: 'sales_report' },
        { name: 'Log Stok', icon: History, page: 'stock_logs' },
        { name: 'Pengguna', icon: Users, page: 'users' },
    ];
    return (
        <aside className="w-60 md:w-64 bg-sky-800 text-sky-100 p-4 sm:p-6 space-y-6 flex flex-col print:hidden shadow-lg">
            <div className="text-2xl md:text-3xl font-bold text-white text-center tracking-tight">FrozenPOS</div>
            <nav className="flex-1">
                <ul className="space-y-2">
                    {navItems.map(item => (
                        <li key={item.name}>
                            <button
                                onClick={() => setCurrentPage(item.page as Page)}
                                className={`w-full flex items-center space-x-3 px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg transition-all duration-200 ease-in-out
                                    ${currentPage === item.page
                                        ? 'bg-sky-600 text-white shadow-lg transform scale-105'
                                        : 'hover:bg-sky-700/80 hover:text-white'
                                    }`}
                            >
                                <item.icon className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
                                <span className="text-sm sm:text-base font-medium">{item.name}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="mt-auto text-center text-xs text-sky-300">
                © {new Date().getFullYear()} FrozenFood POS
            </div>
        </aside>
    );
};

export default Sidebar;
