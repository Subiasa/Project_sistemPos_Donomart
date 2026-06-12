<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\StockOpnameController;
use App\Http\Controllers\Api\DashboardController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes (No Authentication Required)
|--------------------------------------------------------------------------
*/
Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:5,1'); // Max 5 login attempts per minute

/*
|--------------------------------------------------------------------------
| Protected Routes (Requires Sanctum Token)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // ── Dashboard ───────────────────────────────────────────
    Route::get('dashboard', [DashboardController::class, 'index'])->middleware('admin');

    // ── Auth ────────────────────────────────────────────────
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });

    // Legacy /user endpoint (backward compatible)
    Route::get('/user', [AuthController::class, 'me']);

    // ── Master Data ─────────────────────────────────────────
    Route::prefix('master')->middleware('admin')->group(function () {
        Route::apiResource('categories', CategoryController::class);
        Route::apiResource('suppliers', SupplierController::class);
        Route::apiResource('customers', CustomerController::class);
    });

    // Legacy endpoints (backward compatible with existing frontend)
    Route::apiResource('categories', CategoryController::class)->middleware('admin');
    Route::apiResource('suppliers', SupplierController::class)->middleware('admin');
    Route::apiResource('customers', CustomerController::class)->middleware('admin');

    // ── Settings ────────────────────────────────────────────
    Route::get('settings', [SettingController::class, 'index']);
    Route::post('settings', [SettingController::class, 'store'])->middleware('admin');

    // ── Stock Opname ───────────────────────────────────────
    Route::get('stock-opname', [StockOpnameController::class, 'index'])->middleware('admin');
    Route::post('stock-opname', [StockOpnameController::class, 'store'])->middleware('admin');

    // ── Products ────────────────────────────────────────────
    Route::get('products/restock-alerts', [ProductController::class, 'getRestockAlerts']);
    Route::get('products/scan/{kode}', [ProductController::class, 'scan']);
    Route::post('products/import', [ProductController::class, 'import'])->middleware('admin');
    Route::apiResource('products', ProductController::class);

    // ── Transactions (POS) ──────────────────────────────────
    Route::post('transactions/{transaction}/void', [TransactionController::class, 'void'])->middleware('admin');
    Route::apiResource('transactions', TransactionController::class)
        ->only(['index', 'store', 'show']);
});
