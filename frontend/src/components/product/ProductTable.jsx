import React from 'react';
import { Search, Edit, Trash2, PackageSearch } from 'lucide-react';

const ProductTable = ({ search, setSearch, loading, filtered, handleDelete, handleEdit }) => {
    return (
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-50 flex items-center gap-4 bg-white">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Cari nama barang atau barcode..."
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-200 focus:border-slate-400 transition-all font-medium outline-none"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50 text-blue-700 text-[11px] uppercase tracking-wider font-bold border-b border-slate-100">
                        <tr>
                            <th className="px-3 py-2">No</th>
                            <th className="px-3 py-2">Kode/Barcode</th>
                            <th className="px-3 py-2">Nama Barang</th>
                            <th className="px-3 py-2">Kategori</th>
                            <th className="px-3 py-2 text-center">Stok</th>
                            <th className="px-3 py-2">Satuan</th>
                            <th className="px-3 py-2 text-right">Harga Beli</th>
                            <th className="px-3 py-2 text-right">Harga Jual</th>
                            <th className="px-3 py-2 text-center">Diskon</th>
                            <th className="px-3 py-2">Suplier</th>
                            <th className="px-3 py-2">Lokasi</th>
                            <th className="px-3 py-2 text-center">Stok Min</th>
                            <th className="px-3 py-2 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 whitespace-nowrap bg-white text-sm">
                        {loading ? (
                            [1,2,3,4,5].map(i => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan={13} className="px-3 py-2 bg-slate-50/50 h-8"></td>
                                </tr>
                            ))
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={13} className="px-3 py-8 text-center text-slate-400 bg-slate-50">
                                    <div className="flex flex-col items-center justify-center">
                                        <PackageSearch size={32} className="opacity-20 mb-3" />
                                        <span className="font-medium text-slate-500">Belum ada data barang ditemukan.</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filtered.map((product, index) => (
                                <tr key={product.id} className="hover:bg-slate-50/30 transition-colors">
                                    <td className="px-3 py-2 text-slate-400 font-bold">{index + 1}</td>
                                    <td className="px-3 py-2 text-slate-500 font-mono text-xs">{product.kode}</td>
                                    <td className="px-3 py-2 font-bold text-slate-700">
                                        {product.nama}
                                        {product.deskripsi && <span className="block text-xs font-normal text-slate-400 mt-0.5 truncate max-w-[200px]">{product.deskripsi}</span>}
                                    </td>
                                    <td className="px-3 py-2">
                                        <span className="px-2 py-0.5 bg-slate-100/50 text-blue-700 text-[10px] font-black rounded-lg uppercase border border-slate-100">
                                            {product.category?.nama || 'Umum'}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        <span className={`font-black text-xs px-2 py-0.5 rounded ${product.jumlah <= (product.stok_min || 0) ? 'bg-rose-100 text-rose-600' : 'text-slate-600'}`}>
                                            {product.jumlah}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-slate-500 text-xs font-bold">{product.satuan}</td>
                                    <td className="px-3 py-2 text-slate-400 text-right">Rp {Number(product.harga_beli || 0).toLocaleString()}</td>
                                    <td className="px-3 py-2 font-black text-slate-800 text-right">Rp {Number(product.harga_jual || 0).toLocaleString()}</td>
                                    <td className="px-3 py-2 text-center font-bold text-emerald-600">{product.diskon_persen || 0}%</td>
                                    <td className="px-3 py-2 text-slate-500 text-xs font-bold">{product.supplier?.nama || '-'}</td>
                                    <td className="px-3 py-2 text-slate-500 text-xs font-mono">{product.lokasi || '-'}</td>
                                    <td className="px-3 py-2 text-slate-400 text-center">{product.stok_min || 0}</td>
                                    <td className="px-3 py-2 text-center">
                                        <div className="flex justify-center gap-1.5">
                                            <button onClick={() => handleEdit && handleEdit(product)} className="p-1.5 text-blue-600 hover:text-white hover:bg-slate-500 bg-slate-50 border border-slate-100 rounded transition-colors">
                                                <Edit size={14} />
                                            </button>
                                            <button onClick={() => handleDelete(product.id)} className="p-1.5 text-rose-500 hover:text-white hover:bg-rose-500 bg-rose-50 border border-rose-100 rounded transition-colors">
                                                <Trash2 size={14} />
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
    );
};

export default ProductTable;

