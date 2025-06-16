"use client";

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (size: number) => void;
  totalItems: number;
  className?: string;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  totalItems,
  className = '',
}) => {
  // *** PERBAIKAN: Hapus kondisi ini agar navigasi selalu tampil ***
  // Logika sebelumnya: if (totalPages <= 1) { return null; }
  // Navigasi sekarang akan selalu muncul selama ada item (totalItems > 0).
  if (totalItems === 0) {
      return null; // Tetap sembunyikan jika tidak ada data sama sekali.
  }

  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-4 bg-slate-50 border-t border-slate-200 ${className}`}>
      {/* Pilihan item per halaman */}
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <span>Tampilkan</span>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="p-1.5 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
          aria-label="Items per page"
        >
          {[10, 25, 50, 100].map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
        <span>entri</span>
      </div>

      {/* Informasi halaman */}
      <div className="text-sm text-slate-600">
        Menampilkan {startItem}-{endItem} dari {totalItems} entri
      </div>

      {/* Tombol navigasi */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-3 py-1.5 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft size={16} />
          <span>Sebelumnya</span>
        </button>
        
        <span className="text-sm text-slate-700 font-medium px-2" aria-live="polite">
          Halaman {currentPage} dari {totalPages > 0 ? totalPages : 1}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="flex items-center gap-1 px-3 py-1.5 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Halaman berikutnya"
        >
          <span>Berikutnya</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default PaginationControls;
