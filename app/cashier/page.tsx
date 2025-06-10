// app/cashier/page.tsx
"use client";

import { useState, useEffect, FormEvent, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react'; // <-- 1. Impor useSession
import { Product, CartItem, Category, ApiMeta, ApiResponse } from './types';

// Import komponen-komponen
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import ProductGrid from './components/ProductGrid';
import CartSidebar from './components/CartSidebar';

// --- MOCK DATA KATEGORI (Sesuai permintaan Anda) ---
const mockCategories: Category[] = [
    { id: 1, name: 'Makanan Beku' },
    { id: 2, name: 'Minuman' },
    { id: 3, name: 'Bumbu Dapur' },
    { id: 4, name: 'Snack' },
];

export default function CashierPage() {
  const { data: session, status } = useSession(); 
  const router = useRouter();

  // State untuk data dan UI
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState<ApiMeta | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  // State untuk filter, pencarian, dan paginasi
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limitPerPage] = useState<number>(16);

  // Fungsi untuk mengambil data produk dari API
  const fetchProducts = useCallback(async (page: number, limit: number, search: string, categoryId: number | null) => {
    setIsLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search.trim()) queryParams.append('search', search.trim());
      if (categoryId) queryParams.append('categoryId', categoryId.toString());
      
      const response = await fetch(`/api/products?${queryParams.toString()}`);
      const result: ApiResponse<Product[]> = await response.json();

      if (!response.ok) throw new Error(result.message || 'Gagal mengambil data produk');
      
      setProducts(result.data);
      setMeta(result.meta);
    } catch (err: any) {
      setError(err.message);
      setProducts([]);
      setMeta(null);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Effect untuk memuat data dan memeriksa otentikasi
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }

    if (status === 'authenticated') {
      const handler = setTimeout(() => {
          fetchProducts(currentPage, limitPerPage, searchTerm, selectedCategory);
      }, 300);

      setCategories(mockCategories);
      
      return () => {
          clearTimeout(handler);
      };
    }
  }, [fetchProducts, currentPage, limitPerPage, searchTerm, selectedCategory, status, router]);

  // Handler untuk pencarian
  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  // Handler untuk mengubah kategori
  const handleCategoryChange = (categoryId: number | null) => {
    setCurrentPage(1);
    setSelectedCategory(categoryId);
  };

  // Logika keranjang (tidak berubah)
  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        if (existingItem.quantity < product.stock) {
          return prevCart.map(item =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        alert(`Stok ${product.name} tidak mencukupi! Sisa ${product.stock}.`);
        return prevCart;
      }
      if (product.stock > 0) {
        return [...prevCart, { ...product, quantity: 1 }];
      }
      alert(`${product.name} habis!`);
      return prevCart;
    });
  };

  const updateQuantityInCart = (productId: number, change: number) => {
    setCart(prevCart => {
        const itemIndex = prevCart.findIndex(item => item.id === productId);
        if (itemIndex === -1) return prevCart;
        const currentItem = prevCart[itemIndex];
        const newQuantity = currentItem.quantity + change;
        if (newQuantity <= 0) {
            return prevCart.filter(item => item.id !== productId);
        }
        if (newQuantity > currentItem.stock) {
            alert(`Stok ${currentItem.name} hanya ${currentItem.stock}.`);
            return prevCart;
        }
        const updatedCart = [...prevCart];
        updatedCart[itemIndex] = { ...currentItem, quantity: newQuantity };
        return updatedCart;
    });
  };

  const calculateTotal = () => cart.reduce((total, item) => total + item.sellPrice * item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Keranjang belanja kosong!");
      return;
    }
    localStorage.setItem('frozenFoodCart', JSON.stringify(cart));
    localStorage.setItem('frozenFoodCartTotal', calculateTotal().toString());
    router.push('/cashier/payment');
  };
  
  // Tampilkan loading saat sesi masih diperiksa
  if (status === 'loading') {
      return (
        <div className="flex h-screen w-full items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-sky-500"></div>
        </div>
      );
  }
  
  // Tampilkan halaman hanya jika sudah terautentikasi
  if (status === 'authenticated') {
    return (
      <div className="flex h-screen w-full flex-col bg-slate-50 font-sans">
        <div className="sticky top-0 z-30 w-full bg-white/80 shadow-sm backdrop-blur-md">
          {/* 3. Mengirim data sesi yang benar ke Header */}
          <Header session={session} /> 
          <FilterBar 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              handleSearchSubmit={handleSearchSubmit}
              categories={categories} 
              selectedCategory={selectedCategory} 
              handleCategoryChange={handleCategoryChange}
          />
        </div>

        <div className="mx-auto flex w-full max-w-screen-2xl flex-1 flex-col lg:flex-row overflow-hidden">
          <main className="w-full lg:w-2/3 xl:w-3/4 overflow-y-auto p-4 sm:p-6 lg:p-8">
              <ProductGrid 
                  products={products}
                  isLoading={isLoading}
                  error={error}
                  onAddToCart={addToCart}
                  meta={meta}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
              />
          </main>
          <CartSidebar 
              cart={cart}
              updateQuantityInCart={updateQuantityInCart}
              calculateTotal={calculateTotal}
              handleCheckout={handleCheckout}
          />
        </div>
      </div>
    );
  }

  // Return null atau komponen lain saat status 'unauthenticated' sebelum redirect
  return null;
}
