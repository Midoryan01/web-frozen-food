// app/page.tsx
import React from "react";
import Image from "next/image";
import Link from "next/link";

// --- Komponen Ikon SVG (disimpan di sini agar file tetap ringkas) ---

const CheckmarkIcon = () => (
  <div className="flex-shrink-0 bg-sky-100 text-sky-600 p-3 rounded-full">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  </div>
);

const CertificateIcon = () => (
  <div className="flex-shrink-0 bg-sky-100 text-sky-600 p-3 rounded-full">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-4.44a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8.88a2 2 0 0 0 2-2V8.88Z" />
      <path d="M15 2v5h5" />
    </svg>
  </div>
);

const MapPinIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

// --- Komponen Kartu Produk ---

interface ProductCardProps {
  imgSrc: string;
  title: string;
  description: string;
  alt: string;
}

const ProductCard = ({ imgSrc, title, description, alt }: ProductCardProps) => (
  <div className="bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden group transform hover:-translate-y-2 transition-transform duration-300">
    <div className="relative w-full h-48">
      <Image
        src={imgSrc}
        alt={alt}
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-300"
      />
    </div>
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-2 text-slate-900">{title}</h3>
      <p className="text-slate-600 text-sm">{description}</p>
    </div>
  </div>
);

// --- Komponen Utama Halaman ---

export default function HomePage() {
  const products = [
    {
      imgSrc: "/nugget-ayam-premium.jpeg",
      title: "Nugget Ayam Premium",
      description:
        "Dibuat dari daging ayam pilihan, renyah di luar dan lembut di dalam.",
      alt: "Gambar Nugget Ayam Premium",
    },
    {
      imgSrc: "/sosis-sapi.jpeg",
      title: "Sosis Sapi Bakar",
      description:
        "Cita rasa asap yang khas, sempurna untuk dibakar atau digoreng.",
      alt: "Gambar Sosis Sapi Bakar",
    },
    {
      imgSrc: "/kentang-goreng.png",
      title: "Kentang Goreng ",
      description:
        "Potongan tipis dan panjang, menghasilkan kentang goreng yang ekstra renyah.",
      alt: "Gambar Kentang Goreng Shoestring",
    },
    {
      imgSrc: "/shabu-shabu.jpeg",
      title: "Aneka shabu",
      description:
        "Udang segar, cumi, dan ikan fillet yang dibekukan untuk menjaga kualitasnya.",
      alt: "Gambar aneka shabu",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header & Navigasi */}
      <header
        id="header"
        className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-50 transition-all duration-300"
      >
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-sky-600">
            Mapayo<span className="text-slate-800">Frozen</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="#produk"
              className="text-slate-600 hover:text-sky-600 transition-colors"
            >
              Produk
            </Link>
            <Link
              href="#tentang-kami"
              className="text-slate-600 hover:text-sky-600 transition-colors"
            >
              Tentang Kami
            </Link>
            <Link
              href="#kontak"
              className="text-slate-600 hover:text-sky-600 transition-colors"
            >
              Kontak
            </Link>
          </nav>
          <Link
            href="/login"
            className="bg-sky-600 text-white px-5 py-2 rounded-full hover:bg-sky-700 transition-colors text-sm font-semibold shadow-md hover:shadow-lg"
          >
            Masuk
          </Link>
        </div>
      </header>
      <main className="flex-grow">
        {/* Hero Section */}
        <section id="hero" className="relative w-full min-h-screen text-white">
          <Image
            src="/Aneka-Frozen-Food.jpg"
            alt="Berbagai macam produk frozen food yang disajikan dengan menarik"
            fill
            priority
            className="object-cover -z-10"
          />
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="relative z-20 container mx-auto px-6 h-full flex items-center">
            <div className="text-center w-full pt-50">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
                Kebaikan Beku, Siap Saji Setiap Saat
              </h1>

              <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto mb-8">
                Sediakan hidangan lezat dan praktis untuk keluarga dengan produk
                frozen food premium dari Mapayo.
              </p>

              <a
                href="#produk"
                className="bg-white text-sky-700 px-8 py-4 rounded-full text-lg font-bold hover:bg-slate-100 transition-all duration-300 shadow-xl transform hover:scale-105 inline-block"
              >
                Lihat Produk Kami
              </a>
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section id="produk" className="py-20 md:py-24 bg-slate-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                Produk Unggulan
              </h2>
              <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
                Pilihan favorit untuk kemudahan dan kelezatan di meja makan Anda
                setiap hari.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <ProductCard key={product.title} {...product} />
              ))}
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section id="tentang-kami" className="py-20 md:py-24 bg-white">
          <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                Mengapa Memilih Mapayo?
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Kami berkomitmen menyediakan solusi hidangan yang tidak hanya
                praktis, tetapi juga berkualitas tinggi, higienis, dan aman
                dikonsumsi seluruh anggota keluarga.
              </p>
              <div className="mt-8 space-y-6">
                <div className="flex items-start gap-4">
                  <CheckmarkIcon />
                  <div>
                    <h4 className="font-semibold text-lg text-slate-800">
                      Kualitas Terjamin
                    </h4>
                    <p className="text-slate-600">
                      Bahan baku pilihan dan diproses dengan standar kebersihan
                      tertinggi.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <CertificateIcon />
                  <div>
                    <h4 className="font-semibold text-lg text-slate-800">
                      Sertifikasi Halal
                    </h4>
                    <p className="text-slate-600">
                      Semua produk kami telah tersertifikasi Halal, memberikan
                      ketenangan bagi Anda.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative w-full h-80 lg:h-96 rounded-2xl overflow-hidden shadow-2xl order-1 md:order-2">
              <Image
                src="/Aneka-Shabu-Shabu.jpeg"
                alt="Foto ilustrasi dapur produksi yang bersih dan modern"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section id="kontak" className="bg-sky-700">
          <div className="container mx-auto px-6 py-20 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold">
              Siap Memasak Hidangan Lezat & Praktis?
            </h2>
            <p className="mt-4 text-lg text-sky-100 max-w-2xl mx-auto">
              Hubungi kami melalui WhatsApp untuk informasi produk, pemesanan,
              atau peluang menjadi reseller.
            </p>
            <div className="mt-8">
              <a
                href="https://wa.me/6281234567890?text=Halo%2C+saya%20tertarik%20dengan%20produk%20Mapayo%20Frozen%20Food."
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-sky-700 px-8 py-4 rounded-full text-lg font-bold hover:bg-slate-100 transition-all duration-300 shadow-xl transform hover:scale-105 inline-block"
              >
                <span className="mr-2">✓</span> Hubungi via WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>
      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="container mx-auto px-6 text-center">
          <p className="font-bold text-lg text-white mb-2">
            Mapayo Frozen Food
          </p>
          {/* --- MODIFIKASI: Alamat menjadi link Google Maps --- */}
          <a
            href="https://maps.app.goo.gl/ghYKGCmcDBAuswFf6"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm inline-flex items-center justify-center gap-2 hover:text-white transition-colors"
          >
            <MapPinIcon />
            <span>
              Jl. Setia Darma I, Setiadarma, Kec. Tambun Sel., Kabupaten Bekasi,
              Jawa Barat 17510
            </span>
          </a>
          <div className="flex justify-center space-x-6 my-6">
            <a
              href="https://instagram.com/mapayo_frozen_food" 
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
              aria-label="Instagram"
            >
              Instagram
            </a>
            <span className="text-slate-600">|</span>
            <a
              href="https://facebook.com/akun_anda" // GANTI DENGAN LINK FB ANDA
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
              aria-label="Facebook"
            >
              Facebook
            </a>
            <span className="text-slate-600">|</span>
            <a
              href="https://tiktok.com/@akun_anda" // GANTI DENGAN LINK TIKTOK ANDA
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
              aria-label="Tiktok"
            >
              Tiktok
            </a>
          </div>
          <div className="mt-6 border-t border-slate-700 pt-8 text-sm">
            <p>
              &copy; {new Date().getFullYear()} Mapayo Frozen
              Food. Semua Hak Cipta Dilindungi.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
