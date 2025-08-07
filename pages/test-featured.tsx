import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const TestFeaturedPage: React.FC = () => {
  const [gemstones, setGemstones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGemstones();
  }, []);

  const fetchGemstones = async () => {
    try {
      const response = await fetch('/api/admin/gemstones', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setGemstones(data);
      } else {
        toast.error('Failed to fetch gemstones');
      }
    } catch (error) {
      toast.error('Error fetching gemstones');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeatured = async (id: number) => {
    try {
      console.log('🔄 Toggle featured called for ID:', id);

      const response = await fetch('/api/admin/gemstones/featured', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'toggle',
          productId: id,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Toggle successful:', result.message);
        toast.success(result.message);
        await fetchGemstones(); // Refresh data
      } else {
        const errorText = await response.text();
        console.error('❌ Toggle failed:', errorText);
        toast.error(`Toggle failed: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Toggle error:', error);
      toast.error('Failed to toggle featured status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading gemstones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-amber-100 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-amber-900 mb-2">
              🧪 Featured Functionality Test
            </h1>
            <p className="text-gray-600">Simple test page to verify featured product toggling</p>
          </div>

          <div className="mb-6">
            <button
              onClick={fetchGemstones}
              className="bg-amber-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-amber-600 transition-colors"
            >
              🔄 Refresh Data
            </button>
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
                </div>

                {/* Product Info */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">{gem.name}</h3>
                  <p className="text-gray-600 text-xs truncate">{gem.type}</p>
                  <p className="text-amber-600 font-bold text-sm">
                    ₹{gem.price.toLocaleString('en-IN')}
                  </p>
                </div>

                {/* Featured Toggle Button */}
                <button
                  className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 hover:scale-105 ${
                    gem.featured
                      ? 'bg-amber-500 text-white shadow-md hover:bg-amber-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  onClick={() => handleToggleFeatured(gem.id)}
                  type="button"
                >
                  <span className="flex items-center gap-1">
                    <span>{gem.featured ? '⭐' : '☆'}</span>
                    <span>{gem.featured ? 'Featured' : 'Set Featured'}</span>
                  </span>
                </button>

                {/* Featured Indicator */}
                {gem.featured && (
                  <div className="absolute bottom-2 right-2">
                    <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 text-xs border border-amber-200">
                      ↕
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-gray-100 rounded-xl">
            <h3 className="font-semibold text-gray-900 mb-2">Test Instructions:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>Click any "Set Featured" or "⭐ Featured" button</li>
              <li>Check the browser console for detailed logs</li>
              <li>Verify the button text and styling changes</li>
              <li>Click "Refresh Data" to reload from server</li>
              <li>Check that the featured status persists</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestFeaturedPage;
