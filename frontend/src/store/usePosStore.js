import { create } from 'zustand';

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

const usePosStore = create((set, get) => ({
    // Explicit State Structure Requirements
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
    addToCart: (product) => set((state) => {
        const productId = product.id || product.product_id;
        const existingItemIndex = state.cart.findIndex(item => item.product_id === productId);
        
        let newCart = [...state.cart];
        
        if (existingItemIndex >= 0) {
            newCart[existingItemIndex].jumlah += 1;
        } else {
            const harga = product.harga_jual || product.harga || product.harga_satuan || 0;
            newCart.push({
                product_id: productId,
                kode: product.kode,
                nama: product.nama,
                satuan: product.satuan || 'Pcs',
                harga_satuan: harga,
                jumlah: 1,
                diskon_item: 0,
                netto: harga,
                total: harga
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
}));

export default usePosStore;
