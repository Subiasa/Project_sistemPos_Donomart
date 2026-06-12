import React from 'react';

const ProductImportModal = ({ isImportModalOpen, setIsImportModalOpen, handleImportSubmit, setFile, uploading, file }) => {
    if (!isImportModalOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-800/40 backdrop-blur-sm">
            <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                    <h3 className="text-xl font-black text-slate-800">Import Data Excel</h3>
                    <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors bg-white w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 shadow-sm">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                </div>
                <div className="p-6 bg-white flex flex-col gap-4">
                    <p className="text-sm text-slate-600 font-medium">Pastikan format file excel Anda sesuai dengan template master barang. Sistem hanya menerima format .xlsx atau .csv.</p>
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50 text-center flex flex-col items-center justify-center">
                        <input type="file" accept=".xlsx,.csv" onChange={(e) => setFile(e.target.files[0])} className="text-sm text-slate-600 w-full file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-blue-700 hover:file:bg-slate-200 cursor-pointer transition-all" />
                    </div>
                </div>
                <div className="p-5 border-t border-slate-100 flex justify-end gap-3 rounded-b-3xl bg-slate-50">
                    <button type="button" onClick={() => setIsImportModalOpen(false)} className="px-6 py-2.5 text-slate-500 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl font-bold transition-colors">Batal</button>
                    <button onClick={handleImportSubmit} disabled={!file || uploading} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all">
                        {uploading ? 'Mengupload...' : 'Import Data'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductImportModal;

