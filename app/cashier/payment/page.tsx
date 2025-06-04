"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { CreditCard, ShoppingBag, ArrowLeft, CheckCircle, Printer, DollarSign, QrCode, Info } from 'lucide-react';

// Asumsi LoadingSpinner sudah ada atau dibuat di path yang benar
// import LoadingSpinner from '../component/LoadingSpinner';
const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-full">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-sky-500"></div>
    </div>
);

// Tipe data (diasumsikan sama)
interface Category { id: number; name: string; }
interface Product { id: number; name: string; sellPrice: number; imageUrl?: string | null; category?: Category | null; stock: number; /* Tambah stock di Product */ }
interface CartItem extends Product { quantity: number; }

// Tipe untuk detail transaksi terakhir (untuk struk)
interface TransactionDetails {
  orderId: string; // Akan disimulasikan
  transactionDate: Date;
  items: CartItem[];
  totalAmount: number;
  paymentMethod: string;
  cashReceived?: number;
  changeGiven?: number;
  // customerName?: string;
}

export default function PaymentPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<string>(''); // 'pending', 'processing', 'success', 'failed'
  const [cashReceived, setCashReceived] = useState<string>(''); // String untuk input, akan di-parse
  const [changeGiven, setChangeGiven] = useState<number>(0);
  const [lastTransactionDetails, setLastTransactionDetails] = useState<TransactionDetails | null>(null);

  const router = useRouter();

  useEffect(() => {
    const storedCart = localStorage.getItem('frozenFoodCart');
    const storedTotal = localStorage.getItem('frozenFoodCartTotal');
    if (storedCart && storedTotal) {
      const parsedCart: CartItem[] = JSON.parse(storedCart);
      // Pastikan sellPrice adalah number
      const validatedCart = parsedCart.map(item => ({
        ...item,
        sellPrice: Number(item.sellPrice),
        stock: Number(item.stock || 0) // Pastikan stock juga number
      }));
      setCartItems(validatedCart);
      setTotalAmount(parseFloat(storedTotal));
    } else {
      alert("Keranjang tidak ditemukan. Silakan pilih produk terlebih dahulu.");
      router.replace('/cashier');
    }
    setIsLoading(false);
  }, [router]);

  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method);
    setCashReceived(''); // Reset input cash jika metode berubah
    setChangeGiven(0);
    setPaymentStatus(''); // Reset status jika metode pembayaran diubah
  };

  useEffect(() => {
    if (paymentMethod === 'CASH' && cashReceived && totalAmount > 0) {
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


  const handleSubmitOrder = async () => {
    if (!paymentMethod) {
      alert("Silakan pilih metode pembayaran terlebih dahulu.");
      return;
    }
    if (cartItems.length === 0) {
      alert("Keranjang kosong, tidak ada yang bisa diproses.");
      return;
    }
    if (paymentMethod === 'CASH' && (parseFloat(cashReceived) < totalAmount || isNaN(parseFloat(cashReceived)))) {
      alert("Jumlah uang tunai yang diterima tidak mencukupi atau tidak valid.");
      return;
    }

    setPaymentStatus('processing');

    const orderDataForBackend = {
      items: cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        sellPrice: item.sellPrice,
      })),
      totalAmount: totalAmount,
      paymentMethod: paymentMethod,
      // ...(paymentMethod === 'CASH' && { cashReceived: parseFloat(cashReceived), changeGiven }), // Kirim info cash jika metode tunai
      // customerName, cashierId, etc.
    };
    console.log("Order Data to be sent to backend:", orderDataForBackend);

    try {
      // --- SIMULASI ATAU INTEGRASI BACKEND NYATA ---
      // const response = await fetch('/api/orders', { method: 'POST', ... });
      // if (!response.ok) throw new Error('Gagal membuat pesanan.');
      // const orderResult = await response.json();

      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulasi delay

      const transactionDetails: TransactionDetails = {
        orderId: `INV-${Date.now()}`, // ID Order simulasi
        transactionDate: new Date(),
        items: cartItems,
        totalAmount: totalAmount,
        paymentMethod: paymentMethod,
        ...(paymentMethod === 'CASH' && { cashReceived: parseFloat(cashReceived), changeGiven }),
      };
      setLastTransactionDetails(transactionDetails);
      setPaymentStatus('success');
      localStorage.removeItem('frozenFoodCart');
      localStorage.removeItem('frozenFoodCartTotal');
    } catch (err: any) {
      console.error("Error submitting order:", err);
      setPaymentStatus('failed');
      alert(`Gagal memproses pesanan: ${err.message}`);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-100"><LoadingSpinner /></div>;
  }

  if (paymentStatus === 'success' && lastTransactionDetails) {
    return <SuccessAndReceiptView details={lastTransactionDetails} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 sm:py-12 px-4">
      <header className="container mx-auto max-w-3xl mb-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sky-600 hover:text-sky-700 font-medium transition-colors mb-4 text-sm">
          <ArrowLeft size={18} /> Kembali ke Keranjang
        </button>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 flex items-center gap-3">
          <CreditCard className="text-sky-600" /> Detail Pembayaran
        </h1>
      </header>

      <main className="container mx-auto max-w-3xl bg-white p-6 sm:p-8 rounded-xl shadow-2xl border border-slate-200">
        {/* ... (Bagian Ringkasan Pesanan tetap sama) ... */}
        <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <ShoppingBag size={22} /> Ringkasan Pesanan
            </h2>
            <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar border border-slate-200 rounded-lg p-4">
            {cartItems.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm py-2 border-b border-slate-100 last:border-b-0">
                <div className="flex items-center gap-3">
                    {item.imageUrl && (
                    <Image src={item.imageUrl} alt={item.name} width={36} height={36} className="rounded object-cover"/>
                    )}
                    <span className="text-slate-700">{item.name} (x{item.quantity})</span>
                </div>
                <span className="text-slate-600 font-medium">Rp{(item.sellPrice * item.quantity).toLocaleString('id-ID')}</span>
                </div>
            ))}
            </div>
            <div className="mt-6 pt-4 border-t-2 border-slate-300 flex justify-between items-center">
            <p className="text-lg font-bold text-slate-800">Total Pembayaran:</p>
            <p className="text-2xl font-extrabold text-sky-600">Rp{totalAmount.toLocaleString('id-ID')}</p>
            </div>
        </section>


        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-700 mb-4">Pilih Metode Pembayaran</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {['CASH', 'QRIS', 'DEBIT_CARD', 'CREDIT_CARD'].map(methodKey => {
              const methodName = methodKey.replace('_', ' ');
              return (
                <button
                  key={methodKey}
                  onClick={() => handlePaymentMethodChange(methodName)}
                  className={`p-4 border rounded-lg text-left transition-all duration-200 ease-in-out flex items-center justify-center sm:justify-start gap-3
                    ${paymentMethod === methodName ? 'bg-sky-600 text-white ring-2 ring-sky-400 shadow-lg transform scale-105' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300 hover:border-sky-400'}
                  `}
                >
                  {methodKey === 'CASH' && <DollarSign size={20} />}
                  {methodKey === 'QRIS' && <QrCode size={20} />}
                  {(methodKey === 'DEBIT_CARD' || methodKey === 'CREDIT_CARD') && <CreditCard size={20} />}
                  <span className="font-semibold">{methodName}</span>
                </button>
              )
            })}
          </div>
        </section>

        {/* UI Dinamis berdasarkan Metode Pembayaran */}
        {paymentMethod === 'CASH' && (
          <section className="mb-8 p-4 bg-sky-50 border border-sky-200 rounded-lg">
            <h3 className="text-lg font-semibold text-sky-700 mb-3">Pembayaran Tunai</h3>
            <div className="space-y-3">
              <div>
                <label htmlFor="cashReceived" className="block text-sm font-medium text-slate-700 mb-1">Uang Diterima (Rp):</label>
                <input
                  type="number"
                  id="cashReceived"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  placeholder="Contoh: 50000"
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 text-lg"
                />
              </div>
              {parseFloat(cashReceived) >= totalAmount && totalAmount > 0 && (
                <div>
                  <p className="text-sm font-medium text-slate-700">Total Belanja: Rp{totalAmount.toLocaleString('id-ID')}</p>
                  <p className="text-sm font-medium text-slate-700">Uang Diterima: Rp{parseFloat(cashReceived).toLocaleString('id-ID')}</p>
                  <p className="text-lg font-semibold text-green-600 mt-1">Kembalian: Rp{changeGiven.toLocaleString('id-ID')}</p>
                </div>
              )}
               {parseFloat(cashReceived) < totalAmount && cashReceived !== '' && (
                <p className="text-sm text-red-600">Uang tunai kurang.</p>
              )}
            </div>
          </section>
        )}

        {paymentMethod === 'QRIS' && (
          <section className="mb-8 p-4 bg-sky-50 border border-sky-200 rounded-lg text-center">
            <h3 className="text-lg font-semibold text-sky-700 mb-3">Pembayaran QRIS</h3>
            <div className="flex flex-col items-center">
              {/* Ganti dengan komponen QR Code generator atau gambar QRIS Anda */}
              <Image
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=SIMULASI_QRIS_DATA_TOTAL_${totalAmount}`}
                alt="QRIS Code"
                width={200}
                height={200}
                className="border border-slate-400 p-1 rounded-md"
              />
              <p className="text-sm text-slate-600 mt-3">Silakan pindai kode QR di atas dengan aplikasi pembayaran Anda.</p>
              <p className="text-xs text-slate-500 mt-1">(Ini hanya QR code simulasi)</p>
            </div>
          </section>
        )}

        {(paymentMethod === 'DEBIT CARD' || paymentMethod === 'CREDIT CARD') && (
          <section className="mb-8 p-4 bg-sky-50 border border-sky-200 rounded-lg flex items-center gap-3">
            <Info size={24} className="text-sky-600 flex-shrink-0" />
            <p className="text-sm text-slate-700">Silakan proses pembayaran <span className="font-semibold">{paymentMethod}</span> menggunakan mesin EDC yang tersedia.</p>
          </section>
        )}

        <button
          onClick={handleSubmitOrder}
          disabled={!paymentMethod || cartItems.length === 0 || paymentStatus === 'processing' || (paymentMethod === 'CASH' && (parseFloat(cashReceived) < totalAmount || isNaN(parseFloat(cashReceived))))}
          className="w-full bg-green-600 text-white py-3.5 rounded-lg text-lg font-semibold hover:bg-green-700 focus:ring-4 focus:ring-green-300 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {paymentStatus === 'processing' ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
              Memproses...
            </>
          ) : (
            'Konfirmasi & Bayar Sekarang'
          )}
        </button>
        {paymentStatus === 'failed' && (
          <p className="text-red-600 text-center mt-4">Pembayaran gagal. Silakan coba lagi.</p>
        )}
      </main>
    </div>
  );
}

// Komponen untuk Halaman Sukses dan Struk
const SuccessAndReceiptView = ({ details }: { details: TransactionDetails }) => {
  const router = useRouter();

  const handlePrint = () => {
    // Sembunyikan elemen yang tidak ingin dicetak, lalu panggil window.print()
    // Cara sederhana: print seluruh halaman, tapi struk didesain untuk print-friendly
    // Untuk cara lebih canggih, Anda bisa menggunakan CSS @media print
    const printableArea = document.getElementById('receipt-area');
    if (printableArea) {
        const printContents = printableArea.innerHTML;
        const originalContents = document.body.innerHTML;
        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload(); // Reload untuk mengembalikan event listener dll.
    } else {
        window.print();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 p-4 sm:p-6 text-center">
      <CheckCircle className="text-green-500 mb-4 sm:mb-6" size={80} />
      <h1 className="text-2xl sm:text-3xl font-bold text-green-700 mb-3">Pembayaran Berhasil!</h1>
      <p className="text-slate-600 mb-6 sm:mb-8 max-w-md">
        Pesanan Anda dengan ID <span className="font-semibold text-green-700">{details.orderId}</span> telah berhasil diproses.
      </p>

      {/* Area Struk */}
      <div id="receipt-area" className="bg-white p-6 sm:p-8 rounded-lg shadow-xl border border-slate-200 w-full max-w-md text-left mb-6 printable-area">
        <h2 className="text-xl font-semibold text-center text-slate-800 mb-4 border-b pb-2">Struk Pembayaran</h2>
        <div className="text-xs text-slate-600 mb-3">
          <p><strong>ID Pesanan:</strong> {details.orderId}</p>
          <p><strong>Tanggal:</strong> {new Date(details.transactionDate).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</p>
          {/* <p><strong>Pelanggan:</strong> {details.customerName || 'Pelanggan Umum'}</p> */}
          <p><strong>Metode Pembayaran:</strong> {details.paymentMethod}</p>
        </div>
        <table className="w-full text-xs mb-3">
          <thead>
            <tr className="border-b border-slate-300">
              <th className="text-left py-1 pr-1 font-semibold text-slate-700">Produk</th>
              <th className="text-right py-1 px-1 font-semibold text-slate-700">Qty</th>
              <th className="text-right py-1 px-1 font-semibold text-slate-700">Harga</th>
              <th className="text-right py-1 pl-1 font-semibold text-slate-700">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {details.items.map(item => (
              <tr key={item.id} className="border-b border-slate-100">
                <td className="py-1 pr-1 text-slate-700">{item.name}</td>
                <td className="text-right py-1 px-1 text-slate-700">{item.quantity}</td>
                <td className="text-right py-1 px-1 text-slate-700">Rp{item.sellPrice.toLocaleString('id-ID')}</td>
                <td className="text-right py-1 pl-1 text-slate-700">Rp{(item.sellPrice * item.quantity).toLocaleString('id-ID')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 pt-2 border-t border-slate-300 text-sm">
          <div className="flex justify-between font-semibold text-slate-800">
            <span>Total Belanja:</span>
            <span>Rp{details.totalAmount.toLocaleString('id-ID')}</span>
          </div>
          {details.paymentMethod === 'CASH' && typeof details.cashReceived === 'number' && (
            <>
              <div className="flex justify-between mt-1">
                <span className="text-slate-600">Tunai Diterima:</span>
                <span className="text-slate-600">Rp{details.cashReceived.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between font-semibold text-green-600">
                <span>Kembalian:</span>
                <span>Rp{(details.changeGiven ?? 0).toLocaleString('id-ID')}</span>
              </div>
            </>
          )}
          <p className="text-center text-xs text-slate-500 mt-4">Terima kasih telah berbelanja!</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors text-base flex items-center justify-center gap-2"
        >
            <Printer size={18}/> Cetak Struk
        </button>
        <button
            onClick={() => router.push('/cashier')}
            className="bg-slate-600 hover:bg-slate-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors text-base"
        >
            Transaksi Baru
        </button>
      </div>

      {/* CSS untuk menyembunyikan elemen non-struk saat mencetak */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt-area, #receipt-area * {
            visibility: visible;
          }
          #receipt-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 10px; /* Sesuaikan padding untuk cetak */
            border: none;
            box-shadow: none;
          }
        }
      `}</style>
    </div>
  );
};