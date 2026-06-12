<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Http\Requests\StoreTransactionRequest;
use App\Services\TransactionService;

class TransactionController extends Controller
{
    protected $transactionService;

    public function __construct(TransactionService $transactionService)
    {
        $this->transactionService = $transactionService;
    }

    /**
     * Retrieve all transactions
     */
    public function index()
    {
        return response()->json(Transaction::with(['user', 'customer', 'transactionDetails.product'])->latest()->paginate(20));
    }

    /**
     * Store a new transaction
     */
    public function store(StoreTransactionRequest $request)
    {
        try {
            $userId = $request->user() ? $request->user()->id : 1; // Fallback jika auth tidak terbaca
            
            // Logika bisnis didelegasikan ke Service
            $transaction = $this->transactionService->processTransaction($request->validated(), $userId);

            return response()->json([
                'success' => true,
                'message' => 'Transaksi berhasil diproses.',
                'data' => $transaction->load('transactionDetails.product')
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memproses transaksi: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Show a specific transaction
     */
    public function show(Transaction $transaction)
    {
        return response()->json($transaction->load(['user', 'customer', 'transactionDetails.product']));
    }

    /**
     * Void a transaction
     */
    public function void(Transaction $transaction)
    {
        try {
            // Logika void didelegasikan ke Service
            $this->transactionService->voidTransaction($transaction);

            return response()->json(['message' => 'Transaksi berhasil dibatalkan (void).']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal membatalkan transaksi: ' . $e->getMessage()], 400);
        }
    }
}
