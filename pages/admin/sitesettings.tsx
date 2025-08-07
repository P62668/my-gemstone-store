import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';

interface SiteSettings {
  about?: string;
  contact?: string;
  address?: string;
  phone?: string;
  email?: string;
}

const AdminSiteSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchSettings = async () => {
    setError('');
    try {
      const res = await fetch('/api/admin/sitesettings');
      if (!res.ok) throw new Error('Failed to fetch site settings');
      const data = await res.json();
      setSettings(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      // setLoading(false); // This line was removed as per the edit hint.
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings({ ...settings, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/admin/sitesettings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error('Failed to save site settings');
      setSuccess('Settings saved!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <AdminLayout title="Admin Site Settings - Kolkata Gems">
      <div className="max-w-3xl mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold text-amber-900 mb-8">Admin: Site Settings</h1>
        <form
          className="bg-white/80 rounded-3xl shadow-xl border border-amber-100 p-8 flex flex-col gap-4"
          onSubmit={handleSubmit}
        >
          <h2 className="text-2xl font-semibold text-amber-900 mb-2">Edit Site Info</h2>
          <textarea
            name="about"
            value={settings.about || ''}
            onChange={handleChange}
            placeholder="About (HTML or text)"
            className="rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 min-h-[80px]"
          />
          <textarea
            name="contact"
            value={settings.contact || ''}
            onChange={handleChange}
            placeholder="Contact Info"
            className="rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 min-h-[60px]"
          />
          <input
            name="address"
            value={settings.address || ''}
            onChange={handleChange}
            placeholder="Address"
            className="rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500"
          />
          <input
            name="phone"
            value={settings.phone || ''}
            onChange={handleChange}
            placeholder="Phone"
            className="rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500"
          />
          <input
            name="email"
            value={settings.email || ''}
            onChange={handleChange}
            placeholder="Email"
            className="rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500"
          />
          <button
            type="submit"
            className="mt-2 bg-amber-600 text-white px-8 py-3 rounded-2xl font-bold text-lg shadow-lg hover:bg-amber-700 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500"
            disabled={formLoading}
          >
            {formLoading ? 'Saving...' : 'Save Settings'}
          </button>
          {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
          {success && <div className="text-green-700 text-sm mt-2">{success}</div>}
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminSiteSettingsPage;
