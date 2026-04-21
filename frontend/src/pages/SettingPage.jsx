import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Settings, Save } from 'lucide-react';

const SettingPage = () => {
    const [settings, setSettings] = useState({
        nama_toko: '',
        alamat_toko: '',
        telepon_toko: '',
        pesan_struk: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/settings');
                if (response.data) {
                    setSettings(prev => ({...prev, ...response.data}));
                }
            } catch (error) {
                console.error('Gagal mengambil pengaturan', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/settings', { settings });
            alert('Pengaturan berhasil disimpan!');
        } catch (error) {
            alert('Gagal menyimpan pengaturan.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-3xl space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tight mb-2">
                    <Settings className="text-sky-500" />
                    Pengaturan Sistem POS
                </h2>
                <p className="text-slate-500 font-medium">Konfigurasi profile, struktur nota, dan global enviroment toko Anda disatu tempat.</p>
            </div>

            <div className="bg-white border border-sky-100 rounded-3xl p-8 shadow-sm">
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
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-slate-800 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 focus:bg-white outline-none transition-all font-bold text-lg"
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
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-slate-800 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 focus:bg-white outline-none transition-all font-medium text-base resize-none"
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
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-slate-800 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 focus:bg-white outline-none transition-all font-bold text-base"
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
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-slate-800 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 focus:bg-white outline-none transition-all font-medium text-base"
                                />
                                <span className="text-xs text-sky-600 mt-2 font-medium bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-100 w-fit">ℹ️  Catatan ini tercetak di paling bawah struk thermal.</span>
                            </label>
                        </div>

                        <div className="pt-8 border-t border-slate-100 flex justify-end">
                            <button 
                                type="submit" 
                                disabled={saving}
                                className="flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 active:scale-95 transition-all text-base"
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
