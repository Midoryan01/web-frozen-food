
/**
 * File ini berisi semua definisi tipe data (interface)
 * yang digunakan di seluruh aplikasi kasir.
 * Memusatkannya di sini membuatnya mudah untuk diimpor dan dikelola.
 */

export interface Category {
  id: number;
  name: string;
  description?: string | null;
}

export interface Product {
  id: number;
  name: string;
  sku?: string | null;
  sellPrice: number;
  stock: number;
  imageUrl?: string | null;
  category?: Category | null;
}

export interface ApiMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}



export interface CartItem extends Product {
  quantity: number;
}

export interface Filters {
  search: string;
  category: string;
  sortBy: string;
}

export interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
}

export interface CartSidebarProps {
  cart: CartItem[];
  onUpdateCart: (productId: number, change: number) => void;
  onCheckout: () => void;
}


export interface CartSidebarProps {
  cart: CartItem[];
  onUpdateCart: (productId: number, change: number) => void;
  onCheckout: () => void;
}


export interface CartSidebarProps {
  cart: CartItem[];
  updateQuantityInCart: (productId: number, change: number) => void;
  calculateTotal: () => number;
  handleCheckout: () => void;
}

export interface Category {
  id: number;
  name: string;
  description?: string | null;
}

export interface Product {
  id: number;
  name: string;
  sku?: string | null;
  sellPrice: number;
  stock: number;
  imageUrl?: string | null;
  category?: Category | null;
}

export interface ApiMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  meta: ApiMeta;
  message?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface TransactionDetails {
  orderId: string;
  transactionDate: Date;
  items: CartItem[];
  totalAmount: number;
  paymentMethod: string;
  cashReceived?: number;
  changeGiven?: number;
}
