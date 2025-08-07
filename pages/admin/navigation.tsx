import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';

interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  order: number;
  active: boolean;
  children?: MenuItem[];
}

interface NavigationConfig {
  mainMenu: MenuItem[];
  footerMenu: MenuItem[];
  socialLinks: MenuItem[];
}

const NavigationAdmin: React.FC = () => {
  const [navigation, setNavigation] = useState<NavigationConfig>({
    mainMenu: [
      { id: 'home', label: 'Home', href: '/', order: 1, active: true },
      { id: 'shop', label: 'Shop', href: '/shop', order: 2, active: true },
      { id: 'about', label: 'About', href: '/about', order: 3, active: true },
      { id: 'contact', label: 'Contact', href: '/contact', order: 4, active: true },
    ],
    footerMenu: [
      { id: 'privacy', label: 'Privacy Policy', href: '/privacy', order: 1, active: true },
      { id: 'terms', label: 'Terms of Service', href: '/terms', order: 2, active: true },
      { id: 'shipping', label: 'Shipping Info', href: '/shipping', order: 3, active: true },
      { id: 'returns', label: 'Returns', href: '/returns', order: 4, active: true },
    ],
    socialLinks: [
      {
        id: 'facebook',
        label: 'Facebook',
        href: 'https://facebook.com',
        icon: '📘',
        order: 1,
        active: true,
      },
      {
        id: 'instagram',
        label: 'Instagram',
        href: 'https://instagram.com',
        icon: '📷',
        order: 2,
        active: true,
      },
      {
        id: 'twitter',
        label: 'Twitter',
        href: 'https://twitter.com',
        icon: '🐦',
        order: 3,
        active: true,
      },
      {
        id: 'linkedin',
        label: 'LinkedIn',
        href: 'https://linkedin.com',
        icon: '💼',
        order: 4,
        active: true,
      },
    ],
  });

  const [activeTab, setActiveTab] = useState('main');
  const [saving, setSaving] = useState(false);

  const handleItemChange = (
    menuType: keyof NavigationConfig,
    id: string,
    field: keyof MenuItem,
    value: any,
  ) => {
    setNavigation((prev) => ({
      ...prev,
      [menuType]: prev[menuType].map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const toggleItem = (menuType: keyof NavigationConfig, id: string) => {
    setNavigation((prev) => ({
      ...prev,
      [menuType]: prev[menuType].map((item) =>
        item.id === id ? { ...item, active: !item.active } : item,
      ),
    }));
  };

  const moveItem = (menuType: keyof NavigationConfig, id: string, direction: 'up' | 'down') => {
    setNavigation((prev) => {
      const newMenu = [...prev[menuType]];
      const index = newMenu.findIndex((item) => item.id === id);
      if (direction === 'up' && index > 0) {
        [newMenu[index], newMenu[index - 1]] = [newMenu[index - 1], newMenu[index]];
      } else if (direction === 'down' && index < newMenu.length - 1) {
        [newMenu[index], newMenu[index + 1]] = [newMenu[index + 1], newMenu[index]];
      }
      return {
        ...prev,
        [menuType]: newMenu.map((item, idx) => ({ ...item, order: idx + 1 })),
      };
    });
  };

  const addItem = (menuType: keyof NavigationConfig) => {
    const newItem: MenuItem = {
      id: `new-${Date.now()}`,
      label: 'New Item',
      href: '/',
      order: navigation[menuType].length + 1,
      active: true,
    };

    setNavigation((prev) => ({
      ...prev,
      [menuType]: [...prev[menuType], newItem],
    }));

    // setEditingItem(newItem.id); // This line is removed
  };

  const removeItem = (menuType: keyof NavigationConfig, id: string) => {
    if (confirm('Are you sure you want to remove this item?')) {
      setNavigation((prev) => ({
        ...prev,
        [menuType]: prev[menuType].filter((item) => item.id !== id),
      }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/admin/navigation', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(navigation),
      });
      alert('Navigation updated successfully!');
    } catch (error) {
      console.error('Failed to save navigation:', error);
      alert('Failed to save navigation. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'main', name: 'Main Menu', icon: '🧭' },
    { id: 'footer', name: 'Footer Menu', icon: '⬇️' },
    { id: 'social', name: 'Social Links', icon: '🔗' },
  ];

  const renderMenuItems = (menuType: keyof NavigationConfig) => {
    return navigation[menuType].map((item) => (
      <div
        key={item.id}
        className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6 mb-4"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => moveItem(menuType, item.id, 'up')}
                disabled={item.order === 1}
                className="p-2 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ↑
              </button>
              <button
                onClick={() => moveItem(menuType, item.id, 'down')}
                disabled={item.order === navigation[menuType].length}
                className="p-2 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ↓
              </button>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-amber-900">{item.label}</h3>
              <p className="text-sm text-gray-500">Order: {item.order}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={item.active}
                onChange={() => toggleItem(menuType, item.id)}
                className="rounded border-amber-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="ml-2 text-sm text-gray-700">Active</span>
            </label>
            <button
              onClick={() => removeItem(menuType, item.id)}
              className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
            >
              🗑️
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-amber-700 mb-2">Label</label>
            <input
              type="text"
              value={item.label}
              onChange={(e) => handleItemChange(menuType, item.id, 'label', e.target.value)}
              className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-amber-700 mb-2">URL/Link</label>
            <input
              type="text"
              value={item.href}
              onChange={(e) => handleItemChange(menuType, item.id, 'href', e.target.value)}
              className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        </div>

        {menuType === 'socialLinks' && (
          <div className="mt-4">
            <label className="block text-sm font-semibold text-amber-700 mb-2">Icon (emoji)</label>
            <input
              type="text"
              value={item.icon || ''}
              onChange={(e) => handleItemChange(menuType, item.id, 'icon', e.target.value)}
              className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
              placeholder="📘"
            />
          </div>
        )}
      </div>
    ));
  };

  return (
    <Layout title="Navigation Management - Kolkata Gems">
      <div className="max-w-7xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-amber-900 mb-4">Navigation Management</h1>
          <p className="text-lg text-gray-600">Manage menu structure and navigation links</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-amber-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Menu Tab */}
        {activeTab === 'main' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-amber-900">Main Navigation Menu</h2>
              <button
                onClick={() => addItem('mainMenu')}
                className="bg-amber-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-amber-700 transition-colors"
              >
                + Add Menu Item
              </button>
            </div>
            {renderMenuItems('mainMenu')}
          </div>
        )}

        {/* Footer Menu Tab */}
        {activeTab === 'footer' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-amber-900">Footer Menu</h2>
              <button
                onClick={() => addItem('footerMenu')}
                className="bg-amber-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-amber-700 transition-colors"
              >
                + Add Menu Item
              </button>
            </div>
            {renderMenuItems('footerMenu')}
          </div>
        )}

        {/* Social Links Tab */}
        {activeTab === 'social' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-amber-900">Social Media Links</h2>
              <button
                onClick={() => addItem('socialLinks')}
                className="bg-amber-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-amber-700 transition-colors"
              >
                + Add Social Link
              </button>
            </div>
            {renderMenuItems('socialLinks')}
          </div>
        )}

        {/* Preview */}
        <div className="mt-12 bg-white rounded-3xl shadow-xl border border-amber-100 p-8">
          <h2 className="text-2xl font-bold text-amber-900 mb-6">Navigation Preview</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Menu Preview */}
            <div>
              <h3 className="text-lg font-semibold text-amber-900 mb-4">Main Menu</h3>
              <div className="bg-amber-50 rounded-xl p-4">
                <nav className="flex flex-col space-y-2">
                  {navigation.mainMenu
                    .filter((item) => item.active)
                    .map((item) => (
                      <a
                        key={item.id}
                        href={item.href}
                        className="text-amber-700 hover:text-amber-900 font-medium transition-colors"
                      >
                        {item.label}
                      </a>
                    ))}
                </nav>
              </div>
            </div>

            {/* Footer Menu Preview */}
            <div>
              <h3 className="text-lg font-semibold text-amber-900 mb-4">Footer Menu</h3>
              <div className="bg-gray-50 rounded-xl p-4">
                <nav className="flex flex-col space-y-2">
                  {navigation.footerMenu
                    .filter((item) => item.active)
                    .map((item) => (
                      <a
                        key={item.id}
                        href={item.href}
                        className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                      >
                        {item.label}
                      </a>
                    ))}
                </nav>
              </div>
            </div>

            {/* Social Links Preview */}
            <div>
              <h3 className="text-lg font-semibold text-amber-900 mb-4">Social Links</h3>
              <div className="bg-amber-50 rounded-xl p-4">
                <div className="flex space-x-4">
                  {navigation.socialLinks
                    .filter((item) => item.active)
                    .map((item) => (
                      <a
                        key={item.id}
                        href={item.href}
                        className="text-2xl hover:scale-110 transition-transform"
                        title={item.label}
                      >
                        {item.icon}
                      </a>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-amber-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-amber-700 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Navigation'}
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default NavigationAdmin;
