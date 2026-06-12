import React from 'react';

const POSDataTable = ({ cart, updateItemQuantity, updateItemDiscount, removeItem, isDark }) => {
    return (
        <div className={`flex-1 overflow-y-scroll min-h-0 border-y transition-colors duration-300 ${
            isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-slate-200'
        }`}>
            <table className="w-full text-left whitespace-nowrap border-collapse text-sm">
                <thead className={`sticky top-0 z-10 font-bold border-b shadow-sm transition-colors ${
                    isDark 
                        ? 'bg-gray-800 text-gray-400 border-gray-700' 
                        : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}>
                    <tr>
                        <th className="px-4 py-2 w-12 text-center">No</th>
                        <th className="px-4 py-2 w-32">Kode/Barcode</th>
                        <th className="px-4 py-2">Nama Barang</th>
                        <th className="px-4 py-2 w-24 text-center">Qty</th>
                        <th className="px-4 py-2 w-24">Satuan</th>
                        <th className="px-4 py-2 w-28 text-right">Harga</th>
                        <th className="px-4 py-2 w-28 text-center">Diskon (Rp)</th>
                        <th className="px-4 py-2 w-32 text-right">Total</th>
                        <th className="px-4 py-2 w-10 text-center"></th>
                    </tr>
                </thead>
                <tbody className={`divide-y transition-colors ${
                    isDark ? 'bg-gray-900 divide-gray-800' : 'bg-white divide-slate-100'
                }`}>
                    {cart.length === 0 && (
                        <tr>
                            <td colSpan={9} className={`text-center py-12 ${isDark ? 'bg-gray-900 text-gray-500' : 'bg-white text-slate-400'}`}>
                                <span className="font-bold">Keranjang Belanja Kosong</span>
                            </td>
                        </tr>
                    )}
                    {cart.map((item, index) => (
                        <tr key={item.product_id} className={`transition-colors group ${
                            isDark ? 'hover:bg-gray-800' : 'hover:bg-slate-50'
                        }`}>
                            <td className={`px-4 py-3 text-center font-medium ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>{index + 1}</td>
                            <td className={`px-4 py-3 font-mono text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{item.kode}</td>
                            <td className={`px-4 py-3 font-bold truncate max-w-[250px] ${isDark ? 'text-gray-200' : 'text-slate-700'}`}>{item.nama}</td>
                            <td className="px-4 py-3 text-center">
                                <input 
                                    type="number" 
                                    value={item.jumlah}
                                    onFocus={(e) => e.target.select()}
                                    onChange={(e) => updateItemQuantity(item.product_id, e.target.value.replace(/^0+(?=\d)/, ''))}
                                    className={`w-16 border rounded-md text-center font-bold py-1 transition-all ${
                                        isDark 
                                            ? 'bg-gray-800 border-gray-600 text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20' 
                                            : 'bg-white border-slate-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-100'
                                    }`}
                                    min="1"
                                />
                            </td>
                            <td className={`px-4 py-3 text-xs font-bold ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{item.satuan}</td>
                            <td className={`px-4 py-3 text-right ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>{item.harga_satuan.toLocaleString()}</td>
                            <td className="px-4 py-3">
                                <input 
                                    type="number" 
                                    value={item.diskon_item}
                                    onFocus={(e) => e.target.select()}
                                    onChange={(e) => updateItemDiscount(item.product_id, e.target.value.replace(/^0+(?=\d)/, ''))}
                                    className={`w-20 border rounded-md text-right text-rose-500 font-bold py-1 px-2 transition-all ${
                                        isDark 
                                            ? 'bg-gray-800 border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20' 
                                            : 'bg-white border-slate-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-100'
                                    }`}
                                    min="0"
                                />
                            </td>
                            <td className={`px-4 py-3 text-right font-black ${isDark ? 'text-gray-100' : 'text-slate-800'}`}>Rp {item.total.toLocaleString()}</td>
                            <td className="px-4 py-3 text-center">
                                <button onClick={() => removeItem(item.product_id)} className={`font-black w-8 h-8 rounded-lg focus:outline-none flex items-center justify-center mx-auto transition-colors ${
                                    isDark ? 'text-gray-600 hover:text-rose-400 hover:bg-rose-900/30' : 'text-slate-300 hover:text-rose-500 hover:bg-rose-50'
                                }`}>
                                    X
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default POSDataTable;
