"use client";

import React, { useState, useEffect } from 'react';
import type { Category } from '../types';
import { XCircle } from 'lucide-react';

interface CategoryFormModalProps {
    category: Category | null;
    onClose: () => void;
    onSave: () => void;
    apiBaseUrl: string;
}

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({ category, onClose, onSave, apiBaseUrl }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (category) {
            setName(category.name);
            setDescription(category.description || '');
        } else {
            setName('');
            setDescription('');
        }
        setError(null);
    }, [category]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const url = category
                ? `${apiBaseUrl}/category/${category.id}`
                : `${apiBaseUrl}/category`;
            
            const method = category ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Gagal ${category ? 'memperbarui' : 'menyimpan'} kategori.`);
            }

            alert(`Kategori berhasil ${category ? 'diperbarui' : 'disimpan'}!`);
            onSave();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md">
                <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800">{category ? 'Edit Kategori' : 'Tambah Kategori Baru'}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <XCircle size={28} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Nama Kategori</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Deskripsi (Opsional)</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
                        />
                    </div>
                    {error && <p className="text-sm text-red-600 bg-red-100 p-2 rounded-md">{error}</p>}
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg">
                            Batal
                        </button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg disabled:bg-sky-300">
                            {isLoading ? 'Menyimpan...' : 'Simpan Kategori'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryFormModal;