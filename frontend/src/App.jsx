import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import POSPage from './pages/POSPage';
import ProductPage from './pages/ProductPage';

import ReportPage from './pages/ReportPage';
import CustomerPage from './pages/CustomerPage';
import SettingPage from './pages/SettingPage';

import useAuthStore from './store/useAuthStore';

function AdminRoute({ children }) {
  const { user } = useAuthStore();
  if (user?.role !== 'admin') {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-rose-500 mb-2">Akses Ditolak</h2>
          <p className="text-slate-400">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
        </div>
      </div>
    );
  }
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="pos" element={<POSPage />} />
          <Route path="products" element={<AdminRoute><ProductPage /></AdminRoute>} />
          <Route path="customers" element={<AdminRoute><CustomerPage /></AdminRoute>} />
          <Route path="reports" element={<AdminRoute><ReportPage /></AdminRoute>} />
          <Route path="settings" element={<AdminRoute><SettingPage /></AdminRoute>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
