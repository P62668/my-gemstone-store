import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface FeaturedProduct {
  id: number;
  name: string;
  price: number;
  images: string[];
  featured: boolean;
  description: string;
}

const TestFeaturedDisplay: React.FC = () => {
  const [products, setProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('🔍 Fetching featured products...');
        const res = await fetch('/api/gemstones?featured=true');
        console.log('📡 Response status:', res.status);

        if (!res.ok) {
          throw new Error(`Failed to fetch featured products: ${res.status}`);
        }

        const data = await res.json();
        console.log('✅ Featured products fetched:', data);
        setProducts(data);
      } catch (err: any) {
        console.error('❌ Error fetching featured products:', err);
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading featured products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-xl">⚠️</span>
          </div>
          <p className="text-red-600 font-semibold">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-amber-100 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-amber-900 mb-2">🧪 Featured Products Test</h1>
            <p className="text-gray-600">
              Testing if featured products are being fetched and displayed correctly
            </p>
          </div>

          <div className="mb-6">
            <div className="bg-blue-100 p-4 rounded-xl">
              <h3 className="font-semibold text-blue-900 mb-2">API Test Results:</h3>
              <p className="text-blue-700">
                <strong>Total Featured Products:</strong> {products.length}
              </p>
              <p className="text-blue-700">
                <strong>API Endpoint:</strong> /api/gemstones?featured=true
              </p>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="bg-yellow-100 p-6 rounded-xl">
              <h3 className="font-semibold text-yellow-900 mb-2">⚠️ No Featured Products Found</h3>
              <p className="text-yellow-700">
                There are no products marked as featured in the database. Go to the admin panel and
                feature some products first.
              </p>
            </div>
          ) : (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Featured Products ({products.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="border-2 border-amber-500 rounded-xl p-4 bg-amber-50 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {/* Product Image */}
                    <div className="relative aspect-square mb-3 rounded-lg overflow-hidden">
                      <img
                        src={
                          product.images && product.images.length > 0
                            ? product.images[0]
                            : '/images/placeholder-gemstone.jpg'
                        }
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 text-xs border border-amber-200">
                          ⭐
                        </div>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">
                        {product.name}
                      </h3>
                      <p className="text-amber-600 font-bold text-sm">
                        ₹{product.price.toLocaleString('en-IN')}
                      </p>
                      <p className="text-gray-600 text-xs truncate">{product.description}</p>
                    </div>

                    {/* Featured Status */}
                    <div className="mt-2">
                      <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        ✅ Featured
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 p-4 bg-gray-100 rounded-xl">
            <h3 className="font-semibold text-gray-900 mb-2">Test Instructions:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>If you see products above, the featured functionality is working</li>
              <li>If you see "No Featured Products", go to admin and feature some products</li>
              <li>Check the browser console (F12) for detailed API logs</li>
              <li>
                Go to{' '}
                <Link href="/" className="text-blue-600 underline">
                  homepage
                </Link>{' '}
                to see the real featured carousel
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestFeaturedDisplay;
