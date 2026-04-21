<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('no_nota')->unique();
            $table->dateTime('tanggal');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('customer_id')->nullable()->constrained('customers')->onDelete('set null');
            $table->enum('tipe_pembayaran', ['tunai', 'qris'])->default('tunai');
            $table->bigInteger('subtotal');
            $table->bigInteger('diskon_global')->default(0);
            $table->integer('pajak_persen')->default(0);
            $table->bigInteger('sumbangan')->default(0);
            $table->bigInteger('grand_total');
            $table->bigInteger('bayar');
            $table->bigInteger('kembali')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
