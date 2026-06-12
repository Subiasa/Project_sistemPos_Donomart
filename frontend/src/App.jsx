import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AdminRoute, GuestRoute } from './components/RouteGuards';
import DashboardLayout from './layouts/DashboardLayout';

// ── Lazy-loaded Pages ───────────────────────────────────────
// Setiap halaman hanya dimuat ketika user mengaksesnya,
// sehingga bundle awal (initial load) menjadi jauh lebih ringan.
const LoginPage = lazy(() => import('./pages/LoginPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const POSPage = lazy(() => import('./pages/POSPage'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const ReportPage = lazy(() => import('./pages/ReportPage'));
const CustomerPage = lazy(() => import('./pages/CustomerPage'));
const SupplierPage = lazy(() => import('./pages/SupplierPage'));
const SettingPage = lazy(() => import('./pages/SettingPage'));
const PurchaseOrder = lazy(() => import('./pages/PurchaseOrder'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// ── Loading Fallback ────────────────────────────────────────
const PageLoader = () => (
  <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
    <div className="text-center">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-sm font-bold text-slate-400 tracking-wide">Memuat halaman...</p>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ── Public Routes ───────────────────────────────── */}
          <Route path="/login" element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          } />

          {/* ── Standalone POS (fullscreen, no sidebar) ───── */}
          <Route path="/pos" element={<POSPage />} />

          {/* ── Dashboard Routes (with Sidebar layout) ────── */}
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<AdminRoute><ProductPage /></AdminRoute>} />
            <Route path="stock-opname" element={<AdminRoute><StockOpnamePage /></AdminRoute>} />
            <Route path="customers" element={<AdminRoute><CustomerPage /></AdminRoute>} />
            <Route path="suppliers" element={<AdminRoute><SupplierPage /></AdminRoute>} />
            <Route path="purchase-orders" element={<AdminRoute><PurchaseOrder /></AdminRoute>} />
            <Route path="reports" element={<AdminRoute><ReportPage /></AdminRoute>} />
            <Route path="settings" element={<AdminRoute><SettingPage /></AdminRoute>} />
          </Route>

          {/* ── Catch-all 404 ──────────────────────────────── */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
