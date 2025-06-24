"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// PERBAIKAN: Pastikan semua tipe diimpor dari satu sumber
import type {
  Page,
  Product,
  Category,
  StockLog,
  User,
  SalesDataPoint,
  ApiResponse,
} from "@/types";
import type { Order, TopProductDataPoint } from "./types";

// Impor Komponen Layout & Tampilan
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import DashboardView from "./views/DashboardView";
import ProductManagementView from "./views/ProductManagementView";
import CategoryManagementView from "./views/CategoryManagementView";
import TransactionView from "./views/TransactionView";
import SalesReportView from "./views/SalesReportView";
import StockLogView from "./views/StockLogView";
import UserManagementView from "./views/UserManagementView";

// Impor Ikon
import { AlertCircle } from "lucide-react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State untuk navigasi, dikontrol oleh Sidebar
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States untuk semua data yang mungkin dibutuhkan oleh berbagai view
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stockLogs, setStockLogs] = useState<StockLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // States khusus untuk dashboard view
  const [salesSummary, setSalesSummary] = useState<SalesDataPoint[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductDataPoint[]>([]);
  const [summaryStats, setSummaryStats] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
  });

  // PERBAIKAN: Fungsi fetch data generik yang lebih aman secara tipe
  const fetchData = useCallback(
    async <T,>(
      url: string,
      setter: React.Dispatch<React.SetStateAction<T[]>>, // Pastikan setter mengharapkan array
      dataKey: string = "data"
    ) => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message ||
              `Gagal mengambil data dari ${url}. Status: ${response.status}`
          );
        }
        const result = await response.json();
        // Cek apakah data ada di dalam 'dataKey' atau langsung di root
        const dataToSet = result[dataKey as keyof typeof result] ?? result;

        // Pastikan data yang di-set adalah array
        if (Array.isArray(dataToSet)) {
          setter(dataToSet as T[]);
        } else {
          console.warn(
            `Data dari ${url} bukan array, mengeset ke array kosong.`
          );
          setter([]);
        }
      } catch (e: any) {
        setError(e.message);
        setter([]); // Jika error, set ke array kosong
      }
    },
    []
  );

  // Kumpulan fungsi fetch spesifik (tidak perlu diubah)
  const fetchProducts = useCallback(
    () => fetchData<Product>("/api/products?limit=1000", setProducts),
    [fetchData]
  );
  const fetchCategories = useCallback(
    () => fetchData<Category>("/api/category", setCategories),
    [fetchData]
  );
  const fetchOrders = useCallback(
    () => fetchData<Order>("/api/orders", setOrders),
    [fetchData]
  );
  const fetchStockLogs = useCallback(
    () => fetchData<StockLog>("/api/stocklog", setStockLogs),
    [fetchData]
  );
  const fetchUsers = useCallback(
    () => fetchData<User>("/api/users", setUsers),
    [fetchData]
  );

  const fetchDashboardSummary = useCallback(async () => {
    try {
      const response = await fetch("/api/dashboard/summary");
      if (!response.ok) throw new Error("Gagal mengambil ringkasan dashboard.");
      const result: ApiResponse<{
        summary: any;
        salesTrend: SalesDataPoint[];
        topProducts: TopProductDataPoint[];
      }> = await response.json();
      if (result.data) {
        setSummaryStats(result.data.summary);
        setSalesSummary(result.data.salesTrend);
        setTopProducts(result.data.topProducts);
      }
    } catch (e: any) {
      setError(e.message);
    }
  }, []);

  // Effect untuk memeriksa sesi login
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  // Effect untuk memuat data berdasarkan halaman yang aktif
  useEffect(() => {
    if (status !== "authenticated") return;

    const loadDataForPage = async () => {
      setIsLoading(true);
      setError(null);
      switch (currentPage) {
        case "dashboard":
          await fetchDashboardSummary();
          break;
        case "products":
          await Promise.all([fetchProducts(), fetchCategories()]);
          break;
        case "categories":
          await fetchCategories();
          break;
        case "transactions":
          await fetchOrders();
          break;
        case "sales_report":
          await fetchOrders();
          break;
        case "stock_logs":
          await fetchStockLogs();
          break;
        case "users":
          await fetchUsers();
          break;
      }
      setIsLoading(false);
    };

    loadDataForPage();
  }, [
    currentPage,
    status,
    fetchProducts,
    fetchCategories,
    fetchOrders,
    fetchStockLogs,
    fetchUsers,
    fetchDashboardSummary,
  ]);

  // Fungsi untuk merender view yang sesuai
  const renderPageContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-sky-600"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-red-600 bg-red-100 p-4 rounded-md shadow flex items-center gap-2">
          <AlertCircle size={20} /> <span>Error: {error}</span>
        </div>
      );
    }

    switch (currentPage) {
      case "dashboard":
        return (
          <DashboardView
            salesSummary={salesSummary}
            topProducts={topProducts}
            totalRevenue={summaryStats.totalRevenue}
            totalTransactions={summaryStats.totalTransactions}
          />
        );
      case "products":
        return (
          <ProductManagementView
            initialProducts={products}
            categories={categories}
            refreshProducts={fetchProducts}
            apiBaseUrl="/api"
          />
        );
      case "categories":
        return (
          <CategoryManagementView
            initialCategories={categories}
            refreshCategories={fetchCategories}
            apiBaseUrl="/api"
          />
        );
      case "transactions":
        return (
          <TransactionView
            orders={orders}
            isLoading={isLoading}
            fetchOrders={fetchOrders}
          />
        );
      case "sales_report":
        return <SalesReportView orders={orders} />;
      case "stock_logs":
        return (
          <StockLogView
            stockLogs={stockLogs}
            isLoading={isLoading}
            fetchStockLogs={fetchStockLogs}
          />
        );
      case "users":
        return (
          <UserManagementView
            initialUsers={users}
            refreshUsers={fetchUsers}
            apiBaseUrl="/api"
          />
        );
      default:
        return <div>Pilih menu dari sidebar</div>;
    }
  };

  if (status === "loading" || !session) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div className="flex-1 flex flex-col">
        <Header userName={session.user?.fullName || "Admin"} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {renderPageContent()}
        </main>
      </div>
    </div>
  );
}
