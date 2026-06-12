import React, { useState, useEffect } from 'react';
import { getProducts, getProductOptions, createProduct, updateProduct, deleteProduct, importProducts } from '../services/productService';

import ProductHeader from '../components/product/ProductHeader';
import ProductTable from '../components/product/ProductTable';
import ProductAddModal from '../components/product/ProductAddModal';
import ProductImportModal from '../components/product/ProductImportModal';

const ProductPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        kode: '', nama: '', deskripsi: '', category_id: '',
        jumlah: 0, satuan: 'Pcs', harga_beli: 0, harga_jual: 0,
        barcode_grosir: '', satuan_grosir: '', konversi_grosir: 1, harga_jual_grosir: 0,
        supplier_id: '', lokasi: '', diskon_persen: 0, stok_min: 0, expired_date: ''
    });

    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await api.get('/products');
            setProducts(response.data.data || response.data);
        } catch (error) {
            console.error('Gagal mengambil produk', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOptions = async () => {
        try {
            const [catRes, supRes] = await Promise.all([
                api.get('/categories').catch(() => ({ data: { data: [] } })),
                api.get('/suppliers').catch(() => ({ data: { data: [] } }))
            ]);
            setCategories(catRes.data.data || catRes.data || []);
            setSuppliers(supRes.data.data || supRes.data || []);
        } catch (error) {
            console.error('Gagal memuat kategori/supplier');
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchOptions();
    }, []);

    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const handleEdit = (product) => {
        setFormData({
            kode: product.kode || '', 
            nama: product.nama || '', 
            deskripsi: product.deskripsi || '', 
            category_id: product.category_id || '',
            jumlah: product.jumlah || 0, 
            satuan: product.satuan || 'Pcs', 
            harga_beli: product.harga_beli || 0, 
            harga_jual: product.harga_jual || 0,
            barcode_grosir: product.barcode_grosir || '',
            satuan_grosir: product.satuan_grosir || '',
            konversi_grosir: product.konversi_grosir || 1,
            harga_jual_grosir: product.harga_jual_grosir || 0,
            supplier_id: product.supplier_id || '', 
            lokasi: product.lokasi || '', 
            diskon_persen: product.diskon_persen || 0, 
            stok_min: product.stok_min || 0, 
            expired_date: product.expired_date ? product.expired_date.substring(0, 10) : ''
        });
        setEditId(product.id);
        setIsEditing(true);
        setIsAddModalOpen(true);
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await updateProduct(editId, formData);
            } else {
                await createProduct(formData);
            }
            fetchProducts();
            setIsAddModalOpen(false);
            setIsEditing(false);
            setEditId(null);
            setFormData({
                kode: '', nama: '', deskripsi: '', category_id: '',
                jumlah: 0, satuan: 'Pcs', harga_beli: 0, harga_jual: 0,
                barcode_grosir: '', satuan_grosir: '', konversi_grosir: 1, harga_jual_grosir: 0,
                supplier_id: '', lokasi: '', diskon_persen: 0, stok_min: 0, expired_date: ''
            });
        } catch (error) {
            alert(`Gagal ${isEditing ? 'mengubah' : 'menambah'} barang: ` + (error.response?.data?.message || 'Validasi Error'));
        }
    };

    const handleImportSubmit = async (e) => {
        e.preventDefault();
        if (!file) return;

        const formDataFile = new FormData();
        formDataFile.append('file', file);
        setUploading(true);
        try {
            await api.post('/products/import', formDataFile, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchProducts();
            setIsImportModalOpen(false);
            setFile(null);
            alert('Import berhasil!');
        } catch (error) {
            alert('Gagal mengimpor file: ' + (error.response?.data?.message || 'Error'));
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if(window.confirm('Yakin ingin menghapus produk ini?')) {
            try {
                await api.delete(`/products/${id}`);
                fetchProducts();
            } catch (error) {
                alert('Gagal menghapus');
            }
        }
    }

    const filtered = products.filter(p => p.nama.toLowerCase().includes(search.toLowerCase()) || p.kode.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-6">
            <ProductHeader 
                setIsImportModalOpen={setIsImportModalOpen}
                setIsAddModalOpen={setIsAddModalOpen}
            />

            <ProductTable 
                search={search}
                setSearch={setSearch}
                loading={loading}
                filtered={filtered}
                handleDelete={handleDelete}
                handleEdit={handleEdit}
            />

            <ProductAddModal 
                isAddModalOpen={isAddModalOpen}
                setIsAddModalOpen={(val) => {
                    setIsAddModalOpen(val);
                    if(!val) {
                        setIsEditing(false);
                        setEditId(null);
                        setFormData({
                            kode: '', nama: '', deskripsi: '', category_id: '',
                            jumlah: 0, satuan: 'Pcs', harga_beli: 0, harga_jual: 0,
                            barcode_grosir: '', satuan_grosir: '', konversi_grosir: 1, harga_jual_grosir: 0,
                            supplier_id: '', lokasi: '', diskon_persen: 0, stok_min: 0, expired_date: ''
                        });
                    }
                }}
                handleAddSubmit={handleAddSubmit}
                formData={formData}
                setFormData={setFormData}
                categories={categories}
                setCategories={setCategories}
                suppliers={suppliers}
                api={api}
                isEditing={isEditing}
            />

            <ProductImportModal 
                isImportModalOpen={isImportModalOpen}
                setIsImportModalOpen={setIsImportModalOpen}
                handleImportSubmit={handleImportSubmit}
                setFile={setFile}
                uploading={uploading}
                file={file}
            />
        </div>
    );
};

export default ProductPage;
age;
