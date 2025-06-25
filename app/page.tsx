// app/page.tsx

"use client"; // <-- TAMBAHKAN INI di baris paling atas

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion"; // <-- IMPOR motion

// --- Komponen Ikon SVG (Tidak ada perubahan) ---
const CheckmarkIcon = () => (
    <div className="flex-shrink-0 bg-sky-100 text-sky-600 p-3 rounded-full">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /> <path d="m9 12 2 2 4-4" /> </svg>
    </div>
);
const CertificateIcon = () => (
    <div className="flex-shrink-0 bg-sky-100 text-sky-600 p-3 rounded-full">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <path d="M12.22 2h-4.44a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8.88a2 2 0 0 0 2-2V8.88Z" /> <path d="M15 2v5h5" /> </svg>
    </div>
);
const MapPinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /> <circle cx="12" cy="10" r="3" /> </svg>
);


// --- Komponen Kartu Produk (Dengan Animasi Hover) ---
interface ProductCardProps {
  imgSrc: string;
  title: string;
  description: string;
  alt: string;
}

const ProductCard = ({ imgSrc, title, description, alt }: ProductCardProps) => (
  // Diubah menjadi motion.div untuk animasi hover
  <motion.div 
    className="bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden group"
    whileHover={{ y: -8, scale: 1.03 }} // Animasi mengangkat dan sedikit membesar saat hover
    transition={{ type: "spring", stiffness: 300 }}
  >
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
  </motion.div>
);


// --- Komponen Utama Halaman ---
export default function HomePage() {
  const products = [
    { imgSrc: "/nugget-ayam-premium.jpeg", title: "Nugget Ayam Premium", description: "Dibuat dari daging ayam pilihan, renyah di luar dan lembut di dalam.", alt: "Gambar Nugget Ayam Premium", },
    { imgSrc: "/sosis-sapi.jpeg", title: "Sosis Sapi Bakar", description: "Cita rasa asap yang khas, sempurna untuk dibakar atau digoreng.", alt: "Gambar Sosis Sapi Bakar", },
    { imgSrc: "/kentang-goreng.png", title: "Kentang Goreng", description: "Potongan tipis dan panjang, menghasilkan kentang goreng yang ekstra renyah.", alt: "Gambar Kentang Goreng Shoestring", },
    { imgSrc: "/shabu-shabu.jpeg", title: "Aneka shabu", description: "Udang segar, cumi, dan ikan fillet yang dibekukan untuk menjaga kualitasnya.", alt: "Gambar aneka shabu", },
  ];

  // --- VARIAN ANIMASI untuk Framer Motion ---
  const fadeInAnimation = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeInOut" },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.15, // Jeda antar animasi anak
      },
    },
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header & Navigasi */}
      <motion.header
        id="header"
        className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-sky-600">
            Mapayo<span className="text-slate-800">Frozen</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#produk" className="text-slate-600 hover:text-sky-600 transition-colors">Produk</Link>
            <Link href="#tentang-kami" className="text-slate-600 hover:text-sky-600 transition-colors">Tentang Kami</Link>
            <Link href="#kontak" className="text-slate-600 hover:text-sky-600 transition-colors">Kontak</Link>
          </nav>
          <Link href="/login" className="bg-sky-600 text-white px-5 py-2 rounded-full hover:bg-sky-700 transition-colors text-sm font-semibold shadow-md hover:shadow-lg">
            Masuk
          </Link>
        </div>
      </motion.header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section id="hero" className="relative w-full min-h-screen text-white">
          <Image src="/Aneka-Frozen-Food.jpg" alt="Berbagai macam produk frozen food" fill priority className="object-cover -z-10"/>
          <div className="absolute inset-0 bg-black/50"></div>
          
          <div className="absolute inset-0 z-20 flex items-center justify-center px-6">
            <motion.div 
              className="text-center w-full max-w-3xl"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              <motion.h1 
                className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4"
                variants={fadeInAnimation}
              >
                Kebaikan Beku, Siap Saji Setiap Saat
              </motion.h1>

              <motion.p 
                className="text-lg md:text-xl text-gray-200 mb-8"
                variants={fadeInAnimation}
              >
                Sediakan hidangan lezat dan praktis untuk keluarga dengan produk frozen food premium dari Mapayo.
              </motion.p>

              <motion.div variants={fadeInAnimation}>
                <a href="#produk" className="bg-white text-sky-700 px-8 py-4 rounded-full text-lg font-bold hover:bg-slate-100 transition-all duration-300 shadow-xl transform hover:scale-105 inline-block">
                  Lihat Produk Kami
                </a>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section id="produk" className="py-20 md:py-24 bg-slate-50">
          <div className="container mx-auto px-6">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }} // Animasi saat elemen masuk layar
              viewport={{ once: true }} // Hanya animasi sekali
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Produk Unggulan</h2>
              <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
                Pilihan favorit untuk kemudahan dan kelezatan di meja makan Anda setiap hari.
              </p>
            </motion.div>
            
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate" // Mulai animasi saat grid masuk layar
              viewport={{ once: true }}
            >
              {products.map((product) => (
                // Tambahkan motion.div di sini untuk efek stagger
                <motion.div key={product.title} variants={fadeInAnimation}>
                  <ProductCard {...product} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* About Us Section */}
        <section id="tentang-kami" className="py-20 md:py-24 bg-white overflow-hidden">
          <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
            <motion.div 
              className="order-2 md:order-1"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Mengapa Memilih Mapayo?</h2>
              <p className="mt-4 text-lg text-slate-600">
                Kami berkomitmen menyediakan solusi hidangan yang tidak hanya praktis, tetapi juga berkualitas tinggi, higienis, dan aman dikonsumsi seluruh anggota keluarga.
              </p>
              <div className="mt-8 space-y-6">
                <div className="flex items-start gap-4"><CheckmarkIcon /><div><h4 className="font-semibold text-lg text-slate-800">Kualitas Terjamin</h4><p className="text-slate-600">Bahan baku pilihan dan diproses dengan standar kebersihan tertinggi.</p></div></div>
                <div className="flex items-start gap-4"><CertificateIcon /><div><h4 className="font-semibold text-lg text-slate-800">Sertifikasi Halal</h4><p className="text-slate-600">Semua produk kami telah tersertifikasi Halal, memberikan ketenangan bagi Anda.</p></div></div>
              </div>
            </motion.div>
            <motion.div 
              className="relative w-full h-80 lg:h-96 rounded-2xl overflow-hidden shadow-2xl order-1 md:order-2"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <Image src="/Aneka-Shabu-Shabu.jpeg" alt="Ilustrasi dapur bersih" fill className="object-cover" />
            </motion.div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section id="kontak" className="bg-sky-700">
          <motion.div 
            className="container mx-auto px-6 py-20 text-center text-white"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h2 className="text-3xl md:text-4xl font-bold">Siap Memasak Hidangan Lezat & Praktis?</h2>
            <p className="mt-4 text-lg text-sky-100 max-w-2xl mx-auto">
              Hubungi kami melalui WhatsApp untuk informasi produk, pemesanan, atau peluang menjadi reseller.
            </p>
            <div className="mt-8">
              <a href="https://wa.me/6281234567890?text=Halo%2C+saya%20tertarik%20dengan%20produk%20Mapayo%20Frozen%20Food." target="_blank" rel="noopener noreferrer" className="bg-white text-sky-700 px-8 py-4 rounded-full text-lg font-bold hover:bg-slate-100 transition-all duration-300 shadow-xl transform hover:scale-105 inline-block">
                <span className="mr-2">✓</span> Hubungi via WhatsApp
              </a>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="container mx-auto px-6 text-center">
          <p className="font-bold text-lg text-white mb-2">Mapayo Frozen Food</p>
          <a href="https://maps.app.goo.gl/ghYKGCmcDBAuswFf6" target="_blank" rel="noopener noreferrer" className="text-sm inline-flex items-center justify-center gap-2 hover:text-white transition-colors">
            <MapPinIcon />
            <span>Jl. Setia Darma I, Setiadarma, Kec. Tambun Sel., Kabupaten Bekasi, Jawa Barat 17510</span>
          </a>
          <div className="flex justify-center space-x-6 my-6">
            <a href="https://instagram.com/mapayo_frozen_food" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Instagram">Instagram</a>
            <span className="text-slate-600">|</span>
            <a href="#" className="hover:text-white transition-colors" aria-label="Facebook">Facebook</a>
            <span className="text-slate-600">|</span>
            <a href="#" className="hover:text-white transition-colors" aria-label="Tiktok">Tiktok</a>
          </div>
          <div className="mt-6 border-t border-slate-700 pt-8 text-sm">
            <p>© {new Date().getFullYear()} Mapayo Frozen Food. Semua Hak Cipta Dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}