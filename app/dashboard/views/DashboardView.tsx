"use client";

import React from 'react';
import { DollarSign, ShoppingCart, Package } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import type { SalesDataPoint, TopProductDataPoint } from '../types';

interface SummaryCardProps {
    title: string;
    value: string;
    icon: React.ElementType;
    color: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon: Icon, color }) => (
    <div className={`p-5 sm:p-6 rounded-xl shadow-lg text-white ${color} transition-all duration-300 hover:shadow-2xl hover:scale-105`}>
        <div className="flex items-center justify-between mb-2">
            <h3 className="text-base sm:text-lg font-semibold">{title}</h3>
            <Icon className="h-7 w-7 sm:h-8 sm:w-8 opacity-80" />
        </div>
        <p className="text-2xl sm:text-3xl font-bold truncate" title={value}>{value}</p>
    </div>
);

// PERBAIKAN: Interface props disesuaikan dengan data yang dikirim dari page.tsx
interface DashboardViewProps {
    salesSummary: SalesDataPoint[];
    topProducts: TopProductDataPoint[];
    totalRevenue: number;
    totalTransactions: number;
}

const DashboardView: React.FC<DashboardViewProps> = ({ salesSummary, topProducts, totalRevenue, totalTransactions }) => {
    // Tidak perlu lagi menghitung totalRevenue di sini karena sudah diterima dari props

    return (
        <div className="space-y-6 sm:space-y-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {/* Menggunakan props `totalRevenue` dan `totalTransactions` secara langsung */}
                <SummaryCard title="Total Pendapatan" value={`Rp${totalRevenue.toLocaleString('id-ID')}`} icon={DollarSign} color="bg-gradient-to-br from-green-500 to-green-600" />
                <SummaryCard title="Total Transaksi" value={totalTransactions.toLocaleString('id-ID')} icon={ShoppingCart} color="bg-gradient-to-br from-sky-500 to-sky-600" />
                <SummaryCard title="Produk Terlaris" value={topProducts[0]?.name || '-'} icon={Package} color="bg-gradient-to-br from-orange-500 to-orange-600" />
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-xl border border-slate-200">
                <h2 className="text-lg sm:text-xl font-semibold text-slate-700 mb-4">Tren Penjualan Harian</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={salesSummary} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
                        <XAxis dataKey="date" tickFormatter={(tick) => new Date(tick).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} fontSize={12} />
                        <YAxis tickFormatter={(tick) => `${(tick/1000000).toLocaleString('id-ID', {minimumFractionDigits:1, maximumFractionDigits:1})} Jt`} fontSize={12} />
                        <Tooltip formatter={(value: number) => [`Rp${value.toLocaleString('id-ID')}`, "Penjualan"]}/>
                        <Legend />
                        <Line type="monotone" dataKey="totalSales" stroke="#0ea5e9" strokeWidth={2.5} activeDot={{ r: 7, strokeWidth:2, fill: '#fff' }} name="Total Penjualan" dot={{r:4, fill:"#0ea5e9"}}/>
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-xl border border-slate-200">
                <h2 className="text-lg sm:text-xl font-semibold text-slate-700 mb-4">Produk Terlaris (Kuantitas)</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topProducts} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
                        <XAxis dataKey="name" fontSize={12} interval={0} angle={-30} textAnchor="end" height={70} />
                        <YAxis fontSize={12}/>
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="quantitySold" fill="#22c55e" name="Kuantitas Terjual" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default DashboardView;
