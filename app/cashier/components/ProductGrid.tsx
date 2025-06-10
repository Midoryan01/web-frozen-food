// app/cashier/components/ProductGrid.tsx
import { Product, ApiMeta } from '../types';
import ProductCard from './ProductCard';
import Pagination from './Pagination';
import { ShoppingCart } from 'lucide-react';

// Komponen untuk icon loading sederhana
const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-full p-10">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-sky-500"></div>
    </div>
);

interface ProductGridProps {
    products: Product[];
    isLoading: boolean;
    error: string | null;
    onAddToCart: (product: Product) => void;
    meta: ApiMeta | null;
    currentPage: number;
    onPageChange: (page: number) => void;
}

export default function ProductGrid({ products, isLoading, error, onAddToCart, meta, currentPage, onPageChange }: ProductGridProps) {
    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <p className="text-center text-red-600 bg-red-100 p-4 rounded-lg shadow m-8">Error: {error}</p>;
    }

    if (products.length === 0) {
        return (
          <div className='text-center py-20 px-6 text-slate-500'>
              <ShoppingCart size={48} className='mx-auto mb-4 text-slate-400'/>
              <h3 className='text-xl font-semibold text-slate-700'>Produk Tidak Ditemukan</h3>
              <p className='mt-1'>Coba ubah kata kunci pencarian atau filter Anda.</p>
          </div>
        );
    }
    
    return (
        <div className="flex-grow overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 sm:gap-6">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
                ))}
            </div>

            {meta && meta.totalPages > 1 && (
                <Pagination 
                    currentPage={currentPage}
                    totalPages={meta.totalPages}
                    onPageChange={onPageChange}
                />
            )}
        </div>
    );
}
