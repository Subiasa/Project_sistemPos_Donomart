import React from 'react';

const POSCustomerPanel = () => {
    return (
        <div className="col-span-12 md:col-span-3 bg-slate-50 border border-slate-100 p-3 rounded-2xl shadow-sm flex flex-col justify-center relative">
             <span className="absolute top-0 right-4 px-3 py-1 bg-slate-100 text-blue-700 rounded-b-xl text-[10px] font-bold uppercase tracking-wider">Pelanggan</span>
             <div className="flex gap-2 mt-2">
                 <input type="text" className="w-full bg-white border border-slate-200 px-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all" placeholder="0002" />
             </div>
             <div className="text-blue-800 font-bold mt-1 text-sm">Umum</div>
             <div className="text-blue-600 text-xs">--</div>
             <div className="text-blue-700 font-medium mt-1 text-xs bg-slate-100/50 p-1.5 rounded">Sisa Piutang: 0</div>
        </div>
    );
};

export default POSCustomerPanel;

