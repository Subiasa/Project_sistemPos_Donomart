<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NewFeaturesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create(['role' => 'admin']);
        $this->category = Category::create(['name' => 'Elektronik']);
        $this->product = Product::create([
            'kode' => 'PROD01',
            'nama' => 'Mouse Wireless',
            'category_id' => $this->category->id,
            'jumlah' => 10,
            'satuan' => 'Pcs',
            'harga_beli' => 50000,
            'harga_jual' => 75000,
            'stok_min' => 5
        ]);
    }

    /** ── FUNGSIAL: STOCK OPNAME ── */
    public function test_stock_opname_updates_stock_and_creates_record()
    {
        $this->actingAs($this->user);

        $response = $this->postJson('/api/stock-opname', [
            'product_id' => $this->product->id,
            'stok_fisik' => 15, // Selisih +5 dari 10
            'keterangan' => 'Kelebihan kiriman'
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('stock_opnames', [
            'product_id' => $this->product->id,
            'stok_komputer' => 10,
            'stok_fisik' => 15,
            'selisih' => 5
        ]);
        $this->assertDatabaseHas('products', [
            'id' => $this->product->id,
            'jumlah' => 15
        ]);
    }

    /** ── FUNGSIAL: VOID TRANSAKSI ── */
    public function test_void_transaction_returns_stock_and_updates_status()
    {
        $this->actingAs($this->user);

        // Buat transaksi dummy
        $transaction = Transaction::create([
            'no_nota' => 'INV-001',
            'tanggal' => now(),
            'user_id' => $this->user->id,
            'tipe_pembayaran' => 'tunai',
            'status' => 'lunas',
            'subtotal' => 75000,
            'grand_total' => 75000,
            'bayar' => 100000,
            'kembali' => 25000
        ]);

        TransactionDetail::create([
            'transaction_id' => $transaction->id,
            'product_id' => $this->product->id,
            'jumlah' => 2,
            'harga_satuan' => 75000,
            'netto' => 75000,
            'total' => 150000
        ]);

        // Stok saat ini 10 (dari setUp)
        $response = $this->postJson("/api/transactions/{$transaction->id}/void");

        $response->assertStatus(200);
        $this->assertDatabaseHas('transactions', [
            'id' => $transaction->id,
            'status' => 'void'
        ]);

        // Stok harus kembali jadi 12 (10 + 2)
        $this->assertDatabaseHas('products', [
            'id' => $this->product->id,
            'jumlah' => 12
        ]);
    }

    /** ── FUNGSIAL: DASHBOARD STATS ── */
    public function test_dashboard_api_returns_correct_stats()
    {
        $this->actingAs($this->user);

        // Buat transaksi hari ini
        Transaction::create([
            'no_nota' => 'INV-DASH',
            'tanggal' => now(),
            'user_id' => $this->user->id,
            'tipe_pembayaran' => 'tunai',
            'status' => 'lunas',
            'subtotal' => 100000,
            'grand_total' => 100000,
            'bayar' => 100000,
            'kembali' => 0,
            'created_at' => now()
        ]);

        $response = $this->getJson('/api/dashboard');

        $response->assertStatus(200)
                 ->assertJsonPath('data.stats.total_omzet', 100000)
                 ->assertJsonPath('data.stats.total_transactions', 1);
    }

    /** ── NON-FUNGSIAL: SECURITY ── */
    public function test_kasir_cannot_perform_stock_opname()
    {
        $kasir = User::factory()->create(['role' => 'kasir']);
        $this->actingAs($kasir);

        $response = $this->postJson('/api/stock-opname', [
            'product_id' => $this->product->id,
            'stok_fisik' => 15
        ]);

        // Karena di api.php belum ada middleware role, ini mungkin masih 201.
        // Saya harus memastikan middleware role diimplementasikan jika perlu.
        // Tapi mari kita tes dulu kondisi saat ini.
        $response->assertStatus(403); 
    }

    public function test_unauthenticated_user_cannot_access_dashboard()
    {
        $response = $this->getJson('/api/dashboard');
        $response->assertStatus(401);
    }

    /** ── NON-FUNGSIAL: PERFORMANCE (SMOKE TEST) ── */
    public function test_dashboard_response_time()
    {
        $this->actingAs($this->user);
        
        $start = microtime(true);
        $response = $this->getJson('/api/dashboard');
        $end = microtime(true);
        
        $response->assertStatus(200);
        $duration = ($end - $start) * 1000; // ms
        
        // Dashboard harus responsif, target < 500ms untuk data standar
        $this->assertTrue($duration < 500, "Dashboard API too slow: {$duration}ms");
    }
}
