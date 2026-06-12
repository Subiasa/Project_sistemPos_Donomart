import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Helper function to calculate cart totals and handle reactivity internally
const calculateTotals = (cart, diskonGlobal, pajakPersen, sumbangan) => {
    let subTotal = 0;
    
    // Recalculate item totals
    const updatedCart = cart.map((item) => {
        const netto = item.harga_satuan - item.diskon_item;
        const total = netto * item.jumlah;
        subTotal += total;
        return { ...item, netto, total };
    });

    const taxAmount = (subTotal - diskonGlobal) * (pajakPersen / 100);
    const grandTotal = (subTotal - diskonGlobal) + taxAmount + Number(sumbangan);

    return {
        cart: updatedCart,
        subTotal,
        grandTotal,
    };
};

const usePosStore = create(persist((set, get) => ({
    // Explicit State Structure Requirements
    heldTransactions: [], // Array to store pending/held transactions
    cart: [],
    subTotal: 0,
    diskonGlobal: 0,
    pajakPersen: 0,
    sumbangan: 0,
    grandTotal: 0,
    bayar: 0,
    kembali: 0,
    tipePembayaran: 'tunai',
    customerId: null,

    // 1. addToCart
    addToCart: (product, isGrosir = false) => set((state) => {
        const rawProductId = product.id || product.product_id;
        const productId = isGrosir ? `${rawProductId}_grosir` : rawProductId;
        
        const existingItemIndex = state.cart.findIndex(item => item.product_id === productId);
        
        let newCart = [...state.cart];
        
        if (existingItemIndex >= 0) {
            newCart[existingItemIndex].jumlah += 1;
        } else {
            const harga = isGrosir ? (product.harga_jual_grosir || product.harga_jual || product.harga || 0) : (product.harga_jual || product.harga || product.harga_satuan || 0);
            const satuan = isGrosir ? (product.satuan_grosir || 'Dus') : (product.satuan || 'Pcs');
            
            newCart.push({
                product_id: productId,
                kode: product.kode,
                nama: product.nama,
                satuan: satuan,
                harga_satuan: harga,
                jumlah: 1,
                diskon_item: 0,
                netto: harga,
                total: harga,
                is_grosir: isGrosir
            });
        }

        const totals = calculateTotals(newCart, state.diskonGlobal, state.pajakPersen, state.sumbangan);
        const kembali = Math.max(0, state.bayar - totals.grandTotal);

        return { ...totals, kembali };
    }),

    // 2. updateItemQuantity
    updateItemQuantity: (productId, newQty) => set((state) => {
        const qty = Number(newQty);
        if (qty < 1) return state;

        const newCart = state.cart.map(item => 
            item.product_id === productId ? { ...item, jumlah: qty } : item
        );

        const totals = calculateTotals(newCart, state.diskonGlobal, state.pajakPersen, state.sumbangan);
        const kembali = Math.max(0, state.bayar - totals.grandTotal);

        return { ...totals, kembali };
    }),

    // 3. updateItemDiscount
    updateItemDiscount: (productId, discountAmount) => set((state) => {
        const newCart = state.cart.map(item => 
            item.product_id === productId ? { ...item, diskon_item: Number(discountAmount) } : item
        );

        const totals = calculateTotals(newCart, state.diskonGlobal, state.pajakPersen, state.sumbangan);
        const kembali = Math.max(0, state.bayar - totals.grandTotal);

        return { ...totals, kembali };
    }),

    // 4. removeItem
    removeItem: (productId) => set((state) => {
        const newCart = state.cart.filter(item => item.product_id !== productId);
        
        const totals = calculateTotals(newCart, state.diskonGlobal, state.pajakPersen, state.sumbangan);
        const kembali = Math.max(0, state.bayar - totals.grandTotal);

        return { ...totals, kembali };
    }),

    // 5. setModifiers
    setModifiers: (diskonGlobal, pajakPersen, sumbangan) => set((state) => {
        const dGlobal = Number(diskonGlobal) || 0;
        const pPersen = Number(pajakPersen) || 0;
        const sumb = Number(sumbangan) || 0;

        const totals = calculateTotals(state.cart, dGlobal, pPersen, sumb);
        const kembali = Math.max(0, state.bayar - totals.grandTotal);

        return { 
            diskonGlobal: dGlobal, 
            pajakPersen: pPersen, 
            sumbangan: sumb, 
            ...totals, 
            kembali 
        };
    }),

    // 6. setBayar
    setBayar: (amount) => set((state) => {
        const bayarAmount = Number(amount) || 0;
        const kembali = Math.max(0, bayarAmount - state.grandTotal);
        return { bayar: bayarAmount, kembali };
    }),

    // 7. setPaymentDetails
    setPaymentDetails: (type, custId) => set({
        tipePembayaran: type,
        customerId: custId
    }),

    // 8. clearCart
    clearCart: () => set({
        cart: [],
        subTotal: 0,
        diskonGlobal: 0,
        pajakPersen: 0,
        sumbangan: 0,
        grandTotal: 0,
        bayar: 0,
        kembali: 0,
        tipePembayaran: 'tunai',
        customerId: null,
    }),

    // 9. holdTransaction (Pending)
    holdTransaction: (note) => set((state) => {
        if (state.cart.length === 0) return state;
        
        const newHeld = {
            id: Date.now(),
            note: note || `Pending ${new Date().toLocaleTimeString()}`,
            timestamp: new Date().toISOString(),
            cart: [...state.cart],
            subTotal: state.subTotal,
            diskonGlobal: state.diskonGlobal,
            pajakPersen: state.pajakPersen,
            sumbangan: state.sumbangan,
            grandTotal: state.grandTotal,
            customerId: state.customerId,
            tipePembayaran: state.tipePembayaran
        };

        return {
            heldTransactions: [...state.heldTransactions, newHeld],
            // Clear current cart after holding
            cart: [],
            subTotal: 0, diskonGlobal: 0, pajakPersen: 0, sumbangan: 0,
            grandTotal: 0, bayar: 0, kembali: 0,
            tipePembayaran: 'tunai', customerId: null
        };
    }),

    // 10. resumeTransaction
    resumeTransaction: (id) => set((state) => {
        const index = state.heldTransactions.findIndex(t => t.id === id);
        if (index === -1) return state;

        const held = state.heldTransactions[index];
        const newHeldArray = state.heldTransactions.filter(t => t.id !== id);

        return {
            heldTransactions: newHeldArray,
            cart: held.cart,
            subTotal: held.subTotal,
            diskonGlobal: held.diskonGlobal,
            pajakPersen: held.pajakPersen,
            sumbangan: held.sumbangan,
            grandTotal: held.grandTotal,
            customerId: held.customerId,
            tipePembayaran: held.tipePembayaran,
            bayar: 0,
            kembali: 0
        };
    }),

    // 11. removeHeldTransaction
    removeHeldTransaction: (id) => set((state) => ({
        heldTransactions: state.heldTransactions.filter(t => t.id !== id)
    })),

}), {
    name: 'pos-storage',
    partialize: (state) => ({ heldTransactions: state.heldTransactions }), // Only persist heldTransactions, not active cart
}));

export default usePosStore;
