import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';
import ExpertImageManager from '../../components/ui/ExpertImageManager';
import { motion, AnimatePresence } from 'framer-motion';

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
  order: 0,
};

const AdminGemstonesPage: React.FC = () => {
  const router = useRouter();
  const [gems, setGems] = useState<Gemstone[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    try {
      // Check if user is authenticated by calling the /api/users/me endpoint
      const res = await fetch('/api/users/me', { credentials: 'include' });
      if (!res.ok) {
        router.push('/admin/login');
        return;
      }
      const user = await res.json();
      if (user.role !== 'admin') {
        router.push('/admin/login');
        return;
      }
      fetchGems();
      fetchCategories();
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/admin/login');
    }
  };

  const fetchGems = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/gemstones', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch gemstones');
      const data = await res.json();
      setGems(data.map((g: any) => ({ ...g, images: Array.isArray(g.images) ? g.images : [] })));
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
        setGems((prev) => prev.map((gem) => (gem.id === editingId ? updatedGemstone : gem)));
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
        setGems((prev) => [...prev, newGemstone]);
      }

      setForm(emptyGem);
      setEditingId(null);
      setShowForm(false);
      alert(editingId ? 'Gemstone updated successfully!' : 'Gemstone added successfully!');
    } catch (err: any) {
      alert(err.message);
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
      alert('Gemstone deleted successfully!');
    } catch (err: any) {
      alert(err.message);
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
    try {
      // For demo purposes, simulate success
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (bulkAction === 'delete') {
        if (!window.confirm(`Delete ${selectedGems.length} gemstone(s)?`)) return;
        setGems((prev) => prev.filter((gem) => !selectedGems.includes(gem.id)));
      } else if (bulkAction === 'activate' || bulkAction === 'deactivate') {
        setGems((prev) =>
          prev.map((gem) =>
            selectedGems.includes(gem.id) ? { ...gem, active: bulkAction === 'activate' } : gem,
          ),
        );
      }

      setSelectedGems([]);
      setBulkAction('');
      alert('Bulk action completed successfully!');
    } catch (err: any) {
      alert('Bulk action failed: ' + err.message);
    } finally {
      setBulkLoading(false);
    }
  };

  // Filter and search
  const filteredGems = gems.filter((gem) => {
    const matchesSearch =
      gem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gem.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gem.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === '' || gem.categoryId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <AdminLayout title="Gemstones Management - Shankarmala" pageIcon="💎">
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
      <AdminLayout title="Gemstones Management - Shankarmala" pageIcon="💎">
        <div className="max-w-7xl mx-auto py-12 px-4">
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-6xl mb-4">❌</div>
            <div className="text-2xl font-bold text-red-900 mb-2">Error Loading Gemstones</div>
            <div className="text-red-600 mb-4">{error}</div>
            <motion.button
              onClick={fetchGems}
              className="bg-amber-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-amber-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Try Again
            </motion.button>
          </motion.div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Gemstones Management - Shankarmala" pageIcon="💎">
      <div className="max-w-7xl mx-auto py-12 px-4">
        {/* Header */}
        <motion.div
          className="flex justify-between items-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-4xl font-bold text-amber-900 mb-4 font-serif">
              💎 Gemstones Management
            </h1>
            <p className="text-lg text-amber-600">
              Manage your precious gemstone inventory with precision
            </p>
          </div>
          <motion.button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>✨</span>
            <span>Add New Gemstone</span>
          </motion.button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl p-6 border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600 text-sm font-medium">Total Gemstones</p>
                <p className="text-3xl font-bold text-amber-900">{gems.length}</p>
              </div>
              <div className="text-4xl">💎</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Active</p>
                <p className="text-3xl font-bold text-green-900">
                  {gems.filter((g) => g.active).length}
                </p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Categories</p>
                <p className="text-3xl font-bold text-blue-900">{categories.length}</p>
              </div>
              <div className="text-4xl">📂</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Total Value</p>
                <p className="text-3xl font-bold text-purple-900">
                  ₹{gems.reduce((sum, g) => sum + g.price, 0).toLocaleString()}
                </p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          className="bg-white rounded-3xl shadow-xl border border-amber-100 p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-semibold text-amber-700 mb-2">
                🔍 Search Gemstones
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, type, or description..."
                className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-amber-700 mb-2">
                📂 Filter by Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) =>
                  setCategoryFilter(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-amber-700 mb-2">
                ⚡ Bulk Actions
              </label>
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
              >
                <option value="">Select Action</option>
                <option value="activate">Activate Selected</option>
                <option value="deactivate">Deactivate Selected</option>
                <option value="delete">Delete Selected</option>
              </select>
            </div>
            <div className="flex items-end space-x-2">
              <motion.button
                onClick={handleBulkAction}
                disabled={!bulkAction || selectedGems.length === 0 || bulkLoading}
                className="flex-1 bg-amber-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: bulkAction && selectedGems.length > 0 ? 1.02 : 1 }}
                whileTap={{ scale: bulkAction && selectedGems.length > 0 ? 0.98 : 1 }}
              >
                {bulkLoading ? 'Processing...' : 'Apply'}
              </motion.button>
              <motion.button
                onClick={() => {
                  fetchGems();
                  fetchCategories();
                }}
                className="bg-gray-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                🔄
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Gemstones Grid */}
        <motion.div
          className="bg-white rounded-3xl shadow-xl border border-amber-100 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-amber-50 to-orange-50">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedGems.length === filteredGems.length && filteredGems.length > 0
                      }
                      onChange={handleSelectAll}
                      className="rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-amber-900">
                    Gemstone
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-amber-900">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-amber-900">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-amber-900">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-amber-900">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-amber-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {filteredGems.map((gem, index) => (
                  <motion.tr
                    key={gem.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-amber-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedGems.includes(gem.id)}
                        onChange={() => handleSelectGem(gem.id)}
                        className="rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-200 to-orange-200 flex items-center justify-center text-2xl">
                          💎
                        </div>
                        <div>
                          <div className="font-semibold text-amber-900">{gem.name}</div>
                          <div className="text-sm text-amber-600">
                            {gem.description.substring(0, 50)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {gem.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-amber-700">
                        {categories.find((c) => c.id === gem.categoryId)?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-green-600">
                        ₹{gem.price.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          gem.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {gem.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <motion.button
                          onClick={() => handleEdit(gem)}
                          className="text-amber-600 hover:text-amber-900 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          ✏️
                        </motion.button>
                        <motion.button
                          onClick={() => handleDelete(gem.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          🗑️
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Add/Edit Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-6 border-b border-amber-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-amber-900">
                      {editingId ? 'Edit Gemstone' : 'Add New Gemstone'}
                    </h2>
                    <motion.button
                      onClick={() => {
                        setShowForm(false);
                        setEditingId(null);
                        setForm(emptyGem);
                      }}
                      className="text-amber-600 hover:text-amber-900 text-2xl"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      ✕
                    </motion.button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-amber-700 mb-2">
                        Gemstone Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleFormChange}
                        required
                        className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                        placeholder="Enter gemstone name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-amber-700 mb-2">
                        Type *
                      </label>
                      <input
                        type="text"
                        name="type"
                        value={form.type}
                        onChange={handleFormChange}
                        required
                        className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                        placeholder="e.g., Ruby, Diamond, Emerald"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-amber-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleFormChange}
                      required
                      rows={4}
                      className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                      placeholder="Describe the gemstone..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-amber-700 mb-2">
                        Price (₹) *
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={form.price}
                        onChange={handleFormChange}
                        required
                        min="0"
                        className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-amber-700 mb-2">
                        Category
                      </label>
                      <select
                        name="categoryId"
                        value={form.categoryId || ''}
                        onChange={handleFormChange}
                        className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-amber-700 mb-2">
                        Certification
                      </label>
                      <input
                        type="text"
                        name="certification"
                        value={form.certification}
                        onChange={handleFormChange}
                        className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                        placeholder="e.g., GIA, IGI"
                      />
                    </div>
                  </div>

                  <div>
                    <ExpertImageManager
                      images={Array.isArray(form.images) ? form.images : []}
                      onChange={handleImagesChange}
                      maxImages={5}
                      aspectRatio={1}
                      label="Product Images"
                      helperText="Upload high-quality images of the gemstone (JPG, PNG, WebP). Max 5MB per image."
                      required={false}
                      disabled={false}
                      showAspectRatioOptions={true}
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="active"
                        checked={form.active}
                        onChange={(e) => setForm({ ...form, active: e.target.checked })}
                        className="rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="ml-2 text-sm text-amber-700">Active</span>
                    </label>
                  </div>

                  <div className="flex justify-end space-x-4 pt-6 border-t border-amber-200">
                    <motion.button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingId(null);
                        setForm(emptyGem);
                      }}
                      className="px-6 py-3 text-amber-700 hover:text-amber-900 transition-colors font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      disabled={formLoading}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-200 disabled:opacity-50"
                      whileHover={{ scale: formLoading ? 1 : 1.02 }}
                      whileTap={{ scale: formLoading ? 1 : 0.98 }}
                    >
                      {formLoading ? 'Saving...' : editingId ? 'Update Gemstone' : 'Add Gemstone'}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
};

export default AdminGemstonesPage;
