"use client";

import React, { useState, useEffect, useMemo } from 'react';
import type { User } from '../types';
import { PlusCircle, Edit3, Trash2, RefreshCw, Search } from 'lucide-react';
import UserFormModal from '../components/UserFormModal';

interface UserManagementViewProps {
    initialUsers: User[];
    refreshUsers: () => Promise<void>;
    apiBaseUrl: string;
}

const UserManagementView: React.FC<UserManagementViewProps> = ({ initialUsers, refreshUsers, apiBaseUrl }) => {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isLoadingTable, setIsLoadingTable] = useState(false);
    
    // State untuk filter dan search
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<'' | 'ADMIN' | 'KASIR'>('');
    const [filterStatus, setFilterStatus] = useState<'' | 'true' | 'false'>('');

    useEffect(() => {
        setUsers(initialUsers);
    }, [initialUsers]);
    
    // Memoized filtering and searching
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  user.username.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = filterRole ? user.role === filterRole : true;
            const matchesStatus = filterStatus ? String(user.isActive) === filterStatus : true;
            
            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [users, searchTerm, filterRole, filterStatus]);

    const handleRefresh = async () => {
        setIsLoadingTable(true);
        await refreshUsers();
        setIsLoadingTable(false);
    };

    const handleAddUser = () => {
        setEditingUser(null);
        setShowModal(true);
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setShowModal(true);
    };
    
    const handleDeleteUser = async (userId: number) => {
        if(window.confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
            // Logika untuk menghapus user via API
            alert(`Placeholder: Menghapus user dengan ID ${userId}`);
            await refreshUsers(); // Refresh data setelah aksi
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Manajemen Pengguna</h1>
                <div className="flex gap-2">
                     <button onClick={handleRefresh} disabled={isLoadingTable} className="bg-slate-200 text-slate-700 px-4 py-2.5 rounded-lg hover:bg-slate-300 transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50">
                        <RefreshCw size={16} className={isLoadingTable ? "animate-spin" : ""} /> Refresh
                    </button>
                    <button onClick={handleAddUser} className="bg-sky-600 text-white px-4 py-2.5 rounded-lg hover:bg-sky-700 transition-colors flex items-center gap-2 text-sm font-medium">
                        <PlusCircle size={18} /> Tambah Pengguna
                    </button>
                </div>
            </div>

            {/* Filter dan Search Section */}
            <div className="p-4 bg-white rounded-lg shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                     <label htmlFor="searchUser" className="block text-xs font-medium text-slate-600 mb-1">Cari Pengguna</label>
                     <div className="relative">
                        <input type="text" id="searchUser" placeholder="Nama atau Username..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2 pl-9 border border-slate-300 rounded-lg text-sm"/>
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
                     </div>
                </div>
                <div>
                     <label htmlFor="filterRole" className="block text-xs font-medium text-slate-600 mb-1">Filter Role</label>
                     <select id="filterRole" value={filterRole} onChange={e => setFilterRole(e.target.value as any)} className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white">
                        <option value="">Semua Role</option>
                        <option value="ADMIN">Admin</option>
                        <option value="KASIR">Kasir</option>
                     </select>
                </div>
                 <div>
                     <label htmlFor="filterStatus" className="block text-xs font-medium text-slate-600 mb-1">Filter Status</label>
                     <select id="filterStatus" value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)} className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white">
                        <option value="">Semua Status</option>
                        <option value="true">Aktif</option>
                        <option value="false">Non-Aktif</option>
                     </select>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                <table className="w-full min-w-[600px]">
                    <thead className="bg-slate-100">
                        <tr>
                            <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase">Nama Lengkap</th>
                            <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase">Username</th>
                            <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase">Role</th>
                            <th className="p-3 text-center text-xs font-semibold text-slate-500 uppercase">Status</th>
                            <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase">Tgl. Dibuat</th>
                            <th className="p-3 text-center text-xs font-semibold text-slate-500 uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td className="p-3 text-sm font-medium text-slate-700">{user.fullName}</td>
                                <td className="p-3 text-sm text-slate-500">{user.username}</td>
                                <td className="p-3 text-sm text-slate-500">{user.role}</td>
                                <td className="p-3 text-center">
                                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {user.isActive ? 'Aktif' : 'Non-Aktif'}
                                    </span>
                                </td>
                                <td className="p-3 text-sm text-slate-500">{new Date(user.createdAt).toLocaleDateString('id-ID')}</td>
                                <td className="p-3 text-center">
                                    <button onClick={() => handleEditUser(user)} className="text-sky-600 hover:text-sky-800 p-1.5" title="Edit Pengguna"><Edit3 size={16} /></button>
                                    <button onClick={() => handleDeleteUser(user.id)} className="text-red-500 hover:text-red-700 p-1.5 ml-1" title="Hapus Pengguna"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredUsers.length === 0 && <p className="text-center text-slate-500 py-10">Tidak ada pengguna ditemukan sesuai filter.</p>}
            </div>
            {showModal && <UserFormModal user={editingUser} onClose={() => setShowModal(false)} onSave={async () => { await refreshUsers(); setShowModal(false); }} apiBaseUrl={apiBaseUrl} />}
        </div>
    );
};

export default UserManagementView;
