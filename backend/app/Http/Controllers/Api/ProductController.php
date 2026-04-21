<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Imports\ProductImport;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class ProductController extends Controller
{
    public function index()
    {
        return response()->json(Product::with(['category', 'supplier'])->paginate(20));
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
        $product = Product::where('kode', $kode)->first();
        if (!$product) {
            return response()->json(['message' => 'Produk tidak ditemukan.'], 404);
        }
        return response()->json($product);
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
