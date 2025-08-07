import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';

interface SEOSettings {
  global: {
    siteTitle: string;
    siteDescription: string;
    siteKeywords: string;
    siteUrl: string;
    siteLanguage: string;
    siteAuthor: string;
  };
  pages: {
    [key: string]: {
      title: string;
      description: string;
      keywords: string;
      ogImage: string;
      canonical: string;
    };
  };
  social: {
    facebookAppId: string;
    twitterHandle: string;
    instagramHandle: string;
    linkedinUrl: string;
  };
  analytics: {
    googleAnalyticsId: string;
    googleTagManagerId: string;
    facebookPixelId: string;
  };
  structuredData: {
    organization: {
      name: string;
      logo: string;
      address: string;
      phone: string;
      email: string;
    };
    business: {
      type: string;
      openingHours: string;
      priceRange: string;
    };
  };
}

const SEOAdmin: React.FC = () => {
  const [seoSettings, setSeoSettings] = useState<SEOSettings>({
    global: {
      siteTitle: 'Shankarmala - Luxury Gemstone Collection',
      siteDescription:
        "Discover the finest gemstones from Shankarmala's heritage jewelry collection. GIA certified, worldwide shipping.",
      siteKeywords:
        'luxury gemstones, heritage jewelry, Shankarmala, precious stones, GIA certified',
      siteUrl: 'https://shankarmala.com',
      siteLanguage: 'en',
      siteAuthor: 'Shankarmala',
    },
    pages: {
      home: {
        title: 'Shankarmala - Luxury Gemstone Collection',
        description:
          "Discover the finest gemstones from Shankarmala's heritage jewelry collection. GIA certified, worldwide shipping.",
        keywords: 'luxury gemstones, heritage jewelry, Shankarmala',
        ogImage: '/images/og-image.jpg',
        canonical: 'https://shankarmala.com',
      },
      shop: {
        title: 'Shop - Luxury Gemstones | Shankarmala',
        description: 'Browse our exclusive collection of luxury gemstones and heritage jewelry',
        keywords: 'gemstone shop, luxury jewelry, Shankarmala collection',
        ogImage: '/images/og-shop.jpg',
        canonical: 'https://shankarmala.com/shop',
      },
      about: {
        title: 'About Us - Heritage Since 1890 | Kolkata Gems',
        description:
          'Learn about our 125+ years of heritage in fine gemstones and traditional craftsmanship',
        keywords: 'about Kolkata Gems, heritage, craftsmanship, gemstone history',
        ogImage: '/images/og-about.jpg',
        canonical: 'https://kolkata-gems.com/about',
      },
      contact: {
        title: 'Contact Us - Expert Consultation | Kolkata Gems',
        description:
          'Get in touch with our gemstone experts for personalized consultation and support',
        keywords: 'contact Kolkata Gems, gemstone consultation, expert advice',
        ogImage: '/images/og-contact.jpg',
        canonical: 'https://kolkata-gems.com/contact',
      },
    },
    social: {
      facebookAppId: '',
      twitterHandle: '@kolkata_gems',
      instagramHandle: '@kolkata_gems',
      linkedinUrl: 'https://linkedin.com/company/kolkata-gems',
    },
    analytics: {
      googleAnalyticsId: '',
      googleTagManagerId: '',
      facebookPixelId: '',
    },
    structuredData: {
      organization: {
        name: 'Kolkata Gems',
        logo: 'https://kolkata-gems.com/images/logo.png',
        address: '123 Heritage Lane, Park Street, Kolkata, West Bengal 700016',
        phone: '+91 33 1234 5678',
        email: 'info@kolkata-gems.com',
      },
      business: {
        type: 'Jewelry Store',
        openingHours: 'Mo-Fr 10:00-19:00; Sa 10:00-18:00',
        priceRange: '₹₹₹₹',
      },
    },
  });

  const [activeTab, setActiveTab] = useState('global');
  const [saving, setSaving] = useState(false);

  const handleGlobalChange = (field: keyof SEOSettings['global'], value: string) => {
    setSeoSettings((prev) => ({
      ...prev,
      global: {
        ...prev.global,
        [field]: value,
      },
    }));
  };

  const handlePageChange = (
    pageKey: string,
    field: keyof SEOSettings['pages'][string],
    value: string,
  ) => {
    setSeoSettings((prev) => ({
      ...prev,
      pages: {
        ...prev.pages,
        [pageKey]: {
          ...prev.pages[pageKey],
          [field]: value,
        },
      },
    }));
  };

  const handleSocialChange = (field: keyof SEOSettings['social'], value: string) => {
    setSeoSettings((prev) => ({
      ...prev,
      social: {
        ...prev.social,
        [field]: value,
      },
    }));
  };

  const handleAnalyticsChange = (field: keyof SEOSettings['analytics'], value: string) => {
    setSeoSettings((prev) => ({
      ...prev,
      analytics: {
        ...prev.analytics,
        [field]: value,
      },
    }));
  };

  const handleOrganizationChange = (
    field: keyof SEOSettings['structuredData']['organization'],
    value: string,
  ) => {
    setSeoSettings((prev) => ({
      ...prev,
      structuredData: {
        ...prev.structuredData,
        organization: {
          ...prev.structuredData.organization,
          [field]: value,
        },
      },
    }));
  };

  const handleBusinessChange = (
    field: keyof SEOSettings['structuredData']['business'],
    value: string,
  ) => {
    setSeoSettings((prev) => ({
      ...prev,
      structuredData: {
        ...prev.structuredData,
        business: {
          ...prev.structuredData.business,
          [field]: value,
        },
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/admin/seo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(seoSettings),
      });
      alert('SEO settings updated successfully!');
    } catch (error) {
      console.error('Failed to save SEO settings:', error);
      alert('Failed to save SEO settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'global', name: 'Global SEO', icon: '🌐' },
    { id: 'pages', name: 'Page SEO', icon: '📄' },
    { id: 'social', name: 'Social Media', icon: '📱' },
    { id: 'analytics', name: 'Analytics', icon: '📊' },
    { id: 'structured', name: 'Structured Data', icon: '🏷️' },
  ];

  const pages = [
    { key: 'home', name: 'Homepage', icon: '🏠' },
    { key: 'shop', name: 'Shop', icon: '🛍️' },
    { key: 'about', name: 'About', icon: 'ℹ️' },
    { key: 'contact', name: 'Contact', icon: '📞' },
  ];

  return (
    <Layout title="SEO Settings - Kolkata Gems">
      <div className="max-w-7xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-amber-900 mb-4">SEO Settings</h1>
          <p className="text-lg text-gray-600">
            Optimize your site for search engines and social media
          </p>
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

        {/* Global SEO Tab */}
        {activeTab === 'global' && (
          <div className="bg-white rounded-3xl shadow-xl border border-amber-100 p-8">
            <h2 className="text-2xl font-bold text-amber-900 mb-6">Global SEO Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-amber-700 mb-2">
                  Site Title
                </label>
                <input
                  type="text"
                  value={seoSettings.global.siteTitle}
                  onChange={(e) => handleGlobalChange('siteTitle', e.target.value)}
                  className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Site title"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-amber-700 mb-2">Site URL</label>
                <input
                  type="url"
                  value={seoSettings.global.siteUrl}
                  onChange={(e) => handleGlobalChange('siteUrl', e.target.value)}
                  className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="https://example.com"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-amber-700 mb-2">
                  Site Description
                </label>
                <textarea
                  value={seoSettings.global.siteDescription}
                  onChange={(e) => handleGlobalChange('siteDescription', e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Site description (160 characters recommended)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {seoSettings.global.siteDescription.length}/160 characters
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-amber-700 mb-2">Keywords</label>
                <input
                  type="text"
                  value={seoSettings.global.siteKeywords}
                  onChange={(e) => handleGlobalChange('siteKeywords', e.target.value)}
                  className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-amber-700 mb-2">Language</label>
                <select
                  value={seoSettings.global.siteLanguage}
                  onChange={(e) => handleGlobalChange('siteLanguage', e.target.value)}
                  className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="bn">Bengali</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-amber-700 mb-2">Author</label>
                <input
                  type="text"
                  value={seoSettings.global.siteAuthor}
                  onChange={(e) => handleGlobalChange('siteAuthor', e.target.value)}
                  className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Site author"
                />
              </div>
            </div>
          </div>
        )}

        {/* Page SEO Tab */}
        {activeTab === 'pages' && (
          <div className="space-y-6">
            {pages.map((page) => (
              <div
                key={page.key}
                className="bg-white rounded-3xl shadow-xl border border-amber-100 p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">{page.icon}</span>
                  <h3 className="text-xl font-bold text-amber-900">{page.name} SEO</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-amber-700 mb-2">
                      Page Title
                    </label>
                    <input
                      type="text"
                      value={seoSettings.pages[page.key]?.title || ''}
                      onChange={(e) => handlePageChange(page.key, 'title', e.target.value)}
                      className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
                      placeholder="Page title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-amber-700 mb-2">
                      Canonical URL
                    </label>
                    <input
                      type="url"
                      value={seoSettings.pages[page.key]?.canonical || ''}
                      onChange={(e) => handlePageChange(page.key, 'canonical', e.target.value)}
                      className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
                      placeholder="https://example.com/page"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-amber-700 mb-2">
                      Meta Description
                    </label>
                    <textarea
                      value={seoSettings.pages[page.key]?.description || ''}
                      onChange={(e) => handlePageChange(page.key, 'description', e.target.value)}
                      rows={3}
                      className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
                      placeholder="Page description (160 characters recommended)"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {(seoSettings.pages[page.key]?.description || '').length}/160 characters
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-amber-700 mb-2">
                      Keywords
                    </label>
                    <input
                      type="text"
                      value={seoSettings.pages[page.key]?.keywords || ''}
                      onChange={(e) => handlePageChange(page.key, 'keywords', e.target.value)}
                      className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
                      placeholder="page, specific, keywords"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-amber-700 mb-2">
                      OG Image URL
                    </label>
                    <input
                      type="url"
                      value={seoSettings.pages[page.key]?.ogImage || ''}
                      onChange={(e) => handlePageChange(page.key, 'ogImage', e.target.value)}
                      className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
                      placeholder="https://example.com/images/og-image.jpg"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Social Media Tab */}
        {activeTab === 'social' && (
          <div className="bg-white rounded-3xl shadow-xl border border-amber-100 p-8">
            <h2 className="text-2xl font-bold text-amber-900 mb-6">Social Media Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-amber-700 mb-2">
                  Facebook App ID
                </label>
                <input
                  type="text"
                  value={seoSettings.social.facebookAppId}
                  onChange={(e) => handleSocialChange('facebookAppId', e.target.value)}
                  className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="123456789"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-amber-700 mb-2">
                  Twitter Handle
                </label>
                <input
                  type="text"
                  value={seoSettings.social.twitterHandle}
                  onChange={(e) => handleSocialChange('twitterHandle', e.target.value)}
                  className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="@username"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-amber-700 mb-2">
                  Instagram Handle
                </label>
                <input
                  type="text"
                  value={seoSettings.social.instagramHandle}
                  onChange={(e) => handleSocialChange('instagramHandle', e.target.value)}
                  className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="@username"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-amber-700 mb-2">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={seoSettings.social.linkedinUrl}
                  onChange={(e) => handleSocialChange('linkedinUrl', e.target.value)}
                  className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="https://linkedin.com/company/name"
                />
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-3xl shadow-xl border border-amber-100 p-8">
            <h2 className="text-2xl font-bold text-amber-900 mb-6">Analytics & Tracking</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-amber-700 mb-2">
                  Google Analytics ID
                </label>
                <input
                  type="text"
                  value={seoSettings.analytics.googleAnalyticsId}
                  onChange={(e) => handleAnalyticsChange('googleAnalyticsId', e.target.value)}
                  className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-amber-700 mb-2">
                  Google Tag Manager ID
                </label>
                <input
                  type="text"
                  value={seoSettings.analytics.googleTagManagerId}
                  onChange={(e) => handleAnalyticsChange('googleTagManagerId', e.target.value)}
                  className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="GTM-XXXXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-amber-700 mb-2">
                  Facebook Pixel ID
                </label>
                <input
                  type="text"
                  value={seoSettings.analytics.facebookPixelId}
                  onChange={(e) => handleAnalyticsChange('facebookPixelId', e.target.value)}
                  className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="123456789"
                />
              </div>
            </div>
          </div>
        )}

        {/* Structured Data Tab */}
        {activeTab === 'structured' && (
          <div className="bg-white rounded-3xl shadow-xl border border-amber-100 p-8">
            <h2 className="text-2xl font-bold text-amber-900 mb-6">Structured Data</h2>

            {/* Organization */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-amber-900 mb-4">Organization</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-amber-700 mb-2">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={seoSettings.structuredData.organization.name}
                    onChange={(e) => handleOrganizationChange('name', e.target.value)}
                    className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-amber-700 mb-2">
                    Logo URL
                  </label>
                  <input
                    type="url"
                    value={seoSettings.structuredData.organization.logo}
                    onChange={(e) => handleOrganizationChange('logo', e.target.value)}
                    className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-amber-700 mb-2">Address</label>
                  <input
                    type="text"
                    value={seoSettings.structuredData.organization.address}
                    onChange={(e) => handleOrganizationChange('address', e.target.value)}
                    className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-amber-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={seoSettings.structuredData.organization.phone}
                    onChange={(e) => handleOrganizationChange('phone', e.target.value)}
                    className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-amber-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={seoSettings.structuredData.organization.email}
                    onChange={(e) => handleOrganizationChange('email', e.target.value)}
                    className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Business */}
            <div>
              <h3 className="text-lg font-semibold text-amber-900 mb-4">Business Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-amber-700 mb-2">
                    Business Type
                  </label>
                  <input
                    type="text"
                    value={seoSettings.structuredData.business.type}
                    onChange={(e) => handleBusinessChange('type', e.target.value)}
                    className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-amber-700 mb-2">
                    Opening Hours
                  </label>
                  <input
                    type="text"
                    value={seoSettings.structuredData.business.openingHours}
                    onChange={(e) => handleBusinessChange('openingHours', e.target.value)}
                    className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Mo-Fr 10:00-19:00; Sa 10:00-18:00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-amber-700 mb-2">
                    Price Range
                  </label>
                  <select
                    value={seoSettings.structuredData.business.priceRange}
                    onChange={(e) => handleBusinessChange('priceRange', e.target.value)}
                    className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="₹">₹ (Inexpensive)</option>
                    <option value="₹₹">₹₹ (Moderate)</option>
                    <option value="₹₹₹">₹₹₹ (Expensive)</option>
                    <option value="₹₹₹₹">₹₹₹₹ (Very Expensive)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-amber-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-amber-700 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save SEO Settings'}
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default SEOAdmin;
