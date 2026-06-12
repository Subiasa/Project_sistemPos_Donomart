<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Customer;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $today = now()->startOfDay();
        
        // 1. Stats Today
        $statsToday = Transaction::whereDate('created_at', $today)
            ->selectRaw('SUM(grand_total) as omzet, COUNT(*) as count')
            ->first();

        // 2. Total Customers
        $totalCustomers = Customer::count();

        // 3. Low Stock Count
        $lowStockCount = Product::whereColumn('jumlah', '<=', 'stok_min')->count();

        // 4. Recent Transactions
        $recentTransactions = Transaction::with('user')
            ->latest()
            ->take(5)
            ->get();

        // 5. Chart Data (Last 7 Days)
        $chartData = Transaction::where('created_at', '>=', now()->subDays(6)->startOfDay())
            ->selectRaw('DATE(created_at) as date, SUM(grand_total) as total')
            ->groupBy('date')
            ->orderBy('date', 'ASC')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => [
                    'total_omzet' => (int)($statsToday->omzet ?? 0),
                    'total_transactions' => (int)($statsToday->count ?? 0),
                    'total_customers' => $totalCustomers,
                    'low_stock' => $lowStockCount,
                ],
                'recent_transactions' => $recentTransactions,
                'chart_data' => $chartData
            ]
        ]);
    }
}
