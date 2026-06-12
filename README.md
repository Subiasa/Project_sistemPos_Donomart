# Project POS (Point of Sales) Web

Sistem Point of Sales (Kasir) modern yang dibangun menggunakan Laravel (Backend) dan React (Frontend).

## Fitur Utama

- **Dashboard Performa**: Statistik omzet harian, jumlah transaksi, dan peringatan stok rendah.
- **Terminal Kasir (POS)**: Antarmuka kasir cepat dengan dukungan shortcut keyboard (F1, F2, F4, F8, F11).
- **Manajemen Inventaris**: Master data produk, kategori, dan supplier.
- **Stock Opname**: Penyesuaian stok fisik dengan sistem dan pencatatan selisih.
- **Dukungan Grosir**: Fitur harga grosir dan konversi satuan otomatis.
- **Transaksi Kredit**: Pencatatan piutang pelanggan dan tanggal jatuh tempo.
- **Void Transaksi**: Pembatalan nota dengan pengembalian stok otomatis.
- **Laporan Lengkap**: Riwayat transaksi, status pembayaran, dan export ke Excel/CSV.
- **Multi-Role**: Hak akses berbeda untuk Admin dan Kasir.
- **Dark Mode**: Dukungan tema gelap untuk kenyamanan penggunaan.

## Teknologi yang Digunakan

### Backend
- Laravel 11
- Laravel Sanctum (API Auth)
- Service & Service Pattern (Clean Architecture)
- Database: MySQL / SQLite

### Frontend
- React 19 (Vite)
- Tailwind CSS 4
- Zustand (State Management)
- Lucide React (Icons)
- Axios (API Client)

## Cara Instalasi

### 1. Persiapan Backend
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
# Sesuaikan DB_CONNECTION di .env, lalu:
php artisan migrate --seed
php artisan serve
```

### 2. Persiapan Frontend
```bash
cd frontend
npm install
npm run dev
```

## Arsitektur Sistem
Proyek ini menerapkan **Service Pattern** di backend untuk memisahkan logika bisnis dari controller, serta **API Service Layer** di frontend untuk pengelolaan request yang terpusat dan modular.

---
Dikembangkan untuk tugas Semester 4 - Project POS Web.
