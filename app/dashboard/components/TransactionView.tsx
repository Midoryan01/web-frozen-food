// app/dashboard/components/TransactionView.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Search, ListFilter, AlertTriangle, Eye, RefreshCw, ListOrdered } from 'lucide-react';
import type { Order, ApiResponse } from '../types'; // Impor tipe
import OrderDetailModal from './OrderDetailModal'; // Impor modal detail pesanan

interface TransactionViewProps {
  orders: Order[]; // Pesanan awal dari parent
  isLoading: boolean; // Status loading dari parent
  fetchOrders: () => Promise<void>; // Fungsi untuk refresh pesanan dari parent
}

const TransactionView: React.FC<TransactionViewProps> = ({ orders: initialOrders, isLoading: parentIsLoading, fetchOrders }) => {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [isLoading, setIsLoading] = useState(parentIsLoading); // Bisa juga punya state loading internal
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>(''); // '', 'PENDING', 'COMPLETED', 'CANCELLED'
  const [dateRange, setDateRange] = useState<{ start: string, end: string }>({ start: '', end: '' });

  useEffect(() => {
    setOrders(initialOrders.map(o => ({ ...o, totalAmount: Number(o.totalAmount) })));
    setIsLoading(parentIsLoading);
  }, [initialOrders, parentIsLoading]);
  
  // Fungsi filter dan sort bisa ditambahkan di sini jika diperlukan di sisi client
  // Atau lebih baik jika dilakukan di sisi server melalui parameter API
  const filteredOrders = React.useMemo(() => {
    return orders
      .filter(order => {
        const searchTermLower = searchTerm.toLowerCase();
        const matchesSearch = (
          order.orderNumber.toLowerCase().includes(searchTermLower) ||
          (order.customerName && order.customerName.toLowerCase().includes(searchTermLower)) ||
          order.cashier.fullName.toLowerCase().includes(searchTermLower) ||
          order.paymentMethod.toLowerCase().includes(searchTermLower)
        );
        const matchesStatus = filterStatus ? order.status === filterStatus : true;
        
        let matchesDate = true;
        if (dateRange.start && dateRange.end) {
            const orderDate = new Date(order.orderDate);
            const startDate = new Date(dateRange.start);
            const endDate = new Date(dateRange.end);
            // Set endDate to end of day for inclusive range
            endDate.setHours(23, 59, 59, 999); 
            matchesDate = orderDate >= startDate && orderDate <= endDate;
        } else if (dateRange.start) {
            matchesDate = new Date(order.orderDate) >= new Date(dateRange.start);
        } else if (dateRange.end) {
            const endDate = new Date(dateRange.end);
            endDate.setHours(23, 59, 59, 999);
            matchesDate = new Date(order.orderDate) <= endDate;
        }

        return matchesSearch && matchesStatus && matchesDate;
      })
      .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()); // Urutkan terbaru dulu
  }, [orders, searchTerm, filterStatus, dateRange]);

  const handleRefresh = async () => {
    setIsLoading(true);
    await fetchOrders(); // Panggil fungsi dari parent
    // setIsLoading(false); // Parent akan mengatur isLoading global
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Riwayat Transaksi</h1>
        <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="bg-sky-600 text-white px-4 py-2.5 rounded-lg hover:bg-sky-700 transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-70"
        >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} /> Refresh Data
        </button>
      </div>

      {/* Filter Section */}
      <div className="p-4 bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Search Input */}
          <div className="lg:col-span-2">
            <label htmlFor="searchTerm" className="block text-xs font-medium text-slate-600 mb-1">Cari Transaksi</label>
            <div className="relative">
              <input
                type="text"
                id="searchTerm"
                placeholder="No. Order, Pelanggan, Kasir, Metode Bayar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2.5 pl-10 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            </div>
          </div>
          
          {/* Filter Status */}
          <div>
            <label htmlFor="filterStatus" className="block text-xs font-medium text-slate-600 mb-1">Status Pesanan</label>
            <select
              id="filterStatus"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white text-sm"
            >
              <option value="">Semua Status</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Filter Tanggal (Sederhana) */}
          <div className="grid grid-cols-2 gap-2">
             <div>
                <label htmlFor="startDate" className="block text-xs font-medium text-slate-600 mb-1">Dari Tanggal</label>
                <input 
                    type="date" 
                    id="startDate"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({...prev, start: e.target.value}))}
                    className="w-full p-2.5 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
                />
             </div>
             <div>
                <label htmlFor="endDate" className="block text-xs font-medium text-slate-600 mb-1">Sampai Tanggal</label>
                <input 
                    type="date" 
                    id="endDate"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({...prev, end: e.target.value}))}
                    className="w-full p-2.5 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
                />
             </div>
          </div>
          {/*
          <button 
            // onClick={() => { // TODO: Terapkan Filter Tanggal & Status via API Call jika diperlukan }
            className="bg-sky-500 text-white px-4 py-2.5 rounded-lg hover:bg-sky-600 transition-colors flex items-center justify-center gap-2 text-sm lg:mt-0 mt-2"
          >
            <ListFilter size={16} /> Terapkan Filter
          </button>
          */}
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-600"></div>
            <p className="ml-3 text-slate-600">Memuat transaksi...</p>
        </div>
      )}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200 flex items-center gap-2">
            <AlertTriangle size={20} /> <span>Gagal memuat transaksi: {error}</span>
        </div>
      )}

      {!isLoading && filteredOrders.length === 0 && !error && (
         <div className="text-center py-10 bg-white rounded-lg shadow">
            <ListOrdered size={48} className="mx-auto text-slate-400 mb-4"/>
            <p className="text-slate-500 text-lg">Tidak ada transaksi ditemukan.</p>
            {(searchTerm || filterStatus || dateRange.start || dateRange.end) && <p className="text-sm text-slate-400">Coba ubah filter atau kata kunci pencarian Anda.</p>}
         </div>
      )}

      {filteredOrders.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="w-full min-w-[1000px]"> {/* Min-width untuk scroll horizontal jika perlu */}
            <thead className="bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">No. Order</th>
                <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tanggal</th>
                <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Pelanggan</th>
                <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Kasir</th>
                <th className="p-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Metode Bayar</th>
                <th className="p-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="p-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-3 text-sm text-sky-600 font-medium align-middle">{order.orderNumber}</td>
                  <td className="p-3 text-sm text-slate-500 align-middle">{new Date(order.orderDate).toLocaleString('id-ID', {year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}</td>
                  <td className="p-3 text-sm text-slate-700 align-middle">{order.customerName || 'Pelanggan Umum'}</td>
                  <td className="p-3 text-sm text-slate-500 align-middle">{order.cashier.fullName}</td>
                  <td className="p-3 text-sm text-slate-700 text-right align-middle">Rp{order.totalAmount.toLocaleString('id-ID')}</td>
                  <td className="p-3 text-sm text-slate-500 align-middle">{order.paymentMethod}</td>
                  <td className="p-3 text-center align-middle">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full
                      ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-700'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-3 text-center align-middle">
                    <button 
                        onClick={() => setSelectedOrder(order)} 
                        title="Lihat Detail Transaksi"
                        className="text-sky-600 hover:text-sky-800 p-1.5 rounded-md hover:bg-sky-100 transition-colors flex items-center justify-center gap-1 mx-auto text-xs"
                    >
                        <Eye size={16} /> Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

export default TransactionView;
