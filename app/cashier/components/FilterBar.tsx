// app/cashier/components/FilterBar.tsx
"use client";

import { FormEvent } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Category } from '../types';

interface FilterBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  handleSearchSubmit: (e: FormEvent<HTMLFormElement>) => void;
  categories: Category[];
  selectedCategory: number | null;
  handleCategoryChange: (categoryId: number | null) => void;
}

export default function FilterBar({
  searchTerm,
  setSearchTerm,
  handleSearchSubmit,
  categories,
  selectedCategory,
  handleCategoryChange,
}: FilterBarProps) {
  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-auto max-w-screen-2xl flex-col items-start gap-4 p-4 sm:h-[80px] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        
        {/* Input Pencarian di Kiri */}
        <form onSubmit={handleSearchSubmit} className="w-full sm:w-auto sm:max-w-xs">
          <label htmlFor="search-input" className="sr-only">Cari Produk</label>
          <div className="relative">
            <input
              id="search-input"
              type="text"
              placeholder="Cari produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2.5 pl-10 border border-slate-300 rounded-lg w-full text-sm text-slate-800 bg-slate-50 focus:ring-2 focus:ring-sky-300 focus:border-sky-500 transition"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            {searchTerm && (
              <button
                type='button'
                onClick={() => setSearchTerm('')}
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600'
              >
                <X size={18} />
              </button>
            )}
          </div>
        </form>

        {/* Filter Kategori di Kanan */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
           <Filter size={18} className="text-slate-500 flex-shrink-0" />
            <button
              onClick={() => handleCategoryChange(null)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors flex-shrink-0 ${
                selectedCategory === null
                  ? 'bg-sky-600 text-white shadow'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
              }`}
            >
              Semua
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors flex-shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-sky-600 text-white shadow'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
                }`}
              >
                {cat.name}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
