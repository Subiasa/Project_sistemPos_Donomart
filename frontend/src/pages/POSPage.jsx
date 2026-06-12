import React, { useState, useEffect, useRef } from 'react';
import usePosStore from '../store/usePosStore';
import useThemeStore from '../store/useThemeStore';
import api, { submitTransaction } from '../api/axios';

import POSHeader from '../components/pos/POSHeader';
import POSInputBar from '../components/pos/POSInputBar';
import POSDataTable from '../components/pos/POSDataTable';
import POSFooter from '../components/pos/POSFooter';
import POSSearchModal from '../components/pos/POSSearchModal';
import POSReceipt from '../components/pos/POSReceipt';

const POSPage = () => {
    // Bring in everything from our new powerful Zustand POS Store
    const { 
        cart, subTotal, diskonGlobal, pajakPersen, sumbangan, grandTotal, bayar, kembali,
        tipePembayaran, customerId,
        addToCart, updateItemQuantity, updateItemDiscount, removeItem, setModifiers,
        setBayar, setPaymentDetails, clearCart,
        heldTransactions, holdTransaction, resumeTransaction, removeHeldTransaction
    } = usePosStore();

    // Theme Store
    const { isDark, toggleTheme } = useThemeStore();

    // Store settings from /settings API
    const [storeSettings, setStoreSettings] = useState({});

    // Local UI Form States
    const [barcode, setBarcode] = useState('');
    const [searchNama, setSearchNama] = useState('');
    const [keterangan, setKeterangan] = useState('');
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    
    // Modals
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [showHoldModal, setShowHoldModal] = useState(false);
    
    // Checkboxes / Toggles locally
    const [useSumbangan, setUseSumbangan] = useState(false);
    
    const scanInputRef = useRef(null);
    const bayarInputRef = useRef(null);

    // API calls
    const handleScan = async (e) => {
        e.preventDefault();
        setError('');
        if (!barcode) return;
        try {
            const res = await api.get(`/products/scan/${barcode}`);
            let product = res.data;

            if (product) {
                const isGrosir = product.barcode_grosir && product.barcode_grosir === barcode;
                addToCart(product, isGrosir);
                setBarcode('');
                setSearchResults([]);
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
            const res = await api.get(`/products?search=${searchNama}`);
            let results = Array.isArray(res.data.data) ? res.data.data : (res.data.data ? [res.data.data] : []);

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
            bayarInputRef.current?.focus();
            return;
        }

        try {
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
                items: cart.map(item => {
                    const rawId = typeof item.product_id === 'string' ? item.product_id.replace('_grosir', '') : item.product_id;
                    return { 
                        product_id: parseInt(rawId, 10),
                        jumlah: item.jumlah,
                        harga_satuan: item.harga_satuan,
                        diskon_item: item.diskon_item,
                        netto: item.netto,
                        total: item.total,
                        is_grosir: item.is_grosir ? true : false,
                        barcode: item.is_grosir && item.kode ? item.kode : null
                    };
                })
            };

            await submitTransaction(payload);
            setSuccess(true);
            
            setTimeout(() => {
                window.print();
            }, 300);

            setTimeout(() => {
                setSuccess(false);
                handleNewTransaction(); 
            }, 2000);

        } catch (err) {
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

    const handleHoldTransaction = () => {
        if (cart.length === 0) {
            // If empty, open Hold Modal to resume
            setShowHoldModal(true);
        } else {
            // Hold current
            holdTransaction(keterangan);
            setKeterangan('');
            scanInputRef.current?.focus();
        }
    };

    useEffect(() => {
        scanInputRef.current?.focus();
        // Fetch store settings for receipt
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

    const handleDiskonGlobal = (val) => setModifiers(val, pajakPersen, sumbangan);
    const handlePajak = (val) => setModifiers(diskonGlobal, val, sumbangan);
    const handleSumbanganToggle = (checked) => {
        setUseSumbangan(checked);
        if (!checked) setModifiers(diskonGlobal, pajakPersen, 0);
    };
    const handleSumbanganInput = (val) => setModifiers(diskonGlobal, pajakPersen, val);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'F1') {
                e.preventDefault();
                scanInputRef.current?.focus();
            } else if (e.key === 'F2') {
                e.preventDefault();
                bayarInputRef.current?.focus();
            } else if (e.key === 'F4') {
                e.preventDefault();
                if (cart.length > 0 && bayar >= grandTotal && !success) {
                    handleCheckout();
                }
            } else if (e.key === 'F5') {
                e.preventDefault();
                handleNewTransaction();
            } else if (e.key === 'F6') {
                e.preventDefault();
                handleHoldTransaction();
            } else if (e.key === 'F8') {
                // F8 toggle dark/light mode
                e.preventDefault();
                toggleTheme();
            } else if (e.key === 'F11') {
                e.preventDefault();
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(err => {
                        console.log(`Error attempting to enable fullscreen mode: ${err.message} (${err.name})`);
                    });
                } else {
                    document.exitFullscreen();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [cart, bayar, grandTotal, tipePembayaran, success, subTotal, diskonGlobal, pajakPersen, sumbangan, keterangan, toggleTheme]);

    return (
        <>
        <div className={`print:hidden flex flex-col h-screen w-screen font-sans text-sm p-0 m-0 overflow-hidden transition-colors duration-300 ${
            isDark ? 'bg-gray-950 text-gray-100' : 'bg-slate-50 text-slate-800'
        }`}>
            <div className={`flex border-b ${isDark ? 'border-gray-700' : 'border-slate-200'}`}>
                <div className="flex-1 flex flex-col">
                    <POSHeader isDark={isDark} toggleTheme={toggleTheme} />

                    {/* Info Bar */}
                    <div className={`px-4 py-2 flex justify-between items-center shrink-0 border-t text-xs font-mono shadow-sm z-10 transition-colors duration-300 ${
                        isDark 
                            ? 'bg-gray-900 text-gray-300 border-gray-700' 
                            : 'bg-white text-slate-700 border-slate-100'
                    }`}>
                        <div className="flex gap-6">
                            <div className="flex items-center gap-2">
                                <span className={`font-bold ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>KASIR:</span>
                                <span className={`font-black px-2 py-0.5 rounded ${
                                    isDark ? 'text-blue-400 bg-blue-900/30' : 'text-blue-600 bg-blue-50'
                                }`}>ADMIN</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`font-bold ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>PELANGGAN:</span>
                                <input type="text" className={`border rounded px-2 py-0.5 w-32 focus:outline-none font-bold uppercase transition-all ${
                                    isDark 
                                        ? 'bg-gray-800 border-gray-600 text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20' 
                                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-400 focus:ring-1 focus:ring-blue-100'
                                }`} placeholder="UMUM" />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`font-bold ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>PEMBAYARAN:</span>
                                <select value={tipePembayaran} onChange={e=>setPaymentDetails(e.target.value, customerId)} className={`border rounded px-2 py-0.5 focus:outline-none font-bold uppercase cursor-pointer transition-all ${
                                    isDark 
                                        ? 'bg-gray-800 border-gray-600 text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20' 
                                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-400 focus:ring-1 focus:ring-blue-100'
                                }`}>
                                    <option value="TUNAI">TUNAI</option>
                                    <option value="KREDIT">KREDIT</option>
                                    <option value="QRIS">QRIS</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-4">
                             <span className={`font-semibold px-2 py-0.5 rounded ${isDark ? 'text-gray-500 bg-gray-800' : 'text-slate-400 bg-slate-100'}`}>F8: TEMA</span>
                             <span className={`font-semibold px-2 py-0.5 rounded ${isDark ? 'text-gray-500 bg-gray-800' : 'text-slate-400 bg-slate-100'}`}>F11: FULLSCREEN</span>
                             <span className={`font-semibold px-2 py-0.5 rounded ${isDark ? 'text-gray-500 bg-gray-800' : 'text-slate-400 bg-slate-100'}`}>F1: BARCODE</span>
                             <span className={`font-semibold px-2 py-0.5 rounded ${isDark ? 'text-gray-500 bg-gray-800' : 'text-slate-400 bg-slate-100'}`}>F2: BAYAR</span>
                             <span className={`font-semibold px-2 py-0.5 rounded ${isDark ? 'text-gray-500 bg-gray-800' : 'text-slate-400 bg-slate-100'}`}>F4: SIMPAN</span>
                        </div>
                    </div>

                    <POSInputBar 
                        scanInputRef={scanInputRef}
                        barcode={barcode}
                        setBarcode={setBarcode}
                        handleScan={handleScan}
                        searchNama={searchNama}
                        setSearchNama={setSearchNama}
                        handleNameSearch={handleNameSearch}
                        selectProduct={selectProduct}
                        isDark={isDark}
                    />
                </div>

                {/* DIGITAL DISPLAY TOP RIGHT */}
                <div className={`w-[450px] flex flex-col justify-center px-8 py-4 shrink-0 shadow-lg relative overflow-hidden transition-colors duration-300 ${
                    isDark 
                        ? 'bg-blue-900 text-white border-l border-blue-800' 
                        : 'bg-blue-600 text-white border-l border-blue-700'
                }`}>
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl"></div>
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl"></div>
                    
                    <div className={`flex flex-col items-end border-b pb-2 mb-2 relative z-10 ${isDark ? 'border-blue-700/50' : 'border-blue-500/50'}`}>
                        <span className={`text-xs uppercase tracking-widest font-bold mb-1 ${isDark ? 'text-blue-300' : 'text-blue-200'}`}>TOTAL BELANJA</span>
                        <span className="text-5xl font-black font-mono tracking-tighter drop-shadow-md">Rp {grandTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center w-full relative z-10 mt-1">
                        <span className={`text-xs uppercase tracking-widest font-bold ${isDark ? 'text-blue-300' : 'text-blue-200'}`}>BAYAR</span>
                        <span className="text-2xl font-black font-mono text-emerald-300 drop-shadow-sm">Rp {Number(bayar).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center w-full relative z-10">
                        <span className={`text-xs uppercase tracking-widest font-bold ${isDark ? 'text-blue-300' : 'text-blue-200'}`}>KEMBALI</span>
                        <span className="text-2xl font-black font-mono text-white/90">Rp {Math.max(0, bayar - grandTotal).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <POSDataTable 
                cart={cart}
                updateItemQuantity={updateItemQuantity}
                updateItemDiscount={updateItemDiscount}
                removeItem={removeItem}
                isDark={isDark}
            />

            <POSFooter 
                subTotal={subTotal}
                pajakPersen={pajakPersen}
                handlePajak={handlePajak}
                diskonGlobal={diskonGlobal}
                handleDiskonGlobal={handleDiskonGlobal}
                useSumbangan={useSumbangan}
                handleSumbanganToggle={handleSumbanganToggle}
                sumbangan={sumbangan}
                handleSumbanganInput={handleSumbanganInput}
                bayarInputRef={bayarInputRef}
                bayar={bayar}
                setBayar={setBayar}
                grandTotal={grandTotal}
                keterangan={keterangan}
                setKeterangan={setKeterangan}
                handleNewTransaction={handleNewTransaction}
                handleCheckout={handleCheckout}
                handleHoldTransaction={handleHoldTransaction}
                cart={cart}
                error={error}
                setError={setError}
                isDark={isDark}
            />
        </div>

        {/* Modal Hold/Pending Transactions */}
        {showHoldModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm print:hidden transition-all">
                <div className={`border w-full max-w-3xl rounded-2xl shadow-xl flex flex-col overflow-hidden ${
                    isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-slate-200'
                }`}>
                    <div className={`p-4 flex justify-between items-center shrink-0 border-b ${
                        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-100'
                    }`}>
                        <h3 className={`font-black text-lg ${isDark ? 'text-gray-100' : 'text-slate-800'}`}>Daftar Transaksi Pending (Hold)</h3>
                        <button onClick={() => {setShowHoldModal(false); scanInputRef.current?.focus();}} className={`px-4 py-1.5 font-bold rounded-lg transition-colors text-sm ${
                            isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}>Tutup</button>
                    </div>
                    <div className={`p-0 max-h-[60vh] overflow-y-auto ${isDark ? 'bg-gray-900' : 'bg-slate-50'}`}>
                        <table className="w-full text-left whitespace-nowrap border-collapse text-sm">
                            <thead className={`border-b uppercase text-xs font-bold sticky top-0 shadow-sm z-10 ${
                                isDark ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-white border-slate-200 text-slate-500'
                            }`}>
                                <tr>
                                    <th className="px-4 py-3">Waktu</th>
                                    <th className="px-4 py-3">Keterangan</th>
                                    <th className="px-4 py-3 text-center">Item</th>
                                    <th className="px-4 py-3 text-right">Total</th>
                                    <th className="px-4 py-3 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${isDark ? 'divide-gray-800 bg-gray-900' : 'divide-slate-100 bg-white'}`}>
                                {heldTransactions.length === 0 && (
                                    <tr><td colSpan={5} className={`text-center py-12 font-bold ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>Belum ada transaksi yang dipending</td></tr>
                                )}
                                {heldTransactions.map((t) => (
                                    <tr key={t.id} className={`transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-slate-50'}`}>
                                        <td className={`px-4 py-3 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{new Date(t.timestamp).toLocaleTimeString()}</td>
                                        <td className={`px-4 py-3 font-bold ${isDark ? 'text-gray-200' : 'text-slate-700'}`}>{t.note}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                                isDark ? 'bg-gray-800 text-gray-300' : 'bg-slate-100 text-slate-600'
                                            }`}>{t.cart.length} brg</span>
                                        </td>
                                        <td className={`px-4 py-3 text-right font-black ${isDark ? 'text-gray-100' : 'text-slate-800'}`}>Rp {t.grandTotal.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-center space-x-2">
                                            <button onClick={() => { resumeTransaction(t.id); setShowHoldModal(false); scanInputRef.current?.focus(); }} className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-3 py-1.5 font-bold rounded-lg transition-colors border border-blue-200 hover:border-transparent text-xs">Panggil</button>
                                            <button onClick={() => removeHeldTransaction(t.id)} className="bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white px-3 py-1.5 font-bold rounded-lg transition-colors border border-rose-200 hover:border-transparent text-xs">Hapus</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

        <POSSearchModal 
            showSearchModal={showSearchModal}
            searchResults={searchResults}
            selectProduct={selectProduct}
            setShowSearchModal={setShowSearchModal}
            isDark={isDark}
        />

        <POSReceipt 
            cart={cart} subTotal={subTotal} diskonGlobal={diskonGlobal}
            pajakPersen={pajakPersen} sumbangan={sumbangan} grandTotal={grandTotal}
            bayar={bayar} kembali={kembali} tipePembayaran={tipePembayaran}
            storeSettings={storeSettings}
        />
        </>
    );
};

export default POSPage;
