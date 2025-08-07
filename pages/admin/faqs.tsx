import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  order: number;
  active: boolean;
}

const emptyFAQ: Omit<FAQ, 'id'> = {
  question: '',
  answer: '',
  order: 0,
  active: true,
};

const AdminFAQsPage: React.FC = () => {
  const router = useRouter();
  const [faqs, setFAQs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyFAQ);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = () => {
    // Remove: const adminLoggedIn = localStorage.getItem('adminLoggedIn');
    // if (adminLoggedIn !== 'true') {
    //   router.push('/admin/login');
    //   return;
    // }
    fetchFAQs();
  };

  const fetchFAQs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/faqs');
      if (!res.ok) throw new Error('Failed to fetch FAQs');
      const data = await res.json();
      setFAQs(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
      setForm({ ...form, [name]: e.target.checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      // For demo purposes, simulate success
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (editingId) {
        // Update existing FAQ
        setFAQs((prev) =>
          prev.map((faq) => (faq.id === editingId ? { ...form, id: editingId } : faq)),
        );
      } else {
        // Add new FAQ
        const newFAQ = { ...form, id: Date.now() };
        setFAQs((prev) => [...prev, newFAQ]);
      }

      setForm(emptyFAQ);
      setEditingId(null);
      alert(editingId ? 'FAQ updated successfully!' : 'FAQ added successfully!');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (item: FAQ) => {
    setForm({ ...item });
    setEditingId(item.id);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this FAQ?')) return;
    setFormLoading(true);
    try {
      // For demo purposes, simulate success
      await new Promise((resolve) => setTimeout(resolve, 500));
      setFAQs((prev) => prev.filter((faq) => faq.id !== id));
      alert('FAQ deleted successfully!');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Admin FAQs - Kolkata Gems">
        <div className="max-w-5xl mx-auto py-12 px-4">
          <div className="text-center text-gray-500">Loading FAQs...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Admin FAQs - Kolkata Gems">
      <div className="max-w-5xl mx-auto py-12 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-amber-900">Admin: FAQs</h1>
          <button
            onClick={() => router.push('/admin')}
            className="bg-gray-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-700 transition"
          >
            Back to Dashboard
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="text-red-800">{error}</div>
          </div>
        )}

        <form
          className="bg-white/80 rounded-3xl shadow-xl border border-amber-100 p-8 mb-12"
          onSubmit={handleSubmit}
        >
          <h2 className="text-2xl font-semibold text-amber-900 mb-6">
            {editingId ? 'Edit FAQ' : 'Add New FAQ'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              name="question"
              value={form.question}
              onChange={handleFormChange}
              placeholder="Question"
              required
              className="rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500"
            />
            <input
              name="order"
              type="number"
              value={form.order}
              onChange={handleFormChange}
              placeholder="Order"
              className="rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500"
            />
          </div>

          <div className="mt-6">
            <textarea
              name="answer"
              value={form.answer}
              onChange={handleFormChange}
              placeholder="Answer"
              required
              rows={4}
              className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500"
            />
          </div>

          <div className="mt-6">
            <label className="flex items-center gap-2">
              <input
                name="active"
                type="checkbox"
                checked={form.active}
                onChange={handleFormChange}
                className="rounded border-amber-200 focus:ring-amber-500"
              />
              <span className="text-amber-900 font-semibold">Active</span>
            </label>
          </div>

          <div className="mt-6 flex gap-4">
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
                  : 'Add FAQ'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setForm(emptyFAQ);
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
          <h2 className="text-2xl font-semibold text-amber-900 mb-6">All FAQs</h2>
          <div className="space-y-6">
            {faqs.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl shadow-xl border border-amber-100 p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="font-bold text-lg text-amber-900 mb-2">{item.question}</div>
                    <div className="text-amber-700 text-sm leading-relaxed">{item.answer}</div>
                  </div>
                  <div className="ml-4 flex items-center gap-2">
                    <span className="text-sm text-gray-600">Order: {item.order}</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${
                        item.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {item.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-bold hover:bg-blue-700 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-bold hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminFAQsPage;
