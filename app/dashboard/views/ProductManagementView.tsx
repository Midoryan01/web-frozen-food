"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { PlusCircle, Edit3, Trash2, Search, Package, RefreshCw, AlertTriangle } from 'lucide-react';
import type { Product, Category } from '../types';
import ProductFormModal from '../components/ProductFormModal';
import ThSortable from '../components/ThSortable';
import PaginationControls from '../components/PaginationControls'; // Impor komponen

interface ProductManagementViewProps {
    initialProducts: Product[];
    categories: Category[];
    refreshProducts: () => Promise<void>;
    apiBaseUrl: string;
}

const ProductManagementView: React.FC<ProductManagementViewProps> = ({ initialProducts, categories, refreshProducts, apiBaseUrl }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoadingTable, setIsLoadingTable] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: keyof Product | 'category.name' | null; direction: 'ascending' | 'descending' }>({ key: 'name', direction: 'ascending' });
    
    // State untuk navigasi
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10); // Default 10 item

    useEffect(() => {
        setProducts(initialProducts);
    }, [initialProducts]);

    const handleRefresh = async () => {
        setIsLoadingTable(true);
        await refreshProducts();
        setIsLoadingTable(false);
    };

    const filteredAndSortedProducts = useMemo(() => {
        let sortableProducts = [...products];
        if (sortConfig.key) {
            sortableProducts.sort((a, b) => {
                let aValue: any = sortConfig.key === 'category.name' ? a.category?.name : a[sortConfig.key as keyof Product];
                let bValue: any = sortConfig.key === 'category.name' ? b.category?.name : b[sortConfig.key as keyof Product];
                if (aValue == null) return 1; if (bValue == null) return -1;
                if (typeof aValue === 'number' && typeof bValue === 'number') return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
                if (typeof aValue === 'string' && typeof bValue === 'string') return sortConfig.direction === 'ascending' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                if (sortConfig.key === 'expiryDate') { const dateA = new Date(aValue).getTime(); const dateB = new Date(bValue).getTime(); return sortConfig.direction === 'ascending' ? dateA - dateB : dateB - dateA; }
                return 0;
            });
        }
        if (!searchTerm) return sortableProducts;
        return sortableProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase())) || (p.category?.name && p.category.name.toLowerCase().includes(searchTerm.toLowerCase())));
    }, [products, searchTerm, sortConfig]);

    // Logika untuk memotong data sesuai halaman
    const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredAndSortedProducts.slice(startIndex, endIndex);
    }, [filteredAndSortedProducts, currentPage, itemsPerPage]);

    // Handler untuk mengubah halaman dan item per halaman
    const onPageChange = (page: number) => {
        if (page > 0 && page <= totalPages) setCurrentPage(page);
    };
    const onItemsPerPageChange = (size: number) => {
        setItemsPerPage(size);
        setCurrentPage(1);
    };

    const requestSort = (key: keyof Product | 'category.name') => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') direction = 'descending';
        setSortConfig({ key, direction });
    };
    const handleAddProduct = () => { setEditingProduct(null); setShowModal(true); };
    const handleEditProduct = (product: Product) => { setEditingProduct(product); setShowModal(true); };
    const handleDeleteProduct = async (productId: number) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
            setIsLoadingTable(true);
            try {
                const response = await fetch(`${apiBaseUrl}/products/${productId}`, { method: 'DELETE' });
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || 'Gagal menghapus produk.');
                }
                alert('Produk berhasil dihapus!');
                await refreshProducts();
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
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Manajemen Produk</h1>
                <div className="flex gap-2">
                    <button onClick={handleRefresh} disabled={isLoadingTable} className="bg-slate-200 text-slate-700 px-4 py-2.5 rounded-lg hover:bg-slate-300 transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50"><RefreshCw size={16} className={isLoadingTable ? "animate-spin" : ""} /> Refresh</button>
                    <button onClick={handleAddProduct} className="bg-sky-600 text-white px-4 py-2.5 rounded-lg hover:bg-sky-700 transition-colors flex items-center gap-2 text-sm font-medium"><PlusCircle size={18} /> Tambah Produk</button>
                </div>
            </div>

            <div className="relative">
                <input type="text" placeholder="Cari berdasarkan nama, SKU, atau kategori..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-3 pl-10 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors" />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            </div>

            {isLoadingTable && filteredAndSortedProducts.length === 0 ? (
                 <div className="flex justify-center items-center py-10"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-600"></div><p className="ml-3 text-slate-600">Memuat produk...</p></div>
            ) : !isLoadingTable && filteredAndSortedProducts.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-lg shadow-md border"><Package size={48} className="mx-auto text-slate-400 mb-4"/><p className="text-slate-500 text-lg">Tidak ada produk ditemukan.</p>{searchTerm && <p className="text-sm text-slate-400">Coba ubah kata kunci pencarian Anda.</p>}</div>
            ) : (
                <div className="bg-white rounded-lg shadow-xl border border-slate-200">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1000px]">
                            <thead className="bg-slate-100 border-b border-slate-300">
                                <tr>
                                    <ThSortable name="Gambar" sortKey={null} requestSort={requestSort} sortConfig={sortConfig} className="w-20"/>
                                    <ThSortable name="Nama Produk" sortKey="name" requestSort={requestSort} sortConfig={sortConfig} />
                                    <ThSortable name="SKU" sortKey="sku" requestSort={requestSort} sortConfig={sortConfig} />
                                    <ThSortable name="Harga Jual" sortKey="sellPrice" requestSort={requestSort} sortConfig={sortConfig} align="right" />
                                    <ThSortable name="Stok" sortKey="stock" requestSort={requestSort} sortConfig={sortConfig} align="right" />
                                    <ThSortable name="Kategori" sortKey="category.name" requestSort={requestSort} sortConfig={sortConfig} />
                                    <ThSortable name="Kadaluwarsa" sortKey="expiryDate" requestSort={requestSort} sortConfig={sortConfig} />
                                    <ThSortable name="Aksi" sortKey={null} requestSort={requestSort} sortConfig={sortConfig} className="w-28 text-center"/>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {paginatedProducts.map(product => (
                                    <tr key={product.id} className="hover:bg-sky-50/50 transition-colors duration-150">
                                        <td className="p-3"><div className="w-12 h-12 relative"><Image src={product.imageUrl || 'https://placehold.co/48x48/e2e8f0/64748b?text=N/A'} alt={product.name} layout="fill" className="rounded-md object-cover" /></div></td>
                                        <td className="p-3 text-sm text-slate-800 font-medium align-top">{product.name}</td>
                                        <td className="p-3 text-sm text-slate-500 align-top">{product.sku || '-'}</td>
                                        <td className="p-3 text-sm text-slate-700 text-right align-top">Rp{product.sellPrice.toLocaleString('id-ID')}</td>
                                        <td className={`p-3 text-sm text-right align-top font-semibold ${product.stock < 10 ? 'text-red-500' : product.stock < 50 ? 'text-orange-500' : 'text-green-600'}`}>{product.stock}</td>
                                        <td className="p-3 text-sm text-slate-500 align-top">{product.category?.name || '-'}</td>
                                        <td className="p-3 text-sm text-slate-500 align-top">{new Date(product.expiryDate).toLocaleDateString('id-ID', {year: 'numeric', month: 'short', day: 'numeric'})}</td>
                                        <td className="p-3 text-center align-top"><button onClick={() => handleEditProduct(product)} title="Edit Produk" className="text-sky-600 hover:text-sky-800 p-1.5 rounded-md hover:bg-sky-100 transition-colors"><Edit3 size={16} /></button><button onClick={() => handleDeleteProduct(product.id)} title="Hapus Produk" className="text-red-500 hover:text-red-700 p-1.5 rounded-md hover:bg-red-100 transition-colors ml-1"><Trash2 size={16} /></button></td>
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
                        totalItems={filteredAndSortedProducts.length}
                    />
                </div>
            )}
            {showModal && (<ProductFormModal product={editingProduct} categories={categories} onClose={() => setShowModal(false)} onSave={async () => { await refreshProducts(); setShowModal(false); }} apiBaseUrl={apiBaseUrl} />)}
        </div>
    );
};
export default ProductManagementView;
