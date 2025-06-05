// app/dashboard/components/ProductManagementView.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { PlusCircle, Edit3, Trash2, Search, Package, AlertTriangle, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react';
import type { Product, Category, ApiResponse } from '../types'; // Impor tipe
import ProductFormModal from './ProductFormModal'; // Impor modal form produk

interface ProductManagementViewProps {
  initialProducts: Product[]; // Produk awal yang mungkin sudah di-load oleh parent
  categories: Category[]; // Daftar kategori untuk dropdown di form
  fetchProducts: () => Promise<void>; // Fungsi untuk me-refresh daftar produk dari parent
  apiBaseUrl: string; // Base URL untuk API, misal /api
}

// Fungsi helper untuk fetch API (bisa juga dipisah ke file utils/api.ts)
async function fetchData<T>(url: string, setIsLoading: (loading: boolean) => void, setError: (error: string | null) => void): Promise<T | null> {
  setIsLoading(true);
  setError(null);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `Gagal mengambil data dari ${url}. Status: ${response.status}` }));
      throw new Error(errorData.message || `Gagal mengambil data dari ${url}`);
    }
    const result: ApiResponse<T> = await response.json(); // Asumsi API mengembalikan { data: [...] } atau T langsung jika bukan list
    // Jika API Anda mengembalikan objek dengan properti 'data' untuk list, gunakan result.data
    // Jika API mengembalikan array langsung, gunakan result
    // Untuk konsistensi dengan page.tsx, kita asumsikan ada properti 'data'
    return result.data || result as any; // Fallback jika result adalah data itu sendiri
  } catch (e: any) {
    console.error(`Error fetching ${url}:`, e);
    setError(e.message);
    return null;
  } finally {
    setIsLoading(false);
  }
}


const ProductManagementView: React.FC<ProductManagementViewProps> = ({ initialProducts, categories, fetchProducts: refreshProductsFromParent, apiBaseUrl }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Product | null; direction: 'ascending' | 'descending' }>({ key: 'name', direction: 'ascending' });

  // Jika initialProducts berubah (misalnya dari parent), update state lokal
  useEffect(() => {
    setProducts(initialProducts.map(p => ({
        ...p,
        buyPrice: Number(p.buyPrice), // Pastikan numerik
        sellPrice: Number(p.sellPrice), // Pastikan numerik
    })));
  }, [initialProducts]);

  const handleFetchProductsInternal = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    // Kita bisa memanggil fungsi dari parent, atau fetch langsung di sini jika lebih disukai
    // Untuk contoh ini, kita akan panggil fungsi dari parent untuk konsistensi
    // Namun, jika ProductManagementView bertanggung jawab penuh atas datanya, ia bisa fetch sendiri
    try {
      // Simulasi atau jika fetchProducts dari parent tidak mengembalikan data secara langsung:
      const fetchedProducts = await fetchData<Product[]>(`${apiBaseUrl}/products?sortBy=name&order=asc`, setIsLoading, setError);
      if (fetchedProducts) {
        setProducts(fetchedProducts.map(p => ({
          ...p,
          buyPrice: Number(p.buyPrice),
          sellPrice: Number(p.sellPrice),
        })));
      } else if (!initialProducts || initialProducts.length === 0) {
         // Jika fetch gagal dan initialProducts kosong, set produk jadi array kosong
         setProducts([]);
      }
      // Jika menggunakan refreshProductsFromParent, pastikan parent mengupdate initialProducts
      // await refreshProductsFromParent();
    } catch (e: any) {
        setError(e.message);
        setProducts([]); // Kosongkan jika error
    } finally {
        setIsLoading(false);
    }
  }, [apiBaseUrl, initialProducts]); // refreshProductsFromParent,

  // Panggil fetchProductsInternal saat komponen dimuat jika initialProducts kosong
   useEffect(() => {
    if (!initialProducts || initialProducts.length === 0) {
      handleFetchProductsInternal();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Hanya saat mount jika initialProducts kosong


  const filteredAndSortedProducts = React.useMemo(() => {
    let sortableProducts = [...products];
    if (sortConfig.key) {
      sortableProducts.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
        }
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'ascending' 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue);
        }
        // Untuk tipe lain atau null/undefined, bisa ditambahkan logic di sini
        return 0;
      });
    }
    if (!searchTerm) {
      return sortableProducts;
    }
    return sortableProducts.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.category?.name && product.category.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [products, searchTerm, sortConfig]);

  const requestSort = (key: keyof Product) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: keyof Product) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? <ChevronUp size={14} className="ml-1 inline-block"/> : <ChevronDown size={14} className="ml-1 inline-block"/>;
    }
    return null;
  };


  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDeleteProduct = async (productId: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus produk ini? Operasi ini tidak dapat dibatalkan.')) {
      setIsLoading(true);
      try {
        const response = await fetch(`${apiBaseUrl}/products/${productId}`, { method: 'DELETE' });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Gagal menghapus produk. Respons tidak valid.' }));
          throw new Error(errorData.message || 'Gagal menghapus produk');
        }
        // const result = await response.json(); // Biasanya respons DELETE 200/204 dengan body kosong atau pesan sukses
        // alert(result.message || 'Produk berhasil dihapus!');
        alert('Produk berhasil dihapus!');
        handleFetchProductsInternal(); // Refresh daftar produk
      } catch (e: any) {
        console.error('Error deleting product:', e);
        alert(`Error: ${e.message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Manajemen Produk</h1>
        <div className="flex gap-2">
            <button
                onClick={handleFetchProductsInternal}
                disabled={isLoading}
                className="bg-slate-200 text-slate-700 px-4 py-2.5 rounded-lg hover:bg-slate-300 transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50"
            >
                <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} /> Refresh
            </button>
            <button
                onClick={handleAddProduct}
                className="bg-sky-600 text-white px-4 py-2.5 rounded-lg hover:bg-sky-700 transition-colors flex items-center gap-2 text-sm font-medium"
            >
                <PlusCircle size={18} /> Tambah Produk
            </button>
        </div>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Cari berdasarkan nama, SKU, atau kategori..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 pl-10 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
      </div>

      {isLoading && products.length === 0 && (
        <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-600"></div>
            <p className="ml-3 text-slate-600">Memuat produk...</p>
        </div>
      )}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200 flex items-center gap-2">
            <AlertTriangle size={20} /> <span>Gagal memuat produk: {error}</span>
        </div>
      )}

      {!isLoading && filteredAndSortedProducts.length === 0 && !error && (
         <div className="text-center py-10 bg-white rounded-lg shadow">
            <Package size={48} className="mx-auto text-slate-400 mb-4"/>
            <p className="text-slate-500 text-lg">Tidak ada produk ditemukan.</p>
            {searchTerm && <p className="text-sm text-slate-400">Coba ubah kata kunci pencarian Anda.</p>}
         </div>
      )}

      {filteredAndSortedProducts.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="w-full min-w-[1000px]"> 
            <tbody className="bg-slate-100 border-b border-slate-200">
              <tr>
                <ThSortable name="Gambar" sortKey={null} requestSort={requestSort} sortConfig={sortConfig} className="w-20"/>
                <ThSortable name="Nama Produk" sortKey="name" requestSort={requestSort} sortConfig={sortConfig} />
                <ThSortable name="SKU" sortKey="sku" requestSort={requestSort} sortConfig={sortConfig} />
                <ThSortable name="Harga Jual" sortKey="sellPrice" requestSort={requestSort} sortConfig={sortConfig} align="right" />
                <ThSortable name="Stok" sortKey="stock" requestSort={requestSort} sortConfig={sortConfig} align="right" />
                <ThSortable name="Kategori" sortKey="category" requestSort={requestSort} sortConfig={sortConfig} /> 
                <ThSortable name="Tgl. Kadaluwarsa" sortKey="expiryDate" requestSort={requestSort} sortConfig={sortConfig} />
                <ThSortable name="Aksi" sortKey={null} requestSort={requestSort} sortConfig={sortConfig} className="w-28 text-center"/>
              </tr>
            </tbody>
            <tbody className="divide-y divide-slate-200">
              {filteredAndSortedProducts.map(product => (
                <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-3">
                    {product.imageUrl ? (
                      <Image src={product.imageUrl} alt={product.name} width={48} height={48} className="rounded-md object-cover" />
                    ) : (
                      <div className="w-12 h-12 bg-slate-200 rounded-md flex items-center justify-center text-slate-400"><Package size={24}/></div>
                    )}
                  </td>
                  <td className="p-3 text-sm text-slate-800 font-medium align-top">{product.name}</td>
                  <td className="p-3 text-sm text-slate-500 align-top">{product.sku || '-'}</td>
                  <td className="p-3 text-sm text-slate-700 text-right align-top">Rp{product.sellPrice.toLocaleString('id-ID')}</td>
                  <td className={`p-3 text-sm text-right align-top font-semibold ${product.stock < 10 ? 'text-red-600' : product.stock < 50 ? 'text-orange-500' : 'text-green-600'}`}>{product.stock}</td>
                  <td className="p-3 text-sm text-slate-500 align-top">{product.category?.name || '-'}</td>
                  <td className="p-3 text-sm text-slate-500 align-top">{new Date(product.expiryDate).toLocaleDateString('id-ID', {year: 'numeric', month: 'short', day: 'numeric'})}</td>
                  <td className="p-3 text-center align-top">
                    <button 
                        onClick={() => handleEditProduct(product)} 
                        title="Edit Produk"
                        className="text-sky-600 hover:text-sky-800 p-1.5 rounded-md hover:bg-sky-100 transition-colors">
                        <Edit3 size={18} />
                    </button>
                    <button 
                        onClick={() => handleDeleteProduct(product.id)} 
                        title="Hapus Produk"
                        className="text-red-500 hover:text-red-700 p-1.5 rounded-md hover:bg-red-100 transition-colors ml-1">
                        <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <ProductFormModal
          product={editingProduct}
          categories={categories}
          onClose={() => setShowModal(false)}
          onSave={() => {
            handleFetchProductsInternal(); // Refresh produk setelah simpan
            setShowModal(false);
          }}
          apiBaseUrl={apiBaseUrl}
        />
      )}
    </div>
  );
};


// Komponen helper untuk header tabel yang bisa di-sort
interface ThSortableProps {
    name: string;
    sortKey: keyof Product | null;
    requestSort: (key: keyof Product) => void;
    sortConfig: { key: keyof Product | null; direction: string };
    align?: 'left' | 'right' | 'center';
    className?: string;
}

const ThSortable: React.FC<ThSortableProps> = ({ name, sortKey, requestSort, sortConfig, align = 'left', className = '' }) => {
    const isSorted = sortConfig.key === sortKey;
    const directionIcon = isSorted ? (sortConfig.direction === 'ascending' ? <ChevronUp size={14} className="ml-1"/> : <ChevronDown size={14} className="ml-1"/>) : <ChevronUp size={14} className="ml-1 opacity-30"/>;
    
    return (
        <th 
            className={`p-3 text-${align} text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-200 transition-colors ${className}`}
            onClick={() => sortKey && requestSort(sortKey)}
        >
            <div className={`flex items-center ${align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start'}`}>
                {name} {sortKey && directionIcon}
            </div>
        </th>
    );
};


export default ProductManagementView;
