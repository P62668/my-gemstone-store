import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/admin/AdminLayout';
import getSessionOrRedirect from '../../utils/withServerAuth';
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
  const [formError, setFormError] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkError, setBulkError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
  // auth enforced server-side via getServerSideProps
  fetchCategories();
  }, []);

  const checkAuthAndFetch = async () => {
  // client-side auth check removed; server-side guard enforces admin access
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
    setFormError('');
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
      // Optionally show a toast or banner for success
    } catch (err: any) {
      setFormError(err.message || 'An error occurred.');
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
    setFormError('');
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
      // Optionally show a toast or banner for success
    } catch (err: any) {
      setFormError(err.message || 'An error occurred.');
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
    setBulkError('');
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
      // Optionally show a toast or banner for success
    } catch (err: any) {
      setBulkError('Bulk action failed: ' + (err.message || 'An error occurred.'));
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
      <AdminLayout title="Categories Management - Shankarmala">
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
      <AdminLayout title="Categories Management - Shankarmala">
        <div className="max-w-2xl w-full mx-auto py-12 px-4">
          <div className="bg-red-100 border border-red-300 text-red-800 px-6 py-6 rounded-xl text-center font-semibold shadow mb-6">
            <div className="text-5xl mb-2">❌</div>
            <div className="text-2xl font-bold text-red-700 mb-2">Error Loading Categories</div>
            <div className="text-red-800 mb-4">{error}</div>
            <button
              onClick={fetchCategories}
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
    <AdminLayout title="Categories Management - Shankarmala">
      <div className="max-w-7xl mx-auto py-12 px-4">
        {/* Error banners for form and bulk actions */}
        {(formError || bulkError) && (
          <div className="max-w-2xl w-full mx-auto mb-6">
            <div className="bg-red-100 border border-red-300 text-red-800 px-6 py-4 rounded-xl text-center font-semibold shadow">
              <div className="text-2xl mb-1">❌ Error</div>
              <div className="text-red-800">{formError || bulkError}</div>
            </div>
          </div>
        )}

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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-3xl shadow-2xl p-6 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold text-amber-900 mb-2">{categories.length}</div>
            <div className="text-lg text-amber-600">Total Categories</div>
          </div>
          <div className="bg-white rounded-3xl shadow-2xl p-6 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold text-amber-900 mb-2">
              {categories.filter((cat) => cat.active).length}
            </div>
            <div className="text-lg text-amber-600">Active Categories</div>
          </div>
          <div className="bg-white rounded-3xl shadow-2xl p-6 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold text-amber-900 mb-2">
              {categories.filter((cat) => !cat.active).length}
            </div>
            <div className="text-lg text-amber-600">Inactive Categories</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={handleSelectAll}
              className="bg-amber-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-amber-700 transition-colors"
            >
              {selectedCategories.length === filteredCategories.length ? 'Unselect All' : 'Select All'}
            </button>
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="bg-white border border-amber-200 text-amber-900 px-4 py-2 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Bulk Actions</option>
              <option value="delete">Delete</option>
              <option value="activate">Activate</option>
              <option value="deactivate">Deactivate</option>
            </select>
            <button
              onClick={handleBulkAction}
              className="bg-amber-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-amber-700 transition-colors"
              disabled={bulkLoading || selectedCategories.length === 0}
            >
              {bulkLoading ? 'Processing...' : 'Apply'}
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categories..."
              className="bg-white border border-amber-200 text-amber-900 px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
              <svg
                className="w-4 h-4 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-3xl shadow-2xl p-6 flex flex-col items-center justify-center relative"
            >
              <div className="absolute top-2 left-2">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.id)}
                  onChange={() => handleSelectCategory(cat.id)}
                  className="form-checkbox h-5 w-5 text-amber-600"
                />
              </div>
              <div className="w-24 h-24 bg-gray-100 rounded-full mb-4 flex items-center justify-center">
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <div className="text-4xl text-amber-600">📷</div>
                )}
              </div>
              <div className="text-xl font-bold text-amber-900 mb-2">{cat.name}</div>
              <div className="text-lg text-amber-600 mb-4">{cat.description}</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(cat)}
                  className="bg-amber-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-amber-700 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Form Modal */}
        <AnimatePresence mode="wait">
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
                        setFormError('');
                      }}
                      className="text-amber-600 hover:text-amber-900 text-2xl"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      ✕
                    </motion.button>
                  </div>
                </div>

                {/* Form error banner inside modal */}
                {formError && (
                  <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-xl text-center font-semibold shadow mb-4">
                    <div className="text-lg mb-1">❌ Error</div>
                    <div className="text-red-800">{formError}</div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  <div className="flex flex-col">
                    <label htmlFor="name" className="text-lg font-semibold text-amber-900 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleFormChange}
                      className="bg-white border border-amber-200 text-amber-900 px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="description" className="text-lg font-semibold text-amber-900 mb-2">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={form.description || ''}
                      onChange={handleFormChange}
                      className="bg-white border border-amber-200 text-amber-900 px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                      rows={4}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="image" className="text-lg font-semibold text-amber-900 mb-2">
                      Image
                    </label>
                    <ImageUploadWithEdit
                      value={form.image || ''}
                      onChange={handleImageChange}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="order" className="text-lg font-semibold text-amber-900 mb-2">
                      Order
                    </label>
                    <input
                      type="number"
                      id="order"
                      name="order"
                      value={form.order}
                      onChange={handleFormChange}
                      className="bg-white border border-amber-200 text-amber-900 px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="active"
                      name="active"
                      checked={form.active}
                      onChange={handleFormChange}
                      className="form-checkbox h-5 w-5 text-amber-600"
                    />
                    <label htmlFor="active" className="ml-2 text-lg font-semibold text-amber-900">
                      Active
                    </label>
                  </div>
                  <button
                    type="submit"
                    className="bg-amber-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-amber-700 transition-colors"
                    disabled={formLoading}
                  >
                    {formLoading ? 'Processing...' : 'Save'}
                  </button>
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

export async function getServerSideProps(ctx: any) {
  const res = await getSessionOrRedirect(ctx, { requireAdmin: true });
  if ('redirect' in res) return res;
  return { props: {} };
}
