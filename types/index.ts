// types/index.ts

// --- TIPE DATA DASAR (berdasarkan skema Prisma) ---
export interface Category {
  id: number;
  name: string;
  description?: string | null;
}

export interface Product {
  id: number;
  name: string;
  sku: string | null;
  buyPrice: number;
  sellPrice: number;
  stock: number;
  description: string | null;
  supplier: string | null;
  expiryDate: string;
  imageUrl: string | null;
  categoryId: number | null;
  category: Category | null;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  username: string;
  fullName: string;
  role: 'ADMIN' | 'KASIR';
  isActive: boolean;
  createdAt: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  product: Pick<Product, "id" | "name" | "sku" | "imageUrl" | "buyPrice">;
  quantity: number;
  buyPrice: number;
  sellPrice: number;
  subtotal: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerName: string | null;
  cashierId: number;
  cashier: User;
  orderDate: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  totalAmount: number;
  paymentMethod: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface StockLog {
  id: number;
  product: Pick<Product, 'name' | 'sku'>;
  quantity: number;
  type: 'PURCHASE' | 'SALE' | 'ADJUSTMENT' | 'SPOILAGE' | 'RETURN_CUSTOMER' | 'RETURN_SUPPLIER';
  user: Pick<User, 'fullName'>;
  notes: string | null;
  createdAt: string;
}

// --- TIPE UNTUK API & UI ---
export interface ApiMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  meta?: ApiMeta;
  message?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

// --- TIPE UNTUK DASHBOARD ---
export interface SalesDataPoint {
  date: string;
  totalSales: number;
}

export interface TopProductDataPoint {
  name: string;
  quantitySold: number;
}

// --- TIPE UNTUK NAVIGASI DASHBOARD ---
export type Page = 'dashboard' | 'products' | 'categories' | 'transactions' | 'sales_report' | 'stock_logs' | 'users';