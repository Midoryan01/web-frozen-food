import React, { useState } from 'react';
import { XCircle } from 'lucide-react';
import type { User } from '../types';

interface UserFormModalProps {
    user: User | null;
    onClose: () => void;
    onSave: () => Promise<void>;
    apiBaseUrl: string;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ user, onClose, onSave, apiBaseUrl }) => {
    const [formData, setFormData] = useState({
        fullName: user?.fullName || '',
        username: user?.username || '',
        password: '',
        role: user?.role || 'KASIR',
        isActive: user?.isActive !== undefined ? user.isActive : true,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user && !formData.password) {
            setError('Password wajib diisi untuk pengguna baru.');
            return;
        }
        setError(null);
        setIsSubmitting(true);
        
        const dataToSend: any = { ...formData };
        if (!dataToSend.password) {
            delete dataToSend.password;
        }

        try {
            const url = user ? `${apiBaseUrl}/users/${user.id}` : `${apiBaseUrl}/users`;
            const method = user ? 'PATCH' : 'POST';
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal menyimpan data pengguna');
            }
            alert(`Pengguna berhasil ${user ? 'diperbarui' : 'ditambahkan'}!`);
            await onSave();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-xl font-bold text-slate-800">{user ? 'Edit Pengguna' : 'Tambah Pengguna'}</h2>
                    <button onClick={onClose}><XCircle /></button>
                </div>
                {error && <p className="text-red-500 bg-red-100 p-2 rounded text-sm mb-4">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Nama Lengkap*</label>
                        <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required className="mt-1 w-full p-2 border border-slate-300 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Username*</label>
                        <input type="text" name="username" value={formData.username} onChange={handleChange} required className="mt-1 w-full p-2 border border-slate-300 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Password {user ? '(Kosongkan jika tidak ganti)' : '*'}</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} className="mt-1 w-full p-2 border border-slate-300 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Role</label>
                        <select name="role" value={formData.role} onChange={handleChange} className="mt-1 w-full p-2 border border-slate-300 rounded-md bg-white">
                            <option value="KASIR">Kasir</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg">Batal</button>
                        <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg disabled:bg-slate-300">
                            {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserFormModal;