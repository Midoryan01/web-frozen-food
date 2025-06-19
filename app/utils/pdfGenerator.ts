import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Tipe data yang telah diproses yang akan kita teruskan ke fungsi ini
type ProcessedSoldItem = ReturnType<typeof Array.prototype.flatMap<any>>[0];

export const generateSalesReportPDF = (
    items: ProcessedSoldItem[], 
    dateRange: { start: string, end: string },
    totalRevenue: number,
    totalProfit: number
) => {
    // Inisialisasi dokumen PDF
    const doc = new jsPDF();

    // Judul Dokumen
    doc.setFontSize(18);
    doc.text("Laporan Penjualan", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);

    // Informasi Filter Tanggal
    if (dateRange.start && dateRange.end) {
        const formattedStartDate = new Date(dateRange.start).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
        const formattedEndDate = new Date(dateRange.end).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
        doc.text(`Periode: ${formattedStartDate} - ${formattedEndDate}`, 14, 30);
    } else {
        doc.text("Periode: Semua Waktu", 14, 30);
    }
    
    // Buat salinan array dan urutkan berdasarkan tanggal ascending
    const sortedItems = [...items].sort((a, b) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime());
    
    const tableColumns = ["Tanggal", "No. Order", "Produk", "Qty", "Harga Jual", "Profit"];
    // Gunakan 'sortedItems' yang sudah diurutkan untuk membuat baris tabel
    const tableRows = sortedItems.map(item => [
        new Date(item.orderDate).toLocaleDateString('id-ID'),
        item.orderNumber,
        item.product.name,
        item.quantity,
        `Rp${item.sellPrice.toLocaleString('id-ID')}`,
        `Rp${item.profit.toLocaleString('id-ID')}`
    ]);

    autoTable(doc, {
        head: [tableColumns],
        body: tableRows,
        startY: 38,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
    });
    
    const finalY = (doc as any).lastAutoTable.finalY || 200;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    
    const revenueText = `Total Pendapatan: Rp${totalRevenue.toLocaleString('id-ID')}`;
    const profitText = `Total Keuntungan:  Rp${totalProfit.toLocaleString('id-ID')}`;
    
    doc.text(revenueText, 14, finalY + 10);
    doc.setTextColor(41, 128, 185);
    doc.text(profitText, 14, finalY + 18);

    const fileName = `Laporan_Penjualan_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
};