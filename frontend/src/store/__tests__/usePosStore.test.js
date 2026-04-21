import { describe, it, expect, beforeEach } from 'vitest';
import usePosStore from '../usePosStore';

describe('Zustand POS Store (usePosStore)', () => {
    beforeEach(() => {
        usePosStore.getState().clearCart();
    });

    it('cart awalnya harus kosong dan perhitungan bernilai 0', () => {
        const state = usePosStore.getState();
        expect(state.cart).toEqual([]);
        expect(state.subTotal).toBe(0);
        expect(state.grandTotal).toBe(0);
    });

    it('bisa menambahkan produk ke cart dan kalkulasi otomatis berjalan', () => {
        const mockProduct = {
            id: 1,
            kode: 'PROD01',
            nama: 'Oreo Susu',
            harga_jual: 10000
        };

        usePosStore.getState().addToCart(mockProduct);

        const state = usePosStore.getState();
        expect(state.cart.length).toBe(1);
        expect(state.cart[0].jumlah).toBe(1);
        expect(state.cart[0].total).toBe(10000);
        expect(state.subTotal).toBe(10000);
        expect(state.grandTotal).toBe(10000);
    });

    it('kalkulasi grandTotal harus memotong diskon global', () => {
        // Simulasi add barang 20000
        const mockProduct = {
            id: 2,
            kode: 'PROD02',
            nama: 'Kopi',
            harga_jual: 20000
        };
        usePosStore.getState().addToCart(mockProduct);

        // Simulasi kasih diskon global 5000
        usePosStore.getState().setModifiers(5000, 0, 0);

        const state = usePosStore.getState();
        expect(state.subTotal).toBe(20000);
        expect(state.diskonGlobal).toBe(5000);
        // grandTotal = 20000 - 5000 = 15000
        expect(state.grandTotal).toBe(15000);
    });
});
