import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  FileText, 
  Search, 
  Download,
  Filter,
  Receipt
} from 'lucide-react';

const ReportPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedReceipt, setSelectedReceipt] = useState(null);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const response = await api.get('/transactions');
            setTransactions(response.data.data);
        } catch (error) {
            console.error('Gagal mengambil laporan', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const filtered = transactions.filter(t => 
        t.no_nota.toLowerCase().includes(search.toLowerCase()) || 
        (t.user?.name && t.user.name.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tight mb-2">
                        <FileText className="text-orange-500" />
                        Laporan Transaksi
                    </h2>
                    <p className="text-slate-500 font-medium">Buku besar digital history penjualan dan rincian struk pelanggan.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-5 py-3 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-bold border border-slate-200 shadow-sm transition-all text-sm">
                        <Filter size={18} />
                        Filter Tanggal
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-all text-sm">
                        <Download size={18} />
                        Export Data Excel
                    </button>
                </div>
            </div>

            <div className="bg-white border border-sky-100 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-5 border-b border-sky-50 flex items-center gap-4 bg-white">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Cari no nota atau nama kasir..."
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-200 focus:border-sky-400 transition-all font-medium outline-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-sky-50/50 text-sky-700 text-[11px] uppercase tracking-wider font-bold border-b border-sky-100">
                            <tr>
                                <th className="px-6 py-4">Waktu Transaksi</th>
                                <th className="px-6 py-4">ID Nota</th>
                                <th className="px-6 py-4">Penginput (Kasir)</th>
                                <th className="px-6 py-4">Metode Bayar</th>
                                <th className="px-6 py-4 text-right">Penghasilan (Total)</th>
                                <th className="px-6 py-4 text-center">Tinjau</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {loading ? (
                                [1,2,3,4,5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-4 bg-slate-50/50 h-16"></td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center text-slate-400 bg-slate-50">
                                        <div className="flex flex-col items-center justify-center">
                                            <Receipt size={48} className="opacity-20 mb-3" />
                                            <span className="font-medium text-slate-500">Data laporan belum ada atau tidak ditemukan.</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map(t => (
                                    <tr key={t.id} className="hover:bg-sky-50/30 transition-colors">
                                        <td className="px-6 py-4 text-slate-600 font-medium text-sm">
                                            {new Date(t.created_at).toLocaleString('id-ID', {day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit'})}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-800 font-mono text-sm">
                                            {t.no_nota}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-sm font-semibold">
                                            {t.user?.name || 'Sistem Kasir'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-sky-50 text-sky-600 text-[10px] font-black rounded-lg uppercase border border-sky-100">
                                                {t.tipe_pembayaran}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-black text-slate-800 text-right text-lg">
                                            Rp {t.grand_total.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={() => setSelectedReceipt(t)} className="px-4 py-2 text-xs font-bold text-indigo-600 hover:text-white bg-indigo-50 hover:bg-indigo-600 border border-indigo-100 rounded-lg transition-all">
                                                Lihat Struk
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedReceipt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-800/40 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col w-full max-w-sm relative mt-10">
                        <div className="bg-slate-100 p-4 shrink-0 flex justify-between items-center border-b border-slate-200">
                            <h3 className="font-bold text-slate-700">Preview Struk</h3>
                            <button onClick={() => setSelectedReceipt(null)} className="text-slate-400 hover:text-slate-600 font-black w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">✕</button>
                        </div>
                        <div className="p-6 bg-slate-100 overflow-y-auto max-h-[70vh]">
                            {/* Simple Receipt Replication for Preview */}
                            <div className="w-[80mm] text-black bg-white font-mono text-[11px] leading-tight p-4 shadow-sm mx-auto">
                                <div className="flex flex-col items-center mb-2">
                                    <h2 className="font-bold text-[16px] mb-0.5">Donomart Shop</h2>
                                    <p>Jl. Minimarket Kasir No. 1</p>
                                    <p>Surabaya</p>
                                </div>
                                
                                <div className="border-t border-black border-dashed my-1"></div>
                                
                                <div className="flex justify-between items-start mb-1">
                                    <div>
                                        <p>{new Date(selectedReceipt.created_at).toLocaleDateString('id-ID')}</p>
                                        <p>{selectedReceipt.no_nota}</p>
                                    </div>
                                    <div className="text-right">
                                        <p>{selectedReceipt.user?.name || 'admin'}</p>
                                    </div>
                                </div>
                                
                                <div className="border-t border-black border-dashed my-1 mb-2"></div>
                                
                                <div className="mb-1 w-full space-y-1">
                                    {(selectedReceipt.transaction_details || selectedReceipt.details)?.map((item, idx) => (
                                        <div key={item.id} className="mb-1">
                                            <div className="font-bold whitespace-normal">{idx + 1}. {item.product?.nama || 'Barang'}</div>
                                            <div className="flex justify-between w-full pl-3">
                                                <span>{item.jumlah} x {Number(item.harga_satuan).toLocaleString('id-ID')}</span>
                                                <span>Rp {Number(item.total).toLocaleString('id-ID')}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {(!(selectedReceipt.transaction_details || selectedReceipt.details) || (selectedReceipt.transaction_details || selectedReceipt.details).length === 0) && (
                                        <p className="text-center italic opacity-50 py-4">Sistem backend tidak mereturn data item details untuk res ini.</p>
                                    )}
                                </div>
                                <div className="border-t border-black border-dashed my-1 pt-1"></div>
                                
                                <div className="space-y-0.5 mt-1">
                                    <div className="flex justify-between"><span>Sub Total</span><span>Rp {Number(selectedReceipt.subtotal).toLocaleString('id-ID')}</span></div>
                                    <div className="flex justify-between font-bold text-sm mt-1"><span>Total</span><span>Rp {Number(selectedReceipt.grand_total).toLocaleString('id-ID')}</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportPage;
