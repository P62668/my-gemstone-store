import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import ExpertImageManager from '../../components/ui/ExpertImageManager';
import { Truck, DollarSign, Package, AlertTriangle } from 'lucide-react';

interface Category {
  id: number;
  name: string;
}

interface Gemstone {
  id: number;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  categoryId?: number;
  images: string[];
  weight?: number;
  dimensions?: string;
  clarity?: string;
  color?: string;
  cut?: string;
  origin?: string;
  certificate?: string;
  stockCount: number;
  stockQuantity: number;
  lowStockThreshold: number;
  featured: boolean;
  active: boolean;
  cashOnDelivery: boolean;
  category?: {
    id: number;
    name: string;
  };
}

const emptyGemstone: Omit<Gemstone, 'id'> = {
  name: '',
  description: '',
  price: 0,
  images: [],
  stockCount: 0,
  stockQuantity: 0,
  lowStockThreshold: 5,
  featured: false,
  active: true,
  cashOnDelivery: false,
};

const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Gemstone[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState<Omit<Gemstone, 'id'>>(emptyGemstone);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | ''>('');
  const [stockFilter, setStockFilter] = useState<'all' | 'inStock' | 'lowStock' | 'outOfStock'>('all');
  const [showForm, setShowForm] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchStats();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/gemstones', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data.map((g: any) => ({ 
        ...g, 
        images: typeof g.images === 'string' ? JSON.parse(g.images) : (Array.isArray(g.images) ? g.images : [])
      })));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      setCategories(data);
    } catch (err: any) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchStats = async () => {
    try {
      // Get inventory statistics
      const res = await fetch('/api/admin/inventory');
      if (!res.ok) throw new Error('Failed to fetch inventory stats');
      const data = await res.json();
      setStats({
        totalProducts: data.stats.totalProducts,
        totalStock: data.stats.totalStock,
        lowStockItems: data.stats.lowStockCount,
        outOfStockItems: data.stats.outOfStockCount,
      });
    } catch (err: any) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setForm({ 
      ...form, 
      [name]: type === 'checkbox' ? checked : 
               type === 'number' ? (value === '' ? '' : Number(value)) : value 
    });
  };

  const handleImagesChange = (images: string[]) => {
    setForm((f) => ({
      ...f,
      images: images,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    setSuccess('');
    try {
      const payload = { 
        ...form, 
        images: Array.isArray(form.images) ? form.images : [],
        categoryId: form.categoryId || undefined,
        salePrice: form.salePrice || undefined,
        weight: form.weight || undefined,
        dimensions: form.dimensions || undefined,
        clarity: form.clarity || undefined,
        color: form.color || undefined,
        cut: form.cut || undefined,
        origin: form.origin || undefined,
        certificate: form.certificate || undefined,
      };
      
      if (editingId) {
        // Update existing product
        const res = await fetch(`/api/admin/gemstones/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to update product');
        const updatedProduct = await res.json();
        setProducts((prev) => prev.map((product) => (product.id === editingId ? {
          ...updatedProduct,
          images: typeof updatedProduct.images === 'string' ? JSON.parse(updatedProduct.images) : (Array.isArray(updatedProduct.images) ? updatedProduct.images : [])
        } : product)));
        setSuccess('Product updated successfully!');
      } else {
        // Add new product
        const res = await fetch('/api/admin/gemstones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to create product');
        const newProduct = await res.json();
        setProducts((prev) => [...prev, {
          ...newProduct,
          images: typeof newProduct.images === 'string' ? JSON.parse(newProduct.images) : (Array.isArray(newProduct.images) ? newProduct.images : [])
        }]);
        setSuccess('Product added successfully!');
      }

      setForm(emptyGemstone);
      setEditingId(null);
      setShowForm(false);
      fetchStats(); // Refresh stats
    } catch (err: any) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (product: Gemstone) => {
    setForm({
      ...product,
      images: Array.isArray(product.images) ? product.images : [],
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
    setFormLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/admin/gemstones/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete product');
      }
      setProducts((prev) => prev.filter((product) => product.id !== id));
      setSuccess('Product deleted successfully!');
      fetchStats(); // Refresh stats
    } catch (err: any) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedProducts.length === 0) {
      toast.error('Please select products and an action');
      return;
    }

    setBulkLoading(true);
    try {
      if (bulkAction === 'delete') {
        if (!window.confirm(`Are you sure you want to delete ${selectedProducts.length} products? This action cannot be undone.`)) {
          setBulkLoading(false);
          return;
        }
        
        const results = await Promise.all(
          selectedProducts.map(id => 
            fetch(`/api/admin/gemstones/${id}`, {
              method: 'DELETE',
              credentials: 'include',
            })
          )
        );

        const failedDeletes = results.filter(res => !res.ok).length;
        if (failedDeletes > 0) {
          toast.error(`${failedDeletes} products could not be deleted`);
        } else {
          setSuccess(`${selectedProducts.length} products deleted successfully!`);
        }
        
        setProducts(prev => prev.filter(product => !selectedProducts.includes(product.id)));
        setSelectedProducts([]);
      } else if (bulkAction.startsWith('stock_')) {
        const action = bulkAction.split('_')[1]; // add, subtract, set
        const quantity = parseInt(bulkAction.split('_')[2]) || 1;
        
        const res = await fetch('/api/admin/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action,
            gemstoneIds: selectedProducts,
            quantity,
          }),
        });

        if (res.ok) {
          setSuccess(`Stock updated for ${selectedProducts.length} products!`);
          fetchProducts(); // Refresh the product list
        } else {
          throw new Error('Failed to update stock');
        }
      }
      
      fetchStats(); // Refresh stats
    } catch (err: any) {
      setError(err.message);
      toast.error('Bulk action failed');
    } finally {
      setBulkLoading(false);
      setBulkAction('');
    }
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map((p) => p.id));
    }
  };

  const handleSelectProduct = (id: number) => {
    setSelectedProducts((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  // Filter products based on search, category, and stock filters
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === '' || product.categoryId === categoryFilter;
    
    const matchesStock = stockFilter === 'all' ||
                         (stockFilter === 'inStock' && product.stockCount > product.lowStockThreshold) ||
                         (stockFilter === 'lowStock' && product.stockCount <= product.lowStockThreshold && product.stockCount > 0) ||
                         (stockFilter === 'outOfStock' && product.stockCount === 0);
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  if (loading) {
    return (
      <AdminLayout title="Product Management">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Product Management">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="rounded-xl p-4 mb-6 font-semibold text-center shadow border bg-red-100 border-red-300 text-red-800">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-xl p-4 mb-6 font-semibold text-center shadow border bg-green-100 border-green-300 text-green-800">
            {success}
          </div>
        )}
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-amber-900 mb-2">Product Management</h1>
              <p className="text-gray-600">Manage your gemstone products and inventory</p>
            </div>
            <button
              onClick={() => {
                setForm(emptyGemstone);
                setEditingId(null);
                setShowForm(!showForm);
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-6 rounded-xl transition duration-300"
            >
              {showForm ? 'Cancel' : 'Add New Product'}
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              className="bg-white rounded-xl shadow-lg p-6 border border-amber-200"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center">
                <Package className="h-8 w-8 text-amber-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-amber-600">{stats.totalProducts}</div>
                  <div className="text-sm text-gray-600">Total Products</div>
                </div>
              </div>
            </motion.div>
            <motion.div
              className="bg-white rounded-xl shadow-lg p-6 border border-amber-200"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center">
                <Truck className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-green-600">{stats.totalStock}</div>
                  <div className="text-sm text-gray-600">Total Stock</div>
                </div>
              </div>
            </motion.div>
            <motion.div
              className="bg-white rounded-xl shadow-lg p-6 border border-amber-200"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-yellow-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-yellow-600">{stats.lowStockItems}</div>
                  <div className="text-sm text-gray-600">Low Stock Items</div>
                </div>
              </div>
            </motion.div>
            <motion.div
              className="bg-white rounded-xl shadow-lg p-6 border border-amber-200"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-red-600">{stats.outOfStockItems}</div>
                  <div className="text-sm text-gray-600">Out of Stock Items</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Add/Edit Product Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8 overflow-hidden"
            >
              <h2 className="text-2xl font-bold text-amber-900 mb-6">
                {editingId ? 'Edit Product' : 'Add New Product'}
              </h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="name">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="description">
                      Description *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={form.description}
                      onChange={handleFormChange}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2" htmlFor="price">
                        Price (₹) *
                      </label>
                      <input
                        type="number"
                        id="price"
                        name="price"
                        value={form.price || ''}
                        onChange={handleFormChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2" htmlFor="salePrice">
                        Sale Price (₹)
                      </label>
                      <input
                        type="number"
                        id="salePrice"
                        name="salePrice"
                        value={form.salePrice || ''}
                        onChange={handleFormChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2" htmlFor="categoryId">
                        Category *
                      </label>
                      <select
                        id="categoryId"
                        name="categoryId"
                        value={form.categoryId || ''}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2" htmlFor="certificate">
                        Certificate
                      </label>
                      <input
                        type="text"
                        id="certificate"
                        name="certificate"
                        value={form.certificate || ''}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2" htmlFor="weight">
                        Weight (carats)
                      </label>
                      <input
                        type="number"
                        id="weight"
                        name="weight"
                        value={form.weight || ''}
                        onChange={handleFormChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2" htmlFor="dimensions">
                        Dimensions
                      </label>
                      <input
                        type="text"
                        id="dimensions"
                        name="dimensions"
                        value={form.dimensions || ''}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2" htmlFor="clarity">
                        Clarity
                      </label>
                      <input
                        type="text"
                        id="clarity"
                        name="clarity"
                        value={form.clarity || ''}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2" htmlFor="color">
                        Color
                      </label>
                      <input
                        type="text"
                        id="color"
                        name="color"
                        value={form.color || ''}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2" htmlFor="cut">
                        Cut
                      </label>
                      <input
                        type="text"
                        id="cut"
                        name="cut"
                        value={form.cut || ''}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="origin">
                      Origin
                    </label>
                    <input
                      type="text"
                      id="origin"
                      name="origin"
                      value={form.origin || ''}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2">
                      Product Images
                    </label>
                    <ExpertImageManager
                      images={form.images}
                      onImagesChange={handleImagesChange}
                      maxImages={5}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2" htmlFor="stockCount">
                        Stock Count *
                      </label>
                      <input
                        type="number"
                        id="stockCount"
                        name="stockCount"
                        value={form.stockCount || ''}
                        onChange={handleFormChange}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2" htmlFor="lowStockThreshold">
                        Low Stock Threshold
                      </label>
                      <input
                        type="number"
                        id="lowStockThreshold"
                        name="lowStockThreshold"
                        value={form.lowStockThreshold || ''}
                        onChange={handleFormChange}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
                      Product Status
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="active"
                          checked={form.active}
                          onChange={handleFormChange}
                          className="rounded text-amber-600 focus:ring-amber-500"
                        />
                        <span className="ml-2 text-gray-700">Active</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="featured"
                          checked={form.featured}
                          onChange={handleFormChange}
                          className="rounded text-amber-600 focus:ring-amber-500"
                        />
                        <span className="ml-2 text-gray-700">Featured</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="cashOnDelivery"
                          checked={form.cashOnDelivery}
                          onChange={handleFormChange}
                          className="rounded text-amber-600 focus:ring-amber-500"
                        />
                        <span className="ml-2 text-gray-700">Cash on Delivery Available</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setForm(emptyGemstone);
                        setEditingId(null);
                      }}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                      disabled={formLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition flex items-center"
                      disabled={formLoading}
                    >
                      {formLoading && (
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      {editingId ? 'Update Product' : 'Add Product'}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Search</label>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Stock Status</label>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="all">All Stock</option>
                <option value="inStock">In Stock</option>
                <option value="lowStock">Low Stock</option>
                <option value="outOfStock">Out of Stock</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Bulk Actions</label>
              <div className="flex gap-2">
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="">Select Action</option>
                  <option value="delete">Delete Selected</option>
                  <option value="stock_add_1">Add 1 to Stock</option>
                  <option value="stock_add_5">Add 5 to Stock</option>
                  <option value="stock_add_10">Add 10 to Stock</option>
                  <option value="stock_subtract_1">Subtract 1 from Stock</option>
                  <option value="stock_subtract_5">Subtract 5 from Stock</option>
                  <option value="stock_set_0">Set Stock to 0</option>
                </select>
                <button
                  onClick={handleBulkAction}
                  disabled={bulkLoading || selectedProducts.length === 0}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {bulkLoading && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length > 0 && selectedProducts.length === filteredProducts.length}
                      onChange={handleSelectAll}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No products found
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => handleSelectProduct(product.id)}
                          className="rounded text-amber-600 focus:ring-amber-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 relative">
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="h-10 w-10 rounded-md object-cover"
                              />
                            ) : (
                              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500 line-clamp-1">{product.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.category?.name || 'Uncategorized'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{product.price.toLocaleString('en-IN')}
                        {product.salePrice && product.salePrice < product.price && (
                          <div className="text-xs text-red-600 line-through">
                            ₹{product.salePrice.toLocaleString('en-IN')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${
                          product.stockCount === 0 
                            ? 'text-red-600' 
                            : product.stockCount <= product.lowStockThreshold 
                              ? 'text-yellow-600' 
                              : 'text-green-600'
                        }`}>
                          {product.stockCount}
                        </div>
                        {product.stockCount <= product.lowStockThreshold && product.stockCount > 0 && (
                          <div className="text-xs text-yellow-600">Low stock</div>
                        )}
                        {product.stockCount === 0 && (
                          <div className="text-xs text-red-600">Out of stock</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            product.active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.active ? 'Active' : 'Inactive'}
                          </span>
                          {product.featured && (
                            <span className="mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              Featured
                            </span>
                          )}
                          {product.cashOnDelivery && (
                            <span className="mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                              COD
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-amber-600 hover:text-amber-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-900"
                          disabled={formLoading}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProductsPage;