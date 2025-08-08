import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Eye, ShoppingCart, Star, TrendingUp, Sparkles, Clock, Fire } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  category: string;
  discount?: number;
  isNew?: boolean;
  isTrending?: boolean;
  isLimited?: boolean;
  views?: number;
  soldCount?: number;
}

interface SmartRecommendationsProps {
  userId?: number;
  currentProductId?: number;
  userPreferences?: string[];
  recentlyViewed?: number[];
}

const SmartRecommendations: React.FC<SmartRecommendationsProps> = ({
  userId,
  currentProductId,
  userPreferences = [],
  recentlyViewed = [],
}) => {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'personalized' | 'trending' | 'new' | 'similar'>(
    'personalized',
  );
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());

  // Mock data - in real app, this would come from AI/ML API
  const mockProducts: Product[] = [
    {
      id: 1,
      name: 'Natural Ruby Stone',
      price: 25000,
      originalPrice: 30000,
      image: '/images/ruby1.jpg',
      rating: 4.8,
      reviewCount: 124,
      category: 'Ruby',
      discount: 17,
      isNew: true,
      views: 1250,
      soldCount: 45,
    },
    {
      id: 2,
      name: 'Emerald Gemstone',
      price: 35000,
      originalPrice: 42000,
      image: '/images/emerald1.jpg',
      rating: 4.6,
      reviewCount: 89,
      category: 'Emerald',
      discount: 17,
      isTrending: true,
      views: 2100,
      soldCount: 67,
    },
    {
      id: 3,
      name: 'Sapphire Ring',
      price: 45000,
      image: '/images/sapphire1.jpg',
      rating: 4.9,
      reviewCount: 156,
      category: 'Sapphire',
      isLimited: true,
      views: 890,
      soldCount: 23,
    },
    {
      id: 4,
      name: 'Diamond Pendant',
      price: 75000,
      originalPrice: 90000,
      image: '/images/diamond1.jpg',
      rating: 4.7,
      reviewCount: 203,
      category: 'Diamond',
      discount: 17,
      isTrending: true,
      views: 3400,
      soldCount: 89,
    },
    {
      id: 5,
      name: 'Pearl Necklace',
      price: 18000,
      image: '/images/pearl1.jpg',
      rating: 4.5,
      reviewCount: 67,
      category: 'Pearl',
      isNew: true,
      views: 650,
      soldCount: 34,
    },
    {
      id: 6,
      name: 'Opal Stone',
      price: 28000,
      originalPrice: 35000,
      image: '/images/opal1.jpg',
      rating: 4.4,
      reviewCount: 45,
      category: 'Opal',
      discount: 20,
      isLimited: true,
      views: 420,
      soldCount: 12,
    },
  ];

  useEffect(() => {
    // Simulate API call
    const loadRecommendations = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Filter based on active tab
      let filtered = [...mockProducts];

      switch (activeTab) {
        case 'personalized':
          filtered = mockProducts.filter((p) => p.isTrending || p.rating > 4.5);
          break;
        case 'trending':
          filtered = mockProducts.filter((p) => p.isTrending);
          break;
        case 'new':
          filtered = mockProducts.filter((p) => p.isNew);
          break;
        case 'similar':
          filtered = mockProducts.filter((p) => p.category === 'Ruby' || p.category === 'Emerald');
          break;
      }

      setRecommendations(filtered);
      setLoading(false);
    };

    loadRecommendations();
  }, [activeTab]);

  const handleWishlistToggle = (productId: number) => {
    setWishlist((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const getRecommendationReason = (product: Product) => {
    if (product.isNew) return 'New Arrival';
    if (product.isTrending) return 'Trending Now';
    if (product.isLimited) return 'Limited Stock';
    if (product.discount) return `${product.discount}% Off`;
    if (product.rating > 4.7) return 'Highly Rated';
    return 'Recommended';
  };

  const tabs = [
    { key: 'personalized', label: 'For You', icon: Sparkles },
    { key: 'trending', label: 'Trending', icon: TrendingUp },
    { key: 'new', label: 'New Arrivals', icon: Clock },
    { key: 'similar', label: 'Similar Items', icon: Eye },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Smart Recommendations</h3>
          <p className="text-gray-600 mt-1">Curated just for you</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm text-gray-500">Live updates</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-xl p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-white text-amber-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="wait">
          {loading
            ? // Loading skeleton
              Array.from({ length: 6 }).map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-gray-100 rounded-xl h-80 animate-pulse"
                />
              ))
            : recommendations.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative bg-white rounded-xl border border-gray-200 hover:border-amber-300 hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col space-y-2">
                      {product.isNew && (
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          NEW
                        </span>
                      )}
                      {product.isTrending && (
                        <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center">
                          <Fire className="w-3 h-3 mr-1" />
                          TRENDING
                        </span>
                      )}
                      {product.isLimited && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          LIMITED
                        </span>
                      )}
                      {product.discount && (
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          -{product.discount}%
                        </span>
                      )}
                    </div>

                    {/* Wishlist Button */}
                    <button
                      onClick={() => handleWishlistToggle(product.id)}
                      className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          wishlist.has(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'
                        }`}
                      />
                    </button>

                    {/* Quick View */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                        Quick View
                      </button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500 font-medium">{product.category}</span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600">{product.rating}</span>
                        <span className="text-xs text-gray-400">({product.reviewCount})</span>
                      </div>
                    </div>

                    <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h4>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {product.originalPrice && (
                          <span className="text-sm text-gray-400 line-through">
                            ₹{product.originalPrice.toLocaleString()}
                          </span>
                        )}
                        <span className="text-lg font-bold text-gray-900">
                          ₹{product.price.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Social Proof */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{product.views} views</span>
                      <span>{product.soldCount} sold</span>
                    </div>

                    {/* Add to Cart */}
                    <button className="w-full mt-3 bg-amber-600 text-white py-2 rounded-lg font-medium hover:bg-amber-700 transition-colors flex items-center justify-center space-x-2">
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </button>
                  </div>

                  {/* Recommendation Reason */}
                  <div className="absolute bottom-2 left-2">
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                      {getRecommendationReason(product)}
                    </span>
                  </div>
                </motion.div>
              ))}
        </AnimatePresence>
      </div>

      {/* View All Button */}
      <div className="text-center mt-8">
        <Link
          href="/shop"
          className="inline-flex items-center space-x-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
        >
          <span>View All Recommendations</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default SmartRecommendations;
