// app/cashier/payment/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { CreditCard, ShoppingBag, ArrowLeft, DollarSign, QrCode, Info, AlertTriangle, CheckCircle, Printer, User } from 'lucide-react';
import { TransactionDetails, CartItem } from '@/app/cashier/types';
import LoadingSpinner from '../components/LoadingSpinner';
import React from 'react';



// Komponen Sukses dan Struk
const SuccessAndReceiptView = ({ details }: { details: TransactionDetails }) => {
  const router = useRouter();
  const handlePrint = () => window.print();

  return (
    <>
      {/* Tampilan Layar */}
      <div className="print:hidden min-h-screen w-full flex flex-col items-center justify-center bg-green-50 p-4 text-center">
        <CheckCircle className="text-green-500 mb-6" size={80} strokeWidth={1.5} />
        <h1 className="text-3xl font-bold text-green-800 mb-3">Pembayaran Berhasil!</h1>
        <p className="text-slate-600 mb-8 max-w-md">
          Pesanan Anda dengan No. Order <span className="font-semibold text-green-700">{details.orderNumber}</span> telah berhasil diproses.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={handlePrint} className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
            <Printer size={18} /> Cetak Struk
          </button>
          <button onClick={() => router.replace('/cashier')} className="bg-slate-600 hover:bg-slate-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors text-base shadow-md hover:shadow-lg">
            Transaksi Baru
          </button>
        </div>
      </div>
      {/* Area Cetak Struk */}
      <div id="receipt-print-area" className="hidden print:block">
        <div className="receipt-content">
            {/* PERUBAHAN 1: Menambahkan Header di paling atas */}
            <div className="receipt-header">
              <p className="store-tagline">Mapayo Frozen Food</p>
              <p className="store-tagline-sub">Makanan Beku Berkualitas & Praktis</p>
            </div>
            <h2 className="title">Struk Pembayaran</h2>
            <hr />
            <div className="details">
              <p><strong>No. Order:</strong> {details.orderNumber}</p>
              <p><strong>Kasir:</strong> {details.cashierName}</p>
              {details.customerName && <p><strong>Pelanggan:</strong> {details.customerName}</p>}
            </div>
            <hr />
            <table className="items-table">
              <tbody>
                {details.items.map(item => (
                  <React.Fragment key={item.id}>
                    <tr>
                      <td colSpan={3} className="item-name">{item.name}</td>
                    </tr>
                    <tr>
                      <td className='price-detail'>{item.quantity}x</td>
                      <td className='price-detail'>@{item.sellPrice.toLocaleString('id-ID')}</td>
                      <td className='price-total'>Rp{(item.sellPrice * item.quantity).toLocaleString('id-ID')}</td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
            <hr />
            <div className="totals">
              <div className="totals-row total-amount">
                <span>TOTAL</span>
                <span>Rp{details.totalAmount.toLocaleString('id-ID')}</span>
              </div>
              {details.paymentMethod.toUpperCase() === 'CASH' && typeof details.cashReceived === 'number' && (
                <>
                  <div className="totals-row">
                    <span>TUNAI</span>
                    <span>Rp{details.cashReceived.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="totals-row total-change">
                    <span>KEMBALI</span>
                    <span>Rp{(details.changeGiven ?? 0).toLocaleString('id-ID')}</span>
                  </div>
                </>
              )}
            </div>
            <hr />
            <p className="footer-thanks">Terima Kasih!</p>
            <p className="footer-contact">Layanan Pelanggan: 0812-3456-7890</p>
            {/* PERUBAHAN 2: Memindahkan Tanggal ke paling bawah */}
            <p className="receipt-footer-date">
              {new Date(details.transactionDate).toLocaleString('en-US', {
                month: 'numeric',
                day: 'numeric',
                year: '2-digit',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })}
            </p>
        </div>
      </div>

      {/* CSS Global untuk Cetak */}
      <style jsx global>{`
        @media print {
          body { background: white !important; }
          body * { visibility: hidden; }
          #receipt-print-area, #receipt-print-area * { visibility: visible; }
          #receipt-print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .receipt-content { width: 72mm; max-width: 72mm; margin: 0 auto; padding: 2mm; font-family: 'Courier New', Courier, monospace; font-size: 9pt; color: black; line-height: 1.4; }
          
          /* PERUBAHAN 3: Menambahkan style untuk header baru */
          .receipt-content .receipt-header { text-align: center; margin-bottom: 3mm; }
          .receipt-content .store-tagline { font-weight: bold; font-size: 10pt; margin: 0; }
          .receipt-content .store-tagline-sub { font-size: 8.5pt; margin: 0; }
          
          .receipt-content .title { font-size: 11pt; font-weight: bold; text-align: center; margin-bottom: 2mm; }
          .receipt-content hr { border: none; border-top: 1px dashed black; margin: 3mm 0; }
          .receipt-content .details p { margin: 0; line-height: 1.3; }
          .receipt-content .items-table { width: 100%; border-collapse: collapse; }
          .receipt-content .item-name { padding-top: 1mm; }
          .receipt-content .price-detail { text-align: left; }
          .receipt-content .price-total { text-align: right; font-weight: 500; }
          .receipt-content .totals { margin-top: 3mm; }
          .receipt-content .totals-row { display: flex; justify-content: space-between; font-weight: bold; }
          .receipt-content .totals-row.total-amount { font-size: 10pt; }
          .receipt-content .totals-row.total-change { font-size: 10pt; }
          .receipt-content .totals-row span:first-child { text-align: left; }
          .receipt-content .totals-row span:last-child { text-align: right; }
          .receipt-content .footer-thanks, .receipt-content .footer-contact { text-align: center; margin-top: 3mm; }
          .receipt-content .footer-contact { font-size: 8pt; margin-top: 1mm; }

          /* PERUBAHAN 3: Menambahkan style untuk tanggal di footer */
          .receipt-content .receipt-footer-date { text-align: center; font-size: 8pt; margin-top: 4mm; }
        }
      `}</style>
    </>
  );
};

export default function PaymentPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [changeGiven, setChangeGiven] = useState<number>(0);
  const [lastTransactionDetails, setLastTransactionDetails] = useState<TransactionDetails | null>(null);
  const [customerName, setCustomerName] = useState<string>('');

  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    const storedCart = localStorage.getItem('frozenFoodCart');
    const storedTotal = localStorage.getItem('frozenFoodCartTotal');
    if (storedCart && storedTotal) {
      const parsedCart: CartItem[] = JSON.parse(storedCart);
      setCartItems(parsedCart);
      setTotalAmount(parseFloat(storedTotal));
    } else {
      router.replace('/cashier');
    }
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    if (paymentMethod.toUpperCase() === 'CASH' && cashReceived) {
      const received = parseFloat(cashReceived);
      if (!isNaN(received) && received >= totalAmount) {
        setChangeGiven(received - totalAmount);
      } else {
        setChangeGiven(0);
      }
    } else {
      setChangeGiven(0);
    }
  }, [cashReceived, totalAmount, paymentMethod]);

  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method);
    setCashReceived('');
    setChangeGiven(0);
    setPaymentStatus('idle');
  };

  const handleSubmitOrder = async () => {
    const isCashPayment = paymentMethod.toUpperCase() === 'CASH';
    const isCashInvalid = isCashPayment && (parseFloat(cashReceived) < totalAmount || isNaN(parseFloat(cashReceived)));

    if (!paymentMethod || isCashInvalid) {
      return;
    }

    setPaymentStatus('processing');

    const orderPayload = {
      customerName: customerName.trim() || "PELANGGAN",
      cashierId: session?.user?.id || 'unknown-cashier', 
      items: cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity,
      })),
      paymentMethod: paymentMethod,
      amountPaid: isCashPayment ? parseFloat(cashReceived) : totalAmount,
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal mengirim pesanan.');
      }

      const result = await response.json();
      
      const transactionDetails: TransactionDetails = {
        orderNumber: result.orderNumber,
        transactionDate: new Date(result.orderDate),
        items: cartItems,
        totalAmount: totalAmount,
        cashierName: result.cashier?.fullName || session?.user?.name || 'Kasir',
        customerName: orderPayload.customerName,
        ...(isCashPayment && { cashReceived: parseFloat(cashReceived), changeGiven }),
        orderId: '',
        paymentMethod: ''
      };

      setLastTransactionDetails(transactionDetails);
      setPaymentStatus('success');
      
      localStorage.removeItem('frozenFoodCart');
      localStorage.removeItem('frozenFoodCartTotal');

    } catch (err: any) {
      console.error("Error submitting order:", err);
      setPaymentStatus('failed');
    }
  };

  // ----- RENDER -----
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><LoadingSpinner /></div>;
  }

  if (paymentStatus === 'success' && lastTransactionDetails) {
    return <SuccessAndReceiptView details={lastTransactionDetails} />;
  }
  
  const isCashPaymentInvalid = paymentMethod.toUpperCase() === 'CASH' && (parseFloat(cashReceived) < totalAmount || cashReceived === '' || isNaN(parseFloat(cashReceived)));

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl">
        <header className="mb-6">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-sky-600 hover:text-sky-700 font-medium transition-colors mb-4 text-sm">
            <ArrowLeft size={18} /> Kembali ke Kasir
          </button>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 flex items-center gap-3">
            <CreditCard className="text-sky-600" /> Detail Pembayaran
          </h1>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Kolom Kiri: Detail & Form Pembayaran */}
          <div className="md:col-span-3 bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200">
            <section className="mb-6">
              <label htmlFor="customerName" className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <User size={16} /> Nama Pelanggan
              </label>
              <input
                type="text"
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="cth: Budi (Opsional)"
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500"
              />
            </section>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-700 mb-4">Pilih Metode Pembayaran</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'CASH', icon: <DollarSign size={20} /> },
                  { name: 'QRIS', icon: <QrCode size={20} /> },
                  { name: 'DEBIT CARD', icon: <CreditCard size={20} /> },
                  { name: 'CREDIT CARD', icon: <CreditCard size={20} /> }
                ].map(method => (
                  <button
                    key={method.name}
                    onClick={() => handlePaymentMethodChange(method.name)}
                    className={`p-4 border rounded-lg text-left transition-all duration-200 ease-in-out flex items-center justify-center gap-3 text-sm font-semibold
                      ${paymentMethod === method.name
                        ? 'bg-sky-600 text-white ring-2 ring-sky-400 shadow-md'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300 hover:border-sky-400'
                      }`}
                  >
                    {method.icon}
                    <span>{method.name}</span>
                  </button>
                ))}
              </div>
            </section>

            {paymentMethod === 'CASH' && (
              <section className="p-4 bg-sky-50 border border-sky-200 rounded-lg">
                <h3 className="text-lg font-semibold text-sky-700 mb-3">Pembayaran Tunai</h3>
                <div>
                  <label htmlFor="cashReceived" className="block text-sm font-medium text-slate-700 mb-1">Uang Diterima (Rp)</label>
                  <input
                    type="number"
                    id="cashReceived"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    placeholder="Contoh: 50000"
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 text-lg"
                    autoFocus
                  />
                  {parseFloat(cashReceived) < totalAmount && cashReceived !== '' && (
                    <p className="text-xs text-red-600 mt-1">Uang tunai kurang dari total belanja.</p>
                  )}
                </div>
              </section>
            )}

            {paymentMethod === 'QRIS' && (
              <section className="p-4 bg-sky-50 border border-sky-200 rounded-lg text-center">
                <h3 className="text-lg font-semibold text-sky-700 mb-3">Pembayaran QRIS</h3>
                <div className="flex flex-col items-center">
                  <Image
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=SIMULASI_QRIS_DATA_TOTAL_${totalAmount}`}
                    alt="QRIS Code"
                    width={200}
                    height={200}
                    className="border border-slate-400 p-1 rounded-md bg-white"
                  />
                  <p className="text-sm text-slate-600 mt-3">Silakan pindai kode QR di atas dengan aplikasi pembayaran Anda.</p>
                  <p className="text-xs text-slate-500 mt-1">(Ini hanya QR code simulasi)</p>
                </div>
              </section>
            )}

            {(paymentMethod === 'DEBIT CARD' || paymentMethod === 'CREDIT CARD') && (
                <section className="p-4 bg-sky-50 border border-sky-200 rounded-lg text-center">
                    <Info className="mx-auto text-sky-600 mb-2" size={32} />
                    <p className="text-sm text-slate-700">Silakan gunakan mesin EDC untuk pembayaran dengan kartu.</p>
                </section>
            )}
          </div>

          {/* Kolom Kanan: Ringkasan & Total */}
          <div className="md:col-span-2">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200 h-full flex flex-col">
              <h2 className="text-xl font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <ShoppingBag size={22} /> Ringkasan Pesanan
              </h2>
              <div className="space-y-2 flex-grow overflow-y-auto max-h-64 pr-2 -mr-2">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-sm py-2">
                    <div>
                      <p className="text-slate-800 font-medium">{item.name}</p>
                      <p className="text-slate-500 text-xs">{item.quantity} x Rp{item.sellPrice.toLocaleString('id-ID')}</p>
                    </div>
                    <span className="text-slate-700 font-semibold">Rp{(item.sellPrice * item.quantity).toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t-2 border-dashed border-slate-300">
                <div className="flex justify-between items-center">
                  <p className="text-lg font-bold text-slate-800">Total:</p>
                  <p className="text-2xl font-extrabold text-sky-600">Rp{totalAmount.toLocaleString('id-ID')}</p>
                </div>
                {paymentMethod === 'CASH' && parseFloat(cashReceived) > 0 && (
                  <div className="flex justify-between items-center mt-2 text-slate-700">
                    <p className="text-md font-medium">Tunai Diterima:</p>
                    <p className="text-lg font-bold">Rp{parseFloat(cashReceived).toLocaleString('id-ID')}</p>
                  </div>
                )}
                {paymentMethod === 'CASH' && changeGiven > 0 && (
                  <div className="flex justify-between items-center mt-2 text-green-600">
                    <p className="text-md font-medium">Kembalian:</p>
                    <p className="text-lg font-bold">Rp{changeGiven.toLocaleString('id-ID')}</p>
                  </div>
                )}
              </div>
              <button
                onClick={handleSubmitOrder}
                disabled={!paymentMethod || paymentStatus === 'processing' || isCashPaymentInvalid}
                className="w-full mt-6 bg-green-600 text-white py-3.5 rounded-lg text-lg font-semibold hover:bg-green-700 focus:ring-4 focus:ring-green-300 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {paymentStatus === 'processing'
                  ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  : 'Konfirmasi & Bayar'
                }
              </button>
              {paymentStatus === 'failed' && (
                <p className="text-red-600 text-center text-sm mt-3 flex items-center justify-center gap-2"><AlertTriangle size={16} />Pembayaran gagal. Coba lagi.</p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
