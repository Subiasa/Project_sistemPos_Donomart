import React from 'react';
import { Plus, Upload } from 'lucide-react';

const ProductHeader = ({ setIsImportModalOpen, setIsAddModalOpen }) => {
    return (
        <div className="flex justify-between items-end">
            <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Master Barang</h2>
                <p className="text-slate-500 font-medium">Kelola inventori dan harga barang toko Anda.</p>
            </div>
            <div className="flex gap-3">
                <button onClick={() => setIsImportModalOpen(true)} className="flex items-center gap-2 px-5 py-3 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-bold border border-slate-200 shadow-sm transition-all text-sm">
                    <Upload size={18} />
                    Import Excel
                </button>
                <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-600/20 active:scale-95 transition-all text-sm">
                    <Plus size={18} />
                    Tambah Barang
                </button>
            </div>
        </div>
    );
};

export default ProductHeader;

