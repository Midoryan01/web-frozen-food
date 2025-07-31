"use client";

import React, { useState, useMemo } from 'react';
import { Search, FileDown, Printer } from 'lucide-react'; 
import { generateSalesReportPDF } from '../../utils/pdfGenerator';
import type { Order } from '../types';
import Script from 'next/script';
import PaginationControls from '../components/PaginationControls';
import { useSession } from 'next-auth/react';

declare const XLSX: any;

const SalesReportView: React.FC<{ orders: Order[] }> = ({ orders }) => {
    // State untuk filter
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState<{ start: string, end: string }>({ start: '', end: '' });

    // State untuk navigasi
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const { data: session } = useSession();
    const userName = session?.user?.fullName || 'ADMIN';

    // Logika untuk memfilter item penjualan
    const filteredSoldItems = useMemo(() => {
        if (!Array.isArray(orders)) return [];
        return orders
            .filter(o => o.status === 'COMPLETED')
            .flatMap(o => o.items.map(item => {
                const sellPrice = Number(item.sellPrice) || 0;
                const buyPrice = Number(item.buyPrice) || 0;
                const quantity = Number(item.quantity) || 0;
                const subtotal = sellPrice * quantity;
                const profit = (sellPrice - buyPrice) * quantity;
                return { ...item, buyPrice, sellPrice, subtotal, profit, orderDate: o.orderDate, orderNumber: o.orderNumber };
            }))
            .filter(item => {
                let matchesDate = true;
                if (dateRange.start && dateRange.end) {
                    const itemDate = new Date(item.orderDate);
                    const startDate = new Date(dateRange.start);
                    const endDate = new Date(dateRange.end);
                    endDate.setHours(23, 59, 59, 999);
                    matchesDate = itemDate >= startDate && itemDate <= endDate;
                }
                if (!matchesDate) return false;

                const searchTermLower = searchTerm.toLowerCase();
                const matchesSearch = (item.product?.name?.toLowerCase() || '').includes(searchTermLower) ||
                                        (item.product?.sku?.toLowerCase() || '').includes(searchTermLower) ||
                                        item.orderNumber.toLowerCase().includes(searchTermLower);
                return matchesSearch;
            })
            .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
    }, [orders, dateRange, searchTerm]);
    
    // Logika paginasi
    const totalPages = Math.ceil(filteredSoldItems.length / itemsPerPage);
    const paginatedSoldItems = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredSoldItems.slice(startIndex, endIndex);
    }, [filteredSoldItems, currentPage, itemsPerPage]);

    const onPageChange = (page: number) => {
        if (page > 0 && page <= totalPages) setCurrentPage(page);
    };
    const onItemsPerPageChange = (size: number) => {
        setItemsPerPage(size);
        setCurrentPage(1);
    };

    const totalRevenue = filteredSoldItems.reduce((sum, item) => sum + item.subtotal, 0);
    const totalProfit = filteredSoldItems.reduce((sum, item) => sum + item.profit, 0);

    // Fungsi ekspor Excel
    const handleExportToExcel = () => {
        if (typeof XLSX === 'undefined') {
            alert("Library untuk ekspor Excel belum termuat. Silakan coba lagi sebentar.");
            return;
        }
        const dataToExport = filteredSoldItems.map(item => ({
            "Tanggal": new Date(item.orderDate).toLocaleDateString('id-ID'),
            "No. Order": item.orderNumber, "Nama Produk": item.product.name, "SKU": item.product.sku || '-', "Qty": item.quantity,
            "Harga Jual": item.sellPrice, "Harga Beli": item.buyPrice, "Subtotal": item.subtotal, "Profit": item.profit,
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        XLSX.utils.sheet_add_aoa(worksheet, [ [], ["", "", "", "", "", "", "TOTAL", totalRevenue, totalProfit] ], { origin: -1 });
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Penjualan");
        const fileName = `Laporan_Penjualan_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    };


    // Handler untuk tombol print PDF
            const handlePrintPdf = () => {
            if (filteredSoldItems.length === 0) {
                alert('Tidak ada data untuk dicetak.');
                return;
            }
            generateSalesReportPDF(filteredSoldItems, dateRange, totalRevenue, totalProfit, userName);
            };

    return (
        <>
            <Script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js" strategy="lazyOnload" />
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Laporan Penjualan</h1>
                    <div className="flex items-center gap-2">
                        <button onClick={handlePrintPdf} className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg shadow-sm hover:bg-red-700 transition-colors text-sm font-medium">
                            <Printer size={16} /> Cetak PDF
                        </button>
                        <button onClick={handleExportToExcel} className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700 transition-colors text-sm font-medium">
                            <FileDown size={16} /> Cetak Excel
                        </button>
                    </div>
                </div>
                
                <div className="p-4 bg-white rounded-lg shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="searchReport" className="block text-xs font-medium text-slate-600 mb-1">Cari Laporan</label>
                        <div className="relative">
                            <input type="text" id="searchReport" placeholder="Nama produk, SKU, atau No. Order..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2 pl-9 border border-slate-300 rounded-lg text-sm"/>
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label htmlFor="startDateReport" className="block text-xs font-medium text-slate-600 mb-1">Dari</label>
                            <input type="date" id="startDateReport" value={dateRange.start} onChange={e => setDateRange(prev => ({...prev, start: e.target.value}))} className="w-full p-2 border border-slate-300 rounded-lg text-sm"/>
                        </div>
                        <div>
                            <label htmlFor="endDateReport" className="block text-xs font-medium text-slate-600 mb-1">Sampai</label>
                            <input type="date" id="endDateReport" value={dateRange.end} onChange={e => setDateRange(prev => ({...prev, end: e.target.value}))} className="w-full p-2 border border-slate-300 rounded-lg text-sm"/>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-md border"><h3 className="text-sm text-slate-500">Total Pendapatan (Sesuai Filter)</h3><p className="text-2xl font-bold text-green-600">Rp{totalRevenue.toLocaleString('id-ID')}</p></div>
                    <div className="bg-white p-4 rounded-lg shadow-md border"><h3 className="text-sm text-slate-500">Total Keuntungan (Sesuai Filter)</h3><p className="text-2xl font-bold text-sky-600">Rp{totalProfit.toLocaleString('id-ID')}</p></div>
                </div>

                <div className="bg-white rounded-lg shadow-md border border-slate-200">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead className="bg-slate-100">
                                <tr>
                                    <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase">Tanggal</th>
                                    <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase">No. Order</th>
                                    <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase">Produk</th>
                                    <th className="p-3 text-right text-xs font-semibold text-slate-500 uppercase">Qty</th>
                                    <th className="p-3 text-right text-xs font-semibold text-slate-500 uppercase">Harga Jual</th>
                                    <th className="p-3 text-right text-xs font-semibold text-slate-500 uppercase">Harga Beli</th>
                                    <th className="p-3 text-right text-xs font-semibold text-slate-500 uppercase">Profit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {paginatedSoldItems.map((item, index) => (
                                    <tr key={`${item.id}-${index}`}>
                                        <td className="p-3 text-sm text-slate-500">{new Date(item.orderDate).toLocaleDateString('id-ID')}</td>
                                        <td className="p-3 text-sm text-sky-600">{item.orderNumber}</td>
                                        <td className="p-3 text-sm font-medium text-slate-700">{item.product.name}</td>
                                        <td className="p-3 text-sm text-slate-500 text-right">{item.quantity}</td>
                                        <td className="p-3 text-sm text-slate-500 text-right">Rp{item.sellPrice.toLocaleString('id-ID')}</td>
                                        <td className="p-3 text-sm text-slate-500 text-right">Rp{item.buyPrice.toLocaleString('id-ID')}</td>
                                        <td className="p-3 text-sm font-semibold text-green-600 text-right">Rp{item.profit.toLocaleString('id-ID')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredSoldItems.length === 0 && <p className="text-center text-slate-500 py-10">Tidak ada item penjualan ditemukan sesuai filter.</p>}
                    </div>
                    <PaginationControls
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={onPageChange}
                        itemsPerPage={itemsPerPage}
                        onItemsPerPageChange={onItemsPerPageChange}
                        totalItems={filteredSoldItems.length}
                    />
                </div>
            </div>
        </>
    );
};

export default SalesReportView;