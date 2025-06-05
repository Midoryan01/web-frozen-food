"use client"; // Komponen ini akan menjadi Client Component untuk state management

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import ProductManagementView from './components/ProductManagementView';
import TransactionView from './components/TransactionView';
import type {
  Product,
  Category,
  Order,
  SalesDataPoint,
  TopProductDataPoint,
  DashboardSummaryData,
  ApiResponse
} from './types'; // Impor tipe dari file terpisah

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
    const result: ApiResponse<T> = await response.json();
    return result.data; 
  } catch (e: any) {
    console.error(`Error fetching ${url}:`, e);
    setError(e.message);
    return null;
  } finally {
    setIsLoading(false);
  }
}


export default function DashboardPage() {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'products' | 'transactions'>('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State untuk data
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // State untuk data dashboard
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummaryData | null>(null);
  const [salesTrend, setSalesTrend] = useState<SalesDataPoint[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductDataPoint[]>([]);

  const API_BASE_URL = '/api'; // Sesuaikan jika base URL API Anda berbeda

  const fetchProducts = useCallback(async () => {
    // Mengambil data dengan paginasi dari API.
    // Asumsi API Anda mendukung ?page=X&limit=Y
    // Dan responsnya adalah { data: Product[], meta: { total, page, limit, totalPages } }
    // Untuk manajemen, mungkin Anda ingin mengambil semua atau dengan paginasi yang besar.
    // Untuk contoh ini, kita ambil tanpa paginasi di ProductManagementView.
    // fetchData akan di-trigger oleh ProductManagementView.
    const fetchedProducts = await fetchData<Product[]>(`${API_BASE_URL}/products`, setIsLoading, setError);
    if (fetchedProducts) {
      setProducts(fetchedProducts.map(p => ({
        ...p,
        buyPrice: Number(p.buyPrice),
        sellPrice: Number(p.sellPrice),
        // Pastikan tipe data lain juga sesuai jika perlu konversi
      })));
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    const fetchedCategories = await fetchData<Category[]>(`${API_BASE_URL}/category`, setIsLoading, setError);
    if (fetchedCategories) {
      setCategories(fetchedCategories);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    // Asumsi API /api/orders mengembalikan data Order beserta item dan info kasir
    // Anda mungkin perlu parameter seperti ?includeItems=true&includeCashier=true
    const fetchedOrders = await fetchData<Order[]>(`${API_BASE_URL}/orders?limit=100&includeItems=true&includeCashier=true`, setIsLoading, setError);
    if (fetchedOrders) {
      setOrders(fetchedOrders.map(o => ({
        ...o,
        totalAmount: Number(o.totalAmount),
        // Konversi tipe data lain jika perlu
      })));
    }
  }, []);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Panggil beberapa endpoint atau satu endpoint summary
      // Contoh:
      // const summaryRes = await fetch(`${API_BASE_URL}/dashboard/summary`);
      // const trendRes = await fetch(`${API_BASE_URL}/dashboard/sales-trend?period=7d`);
      // const topProductsRes = await fetch(`${API_BASE_URL}/dashboard/top-products?limit=5`);

      // if (!summaryRes.ok || !trendRes.ok || !topProductsRes.ok) {
      //   throw new Error('Gagal mengambil data dashboard');
      // }

      // const summaryData: ApiResponse<DashboardSummaryData> = await summaryRes.json();
      // const trendData: ApiResponse<SalesDataPoint[]> = await trendRes.json();
      // const topProductsData: ApiResponse<TopProductDataPoint[]> = await topProductsRes.json();

      // setDashboardSummary(summaryData.data);
      // setSalesTrend(trendData.data);
      // setTopProducts(topProductsData.data);

      // Data dummy untuk sekarang, gantilah dengan fetch API di atas
      await new Promise(resolve => setTimeout(resolve, 300));
      setDashboardSummary({ totalRevenue: 5860000, totalOrders: 120, totalProductsSold: 350, lowStockItemsCount: 3 });
      setSalesTrend([
          { date: '2025-06-01', totalSales: 1200000 },
          { date: '2025-06-02', totalSales: 1500000 },
          { date: '2025-06-03', totalSales: 1350000 },
          { date: '2025-06-04', totalSales: 1700000 },
          { date: '2025-06-05', totalSales: 110000 }, // Typo? Seharusnya 1100000
      ]);
      setTopProducts([
          { id:1, name: 'Nugget Ayam Original', quantitySold: 150, totalRevenue: 5250000 },
          { id:2, name: 'Sosis Sapi Premium', quantitySold: 120, totalRevenue: 6000000 },
          { id:3, name: 'Kentang Goreng', quantitySold: 90, totalRevenue: 2520000 },
      ]);

    } catch (e: any) {
      console.error('Error fetching dashboard data:', e);
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentPage === 'products') {
      fetchProducts(); // ProductManagementView akan memanggil ini
      fetchCategories();
    } else if (currentPage === 'transactions') {
      fetchOrders();
    } else if (currentPage === 'dashboard') {
      fetchDashboardData();
    }
  // Hanya jalankan saat currentPage berubah, fungsi fetch akan dipanggil dari komponen anak jika perlu.
  // Atau, panggil semua fetch di sini dan teruskan data sebagai props. Untuk awal, ini lebih sederhana.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, fetchDashboardData]); // Hapus fetchProducts, fetchCategories, fetchOrders dari deps jika dipanggil di anak

  const renderPage = () => {
    // isLoading dan error sekarang dikelola oleh fetchData, tapi kita bisa punya loading global juga
    if (isLoading && currentPage === 'dashboard') return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-sky-600"></div></div>;
    if (error) return <div className="text-red-500 bg-red-100 p-4 rounded-md">Error: {error}</div>;

    switch (currentPage) {
      case 'dashboard':
        return <DashboardView 
                  summary={dashboardSummary} 
                  salesTrend={salesTrend} 
                  topProducts={topProducts} 
                  isLoading={isLoading} 
                />;
      case 'products':
        return <ProductManagementView 
                  initialProducts={products} // Kirim produk awal
                  categories={categories} 
                  fetchProducts={fetchProducts} // Kirim fungsi fetch untuk refresh
                  apiBaseUrl={API_BASE_URL}
                />;
      case 'transactions':
        return <TransactionView 
                  orders={orders} 
                  isLoading={isLoading && orders.length === 0} // Tampilkan loading jika orders kosong dan sedang fetch
                  fetchOrders={fetchOrders}
                />;
      default:
        return <DashboardView summary={dashboardSummary} salesTrend={salesTrend} topProducts={topProducts} isLoading={isLoading} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex antialiased text-slate-800">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div className="flex-1 flex flex-col">
        <Header /> {/* Anda bisa meneruskan nama user jika ada autentikasi */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
