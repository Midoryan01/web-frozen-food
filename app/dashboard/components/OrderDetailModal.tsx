// app/dashboard/components/OrderDetailModal.tsx
"use client";

import React from 'react';
import Image from 'next/image';
import { XCircle, Package, ShoppingCart, User, Calendar, CreditCardIcon, Hash, Info, UserCircle, CheckCircle } from 'lucide-react';
import type { Order, OrderItem } from '../types'; // Impor tipe

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  // Pastikan sellPrice dan subtotal adalah angka untuk kalkulasi/formatting
  const validatedItems = order.items.map(item => ({
    ...item,
    sellPrice: Number(item.sellPrice),
    subtotal: Number(item.subtotal),
  }));

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 print:hidden">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col">
        <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-200">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ShoppingCart size={26} className="text-sky-600"/> Detail Pesanan: #{order.orderNumber}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <XCircle size={28} />
          </button>
        </div>

        <div className="overflow-y-auto pr-2 custom-scrollbar flex-grow space-y-6">
            {/* Informasi Umum Pesanan */}
            <section className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-700 mb-3">Informasi Umum</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <InfoItem icon={Hash} label="No. Order" value={order.orderNumber} />
                    <InfoItem icon={Calendar} label="Tanggal Pesan" value={new Date(order.orderDate).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })} />
                    <InfoItem icon={User} label="Pelanggan" value={order.customerName || 'Pelanggan Umum'} />
                    <InfoItem icon={UserCircle} label="Kasir" value={order.cashier.fullName} />
                    <InfoItem icon={CreditCardIcon} label="Metode Bayar" value={order.paymentMethod} />
                    <InfoItem 
                        icon={order.status === 'COMPLETED' ? CheckCircle : order.status === 'CANCELLED' ? XCircle : Info} 
                        label="Status" 
                        value={order.status}
                        valueClassName={`font-semibold 
                            ${order.status === 'COMPLETED' ? 'text-green-600' :
                              order.status === 'PENDING' ? 'text-yellow-600' :
                              order.status === 'CANCELLED' ? 'text-red-600' : 
                              'text-slate-600'}`}
                    />
                </div>
            </section>

            {/* Item Pesanan */}
            <section>
                <h3 className="text-lg font-semibold text-slate-700 mb-3">Item yang Dipesan</h3>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-100">
                        <tr>
                            <th className="p-2.5 text-left font-semibold text-slate-600">Produk</th>
                            <th className="p-2.5 text-center font-semibold text-slate-600 w-20">Kuantitas</th>
                            <th className="p-2.5 text-right font-semibold text-slate-600 w-32">Harga Satuan</th>
                            <th className="p-2.5 text-right font-semibold text-slate-600 w-32">Subtotal</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                        {validatedItems.map((item: OrderItem) => (
                            <tr key={item.id}>
                            <td className="p-2.5 text-slate-700">
                                <div className="flex items-center gap-2">
                                {item.product.imageUrl ? (
                                    <Image src={item.product.imageUrl} alt={item.product.name} width={32} height={32} className="rounded object-cover"/>
                                ) : (
                                    <Package size={20} className="text-slate-400"/>
                                )}
                                <span>{item.product.name} <span className="text-xs text-slate-400">({item.product.sku || 'N/A'})</span></span>
                                </div>
                            </td>
                            <td className="p-2.5 text-slate-600 text-center">{item.quantity}</td>
                            <td className="p-2.5 text-slate-600 text-right">Rp{item.sellPrice.toLocaleString('id-ID')}</td>
                            <td className="p-2.5 text-slate-800 text-right font-medium">Rp{item.subtotal.toLocaleString('id-ID')}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Total Keseluruhan */}
            <section className="mt-6 pt-4 border-t border-slate-300">
                <div className="flex justify-end items-center gap-4">
                    <span className="text-md font-semibold text-slate-700">Total Keseluruhan:</span>
                    <span className="text-xl font-bold text-sky-600">
                        Rp{Number(order.totalAmount).toLocaleString('id-ID')}
                    </span>
                </div>
                {/* Bisa tambahkan info diskon, pajak, dll jika ada */}
            </section>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 mt-auto">
          {/* Tombol Aksi Tambahan (misal: Cetak Ulang Struk, Batalkan Pesanan jika status memungkinkan) */}
          {/* <button 
            type="button" 
            onClick={() => alert(`Cetak ulang struk: ${order.orderNumber}`)}
            className="px-4 py-2 text-sm font-medium text-sky-700 bg-sky-100 hover:bg-sky-200 rounded-lg transition-colors"
          >
            Cetak Ulang Struk
          </button> */}
          <button 
            type="button" 
            onClick={onClose} 
            className="px-5 py-2.5 text-sm font-medium text-white bg-slate-600 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

// Komponen helper untuk item info di modal detail
const InfoItem = ({ icon: Icon, label, value, valueClassName = "text-slate-800" }: { icon: React.ElementType, label: string, value: string | number, valueClassName?: string }) => (
    <div className="flex items-start gap-2">
        <Icon className="h-4 w-4 text-sky-600 mt-0.5 flex-shrink-0" />
        <div>
            <span className="font-medium text-slate-500">{label}:</span> <span className={valueClassName}>{value}</span>
        </div>
    </div>
);


export default OrderDetailModal;
