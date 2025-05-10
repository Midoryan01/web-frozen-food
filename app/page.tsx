'use client';
import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart, Heart, Search, Plus } from "lucide-react";

// Type definition for product based on Prisma schema
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

const ProductCard = ({ product }: { product: Product }) => {
  // Handle image URL
  const imageUrl = product.imageUrl || "https://placehold.co/300x200?text=No+Image";

  const formatsellPrice = (sellPrice: number | string | null) => {
    if (sellPrice === null || sellPrice === undefined || isNaN(Number(sellPrice))) return "0";
    
    const numericsellPrice = typeof sellPrice === "string" ? parseFloat(sellPrice) : sellPrice;
    return new Intl.NumberFormat("id-ID", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numericsellPrice);
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md transition-transform duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full">
      <div className="relative h-48 bg-gray-200">
        <div className="absolute top-2 right-2 z-10">
          <button className="bg-white p-1.5 rounded-full shadow hover:bg-gray-100">
            <Heart size={18} className="text-gray-500 hover:text-red-500" />
          </button>
        </div>
        <div className="h-full w-full relative">
          <img
            src={imageUrl}
            alt={product.name}
            className="object-cover w-full h-full"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://placehold.co/300x200?text=No+Image";
            }}
          />
        </div>
      </div>

      <div className="p-4 flex-grow flex flex-col">
        {product.category && (
          <span className="text-xs font-medium text-blue-600 uppercase">
            {product.category.name}
          </span>
        )}

        <h3 className="font-medium text-gray-900 mt-1 text-lg truncate">
          {product.name}
        </h3>

        {product.sku && (
          <div className="mt-1 text-xs text-gray-500">SKU: {product.sku}</div>
        )}

        <p className="text-gray-500 text-sm mt-1 line-clamp-2 flex-grow">
          {product.description || "No description available"}
        </p>

        <div className="mt-3 flex items-center justify-between">
          <span className="font-semibold text-gray-900">
            Rp {formatsellPrice(product.sellPrice)}
          </span>
          <span
            className={`text-xs ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}
          >
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </span>
        </div>

        <button
          className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-md flex items-center justify-center hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={product.stock <= 0}
        >
          <ShoppingCart size={16} className="mr-2" />
          Add to Cart
        </button>

        {product.expiryDate && (
          <div className="mt-2 text-xs text-gray-500">
            Expires: {new Date(product.expiryDate).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
};

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | "all">("all");
  const [pagination, setPagination] = useState<Meta | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          search: searchTerm,
          categoryId: selectedCategory === "all" ? "" : String(selectedCategory),
          page: "1", // Hardcoded for now, you will need to handle pagination
          limit: "10",
        });
        const res = await fetch(`/api/products?${params.toString()}`);

        if (!res.ok) throw new Error("Failed to fetch products");

        const data = await res.json();
        setProducts(data.data);
        setPagination(data.meta);

        const uniqueCategories = data.data.reduce((acc: { id: number; name: string }[], product: Product) => {
          if (product.category && !acc.some((cat) => cat.id === product.category.id)) {
            acc.push({ id: product.category.id, name: product.category.name });
          }
          return acc;
        }, []);

        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [searchTerm, selectedCategory]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    const matchesCategory =
      selectedCategory === "all" || product.categoryId === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-blue-600">Inventory System</h1>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
              </div>

              <Link
                href="/products/new"
                className="bg-blue-600 text-white py-2 px-4 rounded-md flex items-center hover:bg-blue-700 transition-colors"
              >
                <Plus size={18} className="mr-1" />
                Add Product
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Categories</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${
                selectedCategory === "all" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              All
            </button>

            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${
                  selectedCategory === category.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No products found.</p>
        )}
      </main>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 py-4">
          <button
            disabled={pagination.page <= 1}
            className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400"
          >
            Prev
          </button>
          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            disabled={pagination.page >= pagination.totalPages}
            className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;