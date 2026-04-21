import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  FileText, 
  Settings, 
  LogOut
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const SidebarItem = ({ icon: Icon, label, path, active }) => (
  <Link
    to={path}
    title={label}
    className={`flex items-center justify-center p-3 rounded-xl transition-all duration-200 mx-auto w-12 h-12 mb-2 ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 relative' 
        : 'text-slate-400 hover:bg-sky-50 hover:text-indigo-600 border border-transparent'
    }`}
  >
    <Icon size={22} className={active ? 'text-white' : ''} />
  </Link>
);

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: ShoppingCart, label: 'Kasir (POS)', path: '/pos' },
    { icon: Package, label: 'Produk', path: '/products', role: 'admin' },
    { icon: Users, label: 'Pelanggan', path: '/customers', role: 'admin' },
    { icon: FileText, label: 'Laporan', path: '/reports', role: 'admin' },
    { icon: Settings, label: 'Pengaturan', path: '/settings', role: 'admin' },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    !item.role || (user && user.role === item.role)
  );

  return (
    <div className="w-20 h-screen bg-white flex flex-col items-center border-r border-sky-100 shadow-sm z-50 shrink-0">
      <div className="p-4 pt-6 mb-2">
        {/* Simple Brand Logo directly mapped to D */}
        <div className="w-12 h-12 bg-sky-50 border-2 border-indigo-100 rounded-2xl flex items-center justify-center cursor-default" title="POS Donomart">
           <h1 className="text-2xl font-black text-indigo-600">D</h1>
        </div>
      </div>

      <nav className="flex-1 w-full space-y-1 overflow-y-auto custom-scrollbar no-scrollbar flex flex-col items-center mt-2">
        {filteredMenuItems.map((item) => (
          <SidebarItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            path={item.path}
            active={location.pathname === item.path}
          />
        ))}
      </nav>

      <div className="p-4 border-t border-sky-100 w-full flex flex-col items-center">
        <div 
          className="w-10 h-10 rounded-full bg-orange-500 font-bold text-white shadow-sm flex items-center justify-center mb-4 cursor-help"
          title={`Masuk sebagai: ${user?.name} (${user?.role})`}
        >
          {user?.name?.[0].toUpperCase()}
        </div>
        
        <button
          title="Keluar"
          onClick={logout}
          className="flex items-center justify-center w-12 h-12 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all font-bold border border-transparent hover:border-rose-100"
        >
          <LogOut size={22} />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
