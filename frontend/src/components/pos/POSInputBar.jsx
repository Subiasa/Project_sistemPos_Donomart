import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';

const POSInputBar = ({ scanInputRef, barcode, setBarcode, handleScan, searchNama, setSearchNama, handleNameSearch, selectProduct, isDark }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (!searchNama || searchNama.trim() === '') {
            setSuggestions([]);
            return;
        }

        const debounceTimer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await api.get(`/products?search=${searchNama}`);
                let results = Array.isArray(res.data.data) ? res.data.data : (res.data.data ? [res.data.data] : []);
                setSuggestions(results);
            } catch (error) {
                console.error("Gagal memuat suggestions:", error);
            } finally {
                setIsSearching(false);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(debounceTimer);
    }, [searchNama]);

    // Click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setSuggestions([]);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectSuggestion = (item) => {
        selectProduct(item);
        setSuggestions([]);
        setSearchNama('');
    };

    return (
        <div className={`p-3 flex gap-4 shrink-0 relative z-40 transition-colors duration-300 ${
            isDark 
                ? 'bg-gray-800 border-b border-gray-700' 
                : 'bg-slate-50 border-b border-slate-200'
        }`}>
            <div className="flex-1 flex gap-2">
                <form onSubmit={handleScan} className={`flex-1 flex items-center px-4 py-2 rounded-xl border transition-all shadow-sm ${
                    isDark 
                        ? 'bg-gray-900 border-gray-600 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20' 
                        : 'bg-white border-slate-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100'
                }`}>
                    <label className={`font-black text-sm mr-4 min-w-[100px] ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>BARCODE [F1]</label>
                    <input 
                        ref={scanInputRef} 
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        className={`flex-1 bg-transparent border-none text-xl font-mono font-bold focus:outline-none focus:ring-0 uppercase ${
                            isDark ? 'text-gray-100 placeholder:text-gray-600' : 'text-slate-800 placeholder:text-slate-300'
                        }`}
                        placeholder="SCAN BARCODE..."
                        autoFocus 
                    />
                </form>
            </div>
            <div className="flex-1 flex gap-2 relative" ref={dropdownRef}>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    if(suggestions.length === 1) {
                        handleSelectSuggestion(suggestions[0]);
                    } else if (suggestions.length > 1) {
                        handleNameSearch(e); 
                        setSuggestions([]);
                    } else if (suggestions.length === 0 && searchNama) {
                        handleNameSearch(e);
                    }
                }} className={`flex-1 flex items-center px-4 py-2 rounded-xl border transition-all shadow-sm opacity-90 focus-within:opacity-100 ${
                    isDark 
                        ? 'bg-gray-900 border-gray-600 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20' 
                        : 'bg-white border-slate-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100'
                }`}>
                    <label className={`font-black text-sm mr-4 min-w-[100px] ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>NAMA BARANG</label>
                    <input 
                        value={searchNama}
                        onChange={(e) => setSearchNama(e.target.value)}
                        className={`flex-1 bg-transparent border-none text-lg font-bold focus:outline-none focus:ring-0 ${
                            isDark ? 'text-gray-100 placeholder:text-gray-600' : 'text-slate-800 placeholder:text-slate-300'
                        }`}
                        placeholder="Ketik nama barang..." 
                        autoComplete="off"
                    />
                </form>

                {/* Dropdown Live Search / Katalog per huruf */}
                {searchNama && suggestions.length > 0 && (
                    <div className={`absolute top-full left-0 right-0 mt-2 border rounded-xl shadow-xl z-50 max-h-[350px] overflow-y-auto ${
                        isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-slate-200'
                    }`}>
                        {suggestions.map((item, idx) => (
                            <div 
                                key={idx} 
                                onClick={() => handleSelectSuggestion(item)}
                                className={`px-4 py-3 border-b cursor-pointer flex justify-between items-center transition-colors ${
                                    isDark 
                                        ? 'border-gray-700 hover:bg-gray-700' 
                                        : 'border-slate-100 hover:bg-slate-50'
                                }`}
                            >
                                <div>
                                    <p className={`font-bold text-lg ${isDark ? 'text-gray-100' : 'text-slate-800'}`}>{item.nama}</p>
                                    <div className="flex gap-2 mt-0.5 items-center">
                                        <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded-md border ${
                                            isDark ? 'text-gray-400 bg-gray-900 border-gray-600' : 'text-slate-500 bg-slate-100 border-slate-200'
                                        }`}>{item.kode}</span>
                                        {item.barcode_grosir && (
                                            <span className="text-[10px] font-bold text-blue-400 bg-blue-900/30 px-1.5 py-0.5 rounded-md border border-blue-700/50">Grosir: {item.satuan_grosir}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-emerald-500 text-lg">Rp {item.harga_jual?.toLocaleString()}</p>
                                    <p className={`text-xs font-bold mt-1 ${item.jumlah <= (item.stok_min || 0) ? 'text-rose-500' : isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                                        Stok: {item.jumlah} {item.satuan}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {searchNama && isSearching && suggestions.length === 0 && (
                    <div className={`absolute top-full left-0 right-0 mt-2 border rounded-xl shadow-xl z-50 p-4 text-center ${
                        isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-slate-200'
                    }`}>
                        <span className={`font-bold animate-pulse text-lg ${isDark ? 'text-gray-400' : 'text-slate-400'}`}>Mencari Katalog...</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default POSInputBar;
