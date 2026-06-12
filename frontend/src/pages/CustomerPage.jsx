import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  UserCheck
} from 'lucide-react';

const CustomerPage = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [formData, setFormData] = useState({ id: null, kode: '', nama: '', alamat: '', sisa_piutang: 0 });

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/customers');
            setCustomers(response.data);
        } catch (error) {
            console.error('Gagal mengambil pelanggan', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (formData.id) {
                await api.put(`/customers/${formData.id}`, formData);
            } else {
                await api.post('/customers', formData);
            }
            setIsModalOpen(false);
            fetchCustomers();
        } catch (error) {
            alert('Gagal menyimpan pelanggan.');
        }
    };

    const handleDelete = async (id) => {
        if(window.confirm('Yakin ingin menghapus pelanggan ini?')) {
            try {
                await api.delete(`/customers/${id}`);
                fetchCustomers();
            } catch (error) {
                alert('Gagal menghapus');
            }
        }
    }

    const openEdit = (customer) => {
        setFormData(customer);
        setIsModalOpen(true);
    }

    const filtered = customers.filter(c => c.nama.toLowerCase().includes(search.toLowerCase()) || c.kode.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tight mb-2">
                        <Users className="text-blue-500" />
                        Daftar Pelanggan
                    </h2>
                    <p className="text-slate-500 font-medium">Kelola data keanggotaan dan riwayat pelanggan setia toko Anda.</p>
                </div>
                <button 
                    onClick={() => {
                        setFormData({ id: null, kode: 'CUST-'+Date.now().toString().slice(-4), nama: '', alamat: '', sisa_piutang: 0 });
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold border border-transparent shadow-md shadow-blue-600/20 active:scale-95 transition-all text-sm"
                >
                    <Plus size={18} />
                    Tambah Pelanggan
                </button>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-5 border-b border-slate-50 flex items-center gap-4 bg-white">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Cari kode atau nama..."
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-200 focus:border-slate-400 transition-all font-medium outline-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-blue-700 text-[11px] uppercase tracking-wider font-bold border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Status & Nama</th>
                                <th className="px-6 py-4">Alamat Pelanggan</th>
                                <th className="px-6 py-4 text-right">Aksi Manajemen</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {loading ? (
                                [1,2,3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={3} className="px-6 py-4 bg-slate-50/50 h-16"></td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-16 text-center text-slate-400 bg-slate-50">
                                        <div className="flex flex-col items-center justify-center">
                                            <UserCheck size={48} className="opacity-20 mb-3" />
                                            <span className="font-medium text-slate-500">Data pelanggan tidak ditemukan.</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map(c => (
                                    <tr key={c.id} className="hover:bg-slate-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 text-blue-600 flex items-center justify-center font-bold shadow-sm">{c.nama[0]?.toUpperCase()}</div>
                                                <div>
                                                    <p className="font-bold text-slate-800">{c.nama}</p>
                                                    <p className="text-[11px] text-slate-500 font-mono tracking-widest">{c.kode}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-sm font-medium">
                                            {c.alamat || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => openEdit(c)} className="p-2 text-blue-600 hover:text-white bg-slate-50 hover:bg-slate-500 border border-slate-100 rounded-lg transition-colors">
                                                    <Edit size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(c.id)} className="p-2 text-rose-500 hover:text-white bg-rose-50 hover:bg-rose-500 border border-rose-100 rounded-lg transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Formulir Pelanggan */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-800/40 backdrop-blur-sm">
                    <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 bg-slate-50">
                            <h3 className="text-xl font-black text-slate-800">{formData.id ? 'Edit' : 'Tambah'} Data Pelanggan</h3>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Kode Pelanggan</label>
                                <input type="text" value={formData.kode} onChange={e => setFormData({...formData, kode: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-slate-400 focus:ring-2 focus:ring-sky-100 focus:bg-white outline-none transition-all font-medium" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Nama Lengkap</label>
                                <input type="text" value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-slate-400 focus:ring-2 focus:ring-sky-100 focus:bg-white outline-none transition-all font-medium" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Alamat (Opsional)</label>
                                <textarea value={formData.alamat} onChange={e => setFormData({...formData, alamat: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-slate-400 focus:ring-2 focus:ring-sky-100 focus:bg-white outline-none transition-all font-medium resize-none" rows="3"></textarea>
                            </div>
                            <div className="pt-4 flex gap-3 justify-end border-t border-slate-100">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-500 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl font-bold transition-colors">Batal</button>
                                <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-600/20 active:scale-95 transition-all">Simpan Data</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerPage;


