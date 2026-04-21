import { create } from 'zustand';
import api from '../api/axios';

const useCartStore = create((set, get) => ({
    cart: [],
    customer: null,
    discountGlobal: 0,
    taxPercent: 0,
    donation: 0,
    paymentMethod: 'tunai',

    setPaymentMethod: (method) => set({ paymentMethod: method }),
    setCustomer: (customer) => set({ customer }),
    setDiscount: (discount) => set({ discountGlobal: discount }),
    setTax: (tax) => set({ taxPercent: tax }),
    setDonation: (donation) => set({ donation }),

    addToCart: (product, quantity = 1) => {
        const { cart } = get();
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            set({
                cart: cart.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                )
            });
        } else {
            set({ cart: [...cart, { ...product, quantity }] });
        }
    },

    removeFromCart: (productId) => {
        const { cart } = get();
        set({ cart: cart.filter(item => item.id !== productId) });
    },

    updateQuantity: (productId, quantity) => {
        const { cart } = get();
        if (quantity < 1) return;
        set({
            cart: cart.map(item =>
                item.id === productId ? { ...item, quantity } : item
            )
        });
    },

    clearCart: () => set({ cart: [], customer: null, discountGlobal: 0, taxPercent: 0, donation: 0 }),

    scanProduct: async (kode) => {
        try {
            const response = await api.get(`/products/scan/${kode}`);
            const product = response.data;
            get().addToCart(product);
            return true;
        } catch (error) {
            throw error;
        }
    },

    getSubtotal: () => {
        return get().cart.reduce((acc, item) => acc + (item.harga_jual * item.quantity), 0);
    },

    getGrandTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().discountGlobal;
        const tax = (subtotal - discount) * (get().taxPercent / 100);
        return (subtotal - discount) + tax + get().donation;
    }
}));

export default useCartStore;
