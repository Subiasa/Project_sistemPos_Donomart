import React from 'react';

const ProductAddModal = ({ 
    isAddModalOpen, setIsAddModalOpen, handleAddSubmit, 
    formData, setFormData, categories, setCategories, suppliers, api, isEditing 
}) => {
    if (!isAddModalOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-800/40 backdrop-blur-sm">
            <div className="bg-white border border-slate-200 w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                    <h3 className="text-xl font-black text-slate-800">{isEditing ? 'Edit Barang' : 'Tambah Barang Manual'}</h3>
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
                                <input type="text" value={formData.kode} onChange={e => setFormData({...formData, kode: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-slate-400 focus:ring-2 focus:ring-sky-100 focus:bg-white outline-none transition-all font-medium" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Nama Barang</label>
                                <input type="text" value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-slate-400 focus:ring-2 focus:ring-sky-100 focus:bg-white outline-none transition-all font-medium" required />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Kategori</label>
                                <div className="flex gap-2">
                                    <select value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-slate-400 focus:ring-2 focus:ring-sky-100 focus:bg-white outline-none transition-all font-medium">
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
                                    }} className="bg-slate-100/50 hover:bg-slate-200 text-blue-700 px-5 rounded-xl font-black border border-slate-200 transition-colors shadow-sm shrink-0">+</button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Stok Awal</label>
                                <input type="number" onFocus={e => e.target.select()} value={formData.jumlah} onChange={e => setFormData({...formData, jumlah: e.target.value.replace(/^0+(?=\d)/, '')})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-slate-400 focus:ring-2 focus:ring-sky-100 focus:bg-white outline-none transition-all font-medium" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Satuan</label>
                                <select value={formData.satuan} onChange={e => setFormData({...formData, satuan: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-slate-400 focus:ring-2 focus:ring-sky-100 focus:bg-white outline-none transition-all font-medium" required>
                                    <option value="Pcs">Pcs</option><option value="Dus">Dus</option><option value="Pack">Pack</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Harga Beli (Rp)</label>
                                <input type="number" onFocus={e => e.target.select()} value={formData.harga_beli} onChange={e => setFormData({...formData, harga_beli: e.target.value.replace(/^0+(?=\d)/, '')})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-slate-400 focus:ring-2 focus:ring-sky-100 focus:bg-white outline-none transition-all font-bold" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Harga Jual (Rp)</label>
                                <input type="number" onFocus={e => e.target.select()} value={formData.harga_jual} onChange={e => setFormData({...formData, harga_jual: e.target.value.replace(/^0+(?=\d)/, '')})} className="w-full bg-slate-50 border border-emerald-300 rounded-xl px-4 py-3 text-emerald-700 bg-emerald-50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all font-black text-lg" required />
                            </div>
                            
                            {/* --- Grosir Section --- */}
                            <div className="md:col-span-2 pt-4 border-t border-slate-100 mt-2">
                                <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M2 12h20"/><path d="m5 15-3-3 3-3"/><path d="m19 9 3 3-3 3"/></svg> Pengaturan Grosir (Opsional)</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Barcode Grosir</label>
                                        <input type="text" value={formData.barcode_grosir} onChange={e => setFormData({...formData, barcode_grosir: e.target.value})} className="w-full bg-blue-50/30 border border-blue-100 rounded-xl px-4 py-3 text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium" placeholder="Kosongkan jika tidak ada" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Satuan Grosir</label>
                                        <input type="text" value={formData.satuan_grosir} onChange={e => setFormData({...formData, satuan_grosir: e.target.value})} className="w-full bg-blue-50/30 border border-blue-100 rounded-xl px-4 py-3 text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium" placeholder="Misal: Dus, Karton" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Isi per Satuan (Konversi)</label>
                                        <input type="number" onFocus={e => e.target.select()} value={formData.konversi_grosir} onChange={e => setFormData({...formData, konversi_grosir: e.target.value.replace(/^0+(?=\d)/, '')})} className="w-full bg-blue-50/30 border border-blue-100 rounded-xl px-4 py-3 text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-blue-500 mb-1.5 uppercase tracking-wide">Harga Jual Grosir (Rp)</label>
                                        <input type="number" onFocus={e => e.target.select()} value={formData.harga_jual_grosir} onChange={e => setFormData({...formData, harga_jual_grosir: e.target.value.replace(/^0+(?=\d)/, '')})} className="w-full bg-blue-50 border border-blue-300 rounded-xl px-4 py-3 text-blue-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-black text-lg" />
                                    </div>
                                </div>
                            </div>
                            <div className="md:col-span-2 border-b border-slate-100 mb-2"></div>
                            {/* ---------------------- */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Stok Min (Alert)</label>
                                <input type="number" onFocus={e => e.target.select()} value={formData.stok_min} onChange={e => setFormData({...formData, stok_min: e.target.value.replace(/^0+(?=\d)/, '')})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-slate-400 focus:ring-2 focus:ring-sky-100 focus:bg-white outline-none transition-all font-medium" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Expired Date</label>
                                <input type="date" value={formData.expired_date} onChange={e => setFormData({...formData, expired_date: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-slate-400 focus:ring-2 focus:ring-sky-100 focus:bg-white outline-none transition-all font-medium" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Suplier</label>
                                <select value={formData.supplier_id} onChange={e => setFormData({...formData, supplier_id: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-slate-400 focus:ring-2 focus:ring-sky-100 focus:bg-white outline-none transition-all font-medium">
                                    <option value="">Pilih Suplier...</option>
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Diskon Persen (%)</label>
                                <input type="number" onFocus={e => e.target.select()} value={formData.diskon_persen} onChange={e => setFormData({...formData, diskon_persen: e.target.value.replace(/^0+(?=\d)/, '')})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-slate-400 focus:ring-2 focus:ring-sky-100 focus:bg-white outline-none transition-all font-medium" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Lokasi / Rak Penyimpanan</label>
                                <input type="text" value={formData.lokasi} onChange={e => setFormData({...formData, lokasi: e.target.value})} placeholder="Contoh: Rak C-21" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-slate-400 focus:ring-2 focus:ring-sky-100 focus:bg-white outline-none transition-all font-medium" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Deskripsi Barang</label>
                                <textarea value={formData.deskripsi} onChange={e => setFormData({...formData, deskripsi: e.target.value})} placeholder="Penjelasan / rincian tambahan..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-slate-400 focus:ring-2 focus:ring-sky-100 focus:bg-white outline-none transition-all font-medium min-h-[80px]"></textarea>
                            </div>
                        </div>
                    </form>
                </div>
                <div className="p-5 border-t border-slate-100 shrink-0 bg-slate-50 flex justify-end gap-3 rounded-b-3xl">
                    <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-6 py-2.5 text-slate-500 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl font-bold transition-colors">Batal</button>
                    <button type="submit" form="addForm" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-600/20 active:scale-95 transition-all">{isEditing ? 'Update Barang' : 'Simpan Barang'}</button>
                </div>
            </div>
        </div>
    );
};

export default ProductAddModal;


