import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';
import getSessionOrRedirect from '../../utils/withServerAuth';
import type { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';

// Dynamically import the rich text editor to avoid SSR issues
const RichTextEditor = dynamic(() => import('../../components/admin/RichTextEditor'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>
});

interface Policy {
  id: number;
  title: string;
  slug: string;
  content: string;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const emptyPolicy: Omit<Policy, 'id' | 'createdAt' | 'updatedAt'> = {
  title: '',
  slug: '',
  content: '',
  type: 'privacy',
  status: 'active',
};

const policyTypes = [
  { value: 'privacy', label: 'Privacy Policy' },
  { value: 'terms', label: 'Terms of Service' },
  { value: 'refund', label: 'Refund Policy' },
  { value: 'shipping', label: 'Shipping Policy' },
  { value: 'cookies', label: 'Cookie Policy' },
  { value: 'custom', label: 'Custom Policy' },
];

const AdminPoliciesPage: React.FC = () => {
  const router = useRouter();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState(emptyPolicy);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/policies');
      if (!res.ok) throw new Error('Failed to fetch policies');
      const data = await res.json();
      setPolicies(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    setSuccess('');
    try {
      const endpoint = editingId ? `/api/admin/policies/${editingId}` : '/api/admin/policies';
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save policy');
      }

      setSuccess(editingId ? 'Policy updated successfully!' : 'Policy created successfully!');
      setForm(emptyPolicy);
      setEditingId(null);
      setShowForm(false);
      fetchPolicies();
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/policies/${id}`);
      if (!res.ok) throw new Error('Failed to fetch policy');
      const policy = await res.json();
      setForm({
        title: policy.title,
        slug: policy.slug,
        content: policy.content,
        type: policy.type,
        status: policy.status,
      });
      setEditingId(id);
      setShowForm(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this policy? This may affect your website compliance.')) return;
    setFormLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/admin/policies/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete policy');
      setSuccess('Policy deleted successfully!');
      fetchPolicies();
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setFormLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getPolicyTypeLabel = (type: string) => {
    const policyType = policyTypes.find(pt => pt.value === type);
    return policyType ? policyType.label : type;
  };

  return (
    <AdminLayout title="Admin Policies - Shankarmala">
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-amber-900">Admin: Policies</h1>
          <button
            onClick={() => router.push('/admin')}
            className="bg-gray-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-700 transition"
          >
            Back to Dashboard
          </button>
        </div>

        {(error || success) && (
          <div className={`rounded-xl p-4 mb-6 font-semibold text-center shadow border ${error ? 'bg-red-100 border-red-300 text-red-800' : 'bg-green-100 border-green-300 text-green-800'}`}>
            {error || success}
          </div>
        )}

        <div className="mb-6 flex justify-end">
          <button
            onClick={() => {
              setForm(emptyPolicy);
              setEditingId(null);
              setShowForm(!showForm);
            }}
            className="bg-amber-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-700 transition"
          >
            {showForm ? 'Cancel' : '+ Add New Policy'}
          </button>
        </div>

        {showForm && (
          <form
            className="bg-white/80 rounded-3xl shadow-xl border border-amber-100 p-8 mb-12"
            onSubmit={handleSubmit}
          >
            <h2 className="text-2xl font-semibold text-amber-900 mb-6">
              {editingId ? 'Edit Policy' : 'Create New Policy'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  placeholder="Policy title"
                  required
                  className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => handleFormChange('slug', e.target.value)}
                  placeholder="policy-title"
                  className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Policy Type *</label>
                <select
                  value={form.type}
                  onChange={(e) => handleFormChange('type', e.target.value)}
                  className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
                >
                  {policyTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => handleFormChange('status', e.target.value)}
                  className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
              <RichTextEditor
                value={form.content}
                onChange={(value) => handleFormChange('content', value)}
              />
            </div>

            <div className="mt-8 flex gap-4">
              <button
                type="submit"
                className="bg-amber-600 text-white px-8 py-3 rounded-2xl font-bold text-lg shadow-lg hover:bg-amber-700 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
                disabled={formLoading}
              >
                {formLoading
                  ? editingId
                    ? 'Saving...'
                    : 'Creating...'
                  : editingId
                    ? 'Save Changes'
                    : 'Create Policy'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setForm(emptyPolicy);
                    setEditingId(null);
                    setShowForm(false);
                  }}
                  className="bg-gray-500 text-white px-8 py-3 rounded-2xl font-bold text-lg shadow-lg hover:bg-gray-600 transition-all focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}

        <div className="bg-white/80 rounded-3xl shadow-xl border border-amber-100 p-8">
          <h2 className="text-2xl font-semibold text-amber-900 mb-6">All Policies</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading policies...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">{error}</div>
          ) : policies.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No policies found.</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 bg-amber-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-amber-700 transition"
              >
                Create Your First Policy
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Updated
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {policies.map((policy) => (
                      <tr key={policy.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{policy.title}</div>
                          <div className="text-sm text-gray-500">{policy.slug}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{getPolicyTypeLabel(policy.type)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            policy.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {policy.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(policy.updatedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEdit(policy.id)}
                            className="text-amber-600 hover:text-amber-900 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(policy.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPoliciesPage;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const res = await getSessionOrRedirect(ctx, { requireAdmin: true });
  if ('redirect' in res) return res;
  return { props: {} };
};