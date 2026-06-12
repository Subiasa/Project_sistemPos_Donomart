import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Sun, Moon } from 'lucide-react';

const POSHeader = ({ isDark, toggleTheme }) => {
    const navigate = useNavigate();

    return (
        <div className={`px-6 py-3 flex items-center justify-between shrink-0 z-20 shadow-sm relative transition-colors duration-300 ${
            isDark 
                ? 'bg-gray-900 text-gray-100 border-b border-gray-700' 
                : 'bg-white text-slate-800 border-b border-slate-200'
        }`}>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        isDark ? 'bg-blue-900/50 border border-blue-700' : 'bg-blue-50 border border-blue-100'
                    }`}>
                        <h1 className="text-lg font-black text-blue-500">D</h1>
                    </div>
                    <span className={`font-black text-lg tracking-wider ${isDark ? 'text-gray-100' : 'text-slate-800'}`}>POS MINIMARKET</span>
                </div>
                <span className={`text-xs font-mono font-medium border-l pl-4 transition-colors ${
                    isDark ? 'text-gray-400 border-gray-700' : 'text-slate-500 border-slate-200'
                }`}>
                    {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()} - {new Date().toLocaleTimeString('id-ID')}
                </span>
            </div>
            <div className="flex items-center gap-3">
                {/* Dark/Light Mode Toggle */}
                <button 
                    onClick={toggleTheme}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all duration-300 ${
                        isDark 
                            ? 'bg-gray-800 border border-gray-600 text-amber-400 hover:bg-gray-700 hover:border-amber-500/50' 
                            : 'bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 hover:border-blue-200 hover:text-blue-600'
                    }`}
                    title={isDark ? 'Mode Terang' : 'Mode Gelap'}
                >
                    {isDark ? <Sun size={16} /> : <Moon size={16} />}
                    <span className="hidden sm:inline">{isDark ? 'Terang' : 'Gelap'}</span>
                </button>
                
                <button 
                    onClick={() => navigate('/')} 
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all shadow-sm ${
                        isDark 
                            ? 'bg-gray-800 border border-gray-600 text-gray-300 hover:border-rose-500/50 hover:bg-rose-900/30 hover:text-rose-400' 
                            : 'bg-white border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-600 hover:text-rose-600'
                    }`}
                >
                    <X size={16} /> Keluar (Esc)
                </button>
            </div>
        </div>
    );
};

export default POSHeader;
