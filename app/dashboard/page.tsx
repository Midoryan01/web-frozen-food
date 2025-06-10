// app/dashboard/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react'; // TAMBAHKAN: Impor hook useSession
import { useRouter } from 'next/navigation';  // TAMBAHKAN: Impor hook useRouter

// Impor Tipe Data
import type { Page } from './components/types/navigation';
import type { Product, Category, Order, StockLog, User, SalesDataPoint, TopProductDataPoint, ApiResponse, DashboardViewProps } from './types';

// Impor Komponen Layout & Tampilan
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './views/DashboardView';
import ProductManagementView from './views/ProductManagementView';
import TransactionView from './views/TransactionView';
import SalesReportView from './views/SalesReportView';
import StockLogView from './views/StockLogView';
import UserManagementView from './views/UserManagementView';

// Impor Ikon
import { AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  // TAMBAHKAN: Gunakan hook useSession dan useRouter
  const { data: session, status } = useSession();
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States untuk semua data
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stockLogs, setStockLogs] = useState<StockLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [salesSummary, setSalesSummary] = useState<SalesDataPoint[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductDataPoint[]>([]);

  // --- Fungsi Fetch Data Generik ---
  const fetchData = useCallback(
    async <T,>(url: string, setter: React.Dispatch<React.SetStateAction<T>>, dataKey: string = 'data') => {
      setError(null);
      try {
        const response = await fetch(url);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Gagal mengambil data dari ${url}. Status: ${response.status}`);
        }
        const result: ApiResponse<T> = await response.json();
        const dataToSet = result[dataKey as keyof typeof result];

        if (Array.isArray(setter([] as any)) && !Array.isArray(dataToSet)) {
          console.warn(`Respons API untuk ${url} tidak berupa array seperti yang diharapkan.`, result);
          setter([] as unknown as T);
          return;
        }

        if (dataToSet !== undefined) {
          setter(dataToSet);
        } else {
          setter(result as T);
        }
      } catch (e: any) {
        console.error(`Error saat fetch ${url}:`, e);
        setError(e.message);
        setter([] as unknown as T);
      }
    },
    []
  );

  // --- Fungsi Fetch Spesifik ---
  const fetchProducts = useCallback(async () => {
    await fetchData<Product[]>('/api/products?limit=200', (data) => {
      const normalized = Array.isArray(data)
        ? data.map(p => ({ ...p, buyPrice: Number(p.buyPrice), sellPrice: Number(p.sellPrice) }))
        : [];
      setProducts(normalized);
    });
  }, [fetchData]);

  const fetchCategories = useCallback(async () => {
    await fetchData<Category[]>('/api/category', setCategories);
  }, [fetchData]);

  const fetchOrders = useCallback(async () => {
    await fetchData<Order[]>('/api/orders?limit=100&include=items,cashier', (data: Order[]) => {
      setOrders(Array.isArray(data) ? data.map(o => ({ ...o, totalAmount: Number(o.totalAmount) })) : []);
    });
  }, [fetchData]);

  const processDashboardData = useCallback((allOrders: Order[]) => {
    if (!Array.isArray(allOrders) || allOrders.length === 0) {
      setSalesSummary([]);
      setTopProducts([]);
      return;
    }

    const completedOrders = allOrders.filter(o => o.status === 'COMPLETED');

    const dailySales: { [key: string]: number } = {};
    completedOrders.forEach(order => {
      const date = new Date(order.orderDate).toISOString().split('T')[0];
      dailySales[date] = (dailySales[date] || 0) + Number(order.totalAmount);
    });
    const salesTrendData = Object.entries(dailySales)
      .map(([date, totalSales]) => ({ date, totalSales }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setSalesSummary(salesTrendData);

    const productSales: { [key: string]: { id: string, name: string, quantitySold: number } } = {};
    completedOrders.flatMap(o => o.items).forEach(item => {
      const productId = String(item.productId);
      if (!productSales[productId]) {
        productSales[productId] = { id: productId, name: item.product.name, quantitySold: 0 };
      }
      productSales[productId].quantitySold += Number(item.quantity);
    });
    const topProductsData = Object.values(productSales)
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 5);

    setTopProducts(topProductsData);
  }, []);

  const fetchStockLogs = useCallback(async () => {
    await fetchData<StockLog[]>('/api/stocklog', setStockLogs);
  }, [fetchData]);

  const fetchUsers = useCallback(async () => {
    await fetchData<User[]>('/api/users', setUsers);
  }, [fetchData]);


  // TAMBAHKAN: useEffect untuk memeriksa status otentikasi
  useEffect(() => {
    // Jika status masih loading, jangan lakukan apa-apa
    if (status === 'loading') {
      return;
    }
    // Jika tidak ada sesi (pengguna tidak terotentikasi), redirect ke halaman login
    if (!session) {
      router.replace('/login'); // Ganti '/login' dengan rute halaman login Anda
    }
  }, [session, status, router]);

  useEffect(() => {
    const loadDataForPage = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (currentPage === 'products') {
          await Promise.all([fetchProducts(), fetchCategories()]);
        } else if (currentPage === 'transactions' || currentPage === 'sales_report') {
          await fetchOrders();
        } else if (currentPage === 'dashboard') {
          await fetchOrders();
        } else if (currentPage === 'stock_logs') {
          await fetchStockLogs();
        } else if (currentPage === 'users') {
          await fetchUsers();
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };
    // Hanya jalankan fetch data jika pengguna sudah terotentikasi
    if (status === 'authenticated') {
      loadDataForPage();
    }
  }, [currentPage, fetchProducts, fetchCategories, fetchOrders, fetchStockLogs, fetchUsers, status]); // TAMBAHKAN: 'status' sebagai dependensi

  useEffect(() => {
    if (currentPage === 'dashboard' && orders.length > 0) {
      processDashboardData(orders);
    }
  }, [orders, currentPage, processDashboardData]);

  // TAMBAHKAN: Tampilkan loading global saat sesi sedang diperiksa atau jika belum ada sesi
  // Ini mencegah "flash" konten sebelum redirect.
  if (status === 'loading' || !session) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-sky-600"></div>
      </div>
    );
  }

  const renderPage = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-sky-600"></div></div>;
    }
    if (error) {
      return <div className="text-red-500 bg-red-100 p-4 rounded-md shadow flex items-center gap-2"><AlertCircle size={20} /> <span>Error: {error}</span></div>;
    }

    switch (currentPage) {
      case 'dashboard':
        const completedOrders = orders.filter(o => o.status === 'COMPLETED');
        const totalRevenue = completedOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
        return (
          <DashboardView
            salesSummary={salesSummary}
            topProducts={topProducts}
            totalRevenue={totalRevenue}
            totalTransactions={completedOrders.length}
          />
        );
      case 'products':
        return <ProductManagementView initialProducts={products} categories={categories} refreshProducts={fetchProducts} apiBaseUrl="/api" />;
      case 'transactions':
        return <TransactionView orders={orders} isLoading={isLoading} fetchOrders={fetchOrders} />;
      case 'sales_report':
        return <SalesReportView orders={orders} />;
      case 'stock_logs':
        return <StockLogView stockLogs={stockLogs} isLoading={isLoading} fetchStockLogs={fetchStockLogs} />;
      case 'users':
        return <UserManagementView initialUsers={users} refreshUsers={fetchUsers} apiBaseUrl="/api" />;
      default:
        return <div>Halaman tidak ditemukan</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* UBAH: Gunakan nama dari sesi, dengan fallback ke 'User' atau 'Admin' jika tidak ada */}
        <Header userName={session?.user?.name || 'Admin'} />
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};