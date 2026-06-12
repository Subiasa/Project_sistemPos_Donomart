import api from '../api/axios';

export const getProducts = async () => {
    const response = await api.get('/products');
    return response.data.data || response.data;
};

export const getProductOptions = async () => {
    const [catRes, supRes] = await Promise.all([
        api.get('/categories').catch(() => ({ data: { data: [] } })),
        api.get('/suppliers').catch(() => ({ data: { data: [] } }))
    ]);
    return {
        categories: catRes.data.data || catRes.data || [],
        suppliers: supRes.data.data || supRes.data || []
    };
};

export const createProduct = async (data) => {
    return await api.post('/products', data);
};

export const updateProduct = async (id, data) => {
    return await api.put(`/products/${id}`, data);
};

export const deleteProduct = async (id) => {
    return await api.delete(`/products/${id}`);
};

export const importProducts = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return await api.post('/products/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};
