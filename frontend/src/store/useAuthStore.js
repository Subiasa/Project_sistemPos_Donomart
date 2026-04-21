import { create } from 'zustand';
import api from '../api/axios';

const useAuthStore = create((set) => ({
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,

    login: async (username, password) => {
        set({ loading: true });
        try {
            const response = await api.post('/login', { username, password });
            const { access_token, user } = response.data;

            localStorage.setItem('token', access_token);
            set({ user, token: access_token, isAuthenticated: true, loading: false });
            return true;
        } catch (error) {
            set({ loading: false });
            throw error;
        }
    },

    logout: async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            localStorage.removeItem('token');
            set({ user: null, token: null, isAuthenticated: false });
        }
    },

    fetchMe: async () => {
        try {
            const response = await api.get('/user');
            set({ user: response.data, isAuthenticated: true });
        } catch (error) {
            localStorage.removeItem('token');
            set({ user: null, token: null, isAuthenticated: false });
        }
    }
}));

export default useAuthStore;
