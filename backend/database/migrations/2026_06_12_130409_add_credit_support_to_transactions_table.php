<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            // Since SQLite doesn't support modifying enums directly easily, 
            // and Laravel 11 uses a more flexible approach, 
            // we'll just change it to string for better compatibility if needed, 
            // but let's try to just add columns first.
            $table->string('status')->default('lunas')->after('tipe_pembayaran'); // lunas, piutang, void
            $table->date('jatuh_tempo')->nullable()->after('status');
        });

        // Update the type to string to allow 'kredit' without enum constraints issues in some DBs
        // or just use DB statement if it's MySQL. For Laravel 11, string is safer for broad support.
        Schema::table('transactions', function (Blueprint $table) {
            $table->string('tipe_pembayaran')->change();
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn(['status', 'jatuh_tempo']);
        });
    }
};
