<?php

namespace Tests\Feature\Api;

use App\Models\Product;
use App\Models\User;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransactionTest extends TestCase
{
    use RefreshDatabase;

    public function test_transaction_succeeds_and_decrements_stock()
    {
        // Setup initial dummy constraints
        $user = User::factory()->create();
        $this->actingAs($user); // Login

        // Dummy Product
        $category = Category::create(['name' => 'Minuman']);
        $product = Product::create([
            'kode' => 'AQUA01',
            'nama' => 'Aqua Botol 600ml',
            'category_id' => $category->id,
            'jumlah' => 10, // Stock available
            'satuan' => 'Btl',
            'harga_beli' => 2000,
            'harga_jual' => 3500,
        ]);

        // Construct payload simulating React Frontend mapping
        $payload = [
            'tipe_pembayaran' => 'tunai',
            'items' => [
                [
                    'product_id' => $product->id,
                    'jumlah' => 2,
                    'harga_satuan' => 3500,
                    'diskon_item' => 0,
                    'netto' => 3500,
                    'total' => 7000
                ]
            ],
            'subtotal' => 7000,
            'diskon_global' => 0,
            'pajak_persen' => 0,
            'sumbangan' => 0,
            'grand_total' => 7000,
            'bayar' => 10000,
            'kembali' => 3000
        ];

        // Hit the API
        $response = $this->postJson('/api/transactions', $payload);

        // Assertions
        $response->assertStatus(201)
                 ->assertJsonPath('success', true);

        // Assert DB matches changes
        $this->assertDatabaseHas('transactions', [
            'grand_total' => 7000,
            'bayar' => 10000
        ]);

        // Assert stock decremented by 2 (10 - 2 = 8)
        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'jumlah' => 8
        ]);
    }

    public function test_transaction_fails_if_stock_minus()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $category = Category::create(['name' => 'Minuman']);
        $product = Product::create([
            'kode' => 'AQUA_MINUS',
            'nama' => 'Aqua Error',
            'category_id' => $category->id,
            'jumlah' => 2, // Stock only 2
            'satuan' => 'Pcs',
            'harga_beli' => 2000,
            'harga_jual' => 3500,
        ]);

        $payload = [
            'tipe_pembayaran' => 'tunai',
            'items' => [
                [
                    'product_id' => $product->id,
                    'jumlah' => 5, // Ordering 5, should trigger Exception due to lack of stock
                    'harga_satuan' => 3500,
                    'diskon_item' => 0,
                    'netto' => 3500,
                    'total' => 17500
                ]
            ],
            'subtotal' => 17500,
            'diskon_global' => 0,
            'pajak_persen' => 0,
            'sumbangan' => 0,
            'grand_total' => 17500,
            'bayar' => 50000,
            'kembali' => 32500
        ];

        $response = $this->postJson('/api/transactions', $payload);

        // API should return 400 Bad Request exception wrapper
        $response->assertStatus(400)
                 ->assertJsonFragment([
                     'success' => false
                 ]);

        // Stock MUST remain unchanged due to DB Rollback
        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'jumlah' => 2
        ]);
    }
}
