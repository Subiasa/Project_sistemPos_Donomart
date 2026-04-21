import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

// Interceptor untuk menambahkan Token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor untuk menangani error 401 (Unauthorized)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

/**
 * Fungsi untuk memproses transaksi Kasir ke Backend
 * Mengirimkan mapping state keranjang ke endpoint POST /transactions
 */
export const submitTransaction = async (payload) => {
    try {
        const response = await api.post('/transactions', payload);
        return response.data; // Biasanya berisi { success, message, data }
    } catch (error) {
        if (error.response) {
            // Jika server backend Laravel menolak (Validation Exception / Stock Exception dsb)
            console.error('API Error Response:', error.response.data);
            throw new Error(error.response.data.message || 'Terjadi kesalahan sistem, transaksi dibatalkan.');
        } else if (error.request) {
            // Server down atau tidak dapat diakses
            console.error('API Network Error:', error.request);
            throw new Error('Server Backend tidak merespon. Pastikan server lokal menyala.');
        } else {
            // Kesalahan logika di request
            console.error('Client Log Error:', error.message);
            throw new Error('Terjadi kesalahan saat memproses data keranjang.');
        }
    }
};

export default api;
