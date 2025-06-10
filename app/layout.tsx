// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Providers from "./providers"; // Impor provider yang berisi SessionProvider
import './globals.css'; 

// Konfigurasi font Inter dari Google Fonts untuk tampilan teks yang modern
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap', // Mencegah teks tidak terlihat saat font sedang dimuat
});

// SEO Metadata default untuk seluruh situs
export const metadata: Metadata = {
  title: 'Mapayo Frozen Food - Makanan Beku Berkualitas & Praktis',
  description: 'Temukan berbagai pilihan makanan beku premium dari Mapayo Frozen Food. Praktis, higienis, dan lezat untuk seluruh keluarga Anda.',
  keywords: ['frozen food', 'makanan beku', 'nugget', 'sosis', 'kentang goreng', 'seafood beku', 'toko frozen food'],
  authors: [{ name: 'Mapayo Frozen Food' }],
  // Menambahkan ikon untuk tab browser
  icons: {
    icon: '/favicon.ico', // Pastikan Anda memiliki file favicon.ico di folder /public
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={inter.className}>
      <body className="bg-slate-50 text-slate-800">
        {/*
          Membungkus seluruh aplikasi dengan Providers.
          Ini akan membuat SessionProvider tersedia untuk semua halaman,
          memungkinkan penggunaan hook useSession di mana pun.
        */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
