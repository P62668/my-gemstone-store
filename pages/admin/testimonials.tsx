import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import AdminLayout from '../../components/AdminLayout';
import getSessionOrRedirect from '../../utils/withServerAuth';
import type { GetServerSideProps } from 'next';
import { ImageUploadWithEdit } from '../../components/ui';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  image: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

const emptyTestimonial: Omit<Testimonial, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '',
  role: '',
  company: '',
  content: '',
  rating: 5,
  image: '',
  active: true,
};

const AdminTestimonialsPage: React.FC = () => {
  const router = useRouter();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState(emptyTestimonial);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/testimonials');
      if (!res.ok) throw new Error('Failed to fetch testimonials');
      const data = await res.json();
      setTestimonials(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field: string, value: string | number | boolean) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    setSuccess('');
    try {
      const endpoint = editingId ? `/api/admin/testimonials/${editingId}` : '/api/admin/testimonials';
      const method = editingId ? 'PATCH' : 'POST';
      
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save testimonial');
      }

      setSuccess(editingId ? 'Testimonial updated successfully!' : 'Testimonial created successfully!');
      setForm(emptyTestimonial);
      setEditingId(null);
      fetchTestimonials();
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setForm({ ...testimonial });
    setEditingId(testimonial.id);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;
    setFormLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete testimonial');
      setSuccess('Testimonial deleted successfully!');
      fetchTestimonials();
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setFormLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-5 h-5 ${i < rating ? 'text-amber-500' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <AdminLayout title="Admin Testimonials - Shankarmala">
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-amber-900">Admin: Testimonials</h1>
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

        <form
          className="bg-white/80 rounded-3xl shadow-xl border border-amber-100 p-8 mb-12"
          onSubmit={handleSubmit}
        >
          <h2 className="text-2xl font-semibold text-amber-900 mb-6">
            {editingId ? 'Edit Testimonial' : 'Add New Testimonial'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                placeholder="Customer name"
                required
                className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <select
                value={form.rating}
                onChange={(e) => handleFormChange('rating', parseInt(e.target.value))}
                className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    {num} Star{num > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <input
                type="text"
                value={form.role}
                onChange={(e) => handleFormChange('role', e.target.value)}
                placeholder="Customer role/title"
                className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
              <input
                type="text"
                value={form.company}
                onChange={(e) => handleFormChange('company', e.target.value)}
                placeholder="Company name"
                className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
            <textarea
              value={form.content}
              onChange={(e) => handleFormChange('content', e.target.value)}
              placeholder="Testimonial content"
              rows={4}
              required
              className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Customer Image</label>
            <ImageUploadWithEdit
              aspect={1}
              value={form.image}
              onChange={(_, url) => handleFormChange('image', url || '')}
              label="Upload Image"
              helperText="Recommended size: 200x200px or larger."
            />
          </div>

          <div className="mb-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => handleFormChange('active', e.target.checked)}
                className="rounded border-amber-200 focus:ring-amber-500"
              />
              <span className="text-amber-900 font-semibold">Active</span>
            </label>
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
                  : 'Adding...'
                : editingId
                  ? 'Save Changes'
                  : 'Add Testimonial'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setForm(emptyTestimonial);
                  setEditingId(null);
                }}
                className="bg-gray-500 text-white px-8 py-3 rounded-2xl font-bold text-lg shadow-lg hover:bg-gray-600 transition-all focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        <div className="bg-white/80 rounded-3xl shadow-xl border border-amber-100 p-8">
          <h2 className="text-2xl font-semibold text-amber-900 mb-6">All Testimonials</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading testimonials...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">{error}</div>
          ) : testimonials.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No testimonials found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="bg-white rounded-3xl shadow-xl border border-amber-100 p-6 flex flex-col"
                >
                  <div className="flex items-start mb-4">
                    {testimonial.image ? (
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        width={60}
                        height={60}
                        className="rounded-full mr-4"
                      />
                    ) : (
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mr-4" />
                    )}
                    <div>
                      <div className="font-bold text-lg text-amber-900">{testimonial.name}</div>
                      {testimonial.role && (
                        <div className="text-amber-700 text-sm">{testimonial.role}</div>
                      )}
                      {testimonial.company && (
                        <div className="text-amber-600 text-sm">{testimonial.company}</div>
                      )}
                    </div>
                  </div>

                  <div className="mb-4 flex-grow">
                    <p className="text-gray-700 italic">"{testimonial.content}"</p>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>{renderStars(testimonial.rating)}</div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(testimonial)}
                        className="text-amber-600 hover:text-amber-900 text-sm font-bold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(testimonial.id)}
                        className="text-red-600 hover:text-red-900 text-sm font-bold"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${
                        testimonial.active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {testimonial.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminTestimonialsPage;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const res = await getSessionOrRedirect(ctx, { requireAdmin: true });
  if ('redirect' in res) return res;
  return { props: {} };
};