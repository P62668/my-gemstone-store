import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Truck, Package, CreditCard, Shield } from 'lucide-react';

interface ShippingMethod {
  id: number;
  name: string;
  description: string | null;
  price: number;
  freeAbove: number | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

const emptyShippingMethod: Omit<ShippingMethod, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '',
  description: '',
  price: 0,
  freeAbove: null,
  active: true,
};

const AdminShippingPage: React.FC = () => {
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState<Omit<ShippingMethod, 'id' | 'createdAt' | 'updatedAt'>>(emptyShippingMethod);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showForm, setShowForm] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    averagePrice: 0,
  });

  useEffect(() => {
    fetchShippingMethods();
  }, []);

  const fetchShippingMethods = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/shipping', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch shipping methods');
      const data = await res.json();
      setShippingMethods(data.shippingMethods);
      setStats(data.stats);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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
               type === 'number' ? (value === '' ? null : Number(value)) : value 
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    setSuccess('');
    try {
      const payload = { 
        ...form,
        freeAbove: form.freeAbove || null,
      };
      
      if (editingId) {
        // Update existing shipping method
        const res = await fetch(`/api/admin/shipping/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to update shipping method');
        const updatedMethod = await res.json();
        setShippingMethods((prev) => prev.map((method) => (method.id === editingId ? updatedMethod : method)));
        setSuccess('Shipping method updated successfully!');
      } else {
        // Add new shipping method
        const res = await fetch('/api/admin/shipping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to create shipping method');
        const newMethod = await res.json();
        setShippingMethods((prev) => [...prev, newMethod]);
        setSuccess('Shipping method added successfully!');
      }

      setForm(emptyShippingMethod);
      setEditingId(null);
      setShowForm(false);
      fetchShippingMethods(); // Refresh stats
    } catch (err: any) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (method: ShippingMethod) => {
    setForm({
      name: method.name,
      description: method.description || '',
      price: method.price,
      freeAbove: method.freeAbove,
      active: method.active,
    });
    setEditingId(method.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this shipping method? This action cannot be undone.')) return;
    setFormLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/admin/shipping/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete shipping method');
      }
      setShippingMethods((prev) => prev.filter((method) => method.id !== id));
      setSuccess('Shipping method deleted successfully!');
      fetchShippingMethods(); // Refresh stats
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Filter shipping methods based on search and active filters
  const filteredMethods = shippingMethods.filter((method) => {
    const matchesSearch = method.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (method.description && method.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesActive = activeFilter === 'all' ||
                         (activeFilter === 'active' && method.active) ||
                         (activeFilter === 'inactive' && !method.active);
    
    return matchesSearch && matchesActive;
  });

  if (loading) {
    return (
      <AdminLayout title="Shipping Management">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading shipping methods...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Shipping Management">
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
              <h1 className="text-3xl font-bold text-amber-900 mb-2">Shipping Management</h1>
              <p className="text-gray-600">Manage shipping methods and delivery options</p>
            </div>
            <button
              onClick={() => {
                setForm(emptyShippingMethod);
                setEditingId(null);
                setShowForm(!showForm);
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-6 rounded-xl transition duration-300"
            >
              {showForm ? 'Cancel' : 'Add New Shipping Method'}
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              className="bg-white rounded-xl shadow-lg p-6 border border-amber-200"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center">
                <Truck className="h-8 w-8 text-amber-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-amber-600">{stats.total}</div>
                  <div className="text-sm text-gray-600">Total Methods</div>
                </div>
              </div>
            </motion.div>
            <motion.div
              className="bg-white rounded-xl shadow-lg p-6 border border-amber-200"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center">
                <Package className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                  <div className="text-sm text-gray-600">Active Methods</div>
                </div>
              </div>
            </motion.div>
            <motion.div
              className="bg-white rounded-xl shadow-lg p-6 border border-amber-200"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-blue-600">₹{stats.averagePrice.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Average Price</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Add/Edit Shipping Method Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8 overflow-hidden"
            >
              <h2 className="text-2xl font-bold text-amber-900 mb-6">
                {editingId ? 'Edit Shipping Method' : 'Add New Shipping Method'}
              </h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="name">
                      Shipping Method Name *
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
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={form.description || ''}
                      onChange={handleFormChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
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
                      <label className="block text-gray-700 font-medium mb-2" htmlFor="freeAbove">
                        Free Above (₹)
                      </label>
                      <input
                        type="number"
                        id="freeAbove"
                        name="freeAbove"
                        value={form.freeAbove || ''}
                        onChange={handleFormChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2">
                      Shipping Method Status
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
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Shipping Information</h3>
                    <div className="bg-amber-50 rounded-lg p-4">
                      <div className="flex items-start">
                        <Shield className="h-5 w-5 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
                        <p className="text-sm text-amber-800">
                          All shipments include insurance and tracking. Free shipping applies when order total exceeds the "Free Above" amount.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setForm(emptyShippingMethod);
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
                      {editingId ? 'Update Shipping Method' : 'Add Shipping Method'}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Search</label>
              <input
                type="text"
                placeholder="Search shipping methods..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Status</label>
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchShippingMethods}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Shipping Methods Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shipping Method
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Free Above
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
                {filteredMethods.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No shipping methods found
                    </td>
                  </tr>
                ) : (
                  filteredMethods.map((method) => (
                    <tr key={method.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{method.name}</div>
                        {method.description && (
                          <div className="text-sm text-gray-500">{method.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{method.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {method.freeAbove ? `₹${method.freeAbove.toFixed(2)}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          method.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {method.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(method)}
                          className="text-amber-600 hover:text-amber-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(method.id)}
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

export default AdminShippingPage;