'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';
import HomepageEditor from '../../components/admin/HomepageEditor';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]';

interface HomepageData {
  id?: number;
  banners: any[];
  featuredProducts: number[];
  promotionalSections: any[];
  contentBlocks: any[];
  seo: any;
}

export default function HomepageAdmin() {
  const router = useRouter();
  const [homepageData, setHomepageData] = useState<HomepageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch homepage data on component mount
  useEffect(() => {
    async function fetchHomepageData() {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/homepage');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch homepage data');
        }
        const data = await response.json();
        setHomepageData(data);
      } catch (error: any) {
        console.error('Error fetching homepage data:', error);
        toast.error(error.message || 'Failed to load homepage data');
        setError(error.message || 'Failed to load homepage data');
      } finally {
        setLoading(false);
      }
    }

    fetchHomepageData();
  }, []);

  // Handle save button click
  const handleSave = async () => {
    if (!homepageData) return;
    
    setSaving(true);
    try {
      const response = await fetch('/api/admin/homepage', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(homepageData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save homepage');
      }

      // Force invalidate all cache to ensure changes are reflected immediately
      await fetch('/api/admin/cache/invalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceAll: true })
      }).catch(err => console.warn('Cache invalidation warning:', err));

      toast.success('Homepage saved successfully!');
    } catch (error: any) {
      console.error('Error saving homepage:', error);
      toast.error(error.message || 'Failed to save homepage');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="max-w-7xl mx-auto py-12 px-4">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="max-w-7xl mx-auto py-12 px-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="text-red-800 font-bold mb-2">Error</div>
            <div className="text-red-700 mb-4">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
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
                Customize your homepage content, banners, featured products, and SEO settings
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.back()}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-xl font-semibold hover:bg-gray-300 transition-colors flex items-center gap-2"
              >
                <span>←</span>
                <span>Back</span>
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-md"
              >
                {saving ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>💾</span>
                    <span>Save Homepage</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Homepage Editor */}
        <div className="bg-white rounded-3xl shadow-xl border border-amber-100 p-8">
          {homepageData && (
            <HomepageEditor
              initialContent={homepageData}
              onChange={(updatedContent) => setHomepageData({ ...homepageData, ...updatedContent })}
              seo={homepageData.seo}
              onSeoChange={(updatedSeo) => setHomepageData({ 
                ...homepageData, 
                seo: { 
                  ...homepageData.seo, 
                  ...updatedSeo 
                } 
              })}
              onSave={handleSave}
            />
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

// Server-side authentication
export async function getServerSideProps(ctx: any) {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  
  if (!session || session.user.role !== 'admin') {
    return {
      redirect: {
        destination: '/admin/login',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};