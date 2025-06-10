// app/cashier/payment/components/SuccessAndReceiptView.tsx
"use client";

import { useRouter } from 'next/navigation';
import { CheckCircle, Printer } from 'lucide-react';
import React from 'react';

// Tipe Data (sebaiknya diimpor dari file tipe terpusat: /types.ts)
interface CartItem {
  id: number;
  name: string;
  sellPrice: number;
  quantity: number;
}
interface TransactionDetails {
  orderId: string;
  transactionDate: Date;
  items: CartItem[];
  totalAmount: number;
  paymentMethod: string;
  cashierName: string; // PENAMBAHAN: Nama kasir yang menangani transaksi
  cashReceived?: number;
  changeGiven?: number;
}

export const SuccessAndReceiptView = ({ details }: { details: TransactionDetails }) => {
  const router = useRouter();

  // Fungsi untuk memicu dialog cetak browser
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Bagian untuk Tampilan Layar (Tidak ikut tercetak) */}
      <div className="print:hidden min-h-screen w-full flex flex-col items-center justify-center bg-green-50 p-4 text-center">
        <CheckCircle className="text-green-500 mb-6" size={80} strokeWidth={1.5} />
        <h1 className="text-3xl font-bold text-green-800 mb-3">Pembayaran Berhasil!</h1>
        <p className="text-slate-600 mb-8 max-w-md">
          Pesanan Anda dengan ID <span className="font-semibold text-green-700">{details.orderId}</span> telah berhasil diproses.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handlePrint}
            className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            <Printer size={18} /> Cetak Struk
          </button>
          <button
            onClick={() => router.replace('/cashier')}
            className="bg-slate-600 hover:bg-slate-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors text-base shadow-md hover:shadow-lg"
          >
            Transaksi Baru
          </button>
        </div>
      </div>

      {/* Area Struk untuk Dicetak (Hanya muncul saat mencetak) */}
      <div id="receipt-print-area" className="hidden print:block">
        <div className="receipt-content">
          <h2 className="title">Struk Pembayaran</h2>
          <p className="store-name">Mapayo Frozen Food</p>
          <hr />
          <div className="details">
            <p><strong>ID:</strong> {details.orderId}</p>
            <p><strong>Tanggal:</strong> {new Date(details.transactionDate).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            {/* PERBAIKAN: Menggunakan nama kasir dinamis dari 'details' prop */}
            <p><strong>Kasir:</strong> {details.cashierName || 'N/A'}</p>
          </div>
          <hr />
          
          <div className="items-container">
            {details.items.map(item => (
              // Struktur ini sudah benar, dengan key di elemen terluar dari map
              <div key={item.id} className="item-block">
                <div className="item-main-line">
                  <span className="item-name">{item.name}</span>
                  <span className="item-total">Rp{(item.sellPrice * item.quantity).toLocaleString('id-ID')}</span>
                </div>
                <div className="item-detail-line">
                  <span>{item.quantity} x @{item.sellPrice.toLocaleString('id-ID')}</span>
                </div>
              </div>
            ))}
          </div>

          <hr />
          <div className="totals">
            <div className="totals-row total-amount">
              <span>TOTAL</span>
              <span>Rp{details.totalAmount.toLocaleString('id-ID')}</span>
            </div>
            {details.paymentMethod.toUpperCase() === 'CASH' && typeof details.cashReceived === 'number' && (
              // Menggunakan React Fragment untuk mengelompokkan elemen tanpa menambah node DOM
              <React.Fragment>
                <div className="totals-row">
                  <span>TUNAI</span>
                  <span>Rp{details.cashReceived.toLocaleString('id-ID')}</span>
                </div>
                <div className="totals-row total-change">
                  <span>KEMBALI</span>
                  <span>Rp{(details.changeGiven ?? 0).toLocaleString('id-ID')}</span>
                </div>
              </React.Fragment>
            )}
          </div>
          <hr />
          <p className="footer-thanks">Terima Kasih!</p>
          <p className="footer-contact">Layanan Pelanggan: 0812-3456-7890</p>
        </div>
      </div>

      {/* CSS Global untuk Fungsionalitas Cetak */}
      <style jsx global>{`
        @media print {
          body {
            background-color: white !important; margin: 0; padding: 0;
          }
          /* Trik untuk memastikan hanya area struk yang tercetak */
          body * { visibility: hidden; }
          #receipt-print-area, #receipt-print-area * { visibility: visible; }
          #receipt-print-area {
            position: absolute; left: 0; top: 0; width: 100%;
          }
          .receipt-content {
            width: 72mm; /* Lebar standar kertas thermal */
            max-width: 72mm;
            margin: 0 auto;
            padding: 3mm;
            font-family: 'Courier New', Courier, monospace;
            font-size: 9.5pt;
            color: black;
            line-height: 1.4;
          }
          .receipt-content .title {
            font-size: 11pt; font-weight: bold; text-align: center; margin-bottom: 2mm;
          }
          .receipt-content .store-name {
            text-align: center; font-weight: bold; margin-bottom: 4mm;
          }
          .receipt-content hr {
            border: none; border-top: 1px dashed black; margin: 3mm 0;
          }
          .receipt-content .details p {
            margin: 0; line-height: 1.3; font-size: 9pt;
          }
          .item-block {
            margin-bottom: 2mm; /* Jarak antar item */
          }
          .item-main-line {
            display: flex; justify-content: space-between; align-items: flex-start;
          }
          .item-name {
            text-align: left; word-break: break-word; padding-right: 8px; /* Jarak antara nama dan harga */
          }
          .item-total {
            text-align: right; white-space: nowrap;
          }
          .item-detail-line {
            font-size: 8.5pt; color: #333;
          }
          .receipt-content .totals {
            margin-top: 3mm;
          }
          .receipt-content .totals-row {
            display: flex; justify-content: space-between; font-weight: bold;
          }
          .receipt-content .totals-row.total-amount {
            font-size: 10.5pt;
          }
          .receipt-content .totals-row.total-change {
            font-size: 10.5pt;
          }
          .receipt-content .totals-row span:first-child { text-align: left; }
          .receipt-content .totals-row span:last-child { text-align: right; }
          .receipt-content .footer-thanks,
          .receipt-content .footer-contact {
            text-align: center; margin-top: 3mm;
          }
          .receipt-content .footer-contact {
            font-size: 8pt; margin-top: 1mm;
          }
        }
      `}</style>
    </>
  );
};
