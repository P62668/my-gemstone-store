import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import AdminLayout from '../../components/AdminLayout';

interface HomepageSection {
  id: string;
  key: string;
  title: string;
  subtitle?: string;
  content: string;
  image?: string;
  active: boolean;
  order: number;
}

interface HeroSection {
  title: string;
  subtitle: string;
  primaryCTA: string;
  secondaryCTA: string;
  backgroundImage: string;
  primaryCTALink: string;
  secondaryCTALink: string;
}

const HomepageAdmin: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('hero');
  const [heroSection, setHeroSection] = useState<HeroSection>({
    title: '',
    subtitle: '',
    primaryCTA: '',
    secondaryCTA: '',
    backgroundImage: '',
    primaryCTALink: '',
    secondaryCTALink: '',
  });
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [lastLoaded, setLastLoaded] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Featured products state
  const [allGemstones, setAllGemstones] = useState<any[]>([]);
  const [featuredIds, setFeaturedIds] = useState<number[]>([]);
  const [featuredOrder, setFeaturedOrder] = useState<number[]>([]);
  const [savingFeatured, setSavingFeatured] = useState(false);
  const [search, setSearch] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Optimized gemstones fetching with error handling
  const fetchGemstones = async () => {
    try {
      console.log('📦 Fetching gemstones...');
      const response = await fetch('/api/admin/gemstones', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch gemstones: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ Fetched ${data.length} gemstones`);

      const featuredGemstones = data.filter((g: any) => g.featured);
      console.log('⭐ Featured gemstones:', featuredGemstones.length);
      console.log(
        '⭐ Featured gemstones details:',
        featuredGemstones.map((g: any) => ({ id: g.id, name: g.name, featured: g.featured })),
      );

      setAllGemstones(data);
      setFeaturedIds(featuredGemstones.map((g: any) => g.id));
      setFeaturedOrder(featuredGemstones.map((g: any) => g.id));
    } catch (error) {
      console.error('❌ Failed to fetch gemstones:', error);
      toast.error('Failed to load gemstones');
      setAllGemstones([]);
      setFeaturedIds([]);
      setFeaturedOrder([]);
    }
  };

  // Debug function to check featured status
  const debugFeaturedStatus = async () => {
    try {
      console.log('🔍 Debug: Checking featured status...');
      const response = await fetch('/api/admin/gemstones', { credentials: 'include' });
      const data = await response.json();

      const featuredProducts = data.filter((g: any) => g.featured);
      console.log(
        '🔍 Debug: Featured products from API:',
        featuredProducts.map((g: any) => ({ id: g.id, name: g.name, featured: g.featured })),
      );

      // Also check public API
      const publicResponse = await fetch('/api/gemstones?featured=true');
      const publicData = await publicResponse.json();
      console.log(
        '🔍 Debug: Featured products from public API:',
        publicData.map((g: any) => ({ id: g.id, name: g.name, featured: g.featured })),
      );
    } catch (error) {
      console.error('🔍 Debug: Error checking featured status:', error);
    }
  };

  // Optimized homepage data fetching
  const fetchHomepageData = async () => {
    try {
      const [heroResponse, sectionsResponse] = await Promise.all([
        fetch('/api/admin/homepage/hero', { credentials: 'include' }),
        fetch('/api/admin/homepage/sections', { credentials: 'include' }),
      ]);

      if (heroResponse.ok) {
        const heroData = await heroResponse.json();
        setHeroSection(heroData);
      }

      if (sectionsResponse.ok) {
        const sectionsData = await sectionsResponse.json();
        const mappedSections = sectionsData.map((section: any) => ({
          id: section.key,
          key: section.key,
          title: section.title || '',
          subtitle: section.subtitle || '',
          content: section.content || '',
          image: section.image || '',
          active: section.active !== undefined ? section.active : true,
          order: section.order || 0,
        }));
        setSections(mappedSections);
      }

      setLastLoaded(new Date().toLocaleString());
    } catch (error) {
      console.error('Failed to fetch homepage data:', error);
      toast.error('Failed to load homepage data');
    }
  };

  // Expert-level featured toggle with optimistic updates and rollback
  const handleToggleFeatured = async (id: number) => {
    console.log('🔄 Toggle featured called for ID:', id);
    console.log('🔐 Checking authentication status...');

    const wasFeatured = featuredIds.includes(id);
    console.log('📊 Current featured status:', wasFeatured);

    try {
      // Check authentication first
      const authCheck = await fetch('/api/users/me', { credentials: 'include' });
      console.log('🔐 Auth check status:', authCheck.status);

      if (!authCheck.ok) {
        throw new Error('Authentication failed - please log in again');
      }

      const user = await authCheck.json();
      console.log('👤 Authenticated user:', user.name, user.role);

      // Optimistic update
      console.log('⚡ Applying optimistic update...');
      setFeaturedIds((prev) => {
        const newIds = wasFeatured ? prev.filter((fid) => fid !== id) : [...prev, id];
        console.log('📊 New featured IDs:', newIds);
        return newIds;
      });

      setFeaturedOrder((prev) => {
        const newOrder = wasFeatured ? prev.filter((fid) => fid !== id) : [...prev, id];
        console.log('📊 New featured order:', newOrder);
        return newOrder;
      });

      // API call
      console.log('🌐 Making API call to toggle featured...');
      const response = await fetch('/api/admin/gemstones/featured', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'toggle',
          productId: id,
        }),
      });

      console.log('📡 API response status:', response.status);

      if (!response.ok) {
        throw new Error(`Failed to toggle featured: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Toggle successful:', result.message);
      toast.success(result.message);

      // Force refresh with a small delay to ensure database is updated
      console.log('🔄 Refreshing gemstones data...');
      setTimeout(async () => {
        await fetchGemstones();
      }, 100);
    } catch (error) {
      console.error('❌ Toggle failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to toggle featured status');

      // Rollback optimistic update
      setFeaturedIds((prev) => (wasFeatured ? [...prev, id] : prev.filter((fid) => fid !== id)));
      setFeaturedOrder((prev) => (wasFeatured ? [...prev, id] : prev.filter((fid) => fid !== id)));
    }
  };

  // Drag and drop handlers with error handling
  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setIsDragging(false);

    const { active, over } = event;

    if (!active || !over || active.id === over.id) {
      return;
    }

    try {
      setFeaturedOrder((items) => {
        const oldIndex = items.indexOf(active.id as number);
        const newIndex = items.indexOf(over.id as number);
        return arrayMove(items, oldIndex, newIndex);
      });
    } catch (error) {
      console.error('Drag error:', error);
      toast.error('Failed to reorder items');
    }
  };

  // Save handlers with comprehensive error handling
  const handleSave = async () => {
    setSaving(true);
    try {
      const [heroRes, sectionsRes] = await Promise.all([
        fetch('/api/admin/homepage/hero', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(heroSection),
        }),
        fetch('/api/admin/homepage/sections', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(sections),
        }),
      ]);

      if (!heroRes.ok || !sectionsRes.ok) {
        throw new Error('Failed to save homepage data');
      }

      toast.success('Homepage saved successfully!');
      setLastLoaded(new Date().toLocaleString());
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save homepage');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFeatured = async () => {
    setSavingFeatured(true);
    try {
      const response = await fetch('/api/admin/gemstones/featured', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ featuredIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to save featured products');
      }

      toast.success('Featured products saved successfully!');
      await fetchGemstones();
    } catch (error) {
      console.error('Save featured error:', error);
      toast.error('Failed to save featured products');
    } finally {
      setSavingFeatured(false);
    }
  };

  // Initialize on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔐 Checking authentication...');
        const authRes = await fetch('/api/users/me', { credentials: 'include' });

        if (!authRes.ok) {
          throw new Error('Authentication failed');
        }

        const user = await authRes.json();
        if (user.role !== 'admin') {
          throw new Error('Access denied - Admin role required');
        }

        console.log('✅ Authentication successful');

        // Fetch data in parallel for better performance
        await Promise.all([fetchGemstones(), fetchHomepageData()]);
      } catch (error) {
        console.error('❌ Authentication error:', error);
        setError(error instanceof Error ? error.message : 'Authentication failed');
        toast.error('Please log in to access admin panel');
        setTimeout(() => {
          router.push('/admin/login');
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []); // Empty dependency array to run only once

  // Loading state
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
            <p className="text-amber-600 font-semibold">Loading admin panel...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-700 mb-2">Access Denied</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => router.push('/admin/login')}
              className="bg-amber-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-amber-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-amber-900 mb-4 font-serif">
                🏠 Homepage Management
              </h1>
              <p className="text-lg text-amber-600">
                Expert-level homepage customization with real-time preview
              </p>
              <div className="mt-2 text-sm text-gray-600">
                📊 Status: {featuredIds.length} featured products of {allGemstones.length} total
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  await Promise.all([fetchGemstones(), fetchHomepageData()]);
                }}
                className="bg-amber-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-amber-600 transition-colors flex items-center gap-2"
              >
                <span>🔄</span>
                <span>Refresh Data</span>
              </button>

              {/* Test Button */}
              <button
                onClick={() => {
                  console.log('🧪 Test button clicked');
                  console.log('🧪 All gemstones:', allGemstones.length);
                  console.log('🧪 Featured IDs:', featuredIds);
                  if (allGemstones.length > 0) {
                    console.log(
                      '🧪 Testing with first gemstone:',
                      allGemstones[0].name,
                      allGemstones[0].id,
                    );
                    handleToggleFeatured(allGemstones[0].id);
                  }
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <span>🧪</span>
                <span>Test Toggle</span>
              </button>

              {/* Debug Button */}
              <button
                onClick={debugFeaturedStatus}
                className="bg-green-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <span>🔍</span>
                <span>Debug Featured</span>
              </button>

              {/* Force Refresh Button */}
              <button
                onClick={async () => {
                  console.log('🔄 Force refreshing data...');
                  await fetchGemstones();
                  toast.success('Data refreshed');
                }}
                className="bg-purple-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-purple-600 transition-colors flex items-center gap-2"
              >
                <span>🔄</span>
                <span>Force Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-amber-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'hero', label: 'Hero Section', icon: '🏠' },
                { key: 'featured', label: 'Featured Products', icon: '⭐' },
                { key: 'sections', label: 'Page Sections', icon: '📄' },
                { key: 'preview', label: 'Live Preview', icon: '👁️' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                    activeTab === tab.key
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Hero Section Tab */}
        {activeTab === 'hero' && (
          <div className="bg-white rounded-3xl shadow-xl border border-amber-100 p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-amber-900">Hero Section</h2>
              <div className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
                💾 Last saved: {lastLoaded || 'Not saved yet'}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form */}
              <div className="space-y-6">
                {Object.entries(heroSection).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-semibold text-amber-700 mb-2">
                      {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                    </label>
                    {key.includes('CTA') || key.includes('Link') ? (
                      <input
                        type="text"
                        value={value}
                        onChange={(e) =>
                          setHeroSection((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                        className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
                        placeholder={`Enter ${key.toLowerCase()}`}
                      />
                    ) : key === 'subtitle' ? (
                      <textarea
                        rows={3}
                        value={value}
                        onChange={(e) =>
                          setHeroSection((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                        className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
                        placeholder={`Enter ${key.toLowerCase()}`}
                      />
                    ) : (
                      <input
                        type="text"
                        value={value}
                        onChange={(e) =>
                          setHeroSection((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                        className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
                        placeholder={`Enter ${key.toLowerCase()}`}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Preview */}
              <div className="bg-gradient-to-br from-amber-50 to-white rounded-2xl p-6 border border-amber-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-amber-900">Live Preview</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={fetchHomepageData}
                      className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600 transition-colors"
                    >
                      🔄 Refresh
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-600 transition-colors disabled:opacity-50"
                    >
                      {saving ? '💾 Saving...' : '💾 Save Hero'}
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-amber-900 mb-2">
                      {heroSection.title || 'Hero Title'}
                    </h1>
                    <p className="text-gray-600 mb-4">
                      {heroSection.subtitle || 'Hero subtitle will appear here'}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button className="bg-amber-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                        {heroSection.primaryCTA || 'Primary CTA'}
                      </button>
                      <button className="border border-amber-600 text-amber-600 px-6 py-2 rounded-full text-sm font-semibold">
                        {heroSection.secondaryCTA || 'Secondary CTA'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Featured Products Tab */}
        {activeTab === 'featured' && (
          <div className="bg-white rounded-3xl shadow-xl border border-amber-100 p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-amber-900">Featured Products</h2>
              <div className="flex items-center gap-2 text-sm">
                <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-medium">
                  {featuredIds.length} Featured
                </span>
                <span className="text-gray-500">of {allGemstones.length} Total</span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                  ✅ Expert Mode
                </span>
              </div>
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="Search gemstones..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-4 w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
            />

            {/* Products Grid - FIXED FOR BUTTON CLICKS */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={featuredOrder} strategy={verticalListSortingStrategy}>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {allGemstones
                    .filter((g) => g.name.toLowerCase().includes(search.toLowerCase()))
                    .map((gem) => (
                      <SortableProductCard
                        key={gem.id}
                        gem={gem}
                        isFeatured={featuredIds.includes(gem.id)}
                        onToggleFeatured={handleToggleFeatured}
                        isDragging={isDragging}
                      />
                    ))}
                </div>
              </SortableContext>
            </DndContext>

            {/* Action Buttons */}
            <div className="mt-6 flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-gray-700">Status:</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-bold ${
                    featuredIds.length > 0
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {featuredIds.length} Featured of {allGemstones.length} Total
                </span>
              </div>

              <button
                onClick={handleSaveFeatured}
                disabled={savingFeatured}
                className="px-8 py-3 rounded-xl bg-amber-600 text-white font-bold text-lg shadow-lg hover:bg-amber-700 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {savingFeatured ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>Saving Featured Products...</span>
                  </>
                ) : (
                  <>
                    <span>💾</span>
                    <span>Save Featured Products</span>
                  </>
                )}
              </button>

              <button
                onClick={async () => {
                  if (confirm('Are you sure you want to unfeature ALL products?')) {
                    setSavingFeatured(true);
                    try {
                      const response = await fetch('/api/admin/gemstones/featured', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ featuredIds: [] }),
                      });

                      if (response.ok) {
                        toast.success('All products unfeatured successfully!');
                        await fetchGemstones();
                      } else {
                        toast.error('Failed to unfeature all products.');
                      }
                    } catch (error) {
                      toast.error('Error unfeaturing all products.');
                    }
                    setSavingFeatured(false);
                  }
                }}
                className="px-6 py-3 rounded-xl bg-red-600 text-white font-bold text-lg shadow-lg hover:bg-red-700 transition-all focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={savingFeatured}
              >
                <span>🗑️</span>
                <span>Unfeature All</span>
              </button>

              {/* BIG SIMPLE TEST BUTTON */}
              <button
                onClick={() => {
                  console.log('🎯 BIG TEST BUTTON CLICKED');
                  console.log('🎯 All gemstones:', allGemstones.length);
                  console.log('🎯 Featured IDs:', featuredIds);
                  if (allGemstones.length > 0) {
                    const firstGem = allGemstones[0];
                    console.log('🎯 Testing with first gemstone:', firstGem.name, firstGem.id);
                    console.log('🎯 Current featured status:', featuredIds.includes(firstGem.id));
                    handleToggleFeatured(firstGem.id);
                  } else {
                    toast.error('No gemstones available to test');
                  }
                }}
                className="px-8 py-3 rounded-xl bg-green-600 text-white font-bold text-lg shadow-lg hover:bg-green-700 transition-all focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center gap-2"
              >
                <span>🎯</span>
                <span>BIG TEST BUTTON</span>
              </button>
            </div>
          </div>
        )}

        {/* Page Sections Tab */}
        {activeTab === 'sections' && (
          <div className="bg-white rounded-3xl shadow-xl border border-amber-100 p-8">
            <h2 className="text-2xl font-bold text-amber-900 mb-6">Page Sections</h2>
            <div className="space-y-4">
              {sections.map((section) => (
                <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{section.title}</h3>
                      <p className="text-sm text-gray-600">{section.content}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSections((prev) =>
                            prev.map((s) =>
                              s.id === section.id ? { ...s, active: !s.active } : s,
                            ),
                          );
                        }}
                        className={`px-3 py-1 rounded text-sm ${
                          section.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {section.active ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preview Tab */}
        {activeTab === 'preview' && (
          <div className="bg-white rounded-3xl shadow-xl border border-amber-100 p-8">
            <h2 className="text-2xl font-bold text-amber-900 mb-6">Live Preview</h2>
            <div className="bg-gray-100 rounded-2xl p-6">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-500">Preview will be available here</p>
                <a
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 bg-amber-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-amber-700 transition-colors"
                >
                  View Live Site
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Save All Button */}
        <div className="mt-8 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            <p>
              💡 Tip: Changes are saved to the database and immediately reflected on your live
              website.
            </p>
            <p>🔄 Use the refresh button above to reload data from the server.</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={async () => {
                await Promise.all([fetchGemstones(), fetchHomepageData()]);
              }}
              className="bg-gray-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-600 transition-all"
            >
              📊 Check Current Data
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-amber-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-amber-700 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <span>💾</span>
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default HomepageAdmin;

// Enhanced SortableProductCard Component
const SortableProductCard = ({ gem, isFeatured, onToggleFeatured, isDragging }: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isItemDragging,
  } = useSortable({ id: gem.id });

  const [isToggling, setIsToggling] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isItemDragging ? 0.5 : 1,
  };

  // Parse images from JSON string if needed
  const images = typeof gem.images === 'string' ? JSON.parse(gem.images) : gem.images || [];
  const mainImage = images[0] || '/images/placeholder-gemstone.jpg';

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    console.log('🎯 Toggle button clicked for gem ID:', gem.id);
    console.log('🎯 Current featured status:', isFeatured);
    console.log('🎯 Is toggling:', isToggling);

    if (isToggling) {
      console.log('⚠️ Already toggling, ignoring click');
      return;
    }

    console.log('🎯 Starting toggle process...');
    setIsToggling(true);

    try {
      console.log('🎯 Calling onToggleFeatured...');
      await onToggleFeatured(gem.id);
      console.log('🎯 Toggle completed successfully');
    } catch (error) {
      console.error('🎯 Toggle failed:', error);
    } finally {
      console.log('🎯 Setting isToggling to false');
      setIsToggling(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative border-2 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-all duration-200 ${
        isFeatured ? 'border-amber-500 bg-amber-50' : 'border-gray-200'
      } ${isItemDragging ? 'shadow-2xl scale-105' : ''}`}
    >
      {/* Drag Handle - Only this area is draggable */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center cursor-move hover:bg-gray-200 transition-colors z-10"
        style={{ pointerEvents: 'auto' }}
      >
        <span className="text-xs text-gray-600">↕</span>
      </div>
      {/* Product Image */}
      <div className="relative aspect-square mb-3 rounded-lg overflow-hidden">
        <img src={mainImage} alt={gem.name} className="w-full h-full object-cover" />
        {isToggling && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900 text-sm truncate">{gem.name}</h3>
        <p className="text-gray-600 text-xs truncate">{gem.type}</p>
        <p className="text-amber-600 font-bold text-sm">₹{gem.price.toLocaleString('en-IN')}</p>
      </div>

      {/* Featured Toggle Button - FIXED FOR REAL USAGE */}
      <button
        className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed z-50 ${
          isFeatured
            ? 'bg-amber-500 text-white shadow-md hover:bg-amber-600'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        onClick={handleToggle}
        disabled={isToggling}
        type="button"
        style={{
          pointerEvents: 'auto',
          position: 'absolute',
          zIndex: 9999,
          cursor: 'pointer',
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onMouseUp={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onTouchEnd={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onPointerUp={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
      >
        {isToggling ? (
          <span className="flex items-center gap-1">
            <span className="animate-spin">⏳</span>
            <span>{isFeatured ? 'Unfeaturing...' : 'Featuring...'}</span>
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <span>{isFeatured ? '⭐' : '☆'}</span>
            <span>{isFeatured ? 'Featured' : 'Set Featured'}</span>
          </span>
        )}
      </button>

      {/* Featured Indicator */}
      {isFeatured && (
        <div className="absolute bottom-2 right-2">
          <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 text-xs border border-amber-200">
            ↕
          </div>
        </div>
      )}
    </div>
  );
};
