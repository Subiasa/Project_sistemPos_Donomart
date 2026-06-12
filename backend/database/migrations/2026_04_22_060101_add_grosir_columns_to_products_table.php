<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('barcode_grosir')->nullable()->unique();
            $table->string('satuan_grosir')->nullable();
            $table->integer('konversi_grosir')->default(1);
            $table->bigInteger('harga_jual_grosir')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['barcode_grosir', 'satuan_grosir', 'konversi_grosir', 'harga_jual_grosir']);
        });
    }
};
