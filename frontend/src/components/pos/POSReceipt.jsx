import React from 'react';

const POSReceipt = ({ cart, subTotal, diskonGlobal, pajakPersen, sumbangan, grandTotal, bayar, kembali, tipePembayaran, storeSettings }) => {
    const namaToko = storeSettings?.nama_toko || 'Toko Anda';
    const alamatToko = storeSettings?.alamat_toko || '';
    const teleponToko = storeSettings?.telepon_toko || '';
    const pesanStruk = storeSettings?.pesan_struk || '';

    return (
        <div id="receipt-area" className="hidden print:block w-[80mm] text-black bg-white font-mono text-[11px] leading-tight p-0 m-0 mx-auto">
            <div className="flex flex-col items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/><path d="M12 3v6"/></svg>
                <h2 className="font-bold text-[16px] mb-0.5">{namaToko}</h2>
                {alamatToko && <p>{alamatToko}</p>}
                {teleponToko && <p>No. Telp {teleponToko}</p>}
                <p>{Date.now().toString(36).toUpperCase()}</p>
            </div>
            
            <div className="border-t border-black border-dashed my-1"></div>
            
            <div className="flex justify-between items-start mb-1">
                <div>
                    <p>{new Date().toISOString().split('T')[0]}</p>
                    <p>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                    <p className="mt-1">No.0-{Math.floor(Math.random() * 100)}</p>
                </div>
                <div className="text-right flex flex-col items-end">
                    <p>admin</p>
                    <p>Umum</p>
                    <div className="border-2 border-emerald-600 px-1 mt-0.5 text-emerald-700 font-bold">
                        <p>Pelanggan Yth</p>
                    </div>
                </div>
            </div>
            
            <div className="border-t border-black border-dashed my-1 mb-2"></div>
            
            <div className="mb-1 w-full">
                {cart.map((item, idx) => (
                    <div key={item.product_id} className="mb-1">
                        <div className="font-bold whitespace-normal">{idx + 1}. {item.nama}</div>
                        <div className="flex justify-between w-full pl-3">
                            <span>{item.jumlah} {item.satuan || 'pcs'} x {Number(item.harga_satuan).toLocaleString('id-ID')}</span>
                            <span>Rp {(item.jumlah * item.harga_satuan).toLocaleString('id-ID')}</span>
                        </div>
                        {item.diskon_item > 0 && (
                            <div className="flex justify-between pl-3 text-[10px]">
                                <span>Diskon</span>
                                <span>-Rp {Number(item.diskon_item).toLocaleString('id-ID')}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            
            <div className="border-t border-black border-dashed my-1 pt-1"></div>
            
            <div className="flex justify-between mb-1">
                <span>Total QTY :</span>
                <span>{cart.reduce((a, b) => a + Number(b.jumlah), 0)}</span>
            </div>
            
            <div className="space-y-0.5 mt-1">
                <div className="flex justify-between"><span>Sub Total</span><span>Rp {Number(subTotal).toLocaleString('id-ID')}</span></div>
                {Number(diskonGlobal) > 0 && <div className="flex justify-between"><span>Diskon</span><span>- Rp {Number(diskonGlobal).toLocaleString('id-ID')}</span></div>}
                {Number(pajakPersen) > 0 && <div className="flex justify-between"><span>Pajak</span><span>Rp {((Number(subTotal) - Number(diskonGlobal)) * Number(pajakPersen) / 100).toLocaleString('id-ID')}</span></div>}
                {Number(sumbangan) > 0 && <div className="flex justify-between"><span>Sumbangan</span><span>Rp {Number(sumbangan).toLocaleString('id-ID')}</span></div>}
                
                <div className="flex justify-between font-bold text-sm mt-1"><span>Total</span><span>Rp {Number(grandTotal).toLocaleString('id-ID')}</span></div>
                
                <div className="flex justify-between"><span>Bayar ({tipePembayaran || 'Cash'})</span><span>Rp {Number(bayar).toLocaleString('id-ID')}</span></div>
                <div className="flex justify-between"><span>Kembali</span><span>Rp {Number(kembali).toLocaleString('id-ID')}</span></div>
            </div>
            
            <div className="text-center mt-3 pt-1">
                <p>Terimakasih Telah Berbelanja</p>
                {pesanStruk && (
                    <div className="mt-2">
                        <p className="text-[10px] bg-gray-200 inline-block px-1">{pesanStruk}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default POSReceipt;
