import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';

const SimpleFeaturedPage: React.FC = () => {
  const [gemstones, setGemstones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    fetchGemstones();
  }, []);

  const fetchGemstones = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/gemstones', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setGemstones(data);
        console.log('✅ Fetched gemstones:', data.length);
      } else {
        toast.error('Failed to fetch gemstones');
      }
    } catch (error) {
      toast.error('Error fetching gemstones');
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (gemstoneId: number) => {
    try {
      setUpdating(gemstoneId);
      console.log('🔄 Toggling featured for ID:', gemstoneId);

      const response = await fetch('/api/admin/gemstones/featured', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'toggle',
          productId: gemstoneId,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Toggle successful:', result.message);
        toast.success(result.message);

        // Refresh the data
        await fetchGemstones();
      } else {
        const errorText = await response.text();
        console.error('❌ Toggle failed:', errorText);
        toast.error(`Failed to toggle: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Toggle error:', error);
      toast.error('Failed to toggle featured status');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading gemstones...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl border border-amber-100 p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-amber-900 mb-2">
                🎯 Simple Featured Management
              </h1>
              <p className="text-gray-600">
                Click any button to feature/unfeature products. Super simple!
              </p>
            </div>

            <div className="mb-6 flex gap-4">
              <button
                onClick={fetchGemstones}
                className="bg-amber-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-amber-600 transition-colors"
              >
                🔄 Refresh Data
              </button>

              <div className="bg-gray-100 px-4 py-2 rounded-xl">
                <span className="font-semibold text-gray-700">
                  {gemstones.filter((g) => g.featured).length} Featured of {gemstones.length} Total
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {gemstones.map((gem) => (
                <div
                  key={gem.id}
                  className={`relative border-2 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-all duration-200 ${
                    gem.featured ? 'border-amber-500 bg-amber-50' : 'border-gray-200'
                  }`}
                >
                  {/* Product Image */}
                  <div className="relative aspect-square mb-3 rounded-lg overflow-hidden">
                    <img
                      src={
                        gem.images
                          ? (typeof gem.images === 'string'
                              ? JSON.parse(gem.images)[0]
                              : gem.images[0]) || '/images/placeholder-gemstone.jpg'
                          : '/images/placeholder-gemstone.jpg'
                      }
                      alt={gem.name}
                      className="w-full h-full object-cover"
                    />
                    {updating === gem.id && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">{gem.name}</h3>
                    <p className="text-gray-600 text-xs truncate">{gem.type}</p>
                    <p className="text-amber-600 font-bold text-sm">
                      ₹{gem.price.toLocaleString('en-IN')}
                    </p>
                  </div>

                  {/* BIG SIMPLE BUTTON */}
                  <button
                    className={`w-full mt-3 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 hover:scale-105 ${
                      gem.featured
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    } ${updating === gem.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => toggleFeatured(gem.id)}
                    disabled={updating === gem.id}
                    type="button"
                  >
                    {updating === gem.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin">⏳</span>
                        <span>Updating...</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <span>{gem.featured ? '❌' : '✅'}</span>
                        <span>{gem.featured ? 'Remove Featured' : 'Make Featured'}</span>
                      </span>
                    )}
                  </button>

                  {/* Featured Status */}
                  {gem.featured && (
                    <div className="absolute top-2 left-2">
                      <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 text-xs border border-amber-200">
                        ⭐
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-blue-100 rounded-xl">
              <h3 className="font-semibold text-blue-900 mb-2">How to Use:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
                <li>Click any "Make Featured" button to feature a product</li>
                <li>Click any "Remove Featured" button to unfeature a product</li>
                <li>Wait for the success message</li>
                <li>Check the homepage to see your featured products</li>
              </ol>
            </div>

            <div className="mt-4 p-4 bg-green-100 rounded-xl">
              <h3 className="font-semibold text-green-900 mb-2">✅ This WILL Work:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-green-700">
                <li>Big, clear buttons that are easy to click</li>
                <li>Visual feedback when updating</li>
                <li>Success/error messages</li>
                <li>Automatic data refresh</li>
                <li>Simple, no complex UI</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SimpleFeaturedPage;
