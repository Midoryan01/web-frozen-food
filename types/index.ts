'use client';
interface Product {
  id: number;
  name: string;
  description: string | null;
  sellPrice: number | string | null;
  stock: number;
  sku: string | null;
  imageUrl: string | null;
  expiryDate: string | null;
  category: {
    id: number;
    name: string;
    description: string | null;
  } | null;
  categoryId: number | null;
  createdAt: string;
  updatedAt: string;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Interface for items in the cart
interface CartItem extends Product {
  quantity: number;
}
