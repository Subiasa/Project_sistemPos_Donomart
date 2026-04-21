<?php

namespace App\Imports;

use App\Models\Product;
use App\Models\Category;
use App\Models\Supplier;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ProductImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
        // Temukan atau buat kategori
        $category = Category::firstOrCreate(['nama' => $row['kategori']]);
        
        // Temukan atau buat supplier
        $supplier = Supplier::firstOrCreate(['nama' => $row['supplier']], ['kode' => 'SUP-' . uniqid()]);

        return new Product([
            'kode'          => $row['kode'],
            'nama'          => $row['nama'],
            'deskripsi'     => $row['deskripsi'] ?? null,
            'category_id'   => $category->id,
            'jumlah'        => $row['stok'] ?? 0,
            'satuan'        => $row['satuan'] ?? 'pcs',
            'harga_beli'    => $row['harga_beli'] ?? 0,
            'harga_jual'    => $row['harga_jual'] ?? 0,
            'supplier_id'   => $supplier->id,
            'lokasi'        => $row['lokasi'] ?? null,
            'diskon_persen' => $row['diskon'] ?? 0,
            'stok_min'      => $row['stok_min'] ?? 0,
            'expired_date'  => isset($row['expired_date']) ? \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($row['expired_date']) : null,
        ]);
    }
}
