// app/cashier/components/ProductCard.tsx
import Image from 'next/image';
import { Product } from '../types';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group">
      <div className="relative w-full h-40 sm:h-48">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            priority={product.id < 5}
            onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x400/e2e8f0/94a3b8?text=Error'; }}
          />
        ) : (
          <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
            <ShoppingCart size={48} />
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
            <span className="text-white font-bold text-lg px-3 py-1 bg-red-600 rounded">HABIS</span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h2 className="text-base font-semibold text-slate-800 mb-1 truncate" title={product.name}>
          {product.name}
        </h2>
        {product.category && (
          <p className="text-xs text-slate-500 mb-2 bg-slate-100 px-2 py-0.5 rounded-full w-fit">
            {product.category.name}
          </p>
        )}
        <p className="text-xl font-bold text-sky-600 mb-2">
          Rp{product.sellPrice.toLocaleString('id-ID')}
        </p>
        <p className={`text-sm mb-4 font-medium ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-orange-500' : 'text-red-600'}`}>
          Stok: {product.stock > 0 ? product.stock : 'Kosong'}
        </p>
        <button
          onClick={() => onAddToCart(product)}
          disabled={product.stock === 0}
          className={`w-full mt-auto text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 ease-in-out flex items-center justify-center gap-2 
            ${product.stock > 0
              ? 'bg-sky-500 hover:bg-sky-600 focus:ring-4 focus:ring-sky-300'
              : 'bg-slate-400 cursor-not-allowed'
            }`}
        >
          <ShoppingCart size={18} />
          <span>{product.stock > 0 ? 'Tambah' : 'Habis'}</span>
        </button>
      </div>
    </div>
  );
}
