import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  FileText, 
  Search, 
  Download,
  Filter,
  Receipt,
  Calendar,
  X
} from 'lucide-react';

const ReportPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [storeSettings, setStoreSettings] = useState({});

    // ── Date Filter State ──────────────────────────────────────
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [activeFilter, setActiveFilter] = useState(false);

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
        // Fetch store settings for receipt preview
        const fetchStoreSettings = async () => {
            try {
                const res = await api.get('/settings');
                if (res.data) setStoreSettings(res.data);
            } catch (err) {
                console.error('Gagal mengambil pengaturan toko:', err);
            }
        };
        fetchStoreSettings();
    }, []);

    // ── Filtering Logic ────────────────────────────────────────
    const filtered = transactions.filter(t => {
        // Text search
        const matchSearch = t.no_nota.toLowerCase().includes(search.toLowerCase()) || 
            (t.user?.name && t.user.name.toLowerCase().includes(search.toLowerCase()));
        
        // Date filter
        let matchDate = true;
        if (activeFilter && (filterStartDate || filterEndDate)) {
            const transDate = new Date(t.created_at);
            transDate.setHours(0, 0, 0, 0);
            
            if (filterStartDate) {
                const start = new Date(filterStartDate);
                start.setHours(0, 0, 0, 0);
                if (transDate < start) matchDate = false;
            }
            if (filterEndDate) {
                const end = new Date(filterEndDate);
                end.setHours(23, 59, 59, 999);
                if (transDate > end) matchDate = false;
            }
        }
        
        return matchSearch && matchDate;
    });

    const applyFilter = () => {
        if (filterStartDate || filterEndDate) {
            setActiveFilter(true);
        }
        setShowFilterPanel(false);
    };

    const clearFilter = () => {
        setFilterStartDate('');
        setFilterEndDate('');
        setActiveFilter(false);
        setShowFilterPanel(false);
    };

    // ── Export to Excel (CSV) ──────────────────────────────────
    const handleExportExcel = () => {
        if (filtered.length === 0) {
            alert('Tidak ada data transaksi untuk di-export.');
            return;
        }

        // BOM for UTF-8 encoding support in Excel
        const BOM = '\uFEFF';
        
        // CSV Headers
        const headers = [
            'No',
            'Waktu Transaksi',
            'ID Nota',
            'Kasir',
            'Metode Bayar',
            'Subtotal',
            'Diskon Global',
            'Pajak (%)',
            'Grand Total',
            'Bayar',
            'Kembali'
        ];

        // CSV Rows
        const rows = filtered.map((t, idx) => [
            idx + 1,
            new Date(t.created_at).toLocaleString('id-ID', { 
                day: 'numeric', month: 'short', year: 'numeric', 
                hour: '2-digit', minute: '2-digit' 
            }),
            t.no_nota,
            t.user?.name || 'Sistem Kasir',
            t.tipe_pembayaran?.toUpperCase(),
            t.subtotal,
            t.diskon_global || 0,
            t.pajak_persen || 0,
            t.grand_total,
            t.bayar,
            t.kembali
        ]);

        // Build CSV content
        const csvContent = BOM + [
            headers.join(';'),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))
        ].join('\n');

        // Create downloadable file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        const dateStr = new Date().toISOString().split('T')[0];
        link.href = url;
        link.download = `Laporan_Transaksi_${dateStr}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // ── Summary stats ──────────────────────────────────────────
    const totalPendapatan = filtered.reduce((sum, t) => sum + Number(t.grand_total), 0);
    const totalTransaksi = filtered.length;

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
                    <div className="relative">
                        <button 
                            onClick={() => setShowFilterPanel(!showFilterPanel)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold border shadow-sm transition-all text-sm ${
                                activeFilter 
                                    ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' 
                                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                        >
                            <Filter size={18} />
                            {activeFilter ? 'Filter Aktif' : 'Filter Tanggal'}
                            {activeFilter && (
                                <span 
                                    onClick={(e) => { e.stopPropagation(); clearFilter(); }}
                                    className="ml-1 w-5 h-5 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 cursor-pointer"
                                >
                                    <X size={12} />
                                </span>
                            )}
                        </button>

                        {/* Filter Dropdown Panel */}
                        {showFilterPanel && (
                            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="flex items-center gap-2 mb-4">
                                    <Calendar size={16} className="text-blue-500" />
                                    <h4 className="font-bold text-slate-700 text-sm">Filter Rentang Tanggal</h4>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Dari Tanggal</label>
                                        <input 
                                            type="date"
                                            value={filterStartDate}
                                            onChange={(e) => setFilterStartDate(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Sampai Tanggal</label>
                                        <input 
                                            type="date"
                                            value={filterEndDate}
                                            onChange={(e) => setFilterEndDate(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium text-sm"
                                        />
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button 
                                            onClick={clearFilter}
                                            className="flex-1 px-4 py-2.5 text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg font-bold transition-colors text-sm"
                                        >
                                            Reset
                                        </button>
                                        <button 
                                            onClick={applyFilter}
                                            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors text-sm active:scale-95"
                                        >
                                            Terapkan
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <button 
                        onClick={handleExportExcel}
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-all text-sm"
                    >
                        <Download size={18} />
                        Export Data Excel
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            {activeFilter && (
                <div className="flex gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="bg-white border border-slate-100 rounded-xl px-5 py-3 shadow-sm flex items-center gap-3">
                        <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transaksi Ditemukan</p>
                            <p className="text-lg font-black text-slate-800">{totalTransaksi} nota</p>
                        </div>
                    </div>
                    <div className="bg-white border border-slate-100 rounded-xl px-5 py-3 shadow-sm flex items-center gap-3">
                        <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Pendapatan</p>
                            <p className="text-lg font-black text-slate-800">Rp {totalPendapatan.toLocaleString('id-ID')}</p>
                        </div>
                    </div>
                    <div className="bg-white border border-slate-100 rounded-xl px-5 py-3 shadow-sm flex items-center gap-3">
                        <div className="w-2 h-8 bg-orange-400 rounded-full"></div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rentang Filter</p>
                            <p className="text-sm font-bold text-slate-600">
                                {filterStartDate || '...'} → {filterEndDate || '...'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-5 border-b border-slate-50 flex items-center gap-4 bg-white">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Cari no nota atau nama kasir..."
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
                                    <tr key={t.id} className="hover:bg-slate-50/30 transition-colors">
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
                                            <span className="px-3 py-1 bg-slate-50 text-blue-600 text-[10px] font-black rounded-lg uppercase border border-slate-100">
                                                {t.tipe_pembayaran}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                                t.status === 'void' ? 'bg-rose-100 text-rose-600' : 
                                                t.status === 'piutang' ? 'bg-orange-100 text-orange-600' : 
                                                'bg-emerald-100 text-emerald-600'
                                            }`}>
                                                {t.status || 'lunas'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-black text-slate-800 text-right text-lg">
                                            Rp {t.grand_total.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-center space-x-2 whitespace-nowrap">
                                            <button onClick={() => setSelectedReceipt(t)} className="px-3 py-1.5 text-[10px] font-bold text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 border border-blue-100 rounded-lg transition-all">
                                                Struk
                                            </button>
                                            {t.status !== 'void' && (
                                                <button onClick={() => handleVoid(t.id)} className="px-3 py-1.5 text-[10px] font-bold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-100 rounded-lg transition-all">
                                                    Void
                                                </button>
                                            )}
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
                    <div className="bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col w-full max-w-sm relative mt-10">
                        <div className="bg-slate-100 p-4 shrink-0 flex justify-between items-center border-b border-slate-200">
                            <h3 className="font-bold text-slate-700">Preview Struk</h3>
                            <button onClick={() => setSelectedReceipt(null)} className="text-slate-400 hover:text-slate-600 font-black w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">✕</button>
                        </div>
                        <div className="p-6 bg-slate-100 overflow-y-auto max-h-[70vh]">
                            {/* Simple Receipt Replication for Preview */}
                            <div className="w-[80mm] text-black bg-white font-mono text-[11px] leading-tight p-4 shadow-sm mx-auto">
                                <div className="flex flex-col items-center mb-2">
                                    <h2 className="font-bold text-[16px] mb-0.5">{storeSettings.nama_toko || 'Toko Anda'}</h2>
                                    {storeSettings.alamat_toko && <p>{storeSettings.alamat_toko}</p>}
                                    {storeSettings.telepon_toko && <p>No. Telp {storeSettings.telepon_toko}</p>}
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
