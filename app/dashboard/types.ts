// app/dashboard/types.ts

// --- TIPE DATA (berdasarkan skema Prisma Anda) ---
export interface Category {
  id: number;
  name: string;
  description?: string | null;
  _count?: {  
    products: number;
  };
}

export interface Product {
  id: number;
  name: string;
  sku?: string | null;
  buyPrice: number;
  sellPrice: number;
  stock: number;
  description?: string | null;
  supplier?: string | null;
  expiryDate: string;
  imageUrl?: string | null;
  categoryId?: number | null;
  category?: Category | null;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  username: string;
  fullName: string;
  role: "ADMIN" | "KASIR";
  isActive: boolean;
  createdAt: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  product: Pick<Product, "name" | "sku" | "supplier"|"buyPrice" | "imageUrl">;
  quantity: number;
  buyPrice: number;
  sellPrice: number;
  subtotal: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerName?: string | null;
  cashierId: number;
  cashier: User;
  orderDate: string;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  totalAmount: number;
  paymentMethod: string;
  items: OrderItem[];
  buyPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface StockLog {
  id: number;
  product: Pick<Product, "name" | "sku"|"supplier">;
  quantity: number;
  type:
    | "PURCHASE"
    | "SALE"
    | "ADJUSTMENT"
    | "SPOILAGE"
    | "RETURN_CUSTOMER"
    | "RETURN_SUPPLIER";
  user: Pick<User, "fullName">;
  notes?: string | null;
  createdAt: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  meta?: any; // Untuk paginasi jika ada
}

export interface SalesDataPoint {
  date: string;
  totalSales: number;
}

export interface TopProductDataPoint {
  id: string;
  name: string;
  quantitySold: number;
  totalSold: number;
}

export type DashboardViewProps = {
  salesSummary: SalesDataPoint[];
  topProducts: TopProductDataPoint[];
  totalRevenue: number;
  totalTransactions: number;
};


