<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Exception;

class TransactionService
{
    /**
     * Memproses transaksi baru dan memotong stok barang
     */
    public function processTransaction(array $data, $userId)
    {
        return DB::transaction(function () use ($data, $userId) {
            // 1. Generate unique invoice number
            $no_nota = 'PJL-' . date('Ymd') . '-' . strtoupper(Str::random(4));

            $tipe = $data['tipe_pembayaran'];
            $status = $tipe === 'kredit' ? 'piutang' : 'lunas';

            // 2. Create the main transaction record
            $transaction = Transaction::create([
                'no_nota' => $no_nota,
                'tanggal' => now(),
                'user_id' => $userId,
                'customer_id' => $data['customer_id'] ?? null,
                'tipe_pembayaran' => $tipe,
                'status' => $status,
                'jatuh_tempo' => $data['jatuh_tempo'] ?? null,
                'subtotal' => $data['subtotal'],
                'diskon_global' => $data['diskon_global'] ?? 0,
                'pajak_persen' => $data['pajak_persen'] ?? 0,
                'sumbangan' => $data['sumbangan'] ?? 0,
                'grand_total' => $data['grand_total'],
                'bayar' => $data['bayar'],
                'kembali' => $data['kembali'],
            ]);

            // 3. Bulk lock products to prevent race conditions
            $productIds = collect($data['items'])->pluck('product_id');
            $products = Product::whereIn('id', $productIds)->lockForUpdate()->get()->keyBy('id');
            
            $detailsToInsert = [];
            
            // 4. Process items and deduct stock
            foreach ($data['items'] as $item) {
                $product = $products[$item['product_id']];

                $isGrosir = isset($item['is_grosir']) && $item['is_grosir'];
                $barcodeMatchesGrosir = isset($item['barcode']) && $product->barcode_grosir && $item['barcode'] === $product->barcode_grosir;
                
                $qtyToDeduct = $item['jumlah'];
                if ($isGrosir || $barcodeMatchesGrosir) {
                    $qtyToDeduct = $item['jumlah'] * max(1, $product->konversi_grosir);
                }

                if ($product->jumlah < $qtyToDeduct) {
                    throw new Exception("Stok barang {$product->nama} tidak mencukupi (Sisa: {$product->jumlah}).");
                }

                $detailsToInsert[] = [
                    'transaction_id' => $transaction->id,
                    'product_id' => $product->id,
                    'jumlah' => $item['jumlah'],
                    'harga_satuan' => $item['harga_satuan'],
                    'diskon_item' => $item['diskon_item'] ?? 0,
                    'netto' => $item['netto'],
                    'total' => $item['total'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ];

                // Decrement stock in memory and save
                $product->jumlah -= $qtyToDeduct;
                $product->save();
            }

            // 5. Bulk insert transaction details
            TransactionDetail::insert($detailsToInsert);

            return $transaction;
        });
    }

    /**
     * Membatalkan transaksi (void) dan mengembalikan stok barang
     */
    public function voidTransaction(Transaction $transaction)
    {
        if ($transaction->status === 'void') {
            throw new Exception('Transaksi sudah dibatalkan sebelumnya.');
        }

        DB::transaction(function () use ($transaction) {
            // Return stocks
            foreach ($transaction->transactionDetails as $detail) {
                $product = $detail->product;
                if ($product) {
                    $product->increment('jumlah', $detail->jumlah);
                }
            }

            // Update status
            $transaction->update(['status' => 'void']);
        });
    }
}
