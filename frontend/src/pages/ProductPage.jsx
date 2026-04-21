import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Upload,
  PackageSearch
} from 'lucide-react';

const ProductPage = () => {
    // Component Logic Remains Unchanged
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        kode: '', nama: '', deskripsi: '', category_id: '',
        jumlah: 0, satuan: 'Pcs', harga_beli: 0, harga_jual: 0,
        supplier_id: '', lokasi: '', diskon_persen: 0, stok_min: 0, expired_date: ''
    });

    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await api.get('/products');
            setProducts(response.data.data || response.data);
        } catch (error) {
            console.error('Gagal mengambil produk', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOptions = async () => {
        try {
            const [catRes, supRes] = await Promise.all([
                api.get('/categories').catch(() => ({ data: { data: [] } })),
                api.get('/suppliers').catch(() => ({ data: { data: [] } }))
            ]);
            setCategories(catRes.data.data || catRes.data || []);
            setSuppliers(supRes.data.data || supRes.data || []);
        } catch (error) {
            console.error('Gagal memuat kategori/supplier');
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchOptions();
    }, []);

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/products', formData);
            fetchProducts();
            setIsAddModalOpen(false);
            setFormData({
                kode: '', nama: '', deskripsi: '', category_id: '',
                jumlah: 0, satuan: 'Pcs', harga_beli: 0, harga_jual: 0,
                supplier_id: '', lokasi: '', diskon_persen: 0, stok_min: 0, expired_date: ''
            });
        } catch (error) {
            alert('Gagal menambah barang: ' + (error.response?.data?.message || 'Validasi Error'));
        }
    };

    const handleImportSubmit = async (e) => {
        e.preventDefault();
        if (!file) return;

        const formDataFile = new FormData();
        formDataFile.append('file', file);
        setUploading(true);
        try {
            await api.post('/products/import', formDataFile, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchProducts();
            setIsImportModalOpen(false);
            setFile(null);
            alert('Import berhasil!');
        } catch (error) {
            alert('Gagal mengimpor file: ' + (error.response?.data?.message || 'Error'));
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if(window.confirm('Yakin ingin menghapus produk ini?')) {
            try {
                await api.delete(`/products/${id}`);
                fetchProducts();
            } catch (error) {
                alert('Gagal menghapus');
            }
        }
    }

    const filtered = products.filter(p => p.nama.toLowerCase().includes(search.toLowerCase()) || p.kode.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Master Barang</h2>
                    <p className="text-slate-500 font-medium">Kelola inventori dan harga barang toko Anda.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setIsImportModalOpen(true)} className="flex items-center gap-2 px-5 py-3 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-bold border border-slate-200 shadow-sm transition-all text-sm">
                        <Upload size={18} />
                        Import Excel
                    </button>
                    <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 active:scale-95 transition-all text-sm">
                        <Plus size={18} />
                        Tambah Barang
                    </button>
                </div>
            </div>

            <div className="bg-white border border-sky-100 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-5 border-b border-sky-50 flex items-center gap-4 bg-white">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Cari nama barang atau barcode..."
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-200 focus:border-sky-400 transition-all font-medium outline-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left">
                        <thead className="bg-sky-50/50 text-sky-700 text-[11px] uppercase tracking-wider font-bold border-b border-sky-100">
                            <tr>
                                <th className="px-6 py-4">No</th>
                                <th className="px-6 py-4">Kode/Barcode</th>
                                <th className="px-6 py-4">Nama Barang</th>
                                <th className="px-6 py-4">Kategori</th>
                                <th className="px-6 py-4 text-center">Stok</th>
                                <th className="px-6 py-4">Satuan</th>
                                <th className="px-6 py-4 text-right">Harga Beli</th>
                                <th className="px-6 py-4 text-right">Harga Jual</th>
                                <th className="px-6 py-4 text-center">Diskon</th>
                                <th className="px-6 py-4">Suplier</th>
                                <th className="px-6 py-4">Lokasi</th>
                                <th className="px-6 py-4 text-center">Stok Min</th>
                                <th className="px-6 py-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 whitespace-nowrap bg-white text-sm">
                            {loading ? (
                                [1,2,3,4,5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={13} className="px-6 py-4 bg-slate-50/50 h-16"></td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={13} className="px-6 py-16 text-center text-slate-400 bg-slate-50">
                                        <div className="flex flex-col items-center justify-center">
                                            <PackageSearch size={48} className="opacity-20 mb-3" />
                                            <span className="font-medium text-slate-500">Belum ada data barang ditemukan.</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((product, index) => (
                                    <tr key={product.id} className="hover:bg-sky-50/30 transition-colors">
                                        <td className="px-6 py-4 text-slate-400 font-bold">{index + 1}</td>
                                        <td className="px-6 py-4 text-slate-500 font-mono text-xs">{product.kode}</td>
                                        <td className="px-6 py-4 font-bold text-slate-700">
                                            {product.nama}
                                            {product.deskripsi && <span className="block text-xs font-normal text-slate-400 mt-0.5 truncate max-w-[200px]">{product.deskripsi}</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-sky-100/50 text-sky-700 text-[10px] font-black rounded-lg uppercase border border-sky-100">
                                                {product.category?.nama || 'Umum'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`font-black text-sm px-2 py-1 rounded ${product.jumlah <= (product.stok_min || 0) ? 'bg-rose-100 text-rose-600' : 'text-slate-600'}`}>
                                                {product.jumlah}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-xs font-bold">{product.satuan}</td>
                                        <td className="px-6 py-4 text-slate-400 text-right">Rp {Number(product.harga_beli || 0).toLocaleString()}</td>
                                        <td className="px-6 py-4 font-black text-slate-800 text-right">Rp {Number(product.harga_jual || 0).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-center font-bold text-emerald-600">{product.diskon_persen || 0}%</td>
                                        <td className="px-6 py-4 text-slate-500 text-xs font-bold">{product.supplier?.nama || '-'}</td>
                                        <td className="px-6 py-4 text-slate-500 text-xs font-mono">{product.lokasi || '-'}</td>
                                        <td className="px-6 py-4 text-slate-400 text-center">{product.stok_min || 0}</td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button className="p-2 text-sky-600 hover:text-white hover:bg-sky-500 bg-sky-50 border border-sky-100 rounded-lg transition-colors">
                                                    <Edit size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(product.id)} className="p-2 text-rose-500 hover:text-white hover:bg-rose-500 bg-rose-50 border border-rose-100 rounded-lg transition-colors">
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

            {/* Modal Tambah Barang */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-800/40 backdrop-blur-sm">
                    <div className="bg-white border border-slate-200 w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                            <h3 className="text-xl font-black text-slate-800">Tambah Barang Manual</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors bg-white w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 shadow-sm">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            </button>
                        </div>
                        
                        <div className="overflow-y-auto p-6 bg-white custom-scrollbar text-sm">
                            <form onSubmit={handleAddSubmit} id="addForm">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* All Inputs use Light Theme forms */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Kode / Barcode</label>
                                        <input type="text" value={formData.kode} onChange={e => setFormData({...formData, kode: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 focus:bg-white outline-none transition-all font-medium" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Nama Barang</label>
                                        <input type="text" value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 focus:bg-white outline-none transition-all font-medium" required />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Kategori</label>
                                        <div className="flex gap-2">
                                            <select value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 focus:bg-white outline-none transition-all font-medium">
                                                <option value="">Pilih Kategori</option>
                                                {categories.map(c => <option key={c.id} value={c.id}>{c.nama || c.name}</option>)}
                                            </select>
                                            <button type="button" onClick={async () => {
                                                const newCat = window.prompt('Masukkan nama kategori baru:');
                                                if(newCat) {
                                                    try {
                                                        await api.post('/categories', { nama: newCat });
                                                        const catRes = await api.get('/categories');
                                                        setCategories(catRes.data.data || catRes.data || []);
                                                    } catch(e) { alert('Gagal menambah kategori'); }
                                                }
                                            }} className="bg-sky-100/50 hover:bg-sky-200 text-sky-700 px-5 rounded-xl font-black border border-sky-200 transition-colors shadow-sm shrink-0">+</button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Stok Awal</label>
                                        <input type="number" onFocus={e => e.target.select()} value={formData.jumlah} onChange={e => setFormData({...formData, jumlah: e.target.value.replace(/^0+(?=\d)/, '')})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 focus:bg-white outline-none transition-all font-medium" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Satuan</label>
                                        <select value={formData.satuan} onChange={e => setFormData({...formData, satuan: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 focus:bg-white outline-none transition-all font-medium" required>
                                            <option value="Pcs">Pcs</option><option value="Dus">Dus</option><option value="Pack">Pack</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Harga Beli (Rp)</label>
                                        <input type="number" onFocus={e => e.target.select()} value={formData.harga_beli} onChange={e => setFormData({...formData, harga_beli: e.target.value.replace(/^0+(?=\d)/, '')})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 focus:bg-white outline-none transition-all font-bold" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Harga Jual (Rp)</label>
                                        <input type="number" onFocus={e => e.target.select()} value={formData.harga_jual} onChange={e => setFormData({...formData, harga_jual: e.target.value.replace(/^0+(?=\d)/, '')})} className="w-full bg-slate-50 border border-emerald-300 rounded-xl px-4 py-3 text-emerald-700 bg-emerald-50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all font-black text-lg" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Stok Min (Alert)</label>
                                        <input type="number" onFocus={e => e.target.select()} value={formData.stok_min} onChange={e => setFormData({...formData, stok_min: e.target.value.replace(/^0+(?=\d)/, '')})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 focus:bg-white outline-none transition-all font-medium" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Expired Date</label>
                                        <input type="date" value={formData.expired_date} onChange={e => setFormData({...formData, expired_date: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 focus:bg-white outline-none transition-all font-medium" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Suplier</label>
                                        <select value={formData.supplier_id} onChange={e => setFormData({...formData, supplier_id: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 focus:bg-white outline-none transition-all font-medium">
                                            <option value="">Pilih Suplier...</option>
                                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Diskon Persen (%)</label>
                                        <input type="number" onFocus={e => e.target.select()} value={formData.diskon_persen} onChange={e => setFormData({...formData, diskon_persen: e.target.value.replace(/^0+(?=\d)/, '')})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 focus:bg-white outline-none transition-all font-medium" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Lokasi / Rak Penyimpanan</label>
                                        <input type="text" value={formData.lokasi} onChange={e => setFormData({...formData, lokasi: e.target.value})} placeholder="Contoh: Rak C-21" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 focus:bg-white outline-none transition-all font-medium" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Deskripsi Barang</label>
                                        <textarea value={formData.deskripsi} onChange={e => setFormData({...formData, deskripsi: e.target.value})} placeholder="Penjelasan / rincian tambahan..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 focus:bg-white outline-none transition-all font-medium min-h-[80px]"></textarea>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="p-5 border-t border-slate-100 shrink-0 bg-slate-50 flex justify-end gap-3 rounded-b-3xl">
                            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-6 py-2.5 text-slate-500 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl font-bold transition-colors">Batal</button>
                            <button type="submit" form="addForm" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 active:scale-95 transition-all">Simpan Barang</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Import Excel Omitted mapping for brevity, but matches white modal styling */}
            {isImportModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-800/40 backdrop-blur-sm">
                    <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                            <h3 className="text-xl font-black text-slate-800">Import Data Excel</h3>
                            <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors bg-white w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 shadow-sm">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            </button>
                        </div>
                        <div className="p-6 bg-white flex flex-col gap-4">
                            <p className="text-sm text-slate-600 font-medium">Pastikan format file excel Anda sesuai dengan template master barang. Sistem hanya menerima format .xlsx atau .csv.</p>
                            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50 text-center flex flex-col items-center justify-center">
                                <input type="file" accept=".xlsx,.csv" onChange={(e) => setFile(e.target.files[0])} className="text-sm text-slate-600 w-full file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-sky-100 file:text-sky-700 hover:file:bg-sky-200 cursor-pointer transition-all" />
                            </div>
                        </div>
                        <div className="p-5 border-t border-slate-100 flex justify-end gap-3 rounded-b-3xl bg-slate-50">
                            <button type="button" onClick={() => setIsImportModalOpen(false)} className="px-6 py-2.5 text-slate-500 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl font-bold transition-colors">Batal</button>
                            <button onClick={handleImportSubmit} disabled={!file || uploading} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all">
                                {uploading ? 'Mengupload...' : 'Import Data'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductPage;
