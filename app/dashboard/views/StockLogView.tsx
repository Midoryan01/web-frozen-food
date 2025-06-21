"use client";

import React, { useState, useMemo, FormEvent } from 'react';
import type { StockLog } from '@/types'; // Menggunakan tipe dari @/types
import { RefreshCw, Search, ArrowUpCircle, ArrowDownCircle, FileDown, Edit, Trash2, XCircle } from 'lucide-react';
import Script from 'next/script';
import PaginationControls from '../components/PaginationControls';

// Deklarasi global untuk library eksternal agar TypeScript tidak error
declare const XLSX: any;

// Komponen Modal untuk mengedit catatan
const EditNotesModal: React.FC<{
    log: StockLog;
    onClose: () => void;
    onSave: (logId: number, notes: string) => Promise<void>;
}> = ({ log, onClose, onSave }) => {
    const [notes, setNotes] = useState(log.notes || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await onSave(log.id, notes);
        setIsSaving(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-800">Edit Catatan Log Stok</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <XCircle size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <p className="text-sm text-slate-600 mb-2">
                        Produk: <span className="font-semibold">{log.product.name} ({log.product.sku})</span>
                    </p>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={4}
                        className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
                        placeholder="Tambahkan catatan..."
                    />
                    <div className="flex justify-end gap-3 mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200">
                            Batal
                        </button>
                        <button type="submit" disabled={isSaving} className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:bg-slate-400">
                            {isSaving ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


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
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    // State untuk modal
    const [editingLog, setEditingLog] = useState<StockLog | null>(null);

    const filteredLogs = useMemo(() => {
        if (!Array.isArray(stockLogs)) return [];
        
        return stockLogs.filter(log => {
            const logDate = new Date(log.createdAt);
            const matchesSearch = log.product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  (log.product.sku && log.product.sku.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesChangeType = changeType === 'in' ? log.quantity > 0 : changeType === 'out' ? log.quantity < 0 : true;
            const matchesLogType = logType ? log.type === logType : true;

            let matchesDate = true;
            if (dateRange.start && dateRange.end) {
                const startDate = new Date(dateRange.start);
                const endDate = new Date(dateRange.end);
                endDate.setHours(23, 59, 59, 999);
                matchesDate = logDate >= startDate && logDate <= endDate;
            }

            return matchesSearch && matchesChangeType && matchesLogType && matchesDate;
        }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [stockLogs, searchTerm, dateRange, changeType, logType]);

    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    const paginatedLogs = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredLogs.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredLogs, currentPage, itemsPerPage]);

    const onPageChange = (page: number) => {
        if (page > 0 && page <= totalPages) setCurrentPage(page);
    };
    const onItemsPerPageChange = (size: number) => {
        setItemsPerPage(size);
        setCurrentPage(1);
    };

    const getLogTypeStyling = (type: StockLog['type']) => {
        switch(type) {
            case 'PURCHASE': case 'RETURN_CUSTOMER': return 'bg-blue-100 text-blue-700';
            case 'SALE': case 'SPOILAGE': return 'bg-red-100 text-red-700';
            case 'ADJUSTMENT': case 'RETURN_SUPPLIER': return 'bg-yellow-100 text-yellow-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };
    
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
        XLSX.writeFile(workbook, `Laporan_Log_Stok_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    // Fungsi untuk menyimpan perubahan catatan
    const handleSaveNotes = async (logId: number, notes: string) => {
        try {
            const response = await fetch(`/api/stocklog/${logId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notes }),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Gagal menyimpan catatan');
            }
            alert('Catatan berhasil diperbarui!');
            await fetchStockLogs(); // Refresh data
        } catch (error: any) {
            console.error(error);
            alert(`Error: ${error.message}`);
        }
    };

    // Fungsi untuk menghapus log
    const handleDeleteLog = async (logId: number) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus log ini? Stok akan dikembalikan ke kondisi semula.')) {
            try {
                const response = await fetch(`/api/stocklog/${logId}`, {
                    method: 'DELETE',
                });
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Gagal menghapus log');
                }
                alert('Log berhasil dihapus dan stok telah dikembalikan.');
                await fetchStockLogs(); // Refresh data
            } catch (error: any) {
                console.error(error);
                alert(`Error: ${error.message}`);
            }
        }
    };

    return (
        <>
            <Script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js" strategy="lazyOnload" />
            
            {editingLog && (
                <EditNotesModal 
                    log={editingLog}
                    onClose={() => setEditingLog(null)}
                    onSave={handleSaveNotes}
                />
            )}

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Log Stok</h1>
                    <div className="flex items-center gap-2">
                        <button onClick={fetchStockLogs} disabled={isLoading} className="bg-sky-600 text-white px-4 py-2.5 rounded-lg hover:bg-sky-700 transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-70">
                            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} /> Refresh Data
                        </button>
                        <button onClick={handleExportToExcel} className="bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium">
                            <FileDown size={16} /> Export Excel
                        </button>
                    </div>
                </div>

                <div className="p-4 bg-white rounded-lg shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Filter controls... */}
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

                <div className="bg-white rounded-lg shadow-md border border-slate-200">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead className="bg-slate-100">
                                <tr>
                                    <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase">Tanggal</th>
                                    <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase">Produk</th>
                                    <th className="p-3 text-right text-xs font-semibold text-slate-500 uppercase">Perubahan</th>
                                    <th className="p-3 text-center text-xs font-semibold text-slate-500 uppercase">Tipe</th>
                                    <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase">Oleh</th>
                                    <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase">Catatan</th>
                                    <th className="p-3 text-center text-xs font-semibold text-slate-500 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {paginatedLogs.map(log => (
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
                                        <td className="p-3 text-sm text-slate-500 italic max-w-xs truncate" title={log.notes || ''}>{log.notes || '-'}</td>
                                        <td className="p-3 text-center">
                                            <button onClick={() => setEditingLog(log)} className="text-sky-600 hover:text-sky-800 p-1.5" title="Edit Catatan"><Edit size={16} /></button>
                                            <button onClick={() => handleDeleteLog(log.id)} className="text-red-500 hover:text-red-700 p-1.5 ml-1" title="Hapus Log"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredLogs.length === 0 && !isLoading && <p className="text-center text-slate-500 py-10">Tidak ada log stok ditemukan sesuai filter.</p>}
                    </div>
                    
                    <PaginationControls
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={onPageChange}
                        itemsPerPage={itemsPerPage}
                        onItemsPerPageChange={onItemsPerPageChange}
                        totalItems={filteredLogs.length}
                    />
                </div>
            </div>
        </>
    );
};
export default StockLogView;
