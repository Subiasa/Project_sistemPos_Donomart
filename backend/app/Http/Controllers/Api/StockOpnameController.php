<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StockOpname;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StockOpnameController extends Controller
{
    public function index()
    {
        return response()->json(StockOpname::with(['product', 'user'])->latest()->paginate(20));
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'stok_fisik' => 'required|integer|min:0',
            'keterangan' => 'nullable|string'
        ]);

        try {
            return DB::transaction(function () use ($request) {
                $product = Product::findOrFail($request->product_id);
                $stok_komputer = $product->jumlah;
                $selisih = $request->stok_fisik - $stok_komputer;

                $opname = StockOpname::create([
                    'product_id' => $product->id,
                    'user_id' => $request->user() ? $request->user()->id : 1,
                    'stok_komputer' => $stok_komputer,
                    'stok_fisik' => $request->stok_fisik,
                    'selisih' => $selisih,
                    'keterangan' => $request->keterangan
                ]);

                // Update product stock
                $product->jumlah = $request->stok_fisik;
                $product->save();

                return response()->json([
                    'success' => true,
                    'message' => 'Stock opname berhasil disimpan.',
                    'data' => $opname->load('product')
                ], 201);
            });
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan stock opname: ' . $e->getMessage()
            ], 400);
        }
    }
}
