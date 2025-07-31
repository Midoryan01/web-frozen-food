"use client";

import React, { useState, useMemo } from 'react';
import { Search, Eye, RefreshCw, ListOrdered } from 'lucide-react';
import type { Order } from '../types';
import OrderDetailModal from '../components/OrderDetailModal';
import PaginationControls from '../components/PaginationControls'; 

interface TransactionViewProps {
    orders: Order[];
    isLoading: boolean;
    fetchOrders: () => Promise<void>;
}

const TransactionView: React.FC<TransactionViewProps> = ({ orders, isLoading, fetchOrders }) => {
    // State untuk filter
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [dateRange, setDateRange] = useState<{ start: string, end: string }>({ start: '', end: '' });

    // 2. State untuk navigasi
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Memoized-logic untuk memfilter pesanan
    const filteredOrders = useMemo(() => {
        if (!Array.isArray(orders)) return [];
        return orders
            .filter(order => {
                const searchTermLower = searchTerm.toLowerCase();
                const matchesSearch = (
                    order.orderNumber?.toLowerCase().includes(searchTermLower) ||
                    (order.customerName && order.customerName.toLowerCase().includes(searchTermLower)) ||
                    order.cashier?.fullName?.toLowerCase().includes(searchTermLower)
                );
                const matchesStatus = filterStatus ? order.status === filterStatus : true;
                
                let matchesDate = true;
                if (dateRange.start && dateRange.end) {
                    const orderDate = new Date(order.orderDate);
                    const startDate = new Date(dateRange.start);
                    const endDate = new Date(dateRange.end);
                    endDate.setHours(23, 59, 59, 999); 
                    matchesDate = orderDate >= startDate && orderDate <= endDate;
                }
                return matchesSearch && matchesStatus && matchesDate;
            })
            .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
    }, [orders, searchTerm, filterStatus, dateRange]);

    // 3. Logika untuk memotong data sesuai halaman
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const paginatedOrders = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredOrders.slice(startIndex, endIndex);
    }, [filteredOrders, currentPage, itemsPerPage]);

    // 4. Handler untuk navigasi
    const onPageChange = (page: number) => {
        if (page > 0 && page <= totalPages) setCurrentPage(page);
    };
    const onItemsPerPageChange = (size: number) => {
        setItemsPerPage(size);
        setCurrentPage(1);
    };

    const handleRefresh = async () => {
        await fetchOrders();
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Riwayat Transaksi</h1>
                <button onClick={handleRefresh} disabled={isLoading} className="bg-sky-600 text-white px-4 py-2.5 rounded-lg hover:bg-sky-700 transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-70">
                    <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} /> Refresh Data
                </button>
            </div>

            <div className="p-4 bg-white rounded-lg shadow-sm border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div className="lg:col-span-2">
                        <label htmlFor="searchTerm" className="block text-xs font-medium text-slate-600 mb-1">Cari Transaksi</label>
                        <div className="relative">
                            <input type="text" id="searchTerm" placeholder="No. Order, Pelanggan, atau Kasir..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-2.5 pl-10 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 text-sm" />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="filterStatus" className="block text-xs font-medium text-slate-600 mb-1">Status Pesanan</label>
                        <select id="filterStatus" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg shadow-sm bg-white text-sm">
                            <option value="">Semua Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label htmlFor="startDate" className="block text-xs font-medium text-slate-600 mb-1">Dari</label>
                            <input type="date" id="startDate" value={dateRange.start} onChange={(e) => setDateRange(prev => ({...prev, start: e.target.value}))} className="w-full p-2.5 border border-slate-300 rounded-lg shadow-sm text-sm" />
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-xs font-medium text-slate-600 mb-1">Sampai</label>
                            <input type="date" id="endDate" value={dateRange.end} onChange={(e) => setDateRange(prev => ({...prev, end: e.target.value}))} className="w-full p-2.5 border border-slate-300 rounded-lg shadow-sm text-sm" />
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md border border-slate-200">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px]">
                        <thead className="bg-slate-100 border-b border-slate-200">
                            <tr>
                                <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase">No. Order</th>
                                <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase">Tanggal</th>
                                <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase">Pelanggan</th>
                                <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase">Kasir</th>
                                <th className="p-3 text-right text-xs font-semibold text-slate-500 uppercase">Total</th>
                                <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase">Metode Bayar</th>
                                <th className="p-3 text-center text-xs font-semibold text-slate-500 uppercase">Status</th>
                                <th className="p-3 text-center text-xs font-semibold text-slate-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {/* 5. Gunakan data yang sudah dipotong */}
                            {paginatedOrders.map(order => (
                                <tr key={order.id} className="hover:bg-slate-50/50">
                                    <td className="p-3 text-sm text-sky-600 font-medium">{order.orderNumber}</td>
                                    <td className="p-3 text-sm text-slate-500">{new Date(order.orderDate).toLocaleString('id-ID', {year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}</td>
                                    <td className="p-3 text-sm text-slate-700">{order.customerName || 'Pelanggan Umum'}</td>
                                    <td className="p-3 text-sm text-slate-500">{order.cashier.fullName}</td>
                                    <td className="p-3 text-sm text-slate-700 text-right">Rp{order.totalAmount.toLocaleString('id-ID')}</td>
                                    <td className="p-3 text-sm text-slate-500">{order.paymentMethod}</td>
                                    <td className="p-3 text-center"><span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{order.status}</span></td>
                                    <td className="p-3 text-center"><button onClick={() => setSelectedOrder(order)} title="Lihat Detail" className="text-sky-600 hover:text-sky-800 p-1.5 rounded-md hover:bg-sky-100 flex items-center gap-1 mx-auto text-xs"><Eye size={16} /> Detail</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredOrders.length === 0 && !isLoading && (
                        <div className="text-center py-10"><ListOrdered size={48} className="mx-auto text-slate-400 mb-4"/><p className="text-slate-500">Tidak ada transaksi ditemukan.</p></div>
                    )}
                </div>
                {/* 6. Tampilkan komponen navigasi */}
                <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                    itemsPerPage={itemsPerPage}
                    onItemsPerPageChange={onItemsPerPageChange}
                    totalItems={filteredOrders.length}
                />
            </div>
            {selectedOrder && <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
        </div>
    );
};
export default TransactionView;
