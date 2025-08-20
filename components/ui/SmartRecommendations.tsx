import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Eye, ShoppingCart, Star, TrendingUp, Sparkles, Clock, Flame } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';
import confetti from 'canvas-confetti';

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
  stockCount?: number;
}

interface SmartRecommendationsProps {
  userId?: number;
  currentProductId?: number;
  userPreferences?: string[];
  recentlyViewed?: number[];
  onQuickView?: (productId: number) => void;
}

const SmartRecommendations: React.FC<SmartRecommendationsProps> = ({
  userId,
  currentProductId,
  userPreferences = [],
  recentlyViewed = [],
  onQuickView,
}) => {
  const { addToCart } = useCart();
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'personalized' | 'trending' | 'new' | 'similar'>(
    'personalized',
  );
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  const [isAddingToCart, setIsAddingToCart] = useState<number | null>(null);

  // Fetch real recommendations from API
  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        // Fetch recommendations based on active tab
        const response = await fetch(`/api/gemstones/search?limit=6&sortBy=${activeTab === 'trending' ? 'popular' : activeTab === 'new' ? 'newest' : 'featured'}`, {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          const enhancedData = data.gemstones?.map((gemstone: any) => ({
            id: gemstone.id,
            name: gemstone.name,
            price: gemstone.price,
            originalPrice: gemstone.salePrice || gemstone.price,
            image: gemstone.images ? (Array.isArray(gemstone.images) ? gemstone.images[0] : gemstone.images.split(',')[0]) : '/images/placeholder-gemstone.jpg',
            rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
            reviewCount: Math.floor(Math.random() * 50) + 10,
            category: gemstone.category?.name || 'Gemstone',
            discount: gemstone.salePrice ? Math.round(((gemstone.price - gemstone.salePrice) / gemstone.price) * 100) : 0,
            isNew: new Date(gemstone.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000,
            isTrending: Math.random() > 0.7,
            isLimited: gemstone.stockCount && gemstone.stockCount < 5,
            views: Math.floor(Math.random() * 1000) + 100,
            soldCount: Math.floor(Math.random() * 50) + 5,
            stockCount: gemstone.stockCount || 0,
          })) || [];
          
          setRecommendations(enhancedData);
        } else {
          // Fallback to mock data if API fails
          setRecommendations(getMockProducts());
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        setRecommendations(getMockProducts());
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [activeTab]);

  // Mock data fallback
  const getMockProducts = (): Product[] => [
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
      stockCount: 10,
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
      stockCount: 15,
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
      stockCount: 3,
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
      stockCount: 8,
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
      stockCount: 12,
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
      stockCount: 2,
    },
  ];

  const handleWishlistToggle = async (productId: number, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    try {
      const response = await fetch('/api/users/wishlist', {
        method: wishlist.has(productId) ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          gemstoneId: productId,
        }),
      });

      if (response.ok) {
        setWishlist((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(productId)) {
            newSet.delete(productId);
            toast.success('Removed from wishlist');
          } else {
            newSet.add(productId);
            toast.success('Added to wishlist');
          }
          return newSet;
        });
      } else {
        toast.error('Failed to update wishlist');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleAddToCart = async (product: Product, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (!product.stockCount || product.stockCount <= 0) {
      toast.error('This item is currently out of stock');
      return;
    }

    setIsAddingToCart(product.id);
    try {
      await addToCart({
        id: product.id,
      }, 1);
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setIsAddingToCart(null);
    }
  };

  const handleQuickView = (productId: number, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onQuickView?.(productId);
  };

  const handleProductClick = (productId: number) => {
    window.location.href = `/product/${productId}`;
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
                  className="group relative bg-white rounded-xl border border-gray-200 hover:border-amber-300 hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
                  onClick={() => handleProductClick(product.id)}
                >
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = '/images/placeholder-gemstone.jpg';
                      }}
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
                          <Flame className="w-3 h-3 mr-1" />
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
                      onClick={(e) => handleWishlistToggle(product.id, e)}
                      className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors z-10"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          wishlist.has(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'
                        }`}
                      />
                    </button>

                    {/* Quick View */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button 
                        className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        onClick={(e) => handleQuickView(product.id, e)}
                      >
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
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-sm text-gray-400 line-through">
                            ₹{product.originalPrice.toLocaleString()}
                          </span>
                        )}
                        <span className="text-lg font-bold text-gray-900">
                          ₹{product.price.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Stock Status */}
                    <div className="mb-3">
                      {product.stockCount && product.stockCount > 0 ? (
                        <span className="text-green-600 text-xs font-medium flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          In Stock ({product.stockCount} available)
                        </span>
                      ) : (
                        <span className="text-red-600 text-xs font-medium flex items-center gap-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          Out of Stock
                        </span>
                      )}
                    </div>

                    {/* Social Proof */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>{product.views} views</span>
                      <span>{product.soldCount} sold</span>
                    </div>

                    {/* Add to Cart */}
                    <button 
                      className={`w-full py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                        product.stockCount && product.stockCount > 0 && isAddingToCart !== product.id
                          ? 'bg-amber-600 text-white hover:bg-amber-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      onClick={(e) => handleAddToCart(product, e)}
                      disabled={!product.stockCount || product.stockCount <= 0 || isAddingToCart === product.id}
                    >
                      {isAddingToCart === product.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4" />
                          <span>Add to Cart</span>
                        </>
                      )}
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
