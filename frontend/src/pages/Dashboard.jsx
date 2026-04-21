import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  UsersIcon, 
  AlertTriangle,
  FileText
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import api from '../api/axios';

const StatCard = ({ title, value, icon: Icon, colorClass, borderClass, bgClass }) => (
  <div className={`bg-white border ${borderClass} p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden`}>
    <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full ${bgClass} opacity-20`}></div>
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className={`p-4 rounded-2xl ${bgClass} ${colorClass} shadow-sm`}>
        <Icon size={28} />
      </div>
    </div>
    <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider relative z-10">{title}</h3>
    <p className="text-3xl font-black text-slate-800 mt-2 tracking-tight relative z-10">{value}</p>
  </div>
);

const Dashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalOmzet: 0,
    totalTransactions: 0,
    totalCustomers: 0,
    lowStock: 0,
    recentTransactions: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [transRes, custRes, prodRes] = await Promise.all([
          api.get('/transactions').catch(() => ({ data: { data: [] } })),
          api.get('/customers').catch(() => ({ data: [] })),
          api.get('/products').catch(() => ({ data: { data: [] } })),
        ]);

        const transactions = transRes.data.data || [];
        const customers = custRes.data || [];
        const products = prodRes.data.data || [];

        const today = new Date().toISOString().split('T')[0];
        
        let todayOmzet = 0;
        let todayTransactionsCount = 0;
        
        transactions.forEach(t => {
            if (t.created_at && t.created_at.includes(today)) {
               todayOmzet += t.grand_total;
               todayTransactionsCount++;
            }
        });

        if (todayTransactionsCount === 0 && transactions.length > 0) {
            transactions.forEach(t => {
               todayOmzet += t.grand_total;
            });
            todayTransactionsCount = transactions.length;
        }

        const lowStockCount = products.filter(p => p.jumlah <= (p.stok_min || 10)).length;

        setStats({
          totalOmzet: todayOmzet,
          totalTransactions: todayTransactionsCount,
          totalCustomers: customers.length,
          lowStock: lowStockCount,
          recentTransactions: transactions.slice(0, 5)
        });
      } catch (error) {
        console.error("Gagal mengambil data dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (user?.role === 'kasir') {
      return (
        <div className="h-full flex items-center justify-center p-6 bg-slate-50">
            <div className="text-center bg-white border border-sky-100 p-12 rounded-3xl shadow-xl max-w-lg w-full relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-sky-50 rounded-full"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-50 rounded-full"></div>
                
                <div className="relative z-10">
                    <div className="w-24 h-24 bg-sky-100 text-sky-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm rotate-3 hover:rotate-0 transition-transform">
                        <ShoppingBag size={48} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">Halo, {user.name}!</h2>
                    <p className="text-slate-500 mb-10 font-medium">Sistem terminal kasir siap digunakan. Silakan klik tombol di bawah untuk melayani pembayaran.</p>
                    <a href="/pos" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-10 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 text-lg">
                        Buka Mesin Kasir
                    </a>
                </div>
            </div>
        </div>
      );
  }

  // Admin View
  return (
    <div className="space-y-8 animate-in fade-in duration-500 bg-slate-50 min-h-full p-2">
      <div className="mb-2">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Ringkasan Performa</h2>
        <p className="text-slate-500 font-medium mt-1">Selamat datang <span className="font-bold text-sky-600">{user?.name}</span>! Berikut kilasan laporan toko hari ini.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Omzet Toko" 
          value={loading ? "..." : `Rp ${stats.totalOmzet.toLocaleString()}`} 
          icon={TrendingUp} 
          colorClass="text-emerald-600"
          bgClass="bg-emerald-100"
          borderClass="border-emerald-100"
        />
        <StatCard 
          title="Transaksi (Nota)" 
          value={loading ? "..." : stats.totalTransactions} 
          icon={ShoppingBag} 
          colorClass="text-indigo-600"
          bgClass="bg-indigo-100"
          borderClass="border-indigo-100"
        />
        <StatCard 
          title="Pelanggan" 
          value={loading ? "..." : stats.totalCustomers} 
          icon={UsersIcon} 
          colorClass="text-sky-600"
          bgClass="bg-sky-100"
          borderClass="border-sky-100"
        />
        <StatCard 
          title="Peringatan Stok" 
          value={loading ? "..." : `${stats.lowStock} Barang`} 
          icon={AlertTriangle} 
          colorClass="text-orange-600"
          bgClass="bg-orange-100"
          borderClass="border-orange-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-sky-100 rounded-3xl p-8 min-h-[400px] flex flex-col justify-center items-center text-slate-400 shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-transparent"></div>
          <div className="text-center relative z-10">
            <div className="bg-sky-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
               <TrendingUp size={40} className="text-sky-300" />
            </div>
            <p className="font-bold text-slate-500 text-lg">Grafik belum tersedia</p>
            <p className="text-sm mt-2">Dibutuhkan minimal 7 hari transaksi untuk memproses bagan visual.</p>
          </div>
        </div>

        <div className="bg-white border border-sky-100 rounded-3xl p-6 min-h-[400px] shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-black text-slate-800">Riwayat Terakhir</h3>
             <span className="text-xs font-bold text-sky-600 bg-sky-50 px-3 py-1 rounded-full">Baru Saja</span>
          </div>
          
          <div className="space-y-4 flex-1">
            {loading ? (
                <div className="flex justify-center items-center h-40"><p className="text-slate-400 font-bold">Memuat...</p></div>
            ) : stats.recentTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                    <ShoppingBag size={32} className="opacity-20 mb-2"/>
                    <p className="text-sm font-medium">Belum ada transaksi</p>
                </div>
            ) : (
                stats.recentTransactions.map(t => (
                <div key={t.id} className="flex justify-between items-center p-4 bg-slate-50 hover:bg-sky-50 rounded-2xl transition-colors cursor-pointer border border-transparent hover:border-sky-100 group">
                    <div className="flex gap-4 items-center">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-sky-500 group-hover:border-sky-200 transition-colors">
                           <FileText size={18} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-700">{t.no_nota}</p>
                            <p className="text-xs text-slate-500 font-semibold mt-0.5">{t.tipe_pembayaran === 'tunai' ? '💸 Tunai' : '📱 QRIS'}</p>
                        </div>
                    </div>
                    <p className="text-sm font-black text-slate-800 bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm">Rp {t.grand_total.toLocaleString()}</p>
                </div>
                ))
            )}
          </div>
          
          <button className="w-full mt-4 py-3 text-sm font-bold text-sky-600 bg-sky-50 hover:bg-sky-100 rounded-xl transition-colors">
              Lihat Semua Laporan
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
