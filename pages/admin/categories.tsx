import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';
import ImageUploadWithEdit from '../../components/ui/ImageUploadWithEdit';
import { motion, AnimatePresence } from 'framer-motion';

interface Category {
  id: number;
  name: string;
  description?: string;
  image?: string;
  order: number;
  active: boolean;
}

const emptyCategory: Category = {
  id: 0,
  name: '',
  description: '',
  image: '',
  order: 0,
  active: true,
};

const AdminCategoriesPage: React.FC = () => {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState<Category>(emptyCategory);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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
      fetchCategories();
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/admin/login');
    }
  };

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/categories', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      setCategories(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleImageChange = (file: File | null, url: string | null) => {
    setForm({ ...form, image: url || '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingId) {
        // Update existing category
        const res = await fetch(`/api/admin/categories/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('Failed to update category');
        const updatedCategory = await res.json();
        setCategories((prev) => prev.map((cat) => (cat.id === editingId ? updatedCategory : cat)));
      } else {
        // Add new category
        const res = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('Failed to create category');
        const newCategory = await res.json();
        setCategories((prev) => [...prev, newCategory]);
      }

      setForm(emptyCategory);
      setEditingId(null);
      setShowForm(false);
      alert(editingId ? 'Category updated successfully!' : 'Category added successfully!');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (cat: Category) => {
    setForm({ ...cat });
    setEditingId(cat.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this category?')) return;
    setFormLoading(true);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete category');
      }
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      alert('Category deleted successfully!');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Bulk actions
  const handleSelectAll = () => {
    if (selectedCategories.length === filteredCategories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(filteredCategories.map((c) => c.id));
    }
  };

  const handleSelectCategory = (id: number) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedCategories.length === 0) return;
    setBulkLoading(true);
    try {
      if (bulkAction === 'delete') {
        if (!window.confirm(`Delete ${selectedCategories.length} category(ies)?`)) return;
        // Delete each category individually
        for (const id of selectedCategories) {
          const res = await fetch(`/api/admin/categories/${id}`, {
            method: 'DELETE',
          });
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || `Failed to delete category ${id}`);
          }
        }
        setCategories((prev) => prev.filter((cat) => !selectedCategories.includes(cat.id)));
      } else if (bulkAction === 'activate' || bulkAction === 'deactivate') {
        // Update each category individually
        for (const id of selectedCategories) {
          const category = categories.find((cat) => cat.id === id);
          if (category) {
            const res = await fetch(`/api/admin/categories/${id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...category, active: bulkAction === 'activate' }),
            });
            if (!res.ok) throw new Error(`Failed to update category ${id}`);
          }
        }
        setCategories((prev) =>
          prev.map((cat) =>
            selectedCategories.includes(cat.id)
              ? { ...cat, active: bulkAction === 'activate' }
              : cat,
          ),
        );
      }

      setSelectedCategories([]);
      setBulkAction('');
      alert('Bulk action completed successfully!');
    } catch (err: any) {
      alert('Bulk action failed: ' + err.message);
    } finally {
      setBulkLoading(false);
    }
  };

  // Filter and search
  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cat.description && cat.description.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  if (loading) {
    return (
      <AdminLayout title="Categories Management - Shankarmala" pageIcon="📂">
        <div className="max-w-7xl mx-auto py-12 px-4">
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-6xl mb-4">📂</div>
            <div className="text-2xl font-bold text-amber-900 mb-2">Loading Categories...</div>
            <div className="text-amber-600">Please wait while we fetch your categories</div>
          </motion.div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Categories Management - Shankarmala" pageIcon="📂">
        <div className="max-w-7xl mx-auto py-12 px-4">
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-6xl mb-4">❌</div>
            <div className="text-2xl font-bold text-red-900 mb-2">Error Loading Categories</div>
            <div className="text-red-600 mb-4">{error}</div>
            <motion.button
              onClick={fetchCategories}
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
    <AdminLayout title="Categories Management - Shankarmala" pageIcon="📂">
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
              📂 Categories Management
            </h1>
            <p className="text-lg text-amber-600">
              Organize your gemstone collection with beautiful categories
            </p>
          </div>
          <motion.button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>✨</span>
            <span>Add New Category</span>
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
                <p className="text-amber-600 text-sm font-medium">Total Categories</p>
                <p className="text-3xl font-bold text-amber-900">{categories.length}</p>
              </div>
              <div className="text-4xl">📂</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Active</p>
                <p className="text-3xl font-bold text-green-900">
                  {categories.filter((c) => c.active).length}
                </p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">With Images</p>
                <p className="text-3xl font-bold text-blue-900">
                  {categories.filter((c) => c.image).length}
                </p>
              </div>
              <div className="text-4xl">🖼️</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Average Order</p>
                <p className="text-3xl font-bold text-purple-900">
                  {Math.round(
                    categories.reduce((sum, c) => sum + c.order, 0) / categories.length,
                  ) || 0}
                </p>
              </div>
              <div className="text-4xl">📊</div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-amber-700 mb-2">
                🔍 Search Categories
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or description..."
                className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
              />
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
                disabled={!bulkAction || selectedCategories.length === 0 || bulkLoading}
                className="flex-1 bg-amber-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: bulkAction && selectedCategories.length > 0 ? 1.02 : 1 }}
                whileTap={{ scale: bulkAction && selectedCategories.length > 0 ? 0.98 : 1 }}
              >
                {bulkLoading ? 'Processing...' : 'Apply'}
              </motion.button>
              <motion.button
                onClick={fetchCategories}
                className="bg-gray-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                🔄
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Categories Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {filteredCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white rounded-2xl shadow-xl border border-amber-100 overflow-hidden hover:shadow-2xl transition-all duration-300"
            >
              {/* Category Image */}
              <div className="h-48 bg-gradient-to-br from-amber-100 to-orange-100 relative">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-6xl text-amber-300">💎</div>
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => handleSelectCategory(category.id)}
                    className="rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                  />
                </div>
                <div className="absolute bottom-4 left-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      category.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {category.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Category Content */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-amber-900">{category.name}</h3>
                  <div className="flex space-x-2">
                    <motion.button
                      onClick={() => handleEdit(category)}
                      className="text-amber-600 hover:text-amber-900 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      ✏️
                    </motion.button>
                    <motion.button
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      🗑️
                    </motion.button>
                  </div>
                </div>

                {category.description && (
                  <p className="text-amber-600 text-sm mb-4 line-clamp-2">{category.description}</p>
                )}

                <div className="flex justify-between items-center text-sm text-amber-500">
                  <span>Order: {category.order}</span>
                  <span>ID: #{category.id}</span>
                </div>
              </div>
            </motion.div>
          ))}
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
                      {editingId ? 'Edit Category' : 'Add New Category'}
                    </h2>
                    <motion.button
                      onClick={() => {
                        setShowForm(false);
                        setEditingId(null);
                        setForm(emptyCategory);
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
                        Category Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleFormChange}
                        required
                        className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                        placeholder="Enter category name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-amber-700 mb-2">
                        Display Order
                      </label>
                      <input
                        type="number"
                        name="order"
                        value={form.order}
                        onChange={handleFormChange}
                        min="0"
                        className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-amber-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleFormChange}
                      rows={4}
                      className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                      placeholder="Describe the category..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-amber-700 mb-2">
                      Category Image
                    </label>
                    <ImageUploadWithEdit
                      value={form.image || ''}
                      onChange={handleImageChange}
                      label="Upload Category Image"
                      helperText="Upload a beautiful image for this category"
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
                        setForm(emptyCategory);
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
                      {formLoading ? 'Saving...' : editingId ? 'Update Category' : 'Add Category'}
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

export default AdminCategoriesPage;
