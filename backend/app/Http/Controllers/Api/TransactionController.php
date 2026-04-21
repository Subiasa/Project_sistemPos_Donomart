<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TransactionController extends Controller
{
    public function index()
    {
        return response()->json(Transaction::with(['user', 'customer', 'transactionDetails.product'])->latest()->paginate(20));
    }

    public function store(Request $request)
    {
        // 1. Validate the incoming request
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.jumlah' => 'required|integer|min:1',
            'items.*.harga_satuan' => 'required|numeric',
            'items.*.diskon_item' => 'nullable|numeric',
            'items.*.netto' => 'required|numeric',
            'items.*.total' => 'required|numeric',
            'subtotal' => 'required|numeric',
            'diskon_global' => 'nullable|numeric',
            'pajak_persen' => 'nullable|numeric',
            'sumbangan' => 'nullable|numeric',
            'grand_total' => 'required|numeric',
            'bayar' => 'required|numeric',
            'kembali' => 'required|numeric',
            'tipe_pembayaran' => 'required|in:tunai,qris',
            'customer_id' => 'nullable|exists:customers,id'
        ]);

        try {
            // 2. Start DB::transaction()
            $transactionData = DB::transaction(function () use ($validated, $request) {
                // 3. Generate a unique no_nota
                $no_nota = 'PJL-' . date('Ymd') . '-' . strtoupper(\Illuminate\Support\Str::random(4));

                // 4. Create the main record in the transactions table
                $transaction = Transaction::create([
                    'no_nota' => $no_nota,
                    'tanggal' => now(),
                    'user_id' => $request->user() ? $request->user()->id : 1, // Fallback safe
                    'customer_id' => $validated['customer_id'] ?? null,
                    'tipe_pembayaran' => $validated['tipe_pembayaran'],
                    'subtotal' => $validated['subtotal'],
                    'diskon_global' => $validated['diskon_global'] ?? 0,
                    'pajak_persen' => $validated['pajak_persen'] ?? 0,
                    'sumbangan' => $validated['sumbangan'] ?? 0,
                    'grand_total' => $validated['grand_total'],
                    'bayar' => $validated['bayar'],
                    'kembali' => $validated['kembali'],
                ]);

                // 5. Loop through the items array
                foreach ($validated['items'] as $item) {
                    $product = Product::lockForUpdate()->find($item['product_id']);

                    // Checking stock constraints
                    if ($product->jumlah < $item['jumlah']) {
                        throw new \Exception("Stok barang {$product->nama} tidak mencukupi (Sisa: {$product->jumlah}).");
                    }

                    // Create transaction detail
                    TransactionDetail::create([
                        'transaction_id' => $transaction->id,
                        'product_id' => $product->id,
                        'jumlah' => $item['jumlah'],
                        'harga_satuan' => $item['harga_satuan'],
                        'diskon_item' => $item['diskon_item'] ?? 0,
                        'netto' => $item['netto'],
                        'total' => $item['total'],
                    ]);

                    // IMPORTANT: Decrement product stock
                    $product->decrement('jumlah', $item['jumlah']);
                }

                // 6. Commit happens automatically on successful closure return
                return $transaction;
            });

            // 7. Return JSON response
            return response()->json([
                'success' => true,
                'message' => 'Transaksi berhasil diproses.',
                'data' => $transactionData->load('transactionDetails.product')
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memproses transaksi: ' . $e->getMessage()
            ], 400);
        }
    }

    public function show(Transaction $transaction)
    {
        return response()->json($transaction->load(['user', 'customer', 'transactionDetails.product']));
    }
}
