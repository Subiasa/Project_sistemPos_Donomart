import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  ClipboardCheck, 
  Search, 
  Plus,
  History,
  AlertCircle
} from 'lucide-react';

const StockOpnamePage = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    
    const [formData, setFormData] = useState({
        product_id: '',
        stok_fisik: '',
        keterangan: ''
    });

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await api.get('/stock-opname');
            setHistory(res.data.data || []);
        } catch (error) {
            console.error('Gagal mengambil riwayat opname', error);
        } finally {
            setLoading(false);
        }
    };

    const searchProducts = async (query) => {
        if (!query) return;
        try {
            const res = await api.get(`/products?search=${query}`);
            setProducts(res.data.data || []);
        } catch (error) {
            console.error('Gagal mencari produk', error);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/stock-opname', {
                ...formData,
                stok_fisik: parseInt(formData.stok_fisik)
            });
            alert('Stock opname berhasil disimpan!');
            setFormData({ product_id: '', stok_fisik: '', keterangan: '' });
            setShowForm(false);
            fetchHistory();
        } catch (error) {
            alert('Gagal menyimpan stock opname: ' + (error.response?.data?.message || 'Error'));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tight mb-2">
                        <ClipboardCheck className="text-blue-600" />
                        Stock Opname
                    </h2>
                    <p className="text-slate-500 font-medium">Penyesuaian stok fisik dengan data sistem untuk akurasi inventaris.</p>
                </div>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all text-sm"
                >
                    <Plus size={18} />
                    Input Opname Baru
                </button>
            </div>

            {showForm && (
                <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Form Penyesuaian Stok</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Cari Produk</label>
                                <div className="relative">
                                    <input 
                                        type="text"
                                        placeholder="Ketik nama atau kode barang..."
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                        onChange={(e) => searchProducts(e.target.value)}
                                    />
                                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                </div>
                                {products.length > 0 && (
                                    <div className="mt-2 max-h-40 overflow-y-auto border border-slate-100 rounded-xl shadow-sm bg-white divide-y">
                                        {products.map(p => (
                                            <div 
                                                key={p.id}
                                                className={`p-3 cursor-pointer hover:bg-blue-50 transition-colors flex justify-between items-center ${formData.product_id === p.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                                                onClick={() => {
                                                    setFormData({...formData, product_id: p.id});
                                                    setProducts([]);
                                                }}
                                            >
                                                <div>
                                                    <p className="font-bold text-slate-700 text-sm">{p.nama}</p>
                                                    <p className="text-xs text-slate-400 font-mono">{p.kode}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-bold text-slate-500 uppercase">Sistem: {p.jumlah} {p.satuan}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Stok Fisik (Hasil Hitung)</label>
                                <input 
                                    type="number"
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-bold"
                                    value={formData.stok_fisik}
                                    onChange={(e) => setFormData({...formData, stok_fisik: e.target.value})}
                                    placeholder="Masukkan jumlah stok di gudang/rak"
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Keterangan / Alasan</label>
                                <textarea 
                                    rows="4"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                                    value={formData.keterangan}
                                    onChange={(e) => setFormData({...formData, keterangan: e.target.value})}
                                    placeholder="Contoh: Barang rusak, salah input, atau expired"
                                ></textarea>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button 
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all active:scale-95"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                                >
                                    Simpan Penyesuaian
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-white">
                    <h3 className="font-black text-slate-800 flex items-center gap-2">
                        <History size={18} className="text-slate-400" />
                        Riwayat Penyesuaian
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-slate-500 text-[11px] uppercase tracking-wider font-bold border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Waktu</th>
                                <th className="px-6 py-4">Barang</th>
                                <th className="px-6 py-4 text-center">Stok Sistem</th>
                                <th className="px-6 py-4 text-center">Stok Fisik</th>
                                <th className="px-6 py-4 text-center">Selisih</th>
                                <th className="px-6 py-4">Petugas / Keterangan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {loading ? (
                                [1,2,3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-4 bg-slate-50/50 h-16"></td>
                                    </tr>
                                ))
                            ) : history.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center text-slate-400 bg-slate-50">
                                        <div className="flex flex-col items-center justify-center">
                                            <ClipboardCheck size={48} className="opacity-20 mb-3" />
                                            <span className="font-medium text-slate-500">Belum ada data penyesuaian stok.</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                history.map(h => (
                                    <tr key={h.id} className="hover:bg-slate-50/30 transition-colors">
                                        <td className="px-6 py-4 text-slate-500 font-medium text-xs">
                                            {new Date(h.created_at).toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-700 text-sm">{h.product?.nama}</p>
                                            <p className="text-xs text-slate-400 font-mono">{h.product?.kode}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold text-slate-600">
                                            {h.stok_komputer}
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold text-blue-600">
                                            {h.stok_fisik}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`font-black text-sm ${h.selisih > 0 ? 'text-emerald-600' : h.selisih < 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                                                {h.selisih > 0 ? `+${h.selisih}` : h.selisih}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs font-bold text-slate-600">{h.user?.name || 'Admin'}</p>
                                            <p className="text-[11px] text-slate-400 italic line-clamp-1">{h.keterangan || '-'}</p>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StockOpnamePage;
