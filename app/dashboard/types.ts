// app/dashboard/types.ts

export interface Category {
  id: number;
  name: string;
  description?: string | null;
  createdAt: string; // ISO string date
  updatedAt: string; // ISO string date
}

export interface Product {
  id: number;
  name: string;
  sku?: string | null;
  buyPrice: number;
  sellPrice: number;
  stock: number;
  description?: string | null;
  supplier?: string | null; // Pertimbangkan untuk menjadikannya relasi jika Anda memiliki model Supplier
  expiryDate: string; // ISO string date
  imageUrl?: string | null;
  categoryId?: number | null;
  category?: Category | null;
  createdAt: string; // ISO string date
  updatedAt: string; // ISO string date
  // orderItems: OrderItem[]; // Mungkin tidak perlu di-load semua di list produk
  // stockLogs: StockLog[]; // Mungkin tidak perlu di-load semua di list produk
}

export interface User { // Hanya field yang mungkin relevan untuk ditampilkan
  id: number;
  username: string;
  fullName: string;
  role: string; // 'ADMIN' | 'KASIR'
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  product: Pick<Product, 'id' | 'name' | 'sku' | 'imageUrl'>; // Hanya ambil field produk yang relevan untuk item pesanan
  quantity: number;
  buyPrice: number; // Harga beli saat transaksi
  sellPrice: number; // Harga jual saat transaksi
  subtotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerName?: string | null;
  cashierId: number;
  cashier: Pick<User, 'id' | 'fullName' | 'username'>; // Hanya ambil field kasir yang relevan
  orderDate: string; // ISO string date
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED'; // Sesuai enum OrderStatus Anda
  totalAmount: number;
  amountPaid?: number | null;
  changeAmount?: number | null;
  paymentMethod: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

// Tipe untuk data grafik
export interface SalesDataPoint {
  date: string; // Format YYYY-MM-DD atau label lainnya
  totalSales: number;
}

export interface TopProductDataPoint {
  id: number; // ID Produk
  name: string;
  quantitySold: number;
  totalRevenue: number; // Mungkin juga ingin menampilkan pendapatan dari produk ini
}

// Tipe untuk ringkasan data dashboard secara keseluruhan
export interface DashboardSummaryData {
  totalRevenue: number;
  totalOrders: number;
  totalProductsSold: number;
  activeCustomers?: number; // Opsional
  lowStockItemsCount?: number; // Opsional
}

// Tipe untuk respons API umum (jika API Anda memiliki struktur standar)
export interface ApiResponse<T> {
  data: T;
  message?: string;
  meta?: { // Untuk paginasi
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
