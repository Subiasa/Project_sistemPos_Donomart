import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { ShieldX } from 'lucide-react';

/**
 * AuthRoute — Memproteksi halaman yang memerlukan login.
 * Jika user belum login (tidak ada token), redirect ke /login.
 */
export function AuthRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

/**
 * AdminRoute — Memproteksi halaman khusus admin.
 * Jika user bukan admin, tampilkan pesan akses ditolak.
 */
export function AdminRoute({ children }) {
  const { user } = useAuthStore();
  if (user?.role !== 'admin') {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-rose-100">
            <ShieldX size={36} className="text-rose-400" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Akses Ditolak</h2>
          <p className="text-slate-500 font-medium">Anda tidak memiliki izin untuk mengakses halaman ini. Hubungi administrator.</p>
        </div>
      </div>
    );
  }
  return children;
}

/**
 * GuestRoute — Hanya bisa diakses oleh user yang BELUM login.
 * Jika sudah login, redirect ke dashboard.
 */
export function GuestRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
}
