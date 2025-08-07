import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';
import ImageUploadWithEdit from '../../components/ui/ImageUploadWithEdit';

interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  order: number;
  active: boolean;
}

const emptyBanner: Omit<Banner, 'id'> = {
  title: '',
  subtitle: '',
  image: '',
  link: '',
  order: 0,
  active: true,
};

const AdminBannersPage: React.FC = () => {
  const router = useRouter();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyBanner);
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
    fetchBanners();
  };

  const fetchBanners = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/banners');
      if (!res.ok) throw new Error('Failed to fetch banners');
      const data = await res.json();
      setBanners(data);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingId) {
        // Update existing banner
        const res = await fetch(`/api/admin/banners/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('Failed to update banner');
        const updatedBanner = await res.json();
        setBanners((prev) =>
          prev.map((banner) => (banner.id === editingId ? updatedBanner : banner)),
        );
      } else {
        // Add new banner
        const res = await fetch('/api/admin/banners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('Failed to create banner');
        const newBanner = await res.json();
        setBanners((prev) => [...prev, newBanner]);
      }

      setForm(emptyBanner);
      setEditingId(null);
      alert(editingId ? 'Banner updated successfully!' : 'Banner added successfully!');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (banner: Banner) => {
    setForm({ ...banner });
    setEditingId(banner.id);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this banner?')) return;
    setFormLoading(true);
    try {
      const res = await fetch(`/api/admin/banners/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete banner');
      }
      setBanners((prev) => prev.filter((banner) => banner.id !== id));
      alert('Banner deleted successfully!');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Admin Banners - Kolkata Gems">
        <div className="max-w-5xl mx-auto py-12 px-4">
          <div className="text-center text-gray-500">Loading banners...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Admin Banners - Kolkata Gems">
      <div className="max-w-5xl mx-auto py-12 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-amber-900">Admin: Banners</h1>
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
            {editingId ? 'Edit Banner' : 'Add New Banner'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              name="title"
              value={form.title}
              onChange={handleFormChange}
              placeholder="Title"
              required
              className="rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500"
            />
            <input
              name="subtitle"
              value={form.subtitle}
              onChange={handleFormChange}
              placeholder="Subtitle"
              className="rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500"
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
          </div>

          <div className="mt-6">
            <label className="block text-sm font-semibold text-amber-900 mb-2">Banner Image</label>
            <ImageUploadWithEdit
              aspect={16 / 5}
              value={form.image}
              onChange={(_, url) => setForm((f) => ({ ...f, image: url || '' }))}
              label="Upload Image"
              helperText="Recommended size: 1600x500px or larger."
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
                  : 'Add Banner'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setForm(emptyBanner);
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
          <h2 className="text-2xl font-semibold text-amber-900 mb-6">All Banners</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className="bg-white rounded-3xl shadow-xl border border-amber-100 p-6 flex flex-col gap-4"
              >
                <div className="font-bold text-lg text-amber-900">{banner.title}</div>
                <div className="text-sm text-gray-500">{banner.subtitle}</div>
                {banner.image && (
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-32 object-cover rounded-xl border border-amber-200"
                  />
                )}
                <div className="text-sm text-gray-600">
                  <div>Order: {banner.order}</div>
                  <div>Link: {banner.link || 'None'}</div>
                  <div className="mt-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${
                        banner.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {banner.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => handleEdit(banner)}
                    className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-bold hover:bg-blue-700 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
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

export default AdminBannersPage;
