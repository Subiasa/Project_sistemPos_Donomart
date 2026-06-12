<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Imports\ProductImport;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'supplier']);

        if ($request->has('search')) {
            $searchTerm = $request->search;
            $query->where('nama', 'like', "%{$searchTerm}%")
                  ->orWhere('kode', 'like', "%{$searchTerm}%");
        } elseif ($request->has('kode')) {
            $query->where('kode', $request->kode);
        }

        // Increase pagination size for POS search dropdown to avoid missing items
        return response()->json($query->paginate(50));
    }

    public function store(Request $request)
    {
        $request->validate([
            'kode' => 'required|string|unique:products,kode',
            'nama' => 'required|string|max:255',
            'satuan' => 'required|string',
            'harga_beli' => 'required|integer',
            'harga_jual' => 'required|integer',
        ]);
        $product = Product::create($request->all());
        return response()->json($product, 201);
    }

    public function show(Product $product)
    {
        return response()->json($product->load(['category', 'supplier']));
    }

    public function update(Request $request, Product $product)
    {
        $request->validate([
            'kode' => 'required|string|unique:products,kode,' . $product->id,
            'nama' => 'required|string|max:255',
        ]);
        $product->update($request->all());
        return response()->json($product);
    }

    public function destroy(Product $product)
    {
        $product->delete();
        return response()->json(['message' => 'Produk berhasil dihapus.']);
    }

    public function scan($kode)
    {
        $product = Product::where('kode', $kode)->orWhere('barcode_grosir', $kode)->first();
        if (!$product) {
            return response()->json(['message' => 'Produk tidak ditemukan.'], 404);
        }
        return response()->json($product);
    }

    public function getRestockAlerts()
    {
        $alerts = Product::with('supplier')
            ->whereColumn('jumlah', '<=', 'stok_min')
            ->get()
            ->groupBy('supplier_id');

        $formatted = [];
        foreach($alerts as $supplierId => $products) {
            $supplier = $products->first()->supplier;
            $formatted[] = [
                'supplier' => $supplier,
                'products' => $products
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $formatted
        ]);
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xls,xlsx'
        ]);

        Excel::import(new ProductImport, $request->file('file'));

        return response()->json(['message' => 'Data produk berhasil diimpor.']);
    }
}
