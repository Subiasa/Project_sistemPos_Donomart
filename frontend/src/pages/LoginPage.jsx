import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { Lock, User as UserIcon, Loader2 } from 'lucide-react';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, loading } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(username, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Akun tidak ditemukan. Coba lagi.');
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden font-sans">
            {/* Background Light Orbs */}
            <div className="absolute top-0 -left-10 w-96 h-96 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
            <div className="absolute top-0 -right-10 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-96 h-96 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>

            <div className="w-full max-w-md relative z-10">
                <div className="bg-white/80 backdrop-blur-xl border border-white p-10 rounded-3xl shadow-2xl shadow-sky-900/10">
                    <div className="text-center mb-10">
                        <h1 className="text-5xl font-black tracking-tight text-indigo-700 mb-2">
                            DONOMART
                        </h1>
                        <p className="text-sky-600 font-bold uppercase tracking-widest text-xs">Akses Sistem Kasir</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-2xl text-center font-bold flex items-center justify-center gap-2 shadow-sm">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2 ml-1 uppercase tracking-wider">Username Kasir</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-500 transition-colors">
                                    <UserIcon size={20} />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl focus:ring-4 focus:ring-sky-100 focus:border-sky-400 transition-all placeholder:text-slate-400 font-medium"
                                    placeholder="Ketik username Anda..."
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2 ml-1 uppercase tracking-wider">Kata Sandi</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-500 transition-colors">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl focus:ring-4 focus:ring-sky-100 focus:border-sky-400 transition-all placeholder:text-slate-400 font-medium"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4 outline-none focus:ring-4 focus:ring-indigo-200"
                        >
                            {loading ? <Loader2 className="animate-spin" size={24} /> : 'Masuk Sekarang'}
                        </button>
                    </form>

                    <div className="mt-8 text-center pt-6 border-t border-slate-100">
                        <p className="text-xs text-slate-400 font-medium">
                            Lupa kata sandi? Hubungi Supervisor Anda.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
