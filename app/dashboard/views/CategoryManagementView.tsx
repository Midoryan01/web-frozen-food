"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { PlusCircle, Edit3, Trash2, Search, RefreshCw, Layers, Package } from 'lucide-react';
import type { Category } from '../types';
import CategoryFormModal from '../components/CategoryFormModal';
import ThSortable from '../components/ThSortable';
import PaginationControls from '../components/PaginationControls';

interface CategoryManagementViewProps {
    initialCategories: Category[];
    refreshCategories: () => Promise<void>;
    apiBaseUrl: string;
}

const CategoryManagementView: React.FC<CategoryManagementViewProps> = ({ initialCategories, refreshCategories, apiBaseUrl }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoadingTable, setIsLoadingTable] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'ascending' | 'descending' }>({ key: null, direction: 'ascending' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        setCategories(initialCategories);
    }, [initialCategories]);

    const handleRefresh = async () => {
        setIsLoadingTable(true);
        await refreshCategories();
        setIsLoadingTable(false);
    };

    const filteredAndSortedCategories = useMemo(() => {
        let sortableItems = [...categories];
        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                let aValue: any = sortConfig.key === '_count.products' ? a._count?.products : a[sortConfig.key as keyof Category];
                let bValue: any = sortConfig.key === '_count.products' ? b._count?.products : b[sortConfig.key as keyof Category];
                
                if (aValue == null) return 1; if (bValue == null) return -1;
                if (typeof aValue === 'number' && typeof bValue === 'number') return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
                if (typeof aValue === 'string' && typeof bValue === 'string') return sortConfig.direction === 'ascending' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                return 0;
            });
        }
        if (!searchTerm) return sortableItems;
        return sortableItems.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [categories, searchTerm, sortConfig]);

    const totalPages = Math.ceil(filteredAndSortedCategories.length / itemsPerPage);
    const paginatedCategories = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredAndSortedCategories.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredAndSortedCategories, currentPage, itemsPerPage]);
    
    const onPageChange = (page: number) => {
        if (page > 0 && page <= totalPages) setCurrentPage(page);
    };

    const onItemsPerPageChange = (size: number) => {
        setItemsPerPage(size);
        setCurrentPage(1);
    };

    const requestSort = (key: string) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') direction = 'descending';
        setSortConfig({ key, direction });
    };

    const handleAddCategory = () => { setEditingCategory(null); setShowModal(true); };
    const handleEditCategory = (category: Category) => { setEditingCategory(category); setShowModal(true); };
    
    const handleDeleteCategory = async (categoryId: number) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus kategori ini? Produk dalam kategori ini tidak akan terhapus.')) {
            setIsLoadingTable(true);
            try {
                const response = await fetch(`${apiBaseUrl}/category/${categoryId}`, { method: 'DELETE' });
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || 'Gagal menghapus kategori.');
                }
                alert('Kategori berhasil dihapus!');
                await refreshCategories();
            } catch (e: any) {
                alert(`Error: ${e.message}`);
            } finally {
                setIsLoadingTable(false);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Manajemen Kategori</h1>
                <div className="flex gap-2">
                    <button onClick={handleRefresh} disabled={isLoadingTable} className="bg-slate-200 text-slate-700 px-4 py-2.5 rounded-lg hover:bg-slate-300 transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50">
                        <RefreshCw size={16} className={isLoadingTable ? "animate-spin" : ""} /> Refresh
                    </button>
                    <button onClick={handleAddCategory} className="bg-sky-600 text-white px-4 py-2.5 rounded-lg hover:bg-sky-700 transition-colors flex items-center gap-2 text-sm font-medium">
                        <PlusCircle size={18} /> Tambah Kategori
                    </button>
                </div>
            </div>

            <div className="relative">
                <input type="text" placeholder="Cari berdasarkan nama kategori..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-3 pl-10 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500" />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            </div>

            {isLoadingTable && filteredAndSortedCategories.length === 0 ? (
                <div className="text-center py-10">Memuat kategori...</div>
            ) : !isLoadingTable && filteredAndSortedCategories.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-lg shadow-md border"><Layers size={48} className="mx-auto text-slate-400 mb-4"/><p className="text-slate-500 text-lg">Tidak ada kategori ditemukan.</p></div>
            ) : (
                <div className="bg-white rounded-lg shadow-xl border border-slate-200">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                            <thead className="bg-slate-100 border-b border-slate-300">
                                <tr>
                                    <ThSortable name="Nama Kategori" sortKey="name" requestSort={requestSort} sortConfig={sortConfig} />
                                    <ThSortable name="Deskripsi" sortKey="description" requestSort={requestSort} sortConfig={sortConfig} />
                                    <ThSortable name="Jumlah Produk" sortKey="_count.products" requestSort={requestSort} sortConfig={sortConfig} align="center" />
                                    <ThSortable name="Aksi" sortKey={null} requestSort={requestSort} sortConfig={sortConfig} className="w-28 text-center"/>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {paginatedCategories.map(category => (
                                    <tr key={category.id} className="hover:bg-sky-50/50">
                                        <td className="p-3 text-sm text-slate-800 font-medium">{category.name}</td>
                                        <td className="p-3 text-sm text-slate-500">{category.description || '-'}</td>
                                        <td className="p-3 text-sm text-slate-500 text-center">{category._count?.products ?? 0}</td>
                                        <td className="p-3 text-center">
                                            <button onClick={() => handleEditCategory(category)} title="Edit Kategori" className="text-sky-600 hover:text-sky-800 p-1.5 rounded-md hover:bg-sky-100"><Edit3 size={16} /></button>
                                            <button onClick={() => handleDeleteCategory(category.id)} title="Hapus Kategori" className="text-red-500 hover:text-red-700 p-1.5 rounded-md hover:bg-red-100 ml-1"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <PaginationControls
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={onPageChange}
                        itemsPerPage={itemsPerPage}
                        onItemsPerPageChange={onItemsPerPageChange}
                        totalItems={filteredAndSortedCategories.length}
                    />
                </div>
            )}
            {showModal && (<CategoryFormModal category={editingCategory} onClose={() => setShowModal(false)} onSave={async () => { await refreshCategories(); setShowModal(false); }} apiBaseUrl={apiBaseUrl} />)}
        </div>
    );
};
export default CategoryManagementView;