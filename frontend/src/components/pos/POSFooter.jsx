import React from 'react';

const POSFooter = ({ 
    subTotal, pajakPersen, handlePajak, diskonGlobal, handleDiskonGlobal,
    useSumbangan, handleSumbanganToggle, sumbangan, handleSumbanganInput,
    bayarInputRef, bayar, setBayar, grandTotal,
    keterangan, setKeterangan, handleNewTransaction, handleCheckout, handleHoldTransaction, cart, error, setError,
    isDark
}) => {
    return (
        <div className={`border-t shrink-0 flex flex-col z-20 shadow-lg transition-colors duration-300 ${
            isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-slate-200'
        }`}>
            
            {/* Error Banner */}
            {error && (
                <div className={`px-6 py-2 flex justify-between items-center font-bold text-sm border-b ${
                    isDark ? 'bg-rose-900/30 text-rose-400 border-rose-800/50' : 'bg-rose-50 text-rose-600 border-rose-100'
                }`}>
                    <span className="flex items-center gap-2">⚠️ {error}</span>
                    <button onClick={() => setError('')} className={`p-1 rounded-md transition-colors ${
                        isDark ? 'hover:bg-rose-900/50' : 'hover:bg-rose-100'
                    }`}>X</button>
                </div>
            )}

            {/* Calculations & Total Area */}
            <div className={`flex border-b ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-slate-50 border-slate-200'}`}>
                {/* Modifiers */}
                <div className={`flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 text-sm font-medium border-r ${
                    isDark ? 'border-gray-700 text-gray-300' : 'border-slate-200 text-slate-600'
                }`}>
                     <div className={`flex flex-col px-3 py-2 rounded-xl border shadow-sm ${
                        isDark ? 'bg-gray-900 border-gray-600' : 'bg-white border-slate-200'
                     }`}>
                         <span className={`text-xs font-bold mb-1 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>SUBTOTAL</span>
                         <span className={`font-black text-lg ${isDark ? 'text-gray-100' : 'text-slate-800'}`}>Rp {subTotal.toLocaleString()}</span>
                     </div>
                     <div className={`flex flex-col px-3 py-2 rounded-xl border shadow-sm transition-all ${
                        isDark 
                            ? 'bg-gray-900 border-gray-600 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20' 
                            : 'bg-white border-slate-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100'
                     }`}>
                         <span className={`text-xs font-bold mb-1 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>PAJAK (%)</span>
                         <input type="number" value={pajakPersen} onFocus={e=>e.target.select()} onChange={e=>handlePajak(e.target.value.replace(/^0+(?=\d)/, ''))} className={`bg-transparent w-full focus:outline-none font-black text-lg ${isDark ? 'text-gray-100' : 'text-slate-800'}`} />
                     </div>
                     <div className={`flex flex-col px-3 py-2 rounded-xl border shadow-sm transition-all ${
                        isDark 
                            ? 'bg-gray-900 border-gray-600 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20' 
                            : 'bg-white border-slate-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100'
                     }`}>
                         <span className={`text-xs font-bold mb-1 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>DISKON (Rp)</span>
                         <input type="number" value={diskonGlobal} onFocus={e=>e.target.select()} onChange={e=>handleDiskonGlobal(e.target.value.replace(/^0+(?=\d)/, ''))} className="bg-transparent text-rose-500 w-full focus:outline-none font-black text-lg" />
                     </div>
                     <div className={`flex flex-col px-3 py-2 rounded-xl border shadow-sm transition-all ${
                        isDark 
                            ? 'bg-gray-900 border-gray-600 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20' 
                            : 'bg-white border-slate-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100'
                     }`}>
                         <div className="flex items-center gap-2 mb-1">
                             <input type="checkbox" checked={useSumbangan} onChange={(e)=>handleSumbanganToggle(e.target.checked)} className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300" />
                             <span className={`text-xs font-bold ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>DONASI (Rp)</span>
                         </div>
                         <input type="number" disabled={!useSumbangan} value={sumbangan} onFocus={e=>e.target.select()} onChange={e=>handleSumbanganInput(e.target.value.replace(/^0+(?=\d)/, ''))} className={`bg-transparent disabled:opacity-50 w-full focus:outline-none font-black text-lg ${isDark ? 'text-gray-100' : 'text-slate-800'}`} />
                     </div>
                </div>

            </div>

            {/* Bottom Action Bar */}
            <div className={`flex p-4 gap-4 items-center transition-colors ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
                {/* Note */}
                <div className={`w-64 border rounded-xl p-3 flex items-center shadow-sm transition-all ${
                    isDark 
                        ? 'bg-gray-800 border-gray-600 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20' 
                        : 'bg-slate-50 border-slate-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100'
                }`}>
                    <input type="text" className={`w-full bg-transparent text-sm focus:outline-none font-medium ${
                        isDark ? 'text-gray-200 placeholder:text-gray-600' : 'text-slate-700'
                    }`} placeholder="Tambah Catatan..." value={keterangan} onChange={e=>setKeterangan(e.target.value)} />
                </div>

                {/* Payment Input */}
                <div className={`flex border-2 rounded-xl items-center w-72 shadow-sm transition-all overflow-hidden ${
                    isDark 
                        ? 'bg-gray-800 border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-500/20' 
                        : 'bg-slate-50 border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-100'
                }`}>
                    <span className={`font-bold px-4 text-xs h-full flex items-center border-r ${
                        isDark ? 'text-emerald-400 bg-emerald-900/30 border-emerald-700' : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    }`}>BAYAR [F2]</span>
                    <input 
                        ref={bayarInputRef} 
                        type="number" 
                        className={`w-full bg-transparent text-right font-black text-2xl focus:outline-none px-4 py-2 ${
                            isDark ? 'text-emerald-400' : 'text-emerald-600'
                        }`}
                        value={bayar || ''} 
                        onFocus={e=>e.target.select()}
                        onChange={e=>setBayar(e.target.value.replace(/^0+(?=\d)/, ''))} 
                        placeholder="0"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCheckout();
                        }}
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex-1 flex gap-3 justify-end">
                    <button onClick={handleHoldTransaction} className={`px-6 py-2 rounded-xl font-bold flex flex-col items-center justify-center min-w-[100px] border shadow-sm transition-all ${
                        isDark 
                            ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-600' 
                            : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                        <span className={`text-[10px] mb-0.5 font-black ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>F6</span>
                        <span className="text-sm">PENDING</span>
                    </button>
                    <button onClick={handleNewTransaction} className={`px-6 py-2 rounded-xl font-bold flex flex-col items-center justify-center min-w-[100px] border shadow-sm transition-all ${
                        isDark 
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600' 
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    }`}>
                        <span className={`text-[10px] mb-0.5 font-black ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>F5</span>
                        <span className="text-sm">BARU</span>
                    </button>
                    <button onClick={handleCheckout} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-xl font-bold flex flex-col items-center justify-center min-w-[140px] border border-blue-600 shadow-md transition-all">
                        <span className="text-[10px] text-blue-200 mb-0.5 font-black">F4</span>
                        <span className="text-base">SIMPAN</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default POSFooter;
