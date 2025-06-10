"use client";

import Image from 'next/image';
import { CartItem } from '../types';
import { ShoppingCart, PlusCircle, MinusCircle, ArrowRight } from 'lucide-react';

// Definisikan props untuk komponen ini
interface CartSidebarProps {
  cart: CartItem[];
  updateQuantityInCart: (productId: number, change: number) => void;
  calculateTotal: () => number;
  handleCheckout: () => void; // <-- Prop yang hilang ditambahkan di sini
}

export default function CartSidebar({ cart, updateQuantityInCart, calculateTotal, handleCheckout }: CartSidebarProps) {
  return (
    <aside className="w-full lg:w-1/3 xl:w-1/4 flex-shrink-0 bg-white border-l border-slate-200">
      <div className="h-full flex flex-col">
        <div className="p-5 sm:p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2.5">
            <ShoppingCart className="text-sky-600" /> Keranjang
          </h2>
        </div>

        {cart.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center p-6">
            <ShoppingCart size={48} className="text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">Keranjang Anda kosong</p>
            <p className="text-xs text-slate-400 mt-1">Tambahkan produk untuk memulai.</p>
          </div>
        ) : (
          <div className="flex-grow overflow-y-auto p-2 sm:p-3 space-y-2">
            {cart.map(item => (
              <div key={item.id} className="flex items-center p-2 bg-slate-50/80 rounded-lg gap-2">
                {item.imageUrl && <Image src={item.imageUrl} alt={item.name} width={48} height={48} className="rounded-md object-cover flex-shrink-0"/>}
                <div className="flex-grow min-w-0">
                  <p className="text-sm font-semibold text-slate-700 truncate" title={item.name}>{item.name}</p>
                  <p className="text-xs text-slate-500">Rp{item.sellPrice.toLocaleString('id-ID')}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => updateQuantityInCart(item.id, -1)} className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100 transition-colors">
                    <MinusCircle size={20} />
                  </button>
                  <span className="text-sm font-medium text-slate-700 w-6 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantityInCart(item.id, 1)} disabled={item.quantity >= item.stock} className="p-1 text-green-500 hover:text-green-700 rounded-full hover:bg-green-100 disabled:text-slate-300 disabled:hover:bg-transparent transition-colors">
                    <PlusCircle size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {cart.length > 0 && (
          <div className="p-5 sm:p-6 mt-auto border-t border-slate-200 bg-white shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center mb-4">
              <p className="text-base font-semibold text-slate-800">Total:</p>
              <p className="text-2xl font-bold text-sky-600">
                Rp{calculateTotal().toLocaleString('id-ID')}
              </p>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-sky-600 text-white py-3 rounded-lg text-base font-semibold hover:bg-sky-700 focus:ring-4 focus:ring-sky-300 transition-colors flex items-center justify-center gap-2"
            >
              Lanjut ke Pembayaran <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
