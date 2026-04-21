import React, { useState, useEffect, useRef } from 'react';
import usePosStore from '../store/usePosStore';
import api, { submitTransaction } from '../api/axios';
const POSPage = () => {
    // Bring in everything from our new powerful Zustand POS Store
    const { 
        cart, 
        subTotal,
        diskonGlobal,
        pajakPersen,
        sumbangan,
        grandTotal,
        bayar,
        kembali,
        tipePembayaran,
        customerId,
        addToCart, 
        updateItemQuantity,
        updateItemDiscount,
        removeItem, 
        setModifiers,
        setBayar,
        setPaymentDetails,
        clearCart
    } = usePosStore();

    // Local UI Form States
    const [barcode, setBarcode] = useState('');
    const [searchNama, setSearchNama] = useState('');
    const [keterangan, setKeterangan] = useState('');
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    
    // Search Modal States
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchModal, setShowSearchModal] = useState(false);
    
    // Checkboxes / Toggles locally
    const [useSumbangan, setUseSumbangan] = useState(false);
    
    const scanInputRef = useRef(null);
    const bayarInputRef = useRef(null);

    // Local function to hit API and handle scan before sending to store
    const handleScan = async (e) => {
        e.preventDefault();
        setError('');
        if (!barcode) return;
        try {
            const isNumber = /^\d+$/.test(barcode);
            let url = isNumber ? `/products?kode=${barcode}` : '/products';
            const res = await api.get(url);
            
            let results = Array.isArray(res.data.data) ? res.data.data : (res.data.data ? [res.data.data] : []);

            if (!isNumber && results.length > 0) {
                 results = results.filter(p => p.nama?.toLowerCase().includes(barcode.toLowerCase()));
            }

            if (results.length === 1) {
                addToCart(results[0]);
                setBarcode('');
                setSearchResults([]);
            } else if (results.length > 1) {
                setSearchResults(results);
                setShowSearchModal(true);
            } else {
                setError('Produk tidak ditemukan!');
            }
        } catch (err) {
            setError('Error saat mencari produk.');
        }
    };

    const handleNameSearch = async (e) => {
        e.preventDefault();
        setError('');
        if (!searchNama) return;
        try {
            const res = await api.get('/products');
            let results = Array.isArray(res.data.data) ? res.data.data : (res.data.data ? [res.data.data] : []);

            if (results.length > 0) {
                 results = results.filter(p => p.nama?.toLowerCase().includes(searchNama.toLowerCase()));
            }

            if (results.length === 1) {
                addToCart(results[0]);
                setSearchNama('');
                setSearchResults([]);
                setTimeout(() => scanInputRef.current?.focus(), 100);
            } else if (results.length > 1) {
                setSearchResults(results);
                setShowSearchModal(true);
            } else {
                setError('Produk dengan nama tersebut tidak ditemukan!');
            }
        } catch (err) {
            setError('Error saat mencari produk.');
        }
    };

    const selectProduct = (product) => {
        addToCart(product);
        setBarcode('');
        setShowSearchModal(false);
        setSearchResults([]);
        setTimeout(() => scanInputRef.current?.focus(), 100);
    };

    const handleCheckout = async () => {
        setError('');
        if (cart.length === 0) {
            setError('Keranjang kosong. Scan barang terlebih dahulu.');
            return;
        }
        if (Number(bayar) < grandTotal) {
            setError('Nominal pembayaran kurang dari total belanja.');
            return;
        }

        try {
            // Construct payload mapping strictly from Zustand state
            const payload = {
                tipe_pembayaran: tipePembayaran.toLowerCase(),
                subtotal: subTotal,
                diskon_global: diskonGlobal,
                pajak_persen: pajakPersen,
                sumbangan: sumbangan,
                grand_total: grandTotal,
                bayar: Number(bayar),
                kembali: kembali,
                customer_id: customerId || null,
                items: cart.map(item => ({ 
                    product_id: item.product_id, 
                    jumlah: item.jumlah,
                    harga_satuan: item.harga_satuan,
                    diskon_item: item.diskon_item,
                    netto: item.netto,
                    total: item.total
                }))
            };

            // Hit external API logic
            await submitTransaction(payload);
            
            // Jika berhasil
            setSuccess(true);
            
            // Pemicu cetak struk Thermal Printer
            setTimeout(() => {
                window.print();
            }, 300);

            // Mereset state kasir baru
            setTimeout(() => {
                setSuccess(false);
                handleNewTransaction(); // (fungsi ini sudah otomatis memanggil clearCart() dari Zustand)
            }, 2500);

        } catch (err) {
            // Error ditangkap dari throw function api service
            setError(err.message);
        }
    };

    const handleNewTransaction = () => {
        clearCart();
        setBarcode('');
        setKeterangan('');
        setUseSumbangan(false);
        scanInputRef.current?.focus();
    };

    useEffect(() => {
        scanInputRef.current?.focus();
    }, []);

    // Modifier Wrappers
    const handleDiskonGlobal = (val) => setModifiers(val, pajakPersen, sumbangan);
    const handlePajak = (val) => setModifiers(diskonGlobal, val, sumbangan);
    const handleSumbanganToggle = (checked) => {
        setUseSumbangan(checked);
        if (!checked) setModifiers(diskonGlobal, pajakPersen, 0);
    };
    const handleSumbanganInput = (val) => setModifiers(diskonGlobal, pajakPersen, val);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'F1') {
                e.preventDefault();
                scanInputRef.current?.focus();
            } else if (e.key === 'F2') {
                e.preventDefault();
                bayarInputRef.current?.focus();
            } else if (e.key === 'F3') {
                e.preventDefault();
                if (cart.length > 0 && bayar >= grandTotal && !success) {
                    handleCheckout();
                }
            } else if (e.key === 'F5') {
                e.preventDefault();
                handleNewTransaction();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [cart, bayar, grandTotal, tipePembayaran, success, subTotal, diskonGlobal, pajakPersen, sumbangan]);

    return (
        <>
        <div className="print:hidden flex flex-col h-screen w-screen bg-slate-50 font-sans text-sm p-3 overflow-hidden text-slate-700">
            
            {/* Top Toolbar */}
            <div className="bg-sky-500 text-white text-xs font-bold px-4 py-2 mb-3 flex items-center justify-between rounded-xl shadow-sm">
                <span>TRANSAKSI PENJUALAN | POS</span>
                <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' }).toUpperCase()}</span>
            </div>

            {/* Top Meta Data Bar */}
            <div className="grid grid-cols-12 gap-3 mb-3 shrink-0">
                
                {/* Customer Panel - 30% Sky Blue Mix */}
                <div className="col-span-12 md:col-span-3 bg-sky-50 border border-sky-100 p-4 rounded-2xl shadow-sm flex flex-col justify-center relative">
                     <span className="absolute top-0 right-4 px-3 py-1 bg-sky-100 text-sky-700 rounded-b-xl text-[10px] font-bold uppercase tracking-wider">Pelanggan</span>
                     <div className="flex gap-2 mt-4">
                         <input type="text" className="w-full bg-white border border-sky-200 px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all" placeholder="0002" />
                     </div>
                     <div className="text-sky-800 font-bold mt-2 text-sm">Umum</div>
                     <div className="text-sky-600 text-xs">--</div>
                     <div className="text-sky-700 font-medium mt-1 text-xs bg-sky-100/50 p-1.5 rounded">Sisa Piutang: 0</div>
                </div>

                {/* Middle Date/Sales Panel - Main White with Sky accents */}
                <div className="col-span-12 md:col-span-4 flex p-4 gap-6 items-center bg-white border border-sky-100 rounded-2xl shadow-sm">
                     <div className="flex flex-col gap-3 w-full">
                         <div className="flex items-center gap-3">
                             <span className="w-24 text-xs font-bold text-slate-500 uppercase">TANGGAL</span>
                             <input type="date" className="border border-sky-200 px-3 py-1.5 rounded-lg flex-1 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-sky-400" defaultValue={new Date().toISOString().split('T')[0]} />
                         </div>
                         <div className="flex items-center gap-3">
                             <span className="w-24 text-xs font-bold text-slate-500 uppercase">PEMBAYARAN</span>
                             <select value={tipePembayaran} onChange={e=>setPaymentDetails(e.target.value, customerId)} className="border border-sky-200 px-3 py-1.5 rounded-lg flex-1 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-sky-400 font-bold text-sky-700">
                                 <option value="TUNAI">TUNAI</option>
                                 <option value="KREDIT">KREDIT</option>
                                 <option value="QRIS">QRIS</option>
                             </select>
                         </div>
                     </div>
                </div>

                {/* Right Totals Panel - 10% Pop Color */}
                <div className="col-span-12 md:col-span-5 bg-white border border-sky-100 grid grid-rows-3 text-right font-black tracking-tight text-3xl overflow-hidden rounded-2xl shadow-sm">
                     <div className="flex justify-between items-center px-5 bg-orange-500 text-white relative overflow-hidden group">
                         <div className="absolute opacity-10 -right-4 -top-8 text-9xl group-hover:scale-110 transition-transform">Rp</div>
                         <span className="text-xl tracking-wider opacity-90 z-10">TOTAL</span>
                         <span className="z-10 drop-shadow-md">{grandTotal.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between items-center px-5 bg-sky-50 border-b border-sky-100 text-slate-700">
                         <span className="text-lg tracking-wider font-bold text-slate-500 flex items-center gap-2">BAYAR {success && <span className="text-xs bg-emerald-500 text-white px-3 py-1 rounded-full animate-bounce mt-1">SUKSES</span>}</span>
                         <span className="">{Number(bayar).toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between items-center px-5 bg-white text-emerald-500">
                         <span className="text-lg tracking-wider font-bold text-slate-500">KEMBALI</span>
                         <span>{kembali > 0 ? kembali.toLocaleString() : 0}</span>
                     </div>
                </div>
            </div>

            {/* Input Bar (Data Table Header Replacement) */}
            <div className="flex gap-2 mb-2 shrink-0 bg-white p-3 border border-sky-100 rounded-xl shadow-sm">
                <div className="flex flex-col">
                   <label className="text-xs font-bold text-sky-700 mb-1">KODE (F1)</label>
                   <form onSubmit={handleScan}>
                       <input 
                           ref={scanInputRef} 
                           value={barcode}
                           onChange={(e) => setBarcode(e.target.value)}
                           className="border border-sky-200 px-3 py-1.5 w-44 rounded-lg bg-sky-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 font-bold placeholder:text-sky-300" 
                           placeholder="Scan Disini..."
                           autoFocus 
                       />
                   </form>
                </div>
                <div className="flex flex-col flex-1">
                   <label className="text-xs font-bold text-sky-700 mb-1">NAMA BARANG</label>
                   <form onSubmit={handleNameSearch}>
                       <input 
                           value={searchNama}
                           onChange={(e) => setSearchNama(e.target.value)}
                           className="border border-sky-200 px-3 py-1.5 w-full rounded-lg bg-sky-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 font-bold placeholder:text-sky-300" 
                           placeholder="Ketik lalu Enter..." 
                       />
                   </form>
                </div>
                <div className="flex flex-col">
                   <label className="text-xs font-bold text-slate-400 mb-1 opacity-0">QTY</label>
                   <input className="border border-slate-100 bg-slate-50 px-3 py-1.5 w-16 text-center rounded-lg text-slate-400" readOnly placeholder="0" />
                </div>
            </div>

            {/* Data Table Core Area */}
            <div className="bg-white border border-sky-100 flex-1 overflow-y-auto min-h-0 rounded-2xl shadow-sm my-1">
                <table className="w-full text-left whitespace-nowrap">
                    <thead className="bg-sky-50 text-sky-700 border-b border-sky-100 sticky top-0 z-10 text-[11px] uppercase tracking-wider font-bold">
                        <tr>
                            <th className="px-4 py-3 border-r border-sky-100/50 w-40">Kode</th>
                            <th className="px-4 py-3 border-r border-sky-100/50">Nama</th>
                            <th className="px-4 py-3 border-r border-sky-100/50 w-24 text-center">Jumlah</th>
                            <th className="px-4 py-3 border-r border-sky-100/50 w-24">Satuan</th>
                            <th className="px-4 py-3 border-r border-sky-100/50 w-32 text-right">Harga</th>
                            <th className="px-4 py-3 border-r border-sky-100/50 w-28 text-center">Diskon (Rp)</th>
                            <th className="px-4 py-3 border-r border-sky-100/50 w-32 text-right">Netto</th>
                            <th className="px-4 py-3 w-36 text-right">Total</th>
                            <th className="px-3 py-3 w-12 text-center border-l border-sky-100/50">#</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-50">
                        {cart.length === 0 && (
                            <tr>
                                <td colSpan={9} className="text-center py-12 text-slate-400 bg-slate-50/50">
                                    <div className="flex flex-col items-center justify-center">
                                        <span className="text-4xl block mb-2 opacity-20">🛒</span>
                                        <span>Belum ada barang di keranjang</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {cart.map((item) => (
                            <tr key={item.product_id} className="hover:bg-sky-50/50 transition-colors group">
                                <td className="px-4 py-3 text-slate-500 font-mono text-xs">{item.kode}</td>
                                <td className="px-4 py-3 font-semibold text-slate-800">{item.nama}</td>
                                <td className="px-3 py-2 text-center">
                                    <input 
                                        type="number" 
                                        value={item.jumlah}
                                        onFocus={(e) => e.target.select()}
                                        onChange={(e) => updateItemQuantity(item.product_id, e.target.value.replace(/^0+(?=\d)/, ''))}
                                        className="w-full bg-slate-50 border border-slate-200 px-2 py-1 text-center rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-400 font-bold"
                                        min="1"
                                    />
                                </td>
                                <td className="px-4 py-3 text-slate-500 text-xs">{item.satuan}</td>
                                <td className="px-4 py-3 text-right font-medium">{item.harga_satuan.toLocaleString()}</td>
                                <td className="px-3 py-2">
                                    <input 
                                        type="number" 
                                        value={item.diskon_item}
                                        onFocus={(e) => e.target.select()}
                                        onChange={(e) => updateItemDiscount(item.product_id, e.target.value.replace(/^0+(?=\d)/, ''))}
                                        className="w-full bg-slate-50 border border-slate-200 px-2 py-1 text-right rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400 text-orange-500 font-bold"
                                        min="0"
                                    />
                                </td>
                                <td className="px-4 py-3 text-right font-medium text-slate-600">{item.netto.toLocaleString()}</td>
                                <td className="px-4 py-3 text-right font-bold text-slate-800">{item.total.toLocaleString()}</td>
                                <td className="px-2 py-2 text-center">
                                    <button onClick={() => removeItem(item.product_id)} className="text-slate-300 hover:text-white hover:bg-rose-500 bg-slate-100 p-2 rounded-lg transition-all focus:outline-none">
                                        ✕
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Bottom Footer Area - Calculation & Action */}
            <div className="bg-white border border-sky-100 mt-2 p-4 grid grid-cols-12 gap-6 shrink-0 shadow-sm rounded-2xl">
                 
                 {/* Calculation Modifiers */}
                 <div className="col-span-12 xl:col-span-5 grid grid-cols-2 gap-x-6 gap-y-3 font-medium text-slate-600">
                     <div className="flex flex-col gap-2 relative">
                         <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                             <span className="text-xs uppercase tracking-wide">SubTotal</span>
                             <span className="font-bold text-slate-800">{subTotal.toLocaleString()}</span>
                         </div>
                         <div className="flex items-center justify-between">
                             <span className="text-xs uppercase tracking-wide">Tax %</span>
                             <div className="flex items-center gap-2">
                                 <input type="number" className="border border-sky-200 bg-sky-50 w-14 px-2 py-1 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-400 text-right font-bold text-sky-600" value={pajakPersen} onFocus={e=>e.target.select()} onChange={e=>handlePajak(e.target.value.replace(/^0+(?=\d)/, ''))} />
                             </div>
                         </div>
                         <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                             <span className="text-xs uppercase tracking-wide">Diskon Global</span>
                             <div className="flex items-center gap-2 mt-1">
                                 <input type="number" className="border border-orange-200 bg-orange-50 w-24 px-2 py-1 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-400 text-right font-bold text-orange-500" value={diskonGlobal} onFocus={e=>e.target.select()} onChange={e=>handleDiskonGlobal(e.target.value.replace(/^0+(?=\d)/, ''))} />
                             </div>
                         </div>
                         <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                                 <input type="checkbox" checked={useSumbangan} onChange={(e) => handleSumbanganToggle(e.target.checked)} className="rounded text-sky-500 focus:ring-sky-500 w-4 h-4 cursor-pointer" />
                                 <span className="text-xs uppercase tracking-wide">Sumbangan</span>
                             </div>
                             <input type="number" disabled={!useSumbangan} className="border border-sky-200 bg-slate-50 disabled:opacity-30 disabled:bg-slate-100 w-24 px-2 py-1 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-400 text-right font-bold" value={sumbangan} onFocus={e=>e.target.select()} onChange={e=>handleSumbanganInput(e.target.value.replace(/^0+(?=\d)/, ''))} />
                         </div>
                     </div>
                     
                     <div className="flex flex-col bg-sky-50/50 p-3 rounded-xl border border-sky-100">
                         <label className="text-[10px] uppercase font-bold text-sky-700 tracking-wider mb-2 block">Eksekusi Pembayaran [F2]</label>
                         <div className="relative mb-3">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold">Rp</div>
                             <input 
                                 ref={bayarInputRef} 
                                 type="number" 
                                 className="w-full border-2 border-emerald-400 focus:border-emerald-500 bg-white rounded-xl px-3 py-3 pl-10 text-right font-black text-2xl text-emerald-600 shadow-inner focus:outline-none placeholder:text-emerald-200 transition-all" 
                                 value={bayar || ''} 
                                 onFocus={e=>e.target.select()}
                                 onChange={e=>setBayar(e.target.value.replace(/^0+(?=\d)/, ''))} 
                                 placeholder="0" 
                             />
                         </div>
                         <div className="flex justify-between items-center text-slate-500 border-t border-sky-100 pt-2 text-xs font-bold uppercase">
                             <span>GrandTotal</span>
                             <span className="text-base text-slate-800">{grandTotal.toLocaleString()}</span>
                         </div>
                     </div>
                 </div>

                 {/* Action Buttons & Helpers - The 10% Pop Colors */}
                 <div className="col-span-12 xl:col-span-7 flex flex-col justify-between pl-2 xl:border-l border-sky-100">
                      <div className="flex items-center gap-3 mb-2 bg-slate-50 p-2 rounded-xl">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">Note</span>
                          <input type="text" className="bg-transparent focus:outline-none px-2 py-1 flex-1 text-slate-700 border-b border-transparent focus:border-sky-300 transition-all" placeholder="Tambahkan keterangan transaksi..." value={keterangan} onChange={e=>setKeterangan(e.target.value)} />
                      </div>
                      <div className="flex gap-3 h-14 mt-auto">
                          <button onClick={handleNewTransaction} className="border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-700 px-6 font-bold rounded-xl flex-1 flex flex-col items-center justify-center transition-all focus:ring-2 focus:ring-sky-400 focus:outline-none">
                              <span className="text-xs opacity-60 font-mono">F5</span>
                              <span>Baru</span>
                          </button>
                          
                          <button onClick={() => alert("Mencetak Struk..")} className="border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-700 px-6 font-bold rounded-xl flex-1 flex flex-col items-center justify-center transition-all focus:ring-2 focus:ring-sky-400 focus:outline-none">
                              <span className="text-xs opacity-60 font-mono">F4</span>
                              <span>Cetak</span>
                          </button>
                          
                          <button 
                              onClick={handleCheckout} 
                              disabled={cart.length === 0 || Number(bayar) < grandTotal} 
                              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-8 font-bold rounded-xl shadow-md disabled:shadow-none flex-[2] flex flex-col items-center justify-center transition-all transform active:scale-95 focus:ring-4 focus:ring-indigo-300 focus:outline-none"
                          >
                              <span className="text-xs opacity-80 font-mono">F3</span>
                              <span className="text-lg tracking-wider">SIMPAN BIAYA</span>
                          </button>
                      </div>
                      
                      {error && <div className="text-rose-500 bg-rose-50 px-4 py-2 mt-2 rounded-lg text-xs font-bold w-full flex items-center justify-between border border-rose-100 shadow-sm">
                          <span>⚠️ {error}</span>
                          <button onClick={() => setError('')} className="bg-rose-200 hover:bg-rose-300 text-rose-700 px-2 rounded-full h-5 flex items-center">x</button>
                      </div>}
                 </div>
            </div>
        </div>

        {/* Search Modal */}
        {showSearchModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 print:hidden">
                <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
                    <div className="bg-sky-500 text-white px-4 py-3 flex justify-between items-center">
                        <h3 className="font-bold text-lg">Pilih Produk</h3>
                        <button onClick={() => setShowSearchModal(false)} className="bg-sky-600 hover:bg-sky-700 w-8 h-8 rounded-full flex items-center justify-center font-bold">✕</button>
                    </div>
                    <div className="overflow-y-auto p-2">
                        {searchResults.map(p => (
                            <div key={p.id || p.product_id || p.kode} onClick={() => selectProduct(p)} className="flex justify-between items-center p-3 hover:bg-sky-50 cursor-pointer border-b border-slate-100 last:border-none">
                                <div>
                                    <div className="font-bold text-slate-800">{p.nama}</div>
                                    <div className="text-xs text-slate-500 font-mono">{p.kode}</div>
                                </div>
                                <div className="font-bold text-sky-600">
                                    Rp {Number(p.harga_jual || p.harga_satuan || 0).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* Thermal Print Receipt Area (Only Visible During Print) */}
        <div id="receipt-area" className="hidden print:block w-[80mm] text-black bg-white font-mono text-[11px] leading-tight p-0 m-0 mx-auto">
            <div className="flex flex-col items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/><path d="M12 3v6"/></svg>
                <h2 className="font-bold text-[16px] mb-0.5">Donomart Shop</h2>
                <p>Jl. Minimarket Kasir No. 1</p>
                <p>Surabaya</p>
                <p>No. Telp 0812345678</p>
                <p>16413520230802084636</p>
            </div>
            
            <div className="border-t border-black border-dashed my-1"></div>
            
            <div className="flex justify-between items-start mb-1">
                <div>
                    <p>{new Date().toISOString().split('T')[0]}</p>
                    <p>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                    <p className="mt-1">No.0-{Math.floor(Math.random() * 100)}</p>
                </div>
                <div className="text-right flex flex-col items-end">
                    <p>admin</p>
                    <p>Umum</p>
                    <div className="border-2 border-emerald-600 px-1 mt-0.5 text-emerald-700 font-bold">
                        <p>Pelanggan Yth</p>
                    </div>
                </div>
            </div>
            
            <div className="border-t border-black border-dashed my-1 mb-2"></div>
            
            <div className="mb-1 w-full">
                {cart.map((item, idx) => (
                    <div key={item.product_id} className="mb-1">
                        <div className="font-bold whitespace-normal">{idx + 1}. {item.nama}</div>
                        <div className="flex justify-between w-full pl-3">
                            <span>{item.jumlah} {item.satuan || 'pcs'} x {Number(item.harga_satuan).toLocaleString('id-ID')}</span>
                            <span>Rp {(item.jumlah * item.harga_satuan).toLocaleString('id-ID')}</span>
                        </div>
                        {item.diskon_item > 0 && (
                            <div className="flex justify-between pl-3 text-[10px]">
                                <span>Diskon</span>
                                <span>-Rp {Number(item.diskon_item).toLocaleString('id-ID')}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            
            <div className="border-t border-black border-dashed my-1 pt-1"></div>
            
            <div className="flex justify-between mb-1">
                <span>Total QTY :</span>
                <span>{cart.reduce((a, b) => a + Number(b.jumlah), 0)}</span>
            </div>
            
            <div className="space-y-0.5 mt-1">
                <div className="flex justify-between"><span>Sub Total</span><span>Rp {Number(subTotal).toLocaleString('id-ID')}</span></div>
                {Number(diskonGlobal) > 0 && <div className="flex justify-between"><span>Diskon</span><span>- Rp {Number(diskonGlobal).toLocaleString('id-ID')}</span></div>}
                {Number(pajakPersen) > 0 && <div className="flex justify-between"><span>Pajak</span><span>Rp {((Number(subTotal) - Number(diskonGlobal)) * Number(pajakPersen) / 100).toLocaleString('id-ID')}</span></div>}
                {Number(sumbangan) > 0 && <div className="flex justify-between"><span>Sumbangan</span><span>Rp {Number(sumbangan).toLocaleString('id-ID')}</span></div>}
                
                <div className="flex justify-between font-bold text-sm mt-1"><span>Total</span><span>Rp {Number(grandTotal).toLocaleString('id-ID')}</span></div>
                
                <div className="flex justify-between"><span>Bayar ({tipePembayaran || 'Cash'})</span><span>Rp {Number(bayar).toLocaleString('id-ID')}</span></div>
                <div className="flex justify-between"><span>Kembali</span><span>Rp {Number(kembali).toLocaleString('id-ID')}</span></div>
            </div>
            
            <div className="text-center mt-3 pt-1">
                <p>Terimakasih Telah Berbelanja</p>
                <div className="mt-2">
                    <p className="text-[10px]">Link Kritik dan Saran:</p>
                    <p className="text-[10px] bg-gray-200 inline-block px-1">donomart.com/e-receipt/S-00D39U</p>
                </div>
            </div>
        </div>
        </>
    );
};

export default POSPage;
