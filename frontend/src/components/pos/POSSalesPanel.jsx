import React from 'react';

const POSSalesPanel = ({ tipePembayaran, setPaymentDetails, customerId }) => {
    return (
        <div className="col-span-12 md:col-span-4 flex p-3 gap-3 items-center bg-white border border-slate-100 rounded-2xl shadow-sm">
             <div className="flex flex-col gap-2 w-full">
                 <div className="flex items-center gap-2">
                     <span className="w-24 text-xs font-bold text-slate-500 uppercase">TANGGAL</span>
                     <input type="date" className="border border-slate-200 px-3 py-1 rounded-lg flex-1 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-sky-400" defaultValue={new Date().toISOString().split('T')[0]} />
                 </div>
                 <div className="flex items-center gap-2">
                     <span className="w-24 text-xs font-bold text-slate-500 uppercase">PEMBAYARAN</span>
                     <select value={tipePembayaran} onChange={e=>setPaymentDetails(e.target.value, customerId)} className="border border-slate-200 px-3 py-1 rounded-lg flex-1 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-sky-400 font-bold text-blue-700">
                         <option value="TUNAI">TUNAI</option>
                         <option value="KREDIT">KREDIT</option>
                         <option value="QRIS">QRIS</option>
                     </select>
                 </div>
             </div>
        </div>
    );
};

export default POSSalesPanel;

