import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { ImageUploadWithEdit } from '../../components/ui';

interface Press {
  id: number;
  title: string;
  logo: string;
  link?: string;
  order: number;
  active: boolean;
}

const emptyPress: Omit<Press, 'id'> = {
  title: '',
  logo: '',
  link: '',
  order: 0,
  active: true,
};

const AdminPressPage: React.FC = () => {
  const [press, setPress] = useState<Press[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyPress);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchPress = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/press');
      if (!res.ok) throw new Error('Failed to fetch press');
      const data = await res.json();
      setPress(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPress();
  }, []);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const endpoint = editingId ? `/api/admin/press/${editingId}` : '/api/admin/press';
      const method = editingId ? 'PATCH' : 'POST';
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to save press');
      setForm(emptyPress);
      setEditingId(null);
      await fetchPress();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (item: Press) => {
    setForm({ ...item });
    setEditingId(item.id);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this press/award?')) return;
    setFormLoading(true);
    try {
      const res = await fetch(`/api/admin/press/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete press');
      await fetchPress();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <AdminLayout title="Admin Press - Kolkata Gems">
      <div className="max-w-5xl mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold text-amber-900 mb-8">Admin: Press & Awards</h1>
        <form
          className="bg-white/80 rounded-3xl shadow-xl border border-amber-100 p-8 mb-12 flex flex-col gap-4 max-w-xl"
          onSubmit={handleSubmit}
        >
          <h2 className="text-2xl font-semibold text-amber-900 mb-2">
            {editingId ? 'Edit Press/Award' : 'Add New Press/Award'}
          </h2>
          <input
            name="title"
            value={form.title}
            onChange={handleFormChange}
            placeholder="Title"
            required
            className="rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500"
          />
          <ImageUploadWithEdit
            aspect={4 / 1}
            value={form.logo}
            onChange={(_, url) => setForm((f) => ({ ...f, logo: url || '' }))}
            label="Logo Image"
            required
            helperText="Recommended size: 400x100px or larger."
          />
          <input
            name="link"
            value={form.link}
            onChange={handleFormChange}
            placeholder="Link (optional)"
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
          <button
            type="submit"
            className="mt-2 bg-amber-600 text-white px-8 py-3 rounded-2xl font-bold text-lg shadow-lg hover:bg-amber-700 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500"
            disabled={formLoading}
          >
            {formLoading
              ? editingId
                ? 'Saving...'
                : 'Adding...'
              : editingId
                ? 'Save Changes'
                : 'Add Press/Award'}
          </button>
          {editingId && (
            <button
              type="button"
              className="text-amber-700 font-semibold hover:underline text-sm mt-2"
              onClick={() => {
                setForm(emptyPress);
                setEditingId(null);
              }}
            >
              Cancel Edit
            </button>
          )}
        </form>
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {press.map((item) => (
              <div
                key={item.id}
                className="bg-white/80 rounded-3xl shadow-xl border border-amber-100 p-6 flex flex-col gap-2"
              >
                <div className="font-bold text-lg text-amber-900 mb-1">{item.title}</div>
                {item.logo && (
                  <img
                    src={item.logo}
                    alt={item.title}
                    className="w-32 h-16 object-contain rounded-xl border border-amber-200 mb-2 bg-white"
                  />
                )}
                <div className="text-xs text-gray-400 mb-1">Order: {item.order}</div>
                <div className="text-xs text-gray-400 mb-1">
                  {item.active ? 'Active' : 'Inactive'}
                </div>
                {item.link && (
                  <a
                    href={item.link}
                    className="text-amber-700 font-semibold hover:underline text-sm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit Link
                  </a>
                )}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="px-4 py-1 rounded-xl bg-amber-100 text-amber-700 text-xs font-bold border border-amber-200 hover:bg-amber-200 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-4 py-1 rounded-xl bg-red-100 text-red-700 text-xs font-bold border border-red-200 hover:bg-red-200 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPressPage;
