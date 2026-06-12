<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTransactionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Autorisasi ditangani oleh middleware Sanctum
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.jumlah' => 'required|integer|min:1',
            'items.*.harga_satuan' => 'required|numeric',
            'items.*.diskon_item' => 'nullable|numeric',
            'items.*.netto' => 'required|numeric',
            'items.*.total' => 'required|numeric',
            'items.*.is_grosir' => 'nullable|boolean',
            'items.*.barcode' => 'nullable|string',
            'subtotal' => 'required|numeric',
            'diskon_global' => 'nullable|numeric',
            'pajak_persen' => 'nullable|numeric',
            'sumbangan' => 'nullable|numeric',
            'grand_total' => 'required|numeric',
            'bayar' => 'required|numeric',
            'kembali' => 'required|numeric',
            'tipe_pembayaran' => 'required|in:tunai,qris,kredit',
            'jatuh_tempo' => 'nullable|date',
            'customer_id' => 'nullable|exists:customers,id'
        ];
    }
}
