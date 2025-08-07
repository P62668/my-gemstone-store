import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { ProductCardSkeleton, ProductGridSkeleton, ProductDetailSkeleton } from '../components/ui';

const SkeletonDemo: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for demo purposes
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Layout title="Skeleton Loading Demo - Kolkata Gems">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
            Loading Skeleton Demo
          </h1>

          <div className="space-y-16">
            {/* Product Grid Skeletons */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Product Grid Skeletons</h2>

              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-4">Default Grid (8 items)</h3>
                  <ProductGridSkeleton count={8} variant="default" />
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-4">
                    Compact Grid (12 items)
                  </h3>
                  <ProductGridSkeleton count={12} variant="compact" />
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-4">
                    Featured Grid (4 items)
                  </h3>
                  <ProductGridSkeleton count={4} variant="featured" />
                </div>
              </div>
            </section>

            {/* Individual Card Skeletons */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Individual Card Skeletons
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-4">Default Variant</h3>
                  <ProductCardSkeleton variant="default" />
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-4">Compact Variant</h3>
                  <ProductCardSkeleton variant="compact" />
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-4">Featured Variant</h3>
                  <ProductCardSkeleton variant="featured" />
                </div>
              </div>
            </section>

            {/* Product Detail Skeleton */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Product Detail Skeleton</h2>
              <ProductDetailSkeleton />
            </section>

            {/* Loading State Demo */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Loading State Demo</h2>

              <div className="text-center space-y-4">
                <button
                  onClick={() => setLoading(!loading)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {loading ? 'Stop Loading' : 'Start Loading'}
                </button>

                <div className="mt-8">
                  {loading ? (
                    <ProductGridSkeleton count={6} variant="default" />
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl shadow-lg p-6 text-center">
                          <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <span className="text-2xl">✨</span>
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-2">
                            Loaded Product {i + 1}
                          </h3>
                          <p className="text-gray-600">Content has loaded successfully!</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SkeletonDemo;
