import React from 'react';

const POSTotals = ({ grandTotal, bayar, kembali, success }) => {
    return (
        <div className="col-span-12 md:col-span-5 bg-white border border-slate-100 grid grid-rows-3 text-right font-black tracking-tight text-2xl overflow-hidden rounded-2xl shadow-sm">
             <div className="flex justify-between items-center px-4 bg-orange-500 text-white relative overflow-hidden group">
                 <div className="absolute opacity-10 -right-4 -top-8 text-8xl group-hover:scale-110 transition-transform">Rp</div>
                 <span className="text-lg tracking-wider opacity-90 z-10">TOTAL</span>
                 <span className="z-10 drop-shadow-md">{grandTotal.toLocaleString()}</span>
             </div>
             <div className="flex justify-between items-center px-4 bg-slate-50 border-b border-slate-100 text-slate-700">
                 <span className="text-base tracking-wider font-bold text-slate-500 flex items-center gap-2">BAYAR {success && <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full animate-bounce mt-0.5">SUKSES</span>}</span>
                 <span className="">{Number(bayar).toLocaleString()}</span>
             </div>
             <div className="flex justify-between items-center px-4 bg-white text-emerald-500">
                 <span className="text-base tracking-wider font-bold text-slate-500">KEMBALI</span>
                 <span>{kembali > 0 ? kembali.toLocaleString() : 0}</span>
             </div>
        </div>
    );
};

export default POSTotals;

