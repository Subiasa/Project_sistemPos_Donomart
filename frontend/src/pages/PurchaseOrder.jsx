import React, { useState, useEffect } from 'react';
import { Truck, Printer, AlertCircle } from 'lucide-react';
import api from '../api/axios';

const PurchaseOrder = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [orderQuantities, setOrderQuantities] = useState({});

    const handleQuantityChange = (productId, value) => {
        setOrderQuantities(prev => ({
            ...prev,
            [productId]: value
        }));
    };

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                // Using the endpoint created in the backend
                const response = await api.get('/products/restock-alerts');
                setAlerts(response.data.data || []);
            } catch (err) {
                setError('Gagal mengambil data Restock Alerts.');
            } finally {
                setLoading(false);
            }
        };

        fetchAlerts();
    }, []);

    const handlePrintPO = (supplierData) => {
        // We will create a print-friendly window or override the current view with a print CSS.
        // The easiest way in React without external libraries is to open a new window or trigger window.print() with specific print styles.
        // For this, we can store the selected supplier to print and use CSS media query @media print to only show that section.
        
        const printContent = `
            <html>
            <head>
                <title>Surat Pesanan - ${supplierData.supplier?.nama || 'Tanpa Nama'}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
                    .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
                    .header h1 { margin: 0 0 10px 0; font-size: 24px; text-transform: uppercase; }
                    .supplier-info { margin-bottom: 30px; }
                    .supplier-info p { margin: 5px 0; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
                    th, td { border: 1px solid #000; padding: 10px; text-align: left; }
                    th { background-color: #f4f4f4; }
                    .text-center { text-align: center; }
                    .footer { display: flex; justify-content: space-between; margin-top: 50px; }
                    .signature { width: 200px; text-align: center; }
                    .signature p { margin-bottom: 80px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>SURAT PESANAN (PURCHASE ORDER)</h1>
                    <p>Tanggal: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>

                <div class="supplier-info">
                    <strong>Kepada Yth:</strong>
                    <p>${supplierData.supplier?.nama || 'Supplier Tanpa Nama'}</p>
                    <p>${supplierData.supplier?.alamat || '-'}</p>
                    <p>Telp: ${supplierData.supplier?.telepon || '-'}</p>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th width="5%" class="text-center">No</th>
                            <th width="15%">Kode / Barcode</th>
                            <th width="40%">Nama Barang</th>
                            <th width="20%" class="text-center">Jumlah Pesanan</th>
                            <th width="20%" class="text-center">Keterangan</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${supplierData.products.map((p, index) => `
                            <tr>
                                <td class="text-center">${index + 1}</td>
                                <td>${p.kode}</td>
                                <td>${p.nama}</td>
                                <td class="text-center" style="font-size: 16px;">${orderQuantities[p.id] ? `<b>${orderQuantities[p.id]}</b>` : `........ ${p.satuan_grosir || p.satuan}`}</td>
                                <td>Stok sisa: ${p.jumlah}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="footer">
                    <div class="signature">
                        <p>Hormat Kami,</p>
                        <br/><br/><br/>
                        <strong>( Bagian Pembelian )</strong>
                    </div>
                    <div class="signature">
                        <p>Pemasok,</p>
                        <br/><br/><br/>
                        <strong>( ${supplierData.supplier?.nama || 'Supplier'} )</strong>
                    </div>
                </div>
                <script>
                    window.onload = function() { window.print(); window.close(); }
                </script>
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="text-slate-400 font-bold text-lg animate-pulse">Memuat data Purchase Order...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-rose-50 text-rose-600 p-6 rounded-2xl border border-rose-100 flex items-center gap-3 font-bold">
                <AlertCircle /> {error}
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 min-h-full">
            <div className="mb-8">
                <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                    <Truck className="text-blue-600" size={32} />
                    Purchase Order (Restock)
                </h2>
                <p className="text-slate-500 font-medium mt-1 text-lg">
                    Daftar barang yang stoknya sudah menipis atau habis, dikelompokkan berdasarkan Supplier.
                </p>
            </div>

            {alerts.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-2xl p-16 flex flex-col items-center justify-center text-center shadow-sm">
                    <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 mb-2">Stok Aman!</h3>
                    <p className="text-slate-500 text-lg">Belum ada barang yang perlu di-restock saat ini.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {alerts.map((group, idx) => {
                        const supplierName = group.supplier?.nama || 'Supplier Tidak Diketahui (Atau Tanpa Supplier)';
                        const supplierContact = group.supplier?.telepon || '-';
                        const supplierAddress = group.supplier?.alamat || '-';

                        return (
                            <div key={idx} className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                                <div className="bg-slate-50 border-b border-slate-100 p-6 flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-800 mb-1">{supplierName}</h3>
                                        <p className="text-sm font-semibold text-slate-500">📞 {supplierContact}</p>
                                        <p className="text-sm font-semibold text-slate-500 mt-0.5">📍 {supplierAddress}</p>
                                    </div>
                                    <button 
                                        onClick={() => handlePrintPO(group)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold shadow-sm active:scale-95 transition-all shrink-0"
                                    >
                                        <Printer size={18} />
                                        Cetak PO
                                    </button>
                                </div>
                                <div className="p-0 overflow-x-auto">
                                    <table className="w-full text-left whitespace-nowrap text-sm">
                                        <thead className="bg-slate-50/50 text-slate-500 uppercase text-xs font-bold border-b border-slate-100">
                                            <tr>
                                                <th className="px-6 py-4">Kode/Nama Barang</th>
                                                <th className="px-6 py-4 text-center">Sisa Stok</th>
                                                <th className="px-6 py-4 text-center">Batas Min</th>
                                                <th className="px-6 py-4 text-center">Jumlah Pesan</th>
                                                <th className="px-6 py-4 text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {group.products.map(p => (
                                                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <p className="font-bold text-slate-800">{p.nama}</p>
                                                        <p className="text-xs text-slate-500 font-mono mt-0.5">{p.kode}</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="font-black text-rose-600 bg-rose-50 px-3 py-1 rounded-lg border border-rose-100 text-base">
                                                            {p.jumlah} {p.satuan}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="font-bold text-slate-600">
                                                            {p.stok_min || 0}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center w-32">
                                                        <input 
                                                            type="text" 
                                                            placeholder="Misal: 2 Dus" 
                                                            value={orderQuantities[p.id] || ''} 
                                                            onChange={(e) => handleQuantityChange(p.id, e.target.value)}
                                                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm text-center font-bold"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {p.jumlah <= 0 ? (
                                                            <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-1 rounded border border-rose-200 uppercase tracking-wider">Habis</span>
                                                        ) : (
                                                            <span className="text-xs font-bold text-orange-700 bg-orange-100 px-2 py-1 rounded border border-orange-200 uppercase tracking-wider">Menipis</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default PurchaseOrder;


