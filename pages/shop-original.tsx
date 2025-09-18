import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import Image from 'next/image';
import { prisma } from '../lib/prisma';
import Link from 'next/link';
import { getFirstImage } from '../utils/imageUtils';
import { performanceCache, CACHE_KEYS } from '../utils/clientCache';
import { Filter, X, Grid, List, ChevronDown, Sliders } from 'lucide-react';
import { logger } from '../utils/logger';

interface Category {
  id: number;
  name: string;
  description?: string;
  gemstoneCount?: number;
}

interface Gemstone {
  id: number;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  categoryId: number;
  images: string[];
  weight?: number;
  dimensions?: string;
  clarity?: string;
  color?: string;
  cut?: string;
  origin?: string;
  certificate?: string;
  stockCount: number;
  stockQuantity: number;
  lowStockThreshold: number;
  featured: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  category?: Category;
}

interface ShopProps {
  initialData: {
    gemstones: Gemstone[];
    categories: Category[];
    totalCount: number;
    hasMore: boolean;
  };
  fallbackData: {
    gemstones: Gemstone[];
    categories: Category[];
    totalCount: number;
  };
}

export const getServerSideProps: GetServerSideProps<ShopProps> = async () => {
  try {
    // Check cache first
    const cacheKey = CACHE_KEYS.HOMEPAGE_DATA;
    const cachedData = performanceCache.get(cacheKey);
    if (cachedData) {
      console.log('Returning cached homepage data');
      return {
        props: cachedData
      };
    }
    
    console.log('Fetching fresh homepage data');
    
    // Read directly from the database with optimized queries
    const [gemstonesRaw, categoriesRaw, totalCount] = await Promise.allSettled([
      prisma.gemstone.findMany({
        where: { active: true },
        orderBy: { createdAt: 'desc' },
        // Only select fields we need to improve query performance
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          salePrice: true,
          categoryId: true,
          images: true,
          stockCount: true,
          featured: true,
          createdAt: true,
          weight: true,
          color: true,
        },
        // Limit initial load to improve performance
        take: 12,
      }),
      prisma.category.findMany({
        where: { active: true },
        orderBy: { name: 'asc' },
        select: { id: true, name: true },
      }),
      prisma.gemstone.count({
        where: { active: true },
      }),
    ]);

    // Handle promise rejections
    if (gemstonesRaw.status === 'rejected') {
      console.error('Error fetching gemstones:', gemstonesRaw.reason);
      throw new Error('Failed to fetch gemstones');
    }
    
    if (categoriesRaw.status === 'rejected') {
      console.error('Error fetching categories:', categoriesRaw.reason);
      throw new Error('Failed to fetch categories');
    }
    
    if (totalCount.status === 'rejected') {
      console.error('Error fetching total count:', totalCount.reason);
      throw new Error('Failed to fetch product count');
    }

    // Get gemstone count per category
    const categoryCountsResult = await prisma.gemstone.groupBy({
      by: ['categoryId'],
      where: { active: true },
      _count: true,
    }).catch(error => {
      console.error('Error fetching category counts:', error);
      return [];
    });

    const categoryCountMap = new Map<number, number>(
      categoryCountsResult.map(c => [c.categoryId as number, c._count as number] as [number, number])
    );

    // Create a lookup map for categories to avoid repeated lookups
    const categories = categoriesRaw.value.map(category => ({
      ...category,
      gemstoneCount: categoryCountMap.get(category.id) || 0
    }));

    const categoryById = new Map(categories.map((c) => [c.id, c]));
    
    // Process gemstones with optimized image handling
    const gemstones = gemstonesRaw.value.map((g: any) => {
      // Optimize image processing
      let images: string[] = [];
      try {
        if (Array.isArray(g.images)) {
          images = g.images;
        } else if (typeof g.images === 'string') {
          const parsed = JSON.parse(g.images);
          images = Array.isArray(parsed) ? parsed : [];
        }
        // Limit to first image for initial load to improve performance
        images = images.slice(0, 1);
        
        // Ensure images have proper format and size for optimization
        images = images.map(img => {
          // If image is already optimized or from external source, return as is
          if (img.includes('?w=') || img.startsWith('http')) {
            return img;
          }
          // Add width and quality parameters for image optimization
          return `${img}?w=300&q=75`;
        });
      } catch {
        images = ['/images/placeholder-gemstone.jpg'];
      }

      return {
        ...g,
        images,
        // Ensure JSON-serializable values for dates
        createdAt: typeof g.createdAt === 'string' ? g.createdAt : g.createdAt?.toISOString?.() ?? null,
        category: categoryById.get(g.categoryId) || undefined,
      } as Gemstone;
    });

    // Calculate if there are more gemstones to load
    const hasMore = gemstones.length < totalCount.value;
    
    const result = {
      initialData: {
        gemstones,
        categories,
        totalCount: totalCount.value,
        hasMore,
      },
      fallbackData: {
        gemstones: [],
        categories: [],
        totalCount: 0,
      }
    };
    
    // Cache the result with a longer TTL for homepage data
    performanceCache.set(cacheKey, result, 60000); // Cache for 1 minute
    
    return {
      props: result,
    };
  } catch (error) {
    logger.error('Homepage data fetch error', error);
    
    // Return fallback data
    return {
      props: {
        initialData: {
          gemstones: [],
          categories: [],
          totalCount: 0,
          hasMore: false,
        },
        fallbackData: {
          gemstones: [],
          categories: [],
          totalCount: 0,
        },
      },
    };
  }
};

// Optimized Product Card Component
const ProductCard: React.FC<{ 
  gemstone: Gemstone; 
  viewMode: 'grid' | 'list';
  priority?: boolean;
}> = React.memo(({ gemstone, viewMode, priority = false }) => {
  // Handle image loading errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = '/images/placeholder-gemstone.jpg';
  };

  return (
    <div className={`bg-white rounded-xl sm:rounded-2xl shadow hover:shadow-md transition-all duration-300 overflow-hidden h-full flex flex-col ${viewMode === 'list' ? 'flex-row' : ''}`}>
      <div className={`relative overflow-hidden bg-gray-100 ${viewMode === 'list' ? 'aspect-video sm:aspect-square sm:w-1/3' : 'aspect-square'}`}>
        <Image
          src={getFirstImage(gemstone.images)}
          alt={gemstone.name}
          fill
          priority={priority}
          sizes={viewMode === 'list' ? "(max-width: 768px) 100vw, 33vw" : "(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={handleImageError}
        />
        {gemstone.featured && (
          <span className="absolute top-2 left-2 bg-amber-500 text-white px-2 py-1 rounded-full text-xs sm:text-sm font-medium">
            Featured
          </span>
        )}
        {gemstone.stockCount === 0 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs sm:text-sm font-medium">
            Sold Out
          </span>
        )}
      </div>
      
      <div className="p-3 sm:p-4 space-y-2 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 flex-1">
          <h3 className="font-medium text-gray-900 text-sm sm:text-base line-clamp-2 group-hover:text-amber-600 transition-colors">
            {gemstone.name}
          </h3>
          <span className="text-amber-600 font-bold text-sm sm:text-base whitespace-nowrap">
            ${gemstone.price.toLocaleString()}
          </span>
        </div>
        
        <p className="text-gray-600 text-xs sm:text-sm line-clamp-2">
          {gemstone.description}
        </p>
        
        <div className="flex items-center justify-between text-xs sm:text-sm mt-auto pt-2">
          {gemstone.category && (
            <span className="text-gray-500">{gemstone.category.name}</span>
          )}
          {gemstone.weight && (
            <span className="text-gray-500">{gemstone.weight} ct</span>
          )}
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

const ShopPage: React.FC<ShopProps> = ({ initialData }) => {
  const router = useRouter();
  const [gemstones, setGemstones] = useState<Gemstone[]>(initialData.gemstones);
  const [categories, setCategories] = useState<Category[]>(initialData.categories);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!initialData.gemstones.length && !initialData.categories.length);
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [hasMore, setHasMore] = useState(initialData.hasMore || false);
  const [totalProducts, setTotalProducts] = useState(initialData.totalCount || 0);
  const [error, setError] = useState<string | null>(null);
  
  // For client-side filtering, we'll use all gemstones without additional filtering
  // since server-side filtering is already applied
  const filteredProducts = useMemo(() => {
    return gemstones;
  }, [gemstones]);
  
  // Calculate min and max prices for filtering based on all products
  // This should be fetched from the server, but for now we'll use a reasonable range
  const priceRangeLimits = useMemo(() => {
    // Use a default range that covers most products
    return [0, 50000];
  }, []);
  
  // Debounce search query
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // Skeleton loader component for product cards
  const ProductSkeleton = ({ isListView = false }: { isListView?: boolean }) => (
    <div className={`bg-white rounded-xl sm:rounded-2xl shadow hover:shadow-md transition-all duration-300 overflow-hidden ${isListView ? 'flex flex-col sm:flex-row' : ''}`}>
      <div className={`${isListView ? 'aspect-video sm:aspect-square sm:w-1/3' : 'aspect-square'} bg-gray-200 rounded-xl mb-4`} />
      <div className="p-3 sm:p-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-6 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  );
  
  // Reference for intersection observer
  const loadMoreRef = useRef(null);
  
  // Function to load more products
  const loadMoreProducts = useCallback(async () => {
    // Prevent multiple simultaneous requests
    if (loading || !hasMore) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Calculate offset based on current products
      const offset = gemstones.length;
      
      // Build query parameters
      let queryParams = `offset=${offset}&limit=12`;
      if (selectedCategory) queryParams += `&category=${selectedCategory}`;
      if (debouncedSearchQuery) queryParams += `&search=${encodeURIComponent(debouncedSearchQuery)}`;
      if (sortBy) queryParams += `&sort=${sortBy}`;
      queryParams += `&minPrice=${priceRange[0]}&maxPrice=${priceRange[1]}`;
      
      // Create cache key for this specific request
      const cacheParams = `${selectedCategory || 'all'}_${debouncedSearchQuery || 'all'}_${sortBy || 'newest'}_min${priceRange[0]}_max${priceRange[1]}_${offset}_12`;
      const cacheKey = `${CACHE_KEYS.GEMSTONES_SEARCH}_${cacheParams}`;
      
      // Fetch more products
      const response = await fetch(`/api/gemstones?${queryParams}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Validate response data
      if (!data || !Array.isArray(data.gemstones)) {
        throw new Error('Invalid response data format');
      }
      
      // Add new products to the existing list
      setGemstones(prev => {
        // Filter out any duplicates that might have been added
        const existingIds = new Set(prev.map(g => g.id));
        const newGemstones = data.gemstones.filter(g => !existingIds.has(g.id));
        return [...prev, ...newGemstones];
      });
      
      // Update pagination state
      setHasMore(data.hasMore);
      setTotalProducts(data.totalCount);
    } catch (error: any) {
      console.error('Error loading more products:', error);
      setError(error.message || 'Failed to load more products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, gemstones.length, selectedCategory, debouncedSearchQuery, sortBy, priceRange]);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || loading) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && hasMore && !loading) {
            loadMoreProducts();
          }
        });
      },
      { 
        threshold: 0.1,
        rootMargin: '100px' // Trigger 100px before element is visible
      }
    );
    
    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current as any);
    }
    
    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current as any);
      }
    };
  }, [hasMore, loading, loadMoreProducts]);

  // Reset pagination when filters change
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      // Don't show loading spinner for initial render
      if (initialLoading) return;
      
      setLoading(true);
      setError(null);
      try {
        // Build query parameters
        let queryParams = `limit=12&offset=0`;
        if (selectedCategory) queryParams += `&category=${selectedCategory}`;
        if (debouncedSearchQuery) queryParams += `&search=${encodeURIComponent(debouncedSearchQuery)}`;
        if (sortBy) queryParams += `&sort=${sortBy}`;
        queryParams += `&minPrice=${priceRange[0]}&maxPrice=${priceRange[1]}`;
        
        // Fetch filtered products
        const response = await fetch(`/api/gemstones?${queryParams}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Validate response data
        if (!data || !Array.isArray(data.gemstones)) {
          throw new Error('Invalid response data format');
        }
        
        // Replace products with filtered results
        setGemstones(data.gemstones);
        
        // Update pagination state
        setHasMore(data.hasMore);
        setTotalProducts(data.totalCount);
      } catch (error: any) {
        console.error('Error loading filtered products:', error);
        setError(error.message || 'Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    // Only fetch when filters actually change (not on initial render)
    if (!initialLoading && (initialData.gemstones.length > 0 || initialData.categories.length > 0)) {
      fetchFilteredProducts();
    } else if (initialLoading) {
      // Set initial loading to false after initial data is processed
      setInitialLoading(false);
    }
  }, [selectedCategory, debouncedSearchQuery, sortBy, priceRange, initialLoading, initialData.gemstones.length, initialData.categories.length]);

  if (!initialData.gemstones.length && loading) {
    return (
      <Layout
        title="Shop Gemstones | Shankarmala"
        description="Discover our exclusive collection of fine gemstones. Browse by category, filter by price, and find your perfect piece."
      >
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-8" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl sm:rounded-2xl shadow overflow-hidden">
                    <div className="aspect-square bg-gray-200 rounded-xl mb-4" />
                    <div className="p-3 sm:p-4 space-y-2">
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

  // Generate structured data for SEO
  const generateStructuredData = () => {
    const productsData = filteredProducts.map(product => ({
      '@type': 'Product',
      'name': product.name,
      'description': product.description,
      'image': getFirstImage(product.images),
      'offers': {
        '@type': 'Offer',
        'price': product.price.toString(),
        'priceCurrency': 'USD',
        'availability': product.stockCount > 0 ? 'InStock' : 'OutOfStock'
      }
    }));

    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      'itemListElement': productsData.map((product, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'item': product
      }))
    };
  };

  // Generate breadcrumb structured data
  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': 'https://shankarmala.com/'
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Shop',
        'item': 'https://shankarmala.com/shop'
      }
    ]
  };

  return (
    <Layout 
      title="Shop Gemstones | Shankarmala"
      description="Discover our exclusive collection of fine gemstones. Browse by category, filter by price, and find your perfect piece."
      structuredData={generateStructuredData()}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbData),
        }}
      />
      <div className="min-h-screen bg-gray-50">
        {/* Mobile filter drawer */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-labelledby="filters-title">
            <div 
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setShowMobileFilters(false)}
              aria-hidden="true"
            />
            <div className="fixed inset-y-0 right-0 max-w-full flex">
              <div className="relative w-screen max-w-xs sm:max-w-sm">
                <div className="h-full flex flex-col bg-white shadow-xl">
                  <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <h2 id="filters-title" className="text-lg font-medium text-gray-900">Filters</h2>
                      <button
                        type="button"
                        className="-mr-2 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                        onClick={() => setShowMobileFilters(false)}
                        aria-label="Close filters"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>

                    <div className="mt-8">
                      <div className="border-b border-gray-200 py-6">
                        <h3 className="-my-3 flow-root">
                          <button
                            type="button"
                            className="py-3 bg-white w-full flex items-center justify-between text-sm font-medium text-gray-900"
                            aria-expanded="false"
                          >
                            <span>Category</span>
                            <span className="ml-6 bg-gray-100 rounded-full py-1 px-2.5 text-xs font-medium text-gray-800">
                              {categories.length}
                            </span>
                          </button>
                        </h3>
                        <div className="pt-6">
                          <div className="space-y-4 max-h-60 overflow-y-auto" role="radiogroup" aria-label="Category filters">
                            <div className="flex items-center">
                              <input
                                id="category-all"
                                name="category[]"
                                type="radio"
                                checked={selectedCategory === ''}
                                onChange={() => setSelectedCategory('')}
                                className="h-4 w-4 border-gray-300 rounded text-amber-600 focus:ring-amber-500"
                                aria-label="All categories"
                              />
                              <label
                                htmlFor="category-all"
                                className="ml-3 text-sm text-gray-600"
                              >
                                All Categories
                              </label>
                            </div>
                            {categories.map((category) => (
                              <div key={category.id} className="flex items-center">
                                <input
                                  id={`category-${category.id}`}
                                  name="category[]"
                                  type="radio"
                                  checked={selectedCategory === category.id}
                                  onChange={() => setSelectedCategory(category.id)}
                                  className="h-4 w-4 border-gray-300 rounded text-amber-600 focus:ring-amber-500"
                                  aria-label={`${category.name} (${category.gemstoneCount} products)`}
                                />
                                <label
                                  htmlFor={`category-${category.id}`}
                                  className="ml-3 text-sm text-gray-600"
                                >
                                  {category.name} ({category.gemstoneCount})
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="border-b border-gray-200 py-6">
                        <h3 className="-my-3 flow-root">
                          <button
                            type="button"
                            className="py-3 bg-white w-full flex items-center justify-between text-sm font-medium text-gray-900"
                            aria-expanded="false"
                          >
                            <span>Price</span>
                          </button>
                        </h3>
                        <div className="pt-6">
                          <div>
                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                              <span>${priceRange[0].toLocaleString()}</span>
                              <span>${priceRange[1].toLocaleString()}</span>
                            </div>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label htmlFor="min-price" className="text-sm text-gray-600">Minimum Price</label>
                                <input
                                  id="min-price"
                                  type="range"
                                  min={priceRangeLimits[0]}
                                  max={priceRangeLimits[1]}
                                  value={priceRange[0]}
                                  onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                  aria-label="Minimum price slider"
                                />
                              </div>
                              <div className="space-y-2">
                                <label htmlFor="max-price" className="text-sm text-gray-600">Maximum Price</label>
                                <input
                                  id="max-price"
                                  type="range"
                                  min={priceRangeLimits[0]}
                                  max={priceRangeLimits[1]}
                                  value={priceRange[1]}
                                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                  aria-label="Maximum price slider"
                                />
                              </div>
                            </div>
                            <div className="flex flex-col space-y-2 mt-4">
                              <div className="flex space-x-2">
                                <div className="flex-1">
                                  <label htmlFor="min-price-input" className="block text-sm text-gray-600 mb-1">Min Price</label>
                                  <input
                                    id="min-price-input"
                                    type="number"
                                    value={priceRange[0]}
                                    onChange={(e) => setPriceRange([Number(e.target.value) || 0, priceRange[1]])}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    placeholder="Min"
                                    aria-label="Minimum price"
                                  />
                                </div>
                                <div className="flex-1">
                                  <label htmlFor="max-price-input" className="block text-sm text-gray-600 mb-1">Max Price</label>
                                  <input
                                    id="max-price-input"
                                    type="number"
                                    value={priceRange[1]}
                                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value) || 0])}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    placeholder="Max"
                                    aria-label="Maximum price"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        className="flex-1 bg-amber-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                        onClick={() => {
                          // Apply filters by triggering the useEffect
                          // The useEffect will automatically run when filter state changes
                          setShowMobileFilters(false);
                        }}
                      >
                        Apply Filters
                      </button>
                      <button
                        type="button"
                        className="flex-1 bg-gray-100 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        onClick={() => {
                          setSelectedCategory('');
                          setSearchQuery('');
                          setSortBy('newest');
                          setPriceRange([priceRangeLimits[0], priceRangeLimits[1]]);
                          setShowMobileFilters(false);
                        }}
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="py-8">
          <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700" role="alert">
                {error}
                <button 
                  onClick={() => setError(null)}
                  className="ml-2 text-red-900 hover:text-red-700 font-medium"
                >
                  Dismiss
                </button>
              </div>
            )}
            
            {/* Header and Filters */}
            <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Shop Gemstones</h1>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center" role="radiogroup" aria-label="View mode">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-l-md ${viewMode === 'grid' ? 'bg-amber-100 text-amber-700' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                      aria-label="Grid view"
                      aria-checked={viewMode === 'grid'}
                      role="radio"
                    >
                      <Grid className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-r-md border-l border-gray-200 ${viewMode === 'list' ? 'bg-amber-100 text-amber-700' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                      aria-label="List view"
                      aria-checked={viewMode === 'list'}
                      role="radio"
                    >
                      <List className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <button
                    type="button"
                    className="inline-flex items-center lg:hidden px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                    onClick={() => setShowMobileFilters(true)}
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                  </button>
                </div>
              </div>
              
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
                <div className="flex-1">
                  <label htmlFor="search-input" className="sr-only">Search gemstones</label>
                  <input
                    id="search-input"
                    type="text"
                    placeholder="Search gemstones..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base"
                    aria-label="Search gemstones"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2 sm:gap-4">
                  <label htmlFor="category-select" className="sr-only">Filter by category</label>
                  <select
                    id="category-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value === '' ? '' : Number(e.target.value))}
                    className="px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base"
                    aria-label="Filter by category"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name} ({category.gemstoneCount})
                      </option>
                    ))}
                  </select>
                
                  <label htmlFor="sort-select" className="sr-only">Sort by</label>
                  <select
                    id="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base"
                    aria-label="Sort by"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name A-Z</option>
                    <option value="featured">Featured</option>
                  </select>
                </div>
              </div>
              
              {/* Product Count */}
              <p className="text-sm sm:text-base text-gray-600">
                Showing {filteredProducts.length} of {totalProducts} products
              </p>
            </div>
            
            {/* Loading overlay */}
            {loading && (
              <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center" aria-live="polite" aria-label="Loading products">
                <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-3">
                  <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-700">Loading products...</span>
                </div>
              </div>
            )}
            
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Desktop Filters */}
              <div className="hidden lg:block w-full lg:w-64 flex-shrink-0">
                <div className="bg-white rounded-xl shadow p-6 sticky top-24">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Filters</h3>
                    <button 
                      className="text-sm text-amber-600 hover:text-amber-800"
                      onClick={() => {
                        setSelectedCategory('');
                        setSearchQuery('');
                        setSortBy('newest');
                        setPriceRange([priceRangeLimits[0], priceRangeLimits[1]]);
                      }}
                      aria-label="Clear all filters"
                    >
                      Clear all
                    </button>
                  </div>
                  
                  {/* Category Filter */}
                  <div className="border-b border-gray-200 py-6">
                    <h3 className="-my-3 flow-root">
                      <button
                        type="button"
                        className="py-3 bg-white w-full flex items-center justify-between text-sm font-medium text-gray-900"
                        aria-expanded="false"
                      >
                        <span>Category</span>
                      </button>
                    </h3>
                    <div className="pt-6">
                      <div className="space-y-4 max-h-60 overflow-y-auto">
                        <div className="flex items-center">
                          <input
                            id="desktop-category-all"
                            name="desktop-category[]"
                            type="radio"
                            checked={selectedCategory === ''}
                            onChange={() => setSelectedCategory('')}
                            className="h-4 w-4 border-gray-300 rounded text-amber-600 focus:ring-amber-500"
                            aria-label="All categories"
                          />
                          <label
                            htmlFor="desktop-category-all"
                            className="ml-3 text-sm text-gray-600"
                          >
                            All Categories
                          </label>
                        </div>
                        {categories.map((category) => (
                          <div key={category.id} className="flex items-center">
                            <input
                              id={`desktop-category-${category.id}`}
                              name="desktop-category[]"
                              type="radio"
                              checked={selectedCategory === category.id}
                              onChange={() => setSelectedCategory(category.id)}
                              className="h-4 w-4 border-gray-300 rounded text-amber-600 focus:ring-amber-500"
                              aria-label={`${category.name} (${category.gemstoneCount} products)`}
                            />
                            <label
                              htmlFor={`desktop-category-${category.id}`}
                              className="ml-3 text-sm text-gray-600"
                            >
                              {category.name} ({category.gemstoneCount})
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-b border-gray-200 py-6">
                    <h3 className="-my-3 flow-root">
                      <button
                        type="button"
                        className="py-3 bg-white w-full flex items-center justify-between text-sm font-medium text-gray-900"
                        onClick={() => setShowFilters(!showFilters)}
                        aria-expanded={showFilters}
                        aria-controls="price-filters"
                      >
                        <span>Price Range</span>
                        <ChevronDown className={`h-5 w-5 transform ${showFilters ? 'rotate-180' : ''}`} />
                      </button>
                    </h3>
                    <div id="price-filters" className={`pt-6 ${showFilters ? 'block' : 'hidden'}`}>
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>${priceRange[0].toLocaleString()}</span>
                          <span>${priceRange[1].toLocaleString()}</span>
                        </div>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label htmlFor="desktop-min-price" className="text-sm text-gray-600">Minimum Price</label>
                            <input
                              id="desktop-min-price"
                              type="range"
                              min={priceRangeLimits[0]}
                              max={priceRangeLimits[1]}
                              value={priceRange[0]}
                              onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                              aria-label="Minimum price slider"
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="desktop-max-price" className="text-sm text-gray-600">Maximum Price</label>
                            <input
                              id="desktop-max-price"
                              type="range"
                              min={priceRangeLimits[0]}
                              max={priceRangeLimits[1]}
                              value={priceRange[1]}
                              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                              aria-label="Maximum price slider"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-4">
                          <div className="flex-1">
                            <label htmlFor="desktop-min-price-input" className="block text-sm text-gray-600 mb-1">Min Price</label>
                            <input
                              id="desktop-min-price-input"
                              type="number"
                              value={priceRange[0]}
                              onChange={(e) => setPriceRange([Number(e.target.value) || 0, priceRange[1]])}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                              placeholder="Min"
                              aria-label="Minimum price"
                            />
                          </div>
                          <div className="flex-1">
                            <label htmlFor="desktop-max-price-input" className="block text-sm text-gray-600 mb-1">Max Price</label>
                            <input
                              id="desktop-max-price-input"
                              type="number"
                              value={priceRange[1]}
                              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value) || 0])}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                              placeholder="Max"
                              aria-label="Maximum price"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Product Grid */}
              <div className="flex-1">
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {filteredProducts.map((gemstone, index) => (
                      <Link
                        key={gemstone.id}
                        href={`/product/${gemstone.id}`}
                        className="group block"
                        aria-label={`View details for ${gemstone.name}`}
                      >
                        <ProductCard 
                          gemstone={gemstone} 
                          viewMode={viewMode}
                          priority={index < 8} // Load first 8 images with priority
                        />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredProducts.map((gemstone, index) => (
                      <Link
                        key={gemstone.id}
                        href={`/product/${gemstone.id}`}
                        className="group block"
                        aria-label={`View details for ${gemstone.name}`}
                      >
                        <ProductCard 
                          gemstone={gemstone} 
                          viewMode={viewMode}
                          priority={index < 4} // Load first 4 images with priority
                        />
                      </Link>
                    ))}
                  </div>
                )}
                
                {/* Load More */}
                <div className="mt-8 sm:mt-12 text-center">
                  {loading && (
                    <div className="flex justify-center items-center space-x-2 text-amber-600" aria-live="polite">
                      <div className="w-4 h-4 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-4 h-4 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-4 h-4 rounded-full animate-bounce"></div>
                    </div>
                  )}
                  
                  {!loading && hasMore && (
                    <button
                      onClick={loadMoreProducts}
                      disabled={loading}
                      className="px-6 py-2 sm:py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm sm:text-base font-medium disabled:opacity-50"
                      aria-label="Load more products"
                    >
                      Load More Products
                    </button>
                  )}
                  
                  {filteredProducts.length === 0 && !loading && (
                    <div className="text-center space-y-3">
                      <p className="text-gray-600 text-sm sm:text-base">No products found matching your criteria</p>
                      <button
                        onClick={() => {
                          setSelectedCategory('');
                          setSearchQuery('');
                          setSortBy('newest');
                          setPriceRange([priceRangeLimits[0], priceRangeLimits[1]]);
                        }}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm sm:text-base"
                        aria-label="Clear all filters"
                      >
                        Clear Filters
                      </button>
                    </div>
                  )}
                  
                  <div ref={loadMoreRef} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ShopPage;