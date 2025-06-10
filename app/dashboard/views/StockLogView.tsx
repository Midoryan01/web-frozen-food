"use client";

import React, { useState, useMemo } from 'react';
import type { StockLog } from '../types';
import { RefreshCw, Search, ArrowUpCircle, ArrowDownCircle, FileDown } from 'lucide-react';
import Script from 'next/script'; // Diperlukan untuk library eksternal

declare const XLSX: any;

interface StockLogViewProps {
    stockLogs: StockLog[];
    isLoading: boolean;
    fetchStockLogs: () => Promise<void>;
}

const StockLogView: React.FC<StockLogViewProps> = ({ stockLogs, isLoading, fetchStockLogs }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState<{ start: string, end: string }>({ start: '', end: '' });
    const [changeType, setChangeType] = useState<'in' | 'out' | ''>('');
    const [logType, setLogType] = useState<StockLog['type'] | ''>('');
    
    // Logika filter tidak diubah
    const filteredLogs = useMemo(() => {
        if (!Array.isArray(stockLogs)) return [];
        return stockLogs
            .filter(log => {
                const matchesSearch = log.product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                      (log.product.sku && log.product.sku.toLowerCase().includes(searchTerm.toLowerCase()));
                
                const matchesChangeType = changeType === 'in' ? log.quantity > 0 : 
                                          changeType === 'out' ? log.quantity < 0 : true;

                const matchesLogType = logType ? log.type === logType : true;

                let matchesDate = true;
                if (dateRange.start && dateRange.end) {
                    const logDate = new Date(log.createdAt);
                    const startDate = new Date(dateRange.start);
                    const endDate = new Date(dateRange.end);
                    endDate.setHours(23, 59, 59, 999);
                    matchesDate = logDate >= startDate && logDate <= endDate;
                }

                return matchesSearch && matchesChangeType && matchesLogType && matchesDate;
            })
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [stockLogs, searchTerm, dateRange, changeType, logType]);

    const getLogTypeStyling = (type: StockLog['type']) => {
        switch(type) {
            case 'PURCHASE':
            case 'RETURN_CUSTOMER':
                return 'bg-blue-100 text-blue-700';
            case 'SALE':
            case 'SPOILAGE':
                return 'bg-red-100 text-red-700';
            case 'ADJUSTMENT':
            case 'RETURN_SUPPLIER':
                return 'bg-yellow-100 text-yellow-700';
            default:
                return 'bg-slate-100 text-slate-700';
        }
    }
    
    // --- FUNGSI UNTUK EKSPOR KE EXCEL ---
    const handleExportToExcel = () => {
        if (typeof XLSX === 'undefined') {
            alert("Library untuk ekspor Excel belum termuat. Silakan coba lagi sebentar.");
            return;
        }

        const dataToExport = filteredLogs.map(log => ({
            "Tanggal": new Date(log.createdAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }),
            "Produk": log.product.name,
            "SKU": log.product.sku || '-',
            "Perubahan Qty": log.quantity,
            "Tipe Log": log.type.replace('_', ' '),
            "Oleh": log.user.fullName,
            "Catatan": log.notes || '-',
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Log Stok");

        const fileName = `Laporan_Log_Stok_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    };

    return (
        <>
            {/* Memuat library xlsx */}
            <Script
                src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"
                strategy="lazyOnload"
            />
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Log Stok</h1>
                    <div className="flex items-center gap-2">
                        <button onClick={fetchStockLogs} disabled={isLoading} className="bg-sky-600 text-white px-4 py-2.5 rounded-lg hover:bg-sky-700 transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-70">
                            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} /> Refresh Data
                        </button>
                        <button
                            onClick={handleExportToExcel}
                            className="bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium"
                        >
                            <FileDown size={16} /> Export Excel
                        </button>
                    </div>
                </div>

                {/* Area Filter tidak berubah */}
                <div className="p-4 bg-white rounded-lg shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                         <label htmlFor="searchProduct" className="block text-xs font-medium text-slate-600 mb-1">Cari Produk</label>
                         <div className="relative">
                             <input type="text" id="searchProduct" placeholder="Nama produk atau SKU..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2 pl-9 border border-slate-300 rounded-lg text-sm"/>
                             <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
                         </div>
                    </div>
                    <div>
                         <label htmlFor="filterChangeType" className="block text-xs font-medium text-slate-600 mb-1">Perubahan</label>
                         <select id="filterChangeType" value={changeType} onChange={e => setChangeType(e.target.value as any)} className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white">
                             <option value="">Semua</option>
                             <option value="in">Stok Masuk (+)</option>
                             <option value="out">Stok Keluar (-)</option>
                         </select>
                    </div>
                     <div>
                         <label htmlFor="filterLogType" className="block text-xs font-medium text-slate-600 mb-1">Tipe Log</label>
                         <select id="filterLogType" value={logType} onChange={e => setLogType(e.target.value as any)} className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white">
                             <option value="">Semua Tipe</option>
                             <option value="PURCHASE">Purchase</option>
                             <option value="SALE">Sale</option>
                             <option value="ADJUSTMENT">Adjustment</option>
                             <option value="SPOILAGE">Spoilage</option>
                             <option value="RETURN_CUSTOMER">Return Customer</option>
                             <option value="RETURN_SUPPLIER">Return Supplier</option>
                         </select>
                    </div>
                     <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label htmlFor="startDateLog" className="block text-xs font-medium text-slate-600 mb-1">Dari</label>
                            <input type="date" id="startDateLog" value={dateRange.start} onChange={e => setDateRange(prev => ({...prev, start: e.target.value}))} className="w-full p-2 border border-slate-300 rounded-lg text-sm"/>
                        </div>
                        <div>
                            <label htmlFor="endDateLog" className="block text-xs font-medium text-slate-600 mb-1">Sampai</label>
                            <input type="date" id="endDateLog" value={dateRange.end} onChange={e => setDateRange(prev => ({...prev, end: e.target.value}))} className="w-full p-2 border border-slate-300 rounded-lg text-sm"/>
                        </div>
                     </div>
                </div>

                {/* Tabel tidak berubah */}
                <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase">Tanggal</th>
                                <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase">Produk</th>
                                <th className="p-3 text-right text-xs font-semibold text-slate-500 uppercase">Perubahan</th>
                                <th className="p-3 text-center text-xs font-semibold text-slate-500 uppercase">Tipe</th>
                                <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase">Oleh</th>
                                <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase">Catatan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredLogs.map(log => (
                                <tr key={log.id}>
                                    <td className="p-3 text-sm text-slate-500">{new Date(log.createdAt).toLocaleString('id-ID', {dateStyle:'short', timeStyle:'short'})}</td>
                                    <td className="p-3 text-sm font-medium text-slate-700">{log.product.name} <span className="text-slate-400">({log.product.sku})</span></td>
                                    <td className={`p-3 text-sm font-bold text-right flex items-center justify-end gap-1 ${log.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {log.quantity > 0 ? <ArrowUpCircle size={14} /> : <ArrowDownCircle size={14} />}
                                        {log.quantity > 0 ? `+${log.quantity}` : log.quantity}
                                    </td>
                                    <td className="p-3 text-center">
                                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getLogTypeStyling(log.type)}`}>
                                            {log.type.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="p-3 text-sm text-slate-500">{log.user.fullName}</td>
                                    <td className="p-3 text-sm text-slate-500 italic">{log.notes || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {filteredLogs.length === 0 && <p className="text-center text-slate-500 py-10">Tidak ada log stok ditemukan sesuai filter.</p>}
                </div>
            </div>
        </>
    );
};
export default StockLogView;
