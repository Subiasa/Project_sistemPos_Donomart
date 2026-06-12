import api from '../api/axios';

/**
 * Mengambil data statistik untuk dashboard
 */
export const getDashboardStats = async () => {
    const response = await api.get('/dashboard');
    return response.data.data;
};
