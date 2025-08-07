import React from 'react';
import Layout from '../components/Layout';
import AccessibleProductCard from '../components/ui/AccessibleProductCard';
import { sampleGemstones } from '../utils/sample-data';
import { AccessibilityProvider } from '../components/ui/AccessibilityProvider';

const AnimationDemo: React.FC = () => {
  const handleAddToCart = (productId: string) => {
    console.log('Added to cart:', productId);
  };

  const handleQuickView = (productId: string) => {
    console.log('Quick view:', productId);
  };

  const handleWishlist = (productId: string) => {
    console.log('Wishlist:', productId);
  };

  return (
    <AccessibilityProvider>
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 text-white py-16">
            <div className="container mx-auto px-4">
              <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 animate-fade-in-up">
                Luxury Animation Showcase
              </h1>
              <p className="text-xl text-center text-blue-100 max-w-2xl mx-auto animate-fade-in-up">
                Experience the subtle elegance of our fade-in and scale-up animations
              </p>
            </div>
          </div>

          {/* Animation Explanation */}
          <div className="py-12 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center animate-fade-in-up">
                  Animation Features
                </h2>

                <div className="grid md:grid-cols-2 gap-8 mb-12">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-lg animate-fade-in-up">
                    <h3 className="text-xl font-semibold text-blue-900 mb-3">Fade-In Effects</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Smooth opacity transitions on hover</li>
                      <li>• Gradient overlays with backdrop blur</li>
                      <li>• Staggered animation timing</li>
                      <li>• Elegant ease-out curves</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl shadow-lg animate-fade-in-up">
                    <h3 className="text-xl font-semibold text-purple-900 mb-3">Scale-Up Effects</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Subtle 2% card scale on hover</li>
                      <li>• 10% image scale with brightness</li>
                      <li>• Micro-interactions on elements</li>
                      <li>• Smooth shadow transitions</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center animate-fade-in-up">
                Hover to Experience the Magic
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {sampleGemstones.map((gemstone, index) => (
                  <div
                    key={gemstone.id}
                    className="animate-fade-in-scale"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <AccessibleProductCard
                      product={{
                        id: gemstone.id,
                        name: gemstone.name,
                        type: gemstone.type,
                        price: gemstone.price,
                        originalPrice: gemstone.originalPrice,
                        image: gemstone.image,
                        rating: gemstone.rating,
                        reviewCount: gemstone.reviewCount,
                        certification: gemstone.certification,
                        inStock: gemstone.inStock,
                        stockCount: gemstone.stockCount,
                      }}
                      onAddToCart={handleAddToCart}
                      onQuickView={handleQuickView}
                      onWishlist={handleWishlist}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Animation Details */}
          <div className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center animate-fade-in-up">
                  Technical Implementation
                </h2>

                <div className="bg-gray-900 text-green-400 p-6 rounded-2xl font-mono text-sm overflow-x-auto">
                  <pre>{`// Tailwind CSS Classes Used:

// Card Container
animate-fade-in-scale          // Initial animation
hover:scale-[1.02]            // 2% scale on hover
hover:-translate-y-1          // Slight upward movement
transition-all duration-500   // Smooth transitions

// Image
group-hover:scale-110         // 10% image scale
group-hover:brightness-110    // Brightness increase
transition-all duration-500   // Smooth transitions

// Overlay
bg-gradient-to-t from-black/30  // Gradient overlay
backdrop-blur-sm               // Background blur
animate-fade-in-up            // Staggered animation

// Interactive Elements
hover:scale-110               // Button scale
hover:scale-105               // Badge scale
transition-all duration-300   // Micro-interactions`}</pre>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Notes */}
          <div className="py-12 bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl mx-auto text-center">
                <h3 className="text-2xl font-bold text-green-900 mb-4 animate-fade-in-up">
                  Performance Optimized
                </h3>
                <p className="text-green-800 animate-fade-in-up">
                  All animations use CSS transforms and opacity for optimal performance.
                  GPU-accelerated transitions ensure smooth 60fps animations on all devices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </AccessibilityProvider>
  );
};

export default AnimationDemo;
