import React from 'react';

const POSSearchModal = ({ showSearchModal, searchResults, selectProduct, setShowSearchModal, isDark }) => {
    if (!showSearchModal) return null;
    
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 print:hidden backdrop-blur-sm">
            <div className={`rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[80vh] border ${
                isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-slate-200'
            }`}>
                <div className={`px-4 py-3 flex justify-between items-center ${
                    isDark ? 'bg-gray-700 text-gray-100' : 'bg-slate-500 text-white'
                }`}>
                    <h3 className="font-bold text-lg">Pilih Produk</h3>
                    <button onClick={() => setShowSearchModal(false)} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        isDark ? 'bg-gray-600 hover:bg-gray-500' : 'bg-slate-600 hover:bg-slate-700'
                    }`}>✕</button>
                </div>
                <div className="overflow-y-auto p-2">
                    {searchResults.map(p => (
                        <div key={p.id || p.product_id || p.kode} onClick={() => selectProduct(p)} className={`flex justify-between items-center p-3 cursor-pointer border-b last:border-none transition-colors ${
                            isDark 
                                ? 'border-gray-700 hover:bg-gray-700' 
                                : 'border-slate-100 hover:bg-slate-50'
                        }`}>
                            <div>
                                <div className={`font-bold ${isDark ? 'text-gray-100' : 'text-slate-800'}`}>{p.nama}</div>
                                <div className={`text-xs font-mono ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{p.kode}</div>
                            </div>
                            <div className="font-bold text-blue-500">
                                Rp {Number(p.harga_jual || p.harga_satuan || 0).toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default POSSearchModal;
