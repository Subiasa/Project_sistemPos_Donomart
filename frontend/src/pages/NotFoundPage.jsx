import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4">
            <div className="text-center max-w-lg">
                <h1 className="text-8xl font-black text-slate-200 mb-4 tracking-tighter">404</h1>
                <h2 className="text-2xl font-black text-slate-800 mb-3">Halaman Tidak Ditemukan</h2>
                <p className="text-slate-500 font-medium mb-8">
                    Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.
                </p>
                <div className="flex gap-3 justify-center">
                    <Link
                        to="/"
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-sm"
                    >
                        <Home size={18} /> Dashboard
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-600 px-6 py-3 rounded-xl font-bold transition-all border border-slate-200 shadow-sm"
                    >
                        <ArrowLeft size={18} /> Kembali
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;
