"use client";

import { useState, useEffect, FormEvent, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation'; // Untuk navigasi ke halaman pembayaran
import { Search, X, ShoppingCart, PlusCircle, MinusCircle, Trash2, ArrowRight } from 'lucide-react'; // Menggunakan ikon dari Lucide

// Definisikan tipe data (tetap sama)
interface Category {
  id: number;
  name: string;
  description?: string | null;
}
interface Product {
  id: number;
  name: string;
  sku?: string | null;
  sellPrice: number;
  stock: number;
  imageUrl?: string | null;
  category?: Category | null;
}
interface ApiMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
interface ApiResponse {
  data: Product[];
  meta: ApiMeta;
  message?: string;
}
interface CartItem extends Product {
  quantity: number;
}

// Komponen untuk icon loading sederhana
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-full">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-sky-500"></div>
  </div>
);

// Komponen untuk produk item
const ProductCard = ({ product, onAddToCart }: { product: Product, onAddToCart: (product: Product) => void }) => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl group">
    <div className="relative w-full h-48 sm:h-56">
      {product.imageUrl ? (
        <Image
          src={product.imageUrl}
          alt={product.name}
          layout="fill"
          objectFit="cover"
          className="group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
          priority={product.id < 5} // Prioritaskan beberapa gambar awal
        />
      ) : (
        <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
          <ShoppingCart size={48} />
        </div>
      )}
      {product.stock === 0 && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <span className="text-white font-bold text-lg px-3 py-1 bg-red-600 rounded">HABIS</span>
        </div>
      )}
    </div>
    <div className="p-5 flex flex-col flex-grow">
      <h2 className="text-lg md:text-xl font-semibold text-slate-800 mb-1 truncate" title={product.name}>
        {product.name}
      </h2>
      {product.category && (
        <p className="text-xs text-slate-500 mb-2 bg-slate-100 px-2 py-0.5 rounded-full w-fit">
          {product.category.name}
        </p>
      )}
      <p className="text-2xl font-bold text-sky-600 mb-2">
        Rp{product.sellPrice.toLocaleString('id-ID')}
      </p>
      <p className={`text-sm mb-4 font-medium ${product.stock > 5 ? 'text-green-600' : product.stock > 0 ? 'text-orange-500' : 'text-red-600'}`}>
        Stok: {product.stock > 0 ? product.stock : 'Kosong'}
      </p>
      <button
        onClick={() => onAddToCart(product)}
        disabled={product.stock === 0}
        className={`w-full mt-auto text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 ease-in-out flex items-center justify-center gap-2
          ${product.stock > 0
            ? 'bg-sky-500 hover:bg-sky-600 focus:ring-4 focus:ring-sky-300 transform hover:-translate-y-0.5'
            : 'bg-slate-400 cursor-not-allowed'
          }`}
      >
        <ShoppingCart size={18} />
        {product.stock > 0 ? 'Tambah' : 'Habis'}
      </button>
    </div>
  </div>
);


export default function CashierPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<ApiMeta | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limitPerPage, setLimitPerPage] = useState<number>(12);
  const [cart, setCart] = useState<CartItem[]>([]);
  // const [customerName, setCustomerName] = useState<string>(''); // Bisa diaktifkan jika perlu

  const router = useRouter(); // Inisialisasi router

  const fetchProducts = useMemo(() => async (page = currentPage, limit = limitPerPage, search = searchTerm) => {
    setIsLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search.trim()) {
        queryParams.append('search', search.trim());
      }
      const response = await fetch(`/api/products?${queryParams.toString()}`);
      const result: ApiResponse = await response.json();
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, limitPerPage, searchTerm]); // <- searchTerm dipindah ke dependency fetchProducts

  useEffect(() => {
    fetchProducts(currentPage, limitPerPage, searchTerm);
  }, [fetchProducts, currentPage, limitPerPage, searchTerm]); // Tambahkan searchTerm di sini agar search langsung trigger fetch

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCurrentPage(1);
    // fetchProducts(1, limitPerPage, searchTerm); // Sudah ditangani oleh useEffect
  };

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
      } else {
        if (product.stock > 0) {
          return [...prevCart, { ...product, quantity: 1 }];
        }
        alert(`${product.name} habis!`);
        return prevCart;
      }
    });
  };

  const updateQuantityInCart = (productId: number, change: number) => {
    setCart(prevCart => {
        const itemIndex = prevCart.findIndex(item => item.id === productId);
        if (itemIndex === -1) return prevCart;

        const currentItem = prevCart[itemIndex];
        const newQuantity = currentItem.quantity + change;

        if (newQuantity <= 0) { // Hapus item jika kuantitas <= 0
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
    // Simpan keranjang ke localStorage agar bisa diakses di halaman pembayaran
    localStorage.setItem('frozenFoodCart', JSON.stringify(cart));
    localStorage.setItem('frozenFoodCartTotal', calculateTotal().toString());
    // localStorage.setItem('frozenFoodCustomerName', customerName); // Jika customerName diaktifkan

    router.push('/cashier/payment'); // Arahkan ke halaman pembayaran
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-sky-700 text-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">🛒 Kasir Frozen Food</h1>
           {/* Form Pencarian dipindah ke header untuk aksesibilitas */}
           <form onSubmit={handleSearchSubmit} className="mt-3 sm:mt-0 flex gap-2 w-full sm:w-auto sm:max-w-xs">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="p-2.5 pl-10 border border-sky-500 rounded-lg w-full text-sm text-slate-900 bg-sky-100 focus:ring-2 focus:ring-sky-300 focus:border-sky-400"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-sky-500" />
            </div>
            {/* <button type="submit" className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">
              Cari
            </button> */}
          </form>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Kolom Produk */}
        <div className="lg:w-2/3 xl:w-3/4">
          {isLoading && <LoadingSpinner />}
          {error && <p className="text-center text-red-600 bg-red-100 p-4 rounded-lg shadow">Error: {error}</p>}
          {!isLoading && !error && products.length === 0 && (
            <p className="text-center text-slate-600 text-lg py-10">Tidak ada produk yang ditemukan. Coba kata kunci lain.</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
            ))}
          </div>

          {meta && meta.totalPages > 1 && !isLoading && (
            <div className="mt-8 flex justify-center items-center gap-2 sm:gap-3">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 sm:px-4 sm:py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors text-sm font-medium"
              >
                Sebelumnya
              </button>
              <span className="text-slate-700 text-sm">
                Hal <strong className="text-sky-600">{meta.page}</strong> / {meta.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(meta.totalPages, prev + 1))}
                disabled={currentPage === meta.totalPages}
                className="px-3 py-2 sm:px-4 sm:py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors text-sm font-medium"
              >
                Berikutnya
              </button>
            </div>
          )}
        </div>

        {/* Kolom Keranjang & Checkout (Sidebar) */}
        <aside className="lg:w-1/3 xl:w-1/4">
          <div className="p-5 sm:p-6 bg-white rounded-xl shadow-2xl border border-slate-200 sticky top-24"> {/* Sesuaikan top jika header berubah tinggi */}
            <h2 className="text-xl sm:text-2xl font-bold mb-5 text-slate-800 border-b border-slate-200 pb-3 flex items-center gap-2">
              <ShoppingCart className="text-sky-600" /> Keranjang
            </h2>
            {cart.length === 0 ? (
              <p className="text-slate-500 text-center py-6">Keranjang Anda masih kosong.</p>
            ) : (
              <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-1 -mr-1custom-scrollbar"> {/* Custom scrollbar jika diperlukan */}
                {cart.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg shadow-sm gap-2">
                    <div className="flex items-center gap-3 flex-grow min-w-0">
                      {item.imageUrl && (
                        <Image src={item.imageUrl} alt={item.name} width={48} height={48} className="rounded-md object-cover flex-shrink-0"/>
                      )}
                      <div className="min-w-0 flex-grow">
                        <p className="text-sm font-semibold text-slate-700 truncate" title={item.name}>{item.name}</p>
                        <p className="text-xs text-slate-500">Rp{item.sellPrice.toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                      <button onClick={() => updateQuantityInCart(item.id, -1)} className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100 transition-colors">
                        <MinusCircle size={20} />
                      </button>
                      <span className="text-sm font-medium text-slate-700 w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantityInCart(item.id, 1)} disabled={item.quantity >= item.stock} className="p-1 text-green-500 hover:text-green-700 rounded-full hover:bg-green-100 disabled:text-slate-300 disabled:hover:bg-transparent transition-colors">
                        <PlusCircle size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {cart.length > 0 && (
              <div className="mt-6 pt-5 border-t border-slate-200">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-lg font-semibold text-slate-800">Total:</p>
                  <p className="text-xl sm:text-2xl font-bold text-sky-600">
                    Rp{calculateTotal().toLocaleString('id-ID')}
                  </p>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-sky-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-sky-700 focus:ring-4 focus:ring-sky-300 transition-colors flex items-center justify-center gap-2"
                >
                  Lanjut ke Pembayaran <ArrowRight size={20} />
                </button>
              </div>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}