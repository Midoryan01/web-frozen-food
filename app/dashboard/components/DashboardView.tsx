// app/dashboard/components/DashboardView.tsx
"use client";

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, ShoppingCart, Package, TrendingUp, Users, AlertTriangle } from 'lucide-react';
import SummaryCard from './SummaryCard'; // Impor SummaryCard
import type { SalesDataPoint, TopProductDataPoint, DashboardSummaryData } from '../types'; // Impor tipe

interface DashboardViewProps {
  summary: DashboardSummaryData | null;
  salesTrend: SalesDataPoint[];
  topProducts: TopProductDataPoint[];
  isLoading: boolean;
}

const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-md shadow-lg border border-slate-200">
        <p className="label text-sm text-slate-700">{`Tanggal : ${new Date(label).toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric'})}`}</p>
        {payload.map((entry: any, index: number) => (
           <p key={`item-${index}`} style={{ color: entry.color }} className="text-sm font-medium">
            {`${entry.name} : Rp${entry.value.toLocaleString('id-ID')}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};


const DashboardView: React.FC<DashboardViewProps> = ({ summary, salesTrend, topProducts, isLoading }) => {
  if (isLoading && !summary) { // Tampilkan loading jika data utama belum ada
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-sky-600"></div>
        <p className="ml-4 text-lg text-slate-600">Memuat data dashboard...</p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="text-center p-10">
        <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
        <p className="text-lg text-slate-600">Data dashboard tidak tersedia saat ini.</p>
        <p className="text-sm text-slate-500">Silakan coba lagi nanti atau hubungi administrator.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Dashboard Ringkasan</h1>
      
      {/* Kartu Ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        <SummaryCard 
          title="Total Pendapatan" 
          value={`Rp${summary.totalRevenue.toLocaleString('id-ID')}`} 
          icon={DollarSign} 
          color="bg-gradient-to-br from-green-500 to-green-600"
          description="Pendapatan keseluruhan"
        />
        <SummaryCard 
          title="Total Transaksi" 
          value={summary.totalOrders.toLocaleString('id-ID')} 
          icon={ShoppingCart} 
          color="bg-gradient-to-br from-sky-500 to-sky-600"
          description="Jumlah pesanan berhasil"
        />
        <SummaryCard 
          title="Produk Terjual" 
          value={summary.totalProductsSold.toLocaleString('id-ID')} 
          icon={Package} 
          color="bg-gradient-to-br from-amber-500 to-amber-600"
          description="Total unit produk terjual"
        />
        {typeof summary.lowStockItemsCount === 'number' && (
          <SummaryCard 
            title="Stok Hampir Habis" 
            value={summary.lowStockItemsCount.toLocaleString('id-ID')} 
            icon={AlertTriangle} 
            color="bg-gradient-to-br from-red-500 to-red-600"
            description="Produk dengan stok rendah"
          />
        )}
      </div>

      {/* Grafik Penjualan Mingguan/Bulanan */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-slate-200">
        <h2 className="text-lg sm:text-xl font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <TrendingUp className="text-sky-600" /> Tren Penjualan
        </h2>
        {salesTrend.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={salesTrend} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(tick) => new Date(tick).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} 
                tick={{ fontSize: 12, fill: '#64748b' }} 
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis 
                tickFormatter={(tick) => `Rp${(tick / 1000).toLocaleString('id-ID')}k`} 
                tick={{ fontSize: 12, fill: '#64748b' }} 
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={{ stroke: '#cbd5e1' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "14px" }} />
              <Line 
                type="monotone" 
                dataKey="totalSales" 
                stroke="#0ea5e9" // sky-500
                strokeWidth={2.5} 
                activeDot={{ r: 7, strokeWidth: 2, fill: '#0ea5e9' }} 
                dot={{ r: 4, fill: '#0ea5e9' }}
                name="Total Penjualan"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-slate-500 text-center py-10">Data tren penjualan belum tersedia.</p>
        )}
      </div>

      {/* Grafik Produk Terlaris (Pie Chart) dan Daftar (jika perlu) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-slate-200">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-700 mb-4">Distribusi Produk Terlaris</h2>
          {topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={topProducts}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  innerRadius={40} // Untuk Donut Chart
                  fill="#8884d8"
                  dataKey="quantitySold"
                  paddingAngle={2}
                >
                  {topProducts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number, name: string) => [`${value.toLocaleString('id-ID')} unit`, name]}/>
                <Legend wrapperStyle={{ fontSize: "14px", marginTop: "10px" }}/>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500 text-center py-10">Data produk terlaris belum tersedia.</p>
          )}
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-slate-200">
           <h2 className="text-lg sm:text-xl font-semibold text-slate-700 mb-4">Daftar Produk Terlaris</h2>
            {topProducts.length > 0 ? (
                <ul className="space-y-3 max-h-[300px] overflow-y-auto">
                    {topProducts.map((product, index) => (
                        <li key={product.id || product.name} className="flex justify-between items-center p-2.5 bg-slate-50 rounded-md hover:bg-slate-100">
                            <span className="text-sm text-slate-700 font-medium">{index + 1}. {product.name}</span>
                            <span className="text-sm text-sky-600 font-semibold">{product.quantitySold.toLocaleString('id-ID')} unit</span>
                        </li>
                    ))}
                </ul>
            ) : (
                 <p className="text-slate-500 text-center py-10">Tidak ada data.</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
