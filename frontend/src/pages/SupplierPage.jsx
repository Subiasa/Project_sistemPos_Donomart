import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  Truck, 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  Package,
  CheckCircle,
  XCircle
} from 'lucide-react';

const SupplierPage = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState({ show: false, type: '', message: '' });
    
    const [formData, setFormData] = useState({ id: null, kode: '', nama: '' });

    const showToast = (type, message) => {
        setToast({ show: true, type, message });
        setTimeout(() => setToast({ show: false, type: '', message: '' }), 3500);
    };

    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/suppliers');
            setSuppliers(response.data);
        } catch (error) {
            console.error('Gagal mengambil data supplier', error);
            showToast('error', 'Gagal mengambil data supplier dari server.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (formData.id) {
                await api.put(`/suppliers/${formData.id}`, formData);
                showToast('success', 'Data supplier berhasil diperbarui!');
            } else {
                await api.post('/suppliers', formData);
                showToast('success', 'Supplier baru berhasil ditambahkan!');
            }
            setIsModalOpen(false);
            fetchSuppliers();
        } catch (error) {
            const msg = error.response?.data?.message || 'Gagal menyimpan data supplier.';
            showToast('error', msg);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if(window.confirm('Yakin ingin menghapus supplier ini? Produk yang terhubung mungkin terpengaruh.')) {
            try {
                await api.delete(`/suppliers/${id}`);
                showToast('success', 'Supplier berhasil dihapus.');
                fetchSuppliers();
            } catch (error) {
                showToast('error', 'Gagal menghapus supplier. Mungkin masih terhubung dengan produk.');
            }
        }
    };

    const openEdit = (supplier) => {
        setFormData({ id: supplier.id, kode: supplier.kode, nama: supplier.nama });
        setIsModalOpen(true);
    };

    const openCreate = () => {
        const autoKode = 'SUP-' + Date.now().toString().slice(-4);
        setFormData({ id: null, kode: autoKode, nama: '' });
        setIsModalOpen(true);
    };

    const filtered = suppliers.filter(s => 
        s.nama.toLowerCase().includes(search.toLowerCase()) || 
        s.kode.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Toast Notification */}
            {toast.show && (
                <div className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg border text-sm font-bold transition-all animate-in slide-in-from-top-2 duration-300
                    ${toast.type === 'success' 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                        : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
                    {toast.type === 'success' 
                        ? <CheckCircle size={20} className="text-emerald-500" /> 
                        : <XCircle size={20} className="text-rose-500" />}
                    {toast.message}
                </div>
            )}

            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tight mb-2">
                        <Truck className="text-indigo-500" />
                        Daftar Supplier
                    </h2>
                    <p className="text-slate-500 font-medium">Kelola data pemasok / distributor barang untuk inventaris toko Anda.</p>
                </div>
                <button 
                    onClick={openCreate}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold border border-transparent shadow-md shadow-blue-600/20 active:scale-95 transition-all text-sm"
                >
                    <Plus size={18} />
                    Tambah Supplier
                </button>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-5 border-b border-slate-50 flex items-center gap-4 bg-white">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Cari kode atau nama supplier..."
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-200 focus:border-slate-400 transition-all font-medium outline-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="text-sm text-slate-400 font-bold whitespace-nowrap">
                        {filtered.length} supplier
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-blue-700 text-[11px] uppercase tracking-wider font-bold border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 w-16">No</th>
                                <th className="px-6 py-4">Kode Supplier</th>
                                <th className="px-6 py-4">Nama Supplier</th>
                                <th className="px-6 py-4">Terdaftar</th>
                                <th className="px-6 py-4 text-right">Aksi Manajemen</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {loading ? (
                                [1,2,3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-4 bg-slate-50/50 h-16"></td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center text-slate-400 bg-slate-50">
                                        <div className="flex flex-col items-center justify-center">
                                            <Package size={48} className="opacity-20 mb-3" />
                                            <span className="font-medium text-slate-500">Data supplier belum ada atau tidak ditemukan.</span>
                                            <button 
                                                onClick={openCreate}
                                                className="mt-4 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-all active:scale-95"
                                            >
                                                + Tambah Supplier Pertama
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((s, idx) => (
                                    <tr key={s.id} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="px-6 py-4 text-slate-400 font-mono text-sm">
                                            {idx + 1}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[11px] font-black rounded-lg uppercase border border-indigo-100 font-mono tracking-widest">
                                                {s.kode}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shadow-sm border border-indigo-100">
                                                    {s.nama[0]?.toUpperCase()}
                                                </div>
                                                <span className="font-bold text-slate-800">{s.nama}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 text-sm font-medium">
                                            {s.created_at 
                                                ? new Date(s.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) 
                                                : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => openEdit(s)} 
                                                    className="p-2 text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 border border-blue-100 hover:border-transparent rounded-lg transition-all"
                                                    title="Edit Supplier"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(s.id)} 
                                                    className="p-2 text-rose-500 hover:text-white bg-rose-50 hover:bg-rose-500 border border-rose-100 hover:border-transparent rounded-lg transition-all"
                                                    title="Hapus Supplier"
                                                >
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

            {/* Modal Formulir Supplier */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-800/40 backdrop-blur-sm">
                    <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 bg-slate-50">
                            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                <Truck size={22} className="text-indigo-500" />
                                {formData.id ? 'Edit' : 'Tambah'} Data Supplier
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">
                                {formData.id ? 'Perbarui informasi supplier yang sudah ada.' : 'Daftarkan pemasok / distributor baru.'}
                            </p>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Kode Supplier</label>
                                <input 
                                    type="text" 
                                    value={formData.kode} 
                                    onChange={e => setFormData({...formData, kode: e.target.value})} 
                                    placeholder="Contoh: SUP-001"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-slate-400 focus:ring-2 focus:ring-sky-100 focus:bg-white outline-none transition-all font-bold font-mono uppercase tracking-wide" 
                                    required 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Nama Supplier / Distributor</label>
                                <input 
                                    type="text" 
                                    value={formData.nama} 
                                    onChange={e => setFormData({...formData, nama: e.target.value})} 
                                    placeholder="Contoh: PT. Indofood Sukses Makmur"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-slate-400 focus:ring-2 focus:ring-sky-100 focus:bg-white outline-none transition-all font-medium" 
                                    required 
                                />
                            </div>
                            <div className="pt-4 flex gap-3 justify-end border-t border-slate-100">
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)} 
                                    className="px-5 py-2.5 text-slate-500 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl font-bold transition-colors"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={saving}
                                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-md shadow-blue-600/20 active:scale-95 transition-all flex items-center gap-2"
                                >
                                    {saving ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Menyimpan...
                                        </>
                                    ) : 'Simpan Data'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupplierPage;
