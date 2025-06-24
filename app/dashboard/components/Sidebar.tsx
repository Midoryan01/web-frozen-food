import React from 'react';
import { LayoutDashboard, Package, ListOrdered, FileText, History, Users, Tags } from 'lucide-react';
import type { Page } from './types/navigation';

// Tipe untuk setiap item navigasi
type NavItemData = {
  name: string;
  icon: React.ElementType;
  page: Page;
};

// Data untuk item navigasi
const navItems: NavItemData[] = [
    { name: 'Dashboard', icon: LayoutDashboard, page: 'dashboard' },
    { name: 'Produk', icon: Package, page: 'products' },
    { name: 'Kategori', icon: Tags, page: 'categories' },
    { name: 'Transaksi', icon: ListOrdered, page: 'transactions' },
    { name: 'Laporan Penjualan', icon: FileText, page: 'sales_report' },
    { name: 'Log Stok', icon: History, page: 'stock_logs' },
    { name: 'Pengguna', icon: Users, page: 'users' },
];

interface SidebarProps {
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
}

// Komponen terpisah untuk setiap item di sidebar
const NavItem: React.FC<{
  item: NavItemData;
  isActive: boolean;
  onClick: () => void;
}> = ({ item, isActive, onClick }) => {
  const { name, icon: Icon } = item;

  // Menggabungkan class agar lebih mudah dibaca
  const baseClasses = "w-full flex items-center space-x-3 px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg transition-all duration-200 ease-in-out text-left";
  const activeClasses = "bg-sky-600 text-white shadow-lg transform scale-105";
  const inactiveClasses = "hover:bg-sky-700/80 hover:text-white";
  const finalClasses = `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;

  return (
    <li>
      <button onClick={onClick} className={finalClasses}>
        <Icon className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
        <span className="text-sm sm:text-base font-medium">{name}</span>
      </button>
    </li>
  );
};

// Komponen Sidebar Utama
const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage }) => {
    return (
        <aside className="w-60 md:w-64 bg-sky-800 text-sky-100 p-4 sm:p-6 flex flex-col print:hidden shadow-lg flex-shrink-0">
            <div className="text-2xl md:text-3xl font-bold text-white text-center tracking-tight mb-6">
                FrozenPOS
            </div>
            <nav className="flex-1">
                <ul className="space-y-2">
                    {navItems.map(item => (
                        <NavItem
                            key={item.page}
                            item={item}
                            isActive={currentPage === item.page}
                            onClick={() => setCurrentPage(item.page)}
                        />
                    ))}
                </ul>
            </nav>
            <div className="mt-auto text-center text-xs text-sky-300 pt-6">
                © {new Date().getFullYear()} FrozenFood POS
            </div>
        </aside>
    );
};

export default Sidebar;
