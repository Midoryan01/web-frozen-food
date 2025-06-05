"use client";

import { useState, useEffect } from 'react'; // useMemo tidak digunakan lagi, bisa dihapus jika tidak dipakai di tempat lain
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { CreditCard, ShoppingBag, ArrowLeft, CheckCircle, Printer, DollarSign, QrCode, Info } from 'lucide-react';
import LoadingSpinner from '../component/LoadingSpinner'; 

// Tipe data
interface Category { id: number; name: string; }
interface Product { id: number; name: string; sellPrice: number; imageUrl?: string | null; category?: Category | null; stock: number; }
interface CartItem extends Product { quantity: number; }
interface TransactionDetails {
  orderId: string;
  transactionDate: Date;
  items: CartItem[];
  totalAmount: number;
  paymentMethod: string;
  cashReceived?: number;
  changeGiven?: number;
}

export default function PaymentPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<string>('');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [changeGiven, setChangeGiven] = useState<number>(0);
  const [lastTransactionDetails, setLastTransactionDetails] = useState<TransactionDetails | null>(null);

  const router = useRouter();

  useEffect(() => {
    const storedCart = localStorage.getItem('frozenFoodCart');
    const storedTotal = localStorage.getItem('frozenFoodCartTotal');
    if (storedCart && storedTotal) {
      const parsedCart: CartItem[] = JSON.parse(storedCart);
      const validatedCart = parsedCart.map(item => ({
        ...item,
        sellPrice: Number(item.sellPrice),
        stock: Number(item.stock || 0)
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
    setCashReceived('');
    setChangeGiven(0);
    setPaymentStatus('');
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
    // ... (logika console.log dan try-catch untuk simulasi backend tetap sama) ...
    try {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulasi delay

        const transactionDetails: TransactionDetails = {
            orderId: `INV-${Date.now()}`,
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

// Komponen untuk Halaman Sukses dan Struk (Dengan Perbaikan Cetak & Tampilan Struk)
const SuccessAndReceiptView = ({ details }: { details: TransactionDetails }) => {
  const router = useRouter();

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Bagian ini hanya untuk tampilan layar */}
      <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 p-4 sm:p-6 text-center">
        <CheckCircle className="text-green-500 mb-4 sm:mb-6" size={80} />
        <h1 className="text-2xl sm:text-3xl font-bold text-green-700 mb-3">Pembayaran Berhasil!</h1>
        <p className="text-slate-600 mb-6 sm:mb-8 max-w-md">
          Pesanan Anda dengan ID <span className="font-semibold text-green-700">{details.orderId}</span> telah berhasil diproses.
        </p>
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
      </div>

      {/* Area Struk: Disembunyikan di layar (hidden), ditampilkan saat print (print:block) */}
      {/* Styling untuk tampilan minimarket sekarang sepenuhnya diatur oleh @media print */}
      <div 
        id="receipt-print-area" 
        className="hidden print:block" // Penting: Sembunyikan di layar, tampilkan saat print
      >
        {/* Konten struk tetap sama persis seperti sebelumnya */}
        <h2 className="text-lg font-bold text-center text-black mb-2 pt-2"> {/* Ukuran font untuk print diatur di CSS */}
            STRUK PEMBAYARAN
        </h2>
        <div className="text-black mb-2 space-y-0 leading-tight">
          <p><strong>ID Pesanan:</strong> {details.orderId}</p>
          <p><strong>Tanggal:</strong> {new Date(details.transactionDate).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          <p><strong>Metode Bayar:</strong> {details.paymentMethod}</p>
          <p className="mt-1 border-t border-dashed border-black pt-1 text-center font-semibold">[Nama Toko Anda]</p>
        </div>
        <hr className="border-dashed border-black my-1" />
        <table className="w-full mb-1">
          <tbody>
            {details.items.map(item => (
              <tr key={item.id}>
                <td colSpan={4} className="pt-0.5 text-black break-words">{item.name}</td>
              </tr>
            ))}
            {details.items.map(item => (
              <tr key={`${item.id}-harga`} className="align-top">
                <td className="text-left py-0 pr-1 text-black">{item.quantity}x</td>
                <td className="text-left py-0 px-1 text-black">@{item.sellPrice.toLocaleString('id-ID')}</td>
                <td colSpan={2} className="text-right py-0 pl-1 text-black font-medium">{(item.sellPrice * item.quantity).toLocaleString('id-ID')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <hr className="border-dashed border-black my-1" />
        <div className="mt-1 pt-0">
          <div className="flex justify-between font-semibold text-black mb-0.5">
            <span>TOTAL :</span>
            <span>Rp{details.totalAmount.toLocaleString('id-ID')}</span>
          </div>
          {details.paymentMethod === 'CASH' && typeof details.cashReceived === 'number' && (
            <>
              <div className="flex justify-between mt-0.5">
                <span className="text-black">TUNAI :</span>
                <span className="text-black">Rp{details.cashReceived.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between font-semibold text-black">
                <span>KEMBALI :</span>
                <span>Rp{(details.changeGiven ?? 0).toLocaleString('id-ID')}</span>
              </div>
            </>
          )}
          <p className="text-center text-black mt-2 pt-1 border-t border-dashed border-gray-400">
            Terima Kasih!
          </p>
          <p className="text-center text-xs text-slate-500 mt-0.5">Layanan Pelanggan: [No. WhatsApp]</p>
        </div>
      </div>

      {/* CSS Global untuk @media print */}
      <style jsx global>{`
        @media print {
          body {
            margin: 0mm !important;
            padding: 0mm !important;
            background-color: white !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          /* Sembunyikan semua elemen di body secara default saat print */
          body > * {
            display: none !important;
          }
          /* Tampilkan hanya area struk dan pastikan parent-nya juga visible jika diperlukan */
          /* Jika #receipt-print-area adalah child langsung dari body setelah penyembunyian, ini cukup */
          #receipt-print-area {
            display: block !important; /* Memastikan elemen ini ditampilkan */
            visibility: visible !important;
            position: static !important; /* Biarkan flow normal di kertas, atau 'absolute' jika perlu takeover penuh */
            width: 72mm !important;     /* Atur lebar struk thermal, sesuaikan! */
            max-width: 72mm !important;
            margin: 0 auto !important;   /* Tengahkan jika kertas lebih lebar */
            padding: 2mm !important;     /* Padding konten struk */
            font-family: 'Consolas', 'Courier New', Courier, monospace !important;
            font-size: 8pt !important;   /* Ukuran font struk */
            line-height: 1.25 !important; /* Kerapatan baris */
            color: black !important;
            background-color: white !important;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          /* Pastikan semua anak elemen dari struk juga visible dan mewarisi style dasar */
          #receipt-print-area * {
            visibility: visible !important;
            color: black !important;
            background-color: transparent !important;
            font-size: inherit !important;
            font-family: inherit !important;
            line-height: inherit !important;
          }
          #receipt-print-area h2 { /* Spesifik untuk judul struk saat print */
             font-size: 10pt !important;
             font-weight: bold !important;
             margin-bottom: 1.5mm !important;
          }
          /* Hilangkan gambar pada struk jika tidak diperlukan */
          #receipt-print-area img {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};