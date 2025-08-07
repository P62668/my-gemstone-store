import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Layout from '../components/Layout';
import { useCart } from '../components/context/CartContext';
import type { Gemstone as DatabaseGemstone } from '../interfaces';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import confetti from 'canvas-confetti';
import Head from 'next/head';
import EnhancedProductCard from '../components/ui/EnhancedProductCard';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface Category {
  id: number;
  name: string;
  description?: string;
}

type Gemstone = DatabaseGemstone & {
  category?: Category;
  rating?: number;
  reviewCount?: number;
  stockCount?: number;
  discount?: number;
  flashSale?: boolean;
  views?: number;
  soldCount?: number;
};

const ShopPage: React.FC = () => {
  const { addToCart } = useCart();
  const router = useRouter();

  // State management
  const [gemstones, setGemstones] = useState<Gemstone[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters and search
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [sortBy, setSortBy] = useState('name');
  const [availability, setAvailability] = useState<'all' | 'inStock' | 'outOfStock'>('all');
  const [rating, setRating] = useState<number | ''>('');
  const [discount, setDiscount] = useState(false);

  // UI state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Addictive features
  const [viewersCount, setViewersCount] = useState(0);
  const [socialProof, setSocialProof] = useState<{ name: string; action: string; time: string }[]>(
    [],
  );
  const [flashSaleProducts, setFlashSaleProducts] = useState<Gemstone[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Gemstone[]>([]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<Gemstone[]>([]);

  // Simulate live viewers
  useEffect(() => {
    const interval = setInterval(() => {
      setViewersCount((prev) => {
        const change = Math.floor(Math.random() * 5) - 2;
        return Math.max(15, Math.min(35, prev + change));
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Social proof simulation
  useEffect(() => {
    const names = ['Sarah', 'Mike', 'Emma', 'David', 'Lisa', 'John', 'Anna', 'Tom'];
    const actions = ['purchased', 'added to cart', 'viewed', 'wishlisted'];

    const interval = setInterval(() => {
      const newActivity = {
        name: names[Math.floor(Math.random() * names.length)],
        action: actions[Math.floor(Math.random() * actions.length)],
        time: 'just now',
      };

      setSocialProof((prev) => [newActivity, ...prev.slice(0, 3)]);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // Show mobile filters on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth <= 768) {
        setShowMobileFilters(window.scrollY > 200);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch data
  const fetchGemstones = useCallback(async () => {
    try {
      const response = await fetch('/api/gemstones', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch gemstones');
      }

      const data = await response.json();

      // Add simulated data for better UX
      const enhancedData = data.map((gemstone: Gemstone) => ({
        ...gemstone,
        rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
        reviewCount: Math.floor(Math.random() * 50) + 10,
        stockCount: Math.floor(Math.random() * 20) + 5,
        discount: Math.random() > 0.7 ? Math.floor(Math.random() * 30) + 10 : 0,
        flashSale: Math.random() > 0.8,
        views: Math.floor(Math.random() * 1000) + 100,
        soldCount: Math.floor(Math.random() * 50) + 5,
      }));

      setGemstones(enhancedData);
      setFlashSaleProducts(enhancedData.filter((g: Gemstone) => g.flashSale));
      setTrendingProducts(enhancedData.slice(0, 4));
    } catch (error) {
      console.error('Error fetching gemstones:', error);
      toast.error('Failed to load products');
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/categories', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  // Load data
  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchGemstones(), fetchCategories()]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Price statistics
  const priceStats = useMemo(() => {
    if (gemstones.length === 0) return { min: 1000, max: 100000 };

    const prices = gemstones.map((g) => g.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);

    return {
      min: Math.max(1000, min), // Ensure minimum is at least 1000
      max: Math.max(max, min + 1000), // Ensure max is greater than min
    };
  }, [gemstones]);

  // Initialize price range with safe values
  useEffect(() => {
    if (priceStats.min > 0 && priceStats.max > priceStats.min) {
      setPriceRange([priceStats.min, priceStats.max]);
    }
  }, [priceStats]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let filtered = gemstones.filter((gemstone) => {
      const matchesCategory = !selectedCategory || gemstone.categoryId === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        gemstone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gemstone.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = gemstone.price >= priceRange[0] && gemstone.price <= priceRange[1];
      const matchesAvailability =
        availability === 'all' ||
        (availability === 'inStock' && gemstone.stockCount && gemstone.stockCount > 0) ||
        (availability === 'outOfStock' && gemstone.stockCount === 0);
      const matchesRating = !rating || (gemstone.rating && gemstone.rating >= rating);
      const matchesDiscount = !discount || (gemstone.discount && gemstone.discount > 0);

      return (
        matchesCategory &&
        matchesSearch &&
        matchesPrice &&
        matchesAvailability &&
        matchesRating &&
        matchesDiscount
      );
    });

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'featured':
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
      case 'popular':
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }, [
    gemstones,
    selectedCategory,
    searchQuery,
    priceRange,
    sortBy,
    availability,
    rating,
    discount,
  ]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setSelectedCategory('');
    setSearchQuery('');
    setPriceRange([priceStats.min, priceStats.max]);
    setSortBy('name');
    setAvailability('all');
    setRating('');
    setDiscount(false);
  }, [priceStats]);

  // Wishlist functions
  const toggleWishlist = useCallback((productId: number) => {
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
  }, []);

  // Add to cart with enhanced UX
  const handleAddToCart = useCallback(
    async (product: Gemstone, quantity: number = 1) => {
      setIsAddingToCart(true);
      try {
        await addToCart(product, quantity);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        toast.success(`${product.name} added to cart!`);
      } catch (error) {
        toast.error('Failed to add to cart');
      } finally {
        setIsAddingToCart(false);
      }
    },
    [addToCart],
  );

  // Handle product card click
  const handleProductClick = useCallback(
    (productId: number) => {
      router.push(`/product/${productId}`);
    },
    [router],
  );

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-8" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-3xl shadow-lg p-6 animate-pulse">
                    <div className="aspect-square bg-gray-200 rounded-xl mb-4" />
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-6 bg-gray-200 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>Shop Gemstones | Shankarmala</title>
        <meta
          name="description"
          content="Discover our exclusive collection of fine gemstones. Browse by category, filter by price, and find your perfect piece."
        />
      </Head>
      <Layout>
        <div className="min-h-screen bg-gray-50">
          {/* Desktop Layout with Left Sidebar */}
          <div className="flex">
            {/* Left Sidebar - Desktop Only */}
            <div className="hidden lg:block lg:w-80 flex-shrink-0 lg:sticky lg:top-20 lg:h-screen lg:overflow-y-auto">
              <div className="p-6">
                <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                    <button
                      onClick={clearFilters}
                      className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                    >
                      Clear All
                    </button>
                  </div>

                  {/* Search */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Search</h4>
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                    />
                  </div>

                  {/* Categories */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Categories</h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => setSelectedCategory('')}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedCategory === ''
                            ? 'bg-amber-100 text-amber-700'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        All Categories
                      </button>
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                            selectedCategory === category.id
                              ? 'bg-amber-100 text-amber-700'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
                    <div className="px-2">
                      <div className="space-y-4">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>₹{priceRange[0].toLocaleString()}</span>
                          <span>₹{priceRange[1].toLocaleString()}</span>
                        </div>
                        <div className="relative">
                          <input
                            type="range"
                            min={priceStats.min}
                            max={priceStats.max}
                            value={priceRange[0]}
                            onChange={(e) => {
                              const newMin = parseInt(e.target.value);
                              setPriceRange([newMin, Math.max(newMin + 1000, priceRange[1])]);
                            }}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            style={{
                              background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${((priceRange[0] - priceStats.min) / (priceStats.max - priceStats.min)) * 100}%, #e5e7eb ${((priceRange[0] - priceStats.min) / (priceStats.max - priceStats.min)) * 100}%, #e5e7eb 100%)`,
                            }}
                          />
                          <input
                            type="range"
                            min={priceStats.min}
                            max={priceStats.max}
                            value={priceRange[1]}
                            onChange={(e) => {
                              const newMax = parseInt(e.target.value);
                              setPriceRange([Math.min(priceRange[0], newMax - 1000), newMax]);
                            }}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2"
                            style={{
                              background: `linear-gradient(to right, #e5e7eb 0%, #e5e7eb ${((priceRange[1] - priceStats.min) / (priceStats.max - priceStats.min)) * 100}%, #f59e0b ${((priceRange[1] - priceStats.min) / (priceStats.max - priceStats.min)) * 100}%, #f59e0b 100%)`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Availability */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Availability</h4>
                    <select
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      <option value="all">All Items</option>
                      <option value="inStock">In Stock</option>
                      <option value="outOfStock">Out of Stock</option>
                    </select>
                  </div>

                  {/* Rating Filter */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Rating</h4>
                    <select
                      value={rating}
                      onChange={(e) =>
                        setRating(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      <option value="">All Ratings</option>
                      <option value="4">4+ Stars</option>
                      <option value="3">3+ Stars</option>
                      <option value="2">2+ Stars</option>
                    </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Sort By</h4>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      <option value="name">Name A-Z</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                      <option value="newest">Newest First</option>
                      <option value="featured">Featured First</option>
                      <option value="popular">Most Popular</option>
                    </select>
                  </div>

                  {/* Discount Filter */}
                  <div>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={discount}
                        onChange={(e) => setDiscount(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-gray-700">On Sale Only</span>
                    </label>
                  </div>

                  {/* View Mode */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">View Mode</h4>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-amber-100 text-amber-600' : 'text-gray-400'}`}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-amber-100 text-amber-600' : 'text-gray-400'}`}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Results Count */}
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      {filteredProducts.length} of {gemstones.length} products
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  {/* Header */}
                  <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Shop Gemstones</h1>
                    <p className="text-gray-600">
                      Discover our exclusive collection of fine gemstones
                    </p>
                  </div>

                  {/* Addictive Features Banner */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-4 mb-6"
                  >
                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                          <span className="text-sm font-medium">{viewersCount} people viewing</span>
                        </div>
                        {socialProof[0] && (
                          <div className="text-sm">
                            <span className="font-medium">{socialProof[0].name}</span>
                            <span className="ml-1">{socialProof[0].action}</span>
                            <span className="ml-1 text-amber-200">{socialProof[0].time}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-amber-200 font-medium">
                        {filteredProducts.length} products found
                      </div>
                    </div>
                  </motion.div>

                  {/* Flash Sale Section */}
                  {flashSaleProducts.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-500 text-white rounded-2xl p-4 mb-6"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">🔥</span>
                          <div>
                            <h3 className="font-bold text-lg">Flash Sale!</h3>
                            <p className="text-red-100">Limited time offers on selected items</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">50% OFF</div>
                          <div className="text-red-100 text-sm">Ends soon</div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Products Grid */}
                  {filteredProducts.length > 0 ? (
                    <div
                      className={`grid gap-6 ${
                        viewMode === 'grid'
                          ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
                          : 'grid-cols-1'
                      }`}
                    >
                      <AnimatePresence>
                        {filteredProducts.map((product) => (
                          <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="cursor-pointer"
                            onClick={() => handleProductClick(product.id)}
                          >
                            <EnhancedProductCard
                              product={product}
                              onAddToCart={handleAddToCart}
                              onWishlistToggle={() => toggleWishlist(product.id)}
                              isWishlisted={wishlist.has(product.id)}
                              isAddingToCart={isAddingToCart}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <svg
                          className="w-12 h-12 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No products found
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Try adjusting your filters or search terms
                      </p>
                      <button
                        onClick={clearFilters}
                        className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                      >
                        Clear Filters
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Filters Button - Bottom Right */}
          <AnimatePresence>
            {showMobileFilters && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setMobileFiltersOpen(true)}
                className="fixed bottom-6 right-6 z-50 lg:hidden bg-amber-600 text-white p-4 rounded-full shadow-lg hover:bg-amber-700 transition-all duration-300 hover:scale-110"
                aria-label="Open filters"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"
                  />
                </svg>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Mobile Filters Modal */}
          <AnimatePresence>
            {mobileFiltersOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 lg:hidden bg-black/50 backdrop-blur-sm"
                onClick={() => setMobileFiltersOpen(false)}
              >
                <motion.div
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 100 }}
                  className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Filters</h3>
                    <button
                      onClick={() => setMobileFiltersOpen(false)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Search */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Search</h4>
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>

                    {/* Categories */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Categories</h4>
                      <div className="space-y-2">
                        <button
                          onClick={() => setSelectedCategory('')}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                            selectedCategory === ''
                              ? 'bg-amber-100 text-amber-700'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          All Categories
                        </button>
                        {categories.map((category) => (
                          <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                              selectedCategory === category.id
                                ? 'bg-amber-100 text-amber-700'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {category.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price Range */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
                      <div className="px-2">
                        <div className="space-y-4">
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>₹{priceRange[0].toLocaleString()}</span>
                            <span>₹{priceRange[1].toLocaleString()}</span>
                          </div>
                          <div className="relative">
                            <input
                              type="range"
                              min={priceStats.min}
                              max={priceStats.max}
                              value={priceRange[0]}
                              onChange={(e) => {
                                const newMin = parseInt(e.target.value);
                                setPriceRange([newMin, Math.max(newMin + 1000, priceRange[1])]);
                              }}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                              style={{
                                background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${((priceRange[0] - priceStats.min) / (priceStats.max - priceStats.min)) * 100}%, #e5e7eb ${((priceRange[0] - priceStats.min) / (priceStats.max - priceStats.min)) * 100}%, #e5e7eb 100%)`,
                              }}
                            />
                            <input
                              type="range"
                              min={priceStats.min}
                              max={priceStats.max}
                              value={priceRange[1]}
                              onChange={(e) => {
                                const newMax = parseInt(e.target.value);
                                setPriceRange([Math.min(priceRange[0], newMax - 1000), newMax]);
                              }}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2"
                              style={{
                                background: `linear-gradient(to right, #e5e7eb 0%, #e5e7eb ${((priceRange[1] - priceStats.min) / (priceStats.max - priceStats.min)) * 100}%, #f59e0b ${((priceRange[1] - priceStats.min) / (priceStats.max - priceStats.min)) * 100}%, #f59e0b 100%)`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Availability */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Availability</h4>
                      <select
                        value={availability}
                        onChange={(e) => setAvailability(e.target.value as any)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      >
                        <option value="all">All Items</option>
                        <option value="inStock">In Stock</option>
                        <option value="outOfStock">Out of Stock</option>
                      </select>
                    </div>

                    {/* Rating Filter */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Rating</h4>
                      <select
                        value={rating}
                        onChange={(e) =>
                          setRating(e.target.value === '' ? '' : Number(e.target.value))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      >
                        <option value="">All Ratings</option>
                        <option value="4">4+ Stars</option>
                        <option value="3">3+ Stars</option>
                        <option value="2">2+ Stars</option>
                      </select>
                    </div>

                    {/* Sort Options */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Sort By</h4>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      >
                        <option value="name">Name A-Z</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="rating">Highest Rated</option>
                        <option value="newest">Newest First</option>
                        <option value="featured">Featured First</option>
                        <option value="popular">Most Popular</option>
                      </select>
                    </div>

                    {/* Discount Filter */}
                    <div>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={discount}
                          onChange={(e) => setDiscount(e.target.checked)}
                          className="rounded text-amber-600 focus:ring-amber-500"
                        />
                        <span className="text-gray-700">On Sale Only</span>
                      </label>
                    </div>

                    {/* View Mode */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">View Mode</h4>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setViewMode('grid')}
                          className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-amber-100 text-amber-600' : 'text-gray-400'}`}
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setViewMode('list')}
                          className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-amber-100 text-amber-600' : 'text-gray-400'}`}
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={clearFilters}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Clear All
                      </button>
                      <button
                        onClick={() => setMobileFiltersOpen(false)}
                        className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Layout>
    </>
  );
};

export default ShopPage;
