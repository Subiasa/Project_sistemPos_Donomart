import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Settings, Save, CheckCircle, XCircle } from 'lucide-react';

const SettingPage = () => {
    const [settings, setSettings] = useState({
        nama_toko: '',
        alamat_toko: '',
        telepon_toko: '',
        pesan_struk: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState({ show: false, type: '', message: '' });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/settings');
                if (response.data) {
                    setSettings(prev => ({...prev, ...response.data}));
                }
            } catch (error) {
                console.error('Gagal mengambil pengaturan', error);
                showToast('error', 'Gagal mengambil data pengaturan dari server.');
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const showToast = (type, message) => {
        setToast({ show: true, type, message });
        setTimeout(() => setToast({ show: false, type: '', message: '' }), 3500);
    };

    const handleChange = (e) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/settings', { settings });
            showToast('success', 'Pengaturan berhasil disimpan!');
        } catch (error) {
            console.error('Gagal menyimpan pengaturan:', error);
            showToast('error', 'Gagal menyimpan pengaturan. Silakan coba lagi.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-3xl space-y-8 animate-in fade-in duration-500">
            {/* Toast Notification */}
            {toast.show && (
                <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg border text-sm font-bold transition-all animate-in slide-in-from-top-2 duration-300
                    ${toast.type === 'success' 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                        : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
                    {toast.type === 'success' 
                        ? <CheckCircle size={20} className="text-emerald-500" /> 
                        : <XCircle size={20} className="text-rose-500" />}
                    {toast.message}
                </div>
            )}

            <div>
                <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tight mb-2">
                    <Settings className="text-blue-500" />
                    Pengaturan Sistem POS
                </h2>
                <p className="text-slate-500 font-medium">Konfigurasi profile, struktur nota, dan global enviroment toko Anda disatu tempat.</p>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm">
                {loading ? (
                    <div className="animate-pulse space-y-6">
                        <div className="h-14 bg-slate-50 rounded-xl"></div>
                        <div className="h-14 bg-slate-50 rounded-xl"></div>
                        <div className="h-24 bg-slate-50 rounded-xl"></div>
                    </div>
                ) : (
                    <form onSubmit={handleSave} className="space-y-6">
                        <div>
                            <label className="flex flex-col">
                                <span className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Brand / Nama Toko</span>
                                <input 
                                    type="text"
                                    name="nama_toko"
                                    value={settings.nama_toko}
                                    onChange={handleChange}
                                    placeholder="Contoh: Donomart Cabang Utama"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-slate-800 focus:border-slate-400 focus:ring-2 focus:ring-sky-100 focus:bg-white outline-none transition-all font-bold text-lg"
                                    required
                                />
                            </label>
                        </div>

                        <div>
                            <label className="flex flex-col">
                                <span className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Alamat Fisik Cabang</span>
                                <textarea 
                                    name="alamat_toko"
                                    value={settings.alamat_toko}
                                    onChange={handleChange}
                                    placeholder="Jln. Raya Minimarket No. 123..."
                                    rows="3"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-slate-800 focus:border-slate-400 focus:ring-2 focus:ring-sky-100 focus:bg-white outline-none transition-all font-medium text-base resize-none"
                                    required
                                />
                            </label>
                        </div>

                        <div>
                            <label className="flex flex-col">
                                <span className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Nomor Telepon</span>
                                <input 
                                    type="text"
                                    name="telepon_toko"
                                    value={settings.telepon_toko}
                                    onChange={handleChange}
                                    placeholder="Contoh: 081234567890"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-slate-800 focus:border-slate-400 focus:ring-2 focus:ring-sky-100 focus:bg-white outline-none transition-all font-bold text-base"
                                    required
                                />
                            </label>
                        </div>

                        <div>
                            <label className="flex flex-col">
                                <span className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Catatan Bawah Struk (Footer)</span>
                                <input 
                                    type="text"
                                    name="pesan_struk"
                                    value={settings.pesan_struk}
                                    onChange={handleChange}
                                    placeholder="Barang yang sudah dibeli tidak dapat ditukar."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-slate-800 focus:border-slate-400 focus:ring-2 focus:ring-sky-100 focus:bg-white outline-none transition-all font-medium text-base"
                                />
                                <span className="text-xs text-blue-600 mt-2 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 w-fit">ℹ️  Catatan ini tercetak di paling bawah struk thermal.</span>
                            </label>
                        </div>

                        <div className="pt-8 border-t border-slate-100 flex justify-end">
                            <button 
                                type="submit" 
                                disabled={saving}
                                className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-sm active:scale-95 transition-all text-base"
                            >
                                <Save size={20} />
                                {saving ? 'Sedang Merekam...' : 'Simpan Semua Pembaruan'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default SettingPage;
