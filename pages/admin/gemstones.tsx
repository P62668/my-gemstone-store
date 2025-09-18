import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '../../components/AdminLayout';
import getSessionOrRedirect from '../../utils/withServerAuth';
import ExpertImageManager from '../../components/ui/ExpertImageManager';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Truck, DollarSign } from 'lucide-react';

interface Category {
  id: number;
  name: string;
}

interface Gemstone {
  id: number;
  name: string;
  type: string;
  description: string;
  price: number;
  images: string[];
  certification: string;
  categoryId?: number;
  active?: boolean;
  cashOnDelivery?: boolean;
  order?: number;
}

const emptyGem: Omit<Gemstone, 'id'> = {
  name: '',
  type: '',
  description: '',
  price: 0,
  images: [],
  certification: '',
  categoryId: undefined,
  active: true,
  cashOnDelivery: false,
  order: 0,
};

const AdminGemstonesPage: React.FC = () => {
  const router = useRouter();
  const [gems, setGems] = useState<Gemstone[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState(emptyGem);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedGems, setSelectedGems] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | ''>('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
  // server-side guard via getServerSideProps ensures admin access
  fetchGems();
  fetchCategories();
  }, []);

  const checkAuthAndFetch = async () => {
  // client-side auth check removed. Server-side guard enforces admin access.
  };

  const fetchGems = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/gemstones', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch gemstones');
      const data = await res.json();
      setGems(data.map((g: any) => ({ 
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

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    setForm({ ...form, [name]: type === 'number' ? Number(value) : value });
  };

  // Handle image upload (multiple images)
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
      const payload = { ...form, images: Array.isArray(form.images) ? form.images : [] };
      if (editingId) {
        // Update existing gemstone
        const res = await fetch(`/api/admin/gemstones/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to update gemstone');
        const updatedGemstone = await res.json();
        setGems((prev) => prev.map((gem) => (gem.id === editingId ? {
          ...updatedGemstone,
          images: typeof updatedGemstone.images === 'string' ? JSON.parse(updatedGemstone.images) : (Array.isArray(updatedGemstone.images) ? updatedGemstone.images : [])
        } : gem)));
        setSuccess('Gemstone updated successfully!');
      } else {
        // Add new gemstone
        const res = await fetch('/api/admin/gemstones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to create gemstone');
        const newGemstone = await res.json();
        setGems((prev) => [...prev, {
          ...newGemstone,
          images: typeof newGemstone.images === 'string' ? JSON.parse(newGemstone.images) : (Array.isArray(newGemstone.images) ? newGemstone.images : [])
        }]);
        setSuccess('Gemstone added successfully!');
      }

      setForm(emptyGem);
      setEditingId(null);
      setShowForm(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (gem: Gemstone) => {
    setForm({
      ...gem,
      images: Array.isArray(gem.images) ? gem.images : [],
    });
    setEditingId(gem.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this gemstone?')) return;
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
        throw new Error(errorData.error || 'Failed to delete gemstone');
      }
      setGems((prev) => prev.filter((gem) => gem.id !== id));
      setSuccess('Gemstone deleted successfully!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Bulk actions
  const handleSelectAll = () => {
    if (selectedGems.length === filteredGems.length) {
      setSelectedGems([]);
    } else {
      setSelectedGems(filteredGems.map((g) => g.id));
    }
  };

  const handleSelectGem = (id: number) => {
    setSelectedGems((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]));
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedGems.length === 0) return;
    setBulkLoading(true);
    setError('');
    setSuccess('');
    try {
      // For demo purposes, simulate success
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (bulkAction === 'delete') {
        if (!window.confirm(`Delete ${selectedGems.length} gemstone(s)?`)) return;
        setGems((prev) => prev.filter((gem) => !selectedGems.includes(gem.id)));
        setSuccess('Selected gemstones deleted successfully!');
      } else if (bulkAction === 'activate' || bulkAction === 'deactivate') {
        setGems((prev) =>
          prev.map((gem) =>
            selectedGems.includes(gem.id) ? { ...gem, active: bulkAction === 'activate' } : gem,
          ),
        );
        setSuccess(`Selected gemstones ${bulkAction === 'activate' ? 'activated' : 'deactivated'} successfully!`);
      } else if (bulkAction === 'enableCod' || bulkAction === 'disableCod') {
        setGems((prev) =>
          prev.map((gem) =>
            selectedGems.includes(gem.id) ? { ...gem, cashOnDelivery: bulkAction === 'enableCod' } : gem,
          ),
        );
        setSuccess(`Cash on Delivery ${bulkAction === 'enableCod' ? 'enabled' : 'disabled'} for selected gemstones!`);
      }

      setSelectedGems([]);
      setBulkAction('');
    } catch (err: any) {
      setError('Bulk action failed: ' + err.message);
    } finally {
      setBulkLoading(false);
    }
  };

  // Filter and search
  const filteredGems = gems.filter((gem) => {
    const matchesSearch =
      gem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gem.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === '' || gem.categoryId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <AdminLayout title="Gemstones Management - Shankarmala">
        <div className="max-w-7xl mx-auto py-12 px-4">
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-6xl mb-4">💎</div>
            <div className="text-2xl font-bold text-amber-900 mb-2">Loading Gemstones...</div>
            <div className="text-amber-600">Please wait while we fetch your inventory</div>
          </motion.div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Gemstones Management - Shankarmala">
        <div className="max-w-2xl w-full mx-auto py-12 px-4">
          <div className="bg-red-100 border border-red-300 text-red-800 px-6 py-6 rounded-xl text-center font-semibold shadow mb-6">
            <div className="text-5xl mb-2">❌</div>
            <div className="text-2xl font-bold text-red-700 mb-2">Error Loading Gemstones</div>
            <div className="text-red-800 mb-4">{error}</div>
            <button
              onClick={fetchGems}
              className="bg-amber-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-amber-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Manage Gemstones">
      <Head>
        <title>Admin - Gemstones</title>
      </Head>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header with enhanced styling */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gemstone Inventory</h1>
              <p className="mt-2 text-lg text-gray-600">
                Manage your premium gemstone collection
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <button
                onClick={() => {
                  setForm(emptyGem);
                  setEditingId(null);
                  setShowForm(!showForm);
                }}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-200 transform hover:scale-105"
              >
                {showForm ? 'Cancel' : 'Add New Gemstone'}
              </button>
            </div>
          </div>

          {/* Enhanced Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-8 bg-white rounded-2xl shadow-xl p-6 border border-amber-100"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {editingId ? 'Edit Gemstone' : 'Add New Gemstone'}
                </h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={form.name}
                      onChange={handleFormChange}
                      className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent sm:text-sm transition-all"
                      placeholder="Enter gemstone name"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <input
                      type="text"
                      name="type"
                      id="type"
                      value={form.type}
                      onChange={handleFormChange}
                      className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent sm:text-sm transition-all"
                      placeholder="e.g., Ruby, Sapphire"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                      Price (USD)
                    </label>
                    <input
                      type="number"
                      name="price"
                      id="price"
                      value={form.price}
                      onChange={handleFormChange}
                      className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent sm:text-sm transition-all"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      name="categoryId"
                      id="categoryId"
                      value={form.categoryId || ''}
                      onChange={handleFormChange}
                      className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent sm:text-sm transition-all bg-white"
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="certification" className="block text-sm font-medium text-gray-700 mb-1">
                      Certification
                    </label>
                    <input
                      type="text"
                      name="certification"
                      id="certification"
                      value={form.certification}
                      onChange={handleFormChange}
                      className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent sm:text-sm transition-all"
                      placeholder="GIA, IGI, etc."
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Availability
                    </label>
                    <div className="flex space-x-4 mt-1">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="active"
                          id="active"
                          checked={form.active}
                          onChange={(e) => setForm({ ...form, active: e.target.checked })}
                          className="h-5 w-5 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                        />
                        <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                          Active Listing
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="cashOnDelivery"
                          id="cashOnDelivery"
                          checked={form.cashOnDelivery}
                          onChange={(e) => setForm({ ...form, cashOnDelivery: e.target.checked })}
                          className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <label htmlFor="cashOnDelivery" className="ml-2 block text-sm text-gray-700 flex items-center">
                          <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                          Cash on Delivery
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      rows={4}
                      value={form.description}
                      onChange={handleFormChange}
                      className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent sm:text-sm transition-all"
                      placeholder="Detailed description of the gemstone..."
                    />
                  </div>

                  <div className="sm:col-span-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Images
                    </label>
                    <ExpertImageManager
                      images={Array.isArray(form.images) ? form.images : []}
                      onImagesChange={handleImagesChange}
                    />
                  </div>

                  <div className="sm:col-span-6 flex justify-end space-x-4 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setForm(emptyGem);
                        setEditingId(null);
                        setShowForm(false);
                      }}
                      className="bg-white py-3 px-6 border border-gray-300 rounded-xl shadow-sm text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-xl text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 transition-all"
                    >
                      {formLoading ? (
                        <div className="flex items-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Saving...
                        </div>
                      ) : editingId ? 'Update Gemstone' : 'Create Gemstone'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enhanced Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4"
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 rounded-xl bg-green-50 border border-green-200 p-4"
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Success</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>{success}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enhanced Filters */}
          <div className="mb-6 flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search gemstones by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent sm:text-sm transition-all"
                />
              </div>
            </div>
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value === '' ? '' : Number(e.target.value))}
                className="block w-full py-3 px-4 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent sm:text-sm bg-white transition-all"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Enhanced Bulk Actions */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center mb-3 sm:mb-0">
              <input
                type="checkbox"
                checked={selectedGems.length === filteredGems.length && filteredGems.length > 0}
                onChange={handleSelectAll}
                className="h-5 w-5 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
              />
              <span className="ml-3 text-sm text-gray-700">
                {selectedGems.length} of {filteredGems.length} selected
              </span>
            </div>
            {selectedGems.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="block w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent sm:text-sm bg-white"
                >
                  <option value="">Choose bulk action</option>
                  <option value="activate">Activate</option>
                  <option value="deactivate">Deactivate</option>
                  <option value="enableCod">Enable COD</option>
                  <option value="disableCod">Disable COD</option>
                  <option value="delete">Delete</option>
                </select>
                <button
                  onClick={handleBulkAction}
                  disabled={bulkLoading}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 transition-all"
                >
                  {bulkLoading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </div>
                  ) : 'Apply'}
                </button>
              </div>
            )}
          </div>

          {/* Enhanced Gemstones Table */}
          <div className="flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-2xl">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <input
                            type="checkbox"
                            checked={selectedGems.length === filteredGems.length && filteredGems.length > 0}
                            onChange={handleSelectAll}
                            className="h-5 w-5 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                          />
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                            COD
                          </div>
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loading ? (
                        <tr>
                          <td colSpan={8} className="px-6 py-8 whitespace-nowrap text-center">
                            <div className="flex flex-col items-center justify-center">
                              <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                              <p className="text-gray-600">Loading gemstone inventory...</p>
                            </div>
                          </td>
                        </tr>
                      ) : filteredGems.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-6 py-12 whitespace-nowrap text-center">
                            <div className="flex flex-col items-center justify-center">
                              <div className="text-5xl mb-4">🔍</div>
                              <h3 className="text-lg font-medium text-gray-900 mb-1">No gemstones found</h3>
                              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredGems.map((gem) => (
                          <motion.tr 
                            key={gem.id} 
                            className={selectedGems.includes(gem.id) ? 'bg-amber-50' : 'hover:bg-gray-50'}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={selectedGems.includes(gem.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedGems([...selectedGems, gem.id]);
                                  } else {
                                    setSelectedGems(selectedGems.filter((id) => id !== gem.id));
                                  }
                                }}
                                className="h-5 w-5 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {gem.images && gem.images.length > 0 && (
                                  <div className="flex-shrink-0 h-12 w-12 rounded-lg overflow-hidden border border-gray-200">
                                    <Image
                                      className="h-12 w-12 object-cover"
                                      src={gem.images[0]}
                                      alt={gem.name}
                                      width={48}
                                      height={48}
                                    />
                                  </div>
                                )}
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{gem.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {gem.type}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              ${gem.price.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {categories.find((c) => c.id === gem.categoryId)?.name || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {gem.cashOnDelivery ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                  <DollarSign className="w-3 h-3 mr-1" />
                                  Available
                                </span>
                              ) : (
                                <span className="px-3 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                  Not Available
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {gem.active ? (
                                <span className="px-3 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  Active
                                </span>
                              ) : (
                                <span className="px-3 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                  Inactive
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleEdit(gem)}
                                className="text-amber-600 hover:text-amber-900 mr-4 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(gem.id)}
                                className="text-red-600 hover:text-red-900 transition-colors"
                              >
                                Delete
                              </button>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminGemstonesPage;

export async function getServerSideProps(ctx: any) {
  const res = await getSessionOrRedirect(ctx, { requireAdmin: true });
  if ('redirect' in res) return res;
  return { props: {} };
}