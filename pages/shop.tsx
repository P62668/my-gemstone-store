import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import Image from 'next/image';
import { prisma } from '../lib/prisma';
import Link from 'next/link';
import { getFirstImage } from '../utils/imageUtils';
import { performanceCache, CACHE_KEYS } from '../utils/clientCache';
import { 
  Filter, 
  X, 
  Grid, 
  List, 
  ChevronDown, 
  Sliders, 
  Truck, 
  Star, 
  DollarSign, 
  Search, 
  Check,
  Home,
  ChevronRight,
  Package,
  Eye,
  Sparkles,
  Gem,
  Award,
  Heart
} from 'lucide-react';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import AIPoweredSearch from '../components/ui/AIPoweredSearch';
// ProductCard import removed as we're using ShopProductCard component directly
import QuickViewModal from '../components/ui/QuickViewModal';
import Breadcrumb from '../components/ui/Breadcrumb';
import LuxuryButton from '../components/ui/LuxuryButton';
import LuxuryCard from '../components/ui/LuxuryCard';
import LuxurySectionHeader from '../components/ui/LuxurySectionHeader';

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
  cashOnDelivery: boolean;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  averageRating?: number;
  reviewCount?: number;
}

interface FilterOptions {
  category: string;
  minPrice: number;
  maxPrice: number;
  inStock: boolean;
  featured: boolean;
  sortBy: 'newest' | 'price-low' | 'price-high' | 'name' | 'featured' | 'rating' | 'popular';
  color: string;
  clarity: string;
  cut: string;
  origin: string;
  certificate: string;
  weightRange: [number, number];
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
  initialFacets?: {
    categories: { id: number; name: string; count: number }[];
    certificates: { certificate: string; count: number }[];
    colors: { color: string; count: number }[];
    clarities: { clarity: string; count: number }[];
    cuts: { cut: string; count: number }[];
    origins: { origin: string; count: number }[];
  };
}

export const getServerSideProps: GetServerSideProps<ShopProps> = async () => {
  try {
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
          cashOnDelivery: true,
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
    
    // Fetch initial facets for all products
    const facets = await Promise.all([
      prisma.gemstone.groupBy({
        by: ['categoryId'],
        where: { active: true },
        _count: { categoryId: true },
      }),
      prisma.gemstone.groupBy({
        by: ['certificate'],
        where: { active: true },
        _count: { certificate: true },
      }),
      prisma.gemstone.groupBy({
        by: ['color'],
        where: { active: true },
        _count: { color: true },
      }),
      prisma.gemstone.groupBy({
        by: ['clarity'],
        where: { active: true },
        _count: { clarity: true },
      }),
      prisma.gemstone.groupBy({
        by: ['cut'],
        where: { active: true },
        _count: { cut: true },
      }),
      prisma.gemstone.groupBy({
        by: ['origin'],
        where: { active: true },
        _count: { origin: true },
      }),
    ]).catch(error => {
      console.error('Error fetching facets:', error);
      return [[], [], [], [], [], []];
    });
    
    // Process facets
    const categoryFacetMap = new Map<number, number>();
    const certificateFacetMap = new Map<string, number>();
    const colorFacetMap = new Map<string, number>();
    const clarityFacetMap = new Map<string, number>();
    const cutFacetMap = new Map<string, number>();
    const originFacetMap = new Map<string, number>();
    
    // Category facets
    facets[0].forEach((facet: any) => {
      if (facet.categoryId) {
        categoryFacetMap.set(facet.categoryId as number, (categoryFacetMap.get(facet.categoryId as number) || 0) + (facet._count.categoryId as number));
      }
    });
    
    // Certificate facets
    facets[1].forEach((facet: any) => {
      if (facet.certificate) {
        certificateFacetMap.set(facet.certificate as string, (certificateFacetMap.get(facet.certificate as string) || 0) + (facet._count.certificate as number));
      }
    });
    
    // Color facets
    facets[2].forEach((facet: any) => {
      if (facet.color) {
        colorFacetMap.set(facet.color as string, (colorFacetMap.get(facet.color as string) || 0) + (facet._count.color as number));
      }
    });
    
    // Clarity facets
    facets[3].forEach((facet: any) => {
      if (facet.clarity) {
        clarityFacetMap.set(facet.clarity as string, (clarityFacetMap.get(facet.clarity as string) || 0) + (facet._count.clarity as number));
      }
    });
    
    // Cut facets
    facets[4].forEach((facet: any) => {
      if (facet.cut) {
        cutFacetMap.set(facet.cut as string, (cutFacetMap.get(facet.cut as string) || 0) + (facet._count.cut as number));
      }
    });
    
    // Origin facets
    facets[5].forEach((facet: any) => {
      if (facet.origin) {
        originFacetMap.set(facet.origin as string, (originFacetMap.get(facet.origin as string) || 0) + (facet._count.origin as number));
      }
    });
    
    // Convert facet maps to arrays
    const categoryFacets = Array.from(categoryFacetMap.entries()).map(([id, count]) => {
      const category = categories.find(c => c.id === id);
      return {
        id,
        name: category?.name || 'Unknown',
        count
      };
    });
    
    const certificateFacets = Array.from(certificateFacetMap.entries()).map(([certificate, count]) => ({
      certificate,
      count
    }));
    
    const colorFacets = Array.from(colorFacetMap.entries()).map(([color, count]) => ({
      color,
      count
    }));
    
    const clarityFacets = Array.from(clarityFacetMap.entries()).map(([clarity, count]) => ({
      clarity,
      count
    }));
    
    const cutFacets = Array.from(cutFacetMap.entries()).map(([cut, count]) => ({
      cut,
      count
    }));
    
    const originFacets = Array.from(originFacetMap.entries()).map(([origin, count]) => ({
      origin,
      count
    }));
    
    const initialFacets = {
      categories: categoryFacets,
      certificates: certificateFacets,
      colors: colorFacets,
      clarities: clarityFacets,
      cuts: cutFacets,
      origins: originFacets
    };
    
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
      },
      initialFacets
    };
    
    return {
      props: result,
    };
  } catch (error: any) {
    console.error('Error fetching shop data:', error);
    // Return fallback data instead of failing completely
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
        initialFacets: {
          categories: [],
          certificates: [],
          colors: [],
          clarities: [],
          cuts: [],
          origins: []
        }
      },
    };
  }
};

// Optimized Product Card Component with improved mobile experience
const ShopProductCard: React.FC<{ 
  gemstone: Gemstone;
  viewMode: 'grid' | 'list';
  onQuickView?: (id: number) => void;
  onCompare?: (product: any) => void;
  onLoad?: () => void;
}> = React.memo(({ gemstone, viewMode, onQuickView, onCompare, onLoad }) => {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  // Handle image loading errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setImageError(true);
  };

  const isInStock = gemstone.stockCount > 0;
  const isLowStock = gemstone.stockCount <= 5 && gemstone.stockCount > 0;
  const hasDiscount = gemstone.salePrice && gemstone.salePrice < gemstone.price;
  const discountPercentage = hasDiscount ? Math.round(((gemstone.price - gemstone.salePrice!) / gemstone.price) * 100) : 0;

  return (
    <LuxuryCard 
      className={`group rounded-3xl border border-stone-100 hover:shadow-2xl transition-all duration-500 relative overflow-hidden transform hover:-translate-y-2 luxury-hover-glow luxury-ripple luxury-card-enter h-full flex flex-col ${viewMode === 'list' ? 'flex-row' : ''}`}
      padding="none"
      rounded="3xl"
      border={true}
      shadow="xl"
      hoverEffect={true}
    >
      {/* Premium Shine Effect for Luxury Design */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12 translate-x-full group-hover:-translate-x-full transition-transform duration-1000"></div>
      </div>
      
      {/* Premium Border Glow Effect */}
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 rounded-3xl shadow-[0_0_20px_5px_rgba(212,175,55,0.3)] luxury-glow"></div>
      </div>
      
      {/* Luxury Badges */}
      <div className="absolute top-5 left-5 z-10 flex flex-col gap-2">
        {gemstone.featured && (
          <span className="luxury-badge luxury-badge-gold">
            Featured
          </span>
        )}
        {isLowStock && isInStock && (
          <span className="luxury-badge luxury-badge-amber">
            Low Stock
          </span>
        )}
        {hasDiscount && (
          <span className="luxury-badge luxury-badge-amber">
            {discountPercentage}% OFF
          </span>
        )}
      </div>

      <div className={`relative overflow-hidden bg-gradient-to-br from-gray-50 to-stone-100 ${viewMode === 'list' ? 'aspect-video sm:aspect-square sm:w-1/3' : 'aspect-square'}`}>
        <Image
          src={getFirstImage(gemstone.images)}
          alt={gemstone.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={handleImageError}
          onLoad={() => {
            setIsImageLoaded(true);
            onLoad?.();
          }}
          ref={imageRef}
        />
        {!isInStock && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
            <span className="text-white font-bold text-lg bg-red-600 px-4 py-2 rounded-full">
              Sold Out
            </span>
          </div>
        )}
        {gemstone.cashOnDelivery && (
          <span className="absolute bottom-3 left-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center z-10">
            <Truck className="w-3.5 h-3.5 mr-1.5" />
            COD
          </span>
        )}
      </div>
      
      {/* Product Info with Luxury Styling */}
      <div className="p-5 sm:p-6 space-y-3 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-3 flex-1">
          <h3 className="font-bold text-gray-900 text-lg sm:text-xl line-clamp-2 group-hover:text-luxury-gold transition-colors duration-300 luxury-font-serif">
            {gemstone.name}
          </h3>
          <div className="text-right">
            {hasDiscount ? (
              <>
                <span className="text-2xl font-bold bg-gradient-to-r from-luxury-gold to-luxury-amber bg-clip-text text-transparent luxury-font-serif">
                  ${gemstone.salePrice!.toLocaleString()}
                </span>
                <span className="block text-gray-500 text-sm line-through">
                  ${gemstone.price.toLocaleString()}
                </span>
              </>
            ) : (
              <span className="text-2xl font-bold bg-gradient-to-r from-luxury-gold to-luxury-amber bg-clip-text text-transparent luxury-font-serif">
                ${gemstone.price.toLocaleString()}
              </span>
            )}
          </div>
        </div>
        
        <p className="text-gray-600 text-sm sm:text-base line-clamp-2 leading-relaxed luxury-font-sans">
          {gemstone.description}
        </p>
        
        <div className="flex items-center justify-between text-sm sm:text-base mt-auto pt-3 border-t border-gray-100">
          {gemstone.category && (
            <span className="text-luxury-gold font-medium bg-amber-50 px-3 py-1 rounded-full luxury-font-sans">
              {gemstone.category.name}
            </span>
          )}
          {gemstone.weight && (
            <span className="text-gray-700 font-medium flex items-center luxury-font-sans">
              <Star className="w-4 h-4 mr-1.5 text-amber-500 fill-current" />
              {gemstone.weight} ct
            </span>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {onQuickView && (
            <LuxuryButton
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView && onQuickView(gemstone.id);
              }}
              className="flex-1"
              size="sm"
            >
              <Eye className="w-4 h-4 mr-2" />
              Quick View
            </LuxuryButton>
          )}
          
          {onCompare && (
            <LuxuryButton
              variant="secondary"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onCompare && onCompare({
                  id: gemstone.id,
                  name: gemstone.name,
                  price: gemstone.price,
                  images: gemstone.images,
                  category: gemstone.category?.name,
                  averageRating: gemstone.averageRating || 0,
                  reviewCount: gemstone.reviewCount || 0,
                  specifications: {
                    weight: gemstone.weight ? `${gemstone.weight} ct` : 'N/A',
                    dimensions: gemstone.dimensions || 'N/A',
                    color: gemstone.color || 'N/A',
                    clarity: gemstone.clarity || 'N/A',
                    cut: gemstone.cut || 'N/A',
                    origin: gemstone.origin || 'N/A',
                    certification: gemstone.certificate || 'N/A'
                  },
                  stockCount: gemstone.stockCount,
                  featured: gemstone.featured
                });
              }}
              className="flex-1"
              size="sm"
            >
              <Package className="w-4 h-4 mr-2" />
              Compare
            </LuxuryButton>
          )}
        </div>
      </div>
    </LuxuryCard>
  );
});

ShopProductCard.displayName = 'ShopProductCard';

const ShopPage: React.FC<ShopProps> = ({ initialData, fallbackData, initialFacets }) => {
  const router = useRouter();
  const [products, setProducts] = useState<Gemstone[]>(initialData.gemstones);
  const [categories, setCategories] = useState<Category[]>(initialData.categories);
  const [totalProducts, setTotalProducts] = useState<number>(initialData.totalCount);
  const [hasMore, setHasMore] = useState<boolean>(initialData.hasMore);
  const [loading, setLoading] = useState<boolean>(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'name' | 'featured' | 'rating' | 'popular'>('newest');
  const [selectedCategory, setSelectedCategory] = useState<string>(router.query.category ? router.query.category as string : '');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [priceRangeLimits, setPriceRangeLimits] = useState<[number, number]>([0, 100000]);
  const [showCODOnly, setShowCODOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    category: router.query.category ? router.query.category as string : '',
    minPrice: 0,
    maxPrice: 100000,
    inStock: false,
    featured: false,
    sortBy: 'newest',
    color: '',
    clarity: '',
    cut: '',
    origin: '',
    certificate: '',
    weightRange: [0, 100]
  });
  const [facets, setFacets] = useState({
    categories: initialFacets?.categories || [],
    certificates: initialFacets?.certificates || [],
    colors: initialFacets?.colors || [],
    clarities: initialFacets?.clarities || [],
    cuts: initialFacets?.cuts || [],
    origins: initialFacets?.origins || []
  });
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  // Initialize price range limits
  useEffect(() => {
    if (initialData.gemstones.length > 0) {
      const prices = initialData.gemstones.map(p => p.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      setPriceRangeLimits([minPrice, maxPrice]);
      setPriceRange([minPrice, maxPrice]);
      
      // Also update filters
      setFilters(prev => ({
        ...prev,
        minPrice,
        maxPrice
      }));
    }
  }, [initialData.gemstones]);

  // Handle URL parameters
  useEffect(() => {
    const { category, search, sort, color, clarity, cut, origin, certificate } = router.query;
    
    if (category) {
      setSelectedCategory(category as string);
      setFilters(prev => ({ ...prev, category: category as string }));
    } else {
      setSelectedCategory('');
      setFilters(prev => ({ ...prev, category: '' }));
    }
    
    if (search) {
      setSearchQuery(search as string);
    } else {
      setSearchQuery('');
    }
    
    if (sort) {
      setSortBy(sort as any);
      setFilters(prev => ({ ...prev, sortBy: sort as any }));
    } else {
      setSortBy('newest');
      setFilters(prev => ({ ...prev, sortBy: 'newest' }));
    }
    
    if (color) {
      setFilters(prev => ({ ...prev, color: color as string }));
    } else {
      setFilters(prev => ({ ...prev, color: '' }));
    }
    
    if (clarity) {
      setFilters(prev => ({ ...prev, clarity: clarity as string }));
    } else {
      setFilters(prev => ({ ...prev, clarity: '' }));
    }
    
    if (cut) {
      setFilters(prev => ({ ...prev, cut: cut as string }));
    } else {
      setFilters(prev => ({ ...prev, cut: '' }));
    }
    
    if (origin) {
      setFilters(prev => ({ ...prev, origin: origin as string }));
    } else {
      setFilters(prev => ({ ...prev, origin: '' }));
    }
    
    if (certificate) {
      setFilters(prev => ({ ...prev, certificate: certificate as string }));
    } else {
      setFilters(prev => ({ ...prev, certificate: '' }));
    }
  }, [router.query]);

  // Fetch more products
  useEffect(() => {
    if (loading || !hasMore || products.length > 0) return;

    const loadMoreProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/shop?skip=${products.length}&limit=12&category=${filters.category}&minPrice=${filters.minPrice}&maxPrice=${filters.maxPrice}&inStock=${filters.inStock}&featured=${filters.featured}&sortBy=${filters.sortBy}&color=${filters.color}&clarity=${filters.clarity}&cut=${filters.cut}&origin=${filters.origin}&certificate=${filters.certificate}&weightRange=${filters.weightRange[0]}-${filters.weightRange[1]}&search=${searchQuery}&showCODOnly=${showCODOnly}&priceRange=${priceRangeLimits[0]}-${priceRangeLimits[1]}`);
        const data = await response.json();
        setProducts(prev => [...prev, ...data.gemstones]);
        setTotalProducts(data.totalCount);
        setHasMore(data.hasMore);
      } catch (error) {
        console.error('Error fetching more products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMoreProducts();
  }, [loading, hasMore, products.length, filters, showCODOnly, searchQuery, priceRangeLimits]);

  // Apply filters function
  const applyFilters = useCallback(() => {
    // This function is called when applying filters
    // The filtering is already handled by the useMemo hook above
    // We just need to ensure the state is updated properly
    console.log('Applying filters');
  }, [filters, showCODOnly, searchQuery]);

  // Reset filters function
  const resetFilters = useCallback(() => {
    setFilters({
      category: '',
      minPrice: priceRangeLimits[0],
      maxPrice: priceRangeLimits[1],
      inStock: false,
      featured: false,
      sortBy: 'newest',
      color: '',
      clarity: '',
      cut: '',
      origin: '',
      certificate: '',
      weightRange: [0, 100]
    });
    setSearchQuery('');
    setShowCODOnly(false);
    setSelectedCategory('');
    setPriceRange([priceRangeLimits[0], priceRangeLimits[1]]);
    
    // Update URL without page reload
    const newQuery = { ...router.query };
    delete newQuery.category;
    delete newQuery.search;
    delete newQuery.sort;
    delete newQuery.color;
    delete newQuery.clarity;
    delete newQuery.cut;
    delete newQuery.origin;
    delete newQuery.certificate;
    
    router.push({
      pathname: router.pathname,
      query: newQuery
    }, undefined, { shallow: true });
  }, [priceRangeLimits, router]);

  // Filter products based on selected filters
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (filters.category && product.categoryId !== parseInt(filters.category)) {
        return false;
      }
      if (filters.minPrice && product.price < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice && product.price > filters.maxPrice) {
        return false;
      }
      if (filters.inStock && product.stockCount <= 0) {
        return false;
      }
      if (filters.featured && !product.featured) {
        return false;
      }
      if (filters.color && product.color !== filters.color) {
        return false;
      }
      if (filters.clarity && product.clarity !== filters.clarity) {
        return false;
      }
      if (filters.cut && product.cut !== filters.cut) {
        return false;
      }
      if (filters.origin && product.origin !== filters.origin) {
        return false;
      }
      if (filters.certificate && product.certificate !== filters.certificate) {
        return false;
      }
      if (filters.weightRange[0] && product.weight && product.weight < filters.weightRange[0]) {
        return false;
      }
      if (filters.weightRange[1] && product.weight && product.weight > filters.weightRange[1]) {
        return false;
      }
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (showCODOnly && !product.cashOnDelivery) {
        return false;
      }
      return true;
    });
  }, [products, filters, searchQuery, showCODOnly]);

  // Load more products for infinite scroll
  const loadMoreProducts = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/shop?skip=${products.length}&limit=12&category=${filters.category}&minPrice=${filters.minPrice}&maxPrice=${filters.maxPrice}&inStock=${filters.inStock}&featured=${filters.featured}&sortBy=${filters.sortBy}&color=${filters.color}&clarity=${filters.clarity}&cut=${filters.cut}&origin=${filters.origin}&certificate=${filters.certificate}&weightRange=${filters.weightRange[0]}-${filters.weightRange[1]}&search=${searchQuery}&showCODOnly=${showCODOnly}&priceRange=${priceRangeLimits[0]}-${priceRangeLimits[1]}`);
      const data = await response.json();
      setProducts(prev => [...prev, ...data.gemstones]);
      setTotalProducts(data.totalCount);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error('Error fetching more products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMoreProducts();
        }
      },
      { threshold: 1.0 }
    );
    
    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }
    
    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasMore, loading, loadMoreProducts]);

  if (!initialData.gemstones.length && loading) {
    return (
      <Layout
        title="Shop Gemstones | Shankarmala"
        description="Discover our exclusive collection of fine gemstones. Browse by category, filter by price, and find your perfect piece."
      >
        <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-orange-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              <SkeletonLoader type="product-card" count={8} />
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

  const fetchProductForQuickView = async (productId: number) => {
    try {
      const res = await fetch(`/api/gemstones/${productId}`);
      if (res.ok) {
        const data = await res.json();
        setQuickViewProduct(data);
        setIsQuickViewOpen(true);
      }
    } catch (error) {
      console.error('Error fetching product for quick view:', error);
    }
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
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-orange-50">
        {/* Mobile filter drawer */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-labelledby="filters-title">
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={() => setMobileFiltersOpen(false)}
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
                        onClick={() => setMobileFiltersOpen(false)}
                        aria-label="Close filters"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>

                    <div className="mt-8 space-y-8">
                      {/* Category Filter */}
                      <div className="border-b border-gray-200 pb-6">
                        <h3 className="flow-root">
                          <button
                            type="button"
                            className="py-3 bg-white w-full flex items-center justify-between text-sm font-medium text-gray-900"
                            aria-expanded="false"
                          >
                            <span className="flex items-center">
                              <Filter className="h-4 w-4 mr-2 text-amber-600" />
                              Category
                            </span>
                            <span className="ml-6 bg-amber-100 text-amber-800 rounded-full py-1 px-2.5 text-xs font-medium">
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
                                checked={filters.category === ''}
                                onChange={() => setFilters(prev => ({ ...prev, category: '' }))}
                                className="h-4 w-4 border-gray-300 rounded text-amber-600 focus:ring-amber-500"
                                aria-label="All categories"
                              />
                              <label
                                htmlFor="category-all"
                                className="ml-3 text-sm text-gray-700 font-medium"
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
                                  checked={filters.category === String(category.id)}
                                  onChange={() => setFilters(prev => ({ ...prev, category: String(category.id) }))}
                                  className="h-4 w-4 border-gray-300 rounded text-amber-600 focus:ring-amber-500"
                                  aria-label={`${category.name} (${category.gemstoneCount} products)`}
                                />
                                <label
                                  htmlFor={`category-${category.id}`}
                                  className="ml-3 text-sm text-gray-700"
                                >
                                  {category.name} <span className="text-gray-500">({category.gemstoneCount})</span>
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Sort By Filter */}
                      <div className="border-b border-gray-200 pb-6">
                        <h3 className="flow-root">
                          <button
                            type="button"
                            className="py-3 bg-white w-full flex items-center justify-between text-sm font-medium text-gray-900"
                            aria-expanded="false"
                          >
                            <span className="flex items-center">
                              <Sliders className="h-4 w-4 mr-2 text-amber-600" />
                              Sort By
                            </span>
                          </button>
                        </h3>
                        <div className="pt-6">
                          <div className="space-y-4">
                            <select
                              value={filters.sortBy}
                              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            >
                              <option value="newest">Newest First</option>
                              <option value="price-low">Price: Low to High</option>
                              <option value="price-high">Price: High to Low</option>
                              <option value="name">Name A-Z</option>
                              <option value="featured">Featured</option>
                              <option value="rating">Top Rated</option>
                              <option value="popular">Most Popular</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Price Range Filter */}
                      <div className="border-b border-gray-200 pb-6">
                        <h3 className="flow-root">
                          <button
                            type="button"
                            className="py-3 bg-white w-full flex items-center justify-between text-sm font-medium text-gray-900"
                            aria-expanded="false"
                          >
                            <span className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-2 text-amber-600" />
                              Price Range
                            </span>
                          </button>
                        </h3>
                        <div className="pt-6">
                          <div>
                            <div className="flex justify-between text-sm text-gray-600 mb-3">
                              <span>${filters.minPrice.toLocaleString()}</span>
                              <span>${filters.maxPrice.toLocaleString()}</span>
                            </div>
                            <div className="space-y-5">
                              <div className="space-y-3">
                                <label htmlFor="min-price" className="text-sm text-gray-700 font-medium">Minimum Price</label>
                                <input
                                  id="min-price"
                                  type="range"
                                  min={priceRangeLimits[0]}
                                  max={priceRangeLimits[1]}
                                  value={filters.minPrice}
                                  onChange={(e) => setFilters(prev => ({ ...prev, minPrice: Number(e.target.value) }))}
                                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                  aria-label="Minimum price slider"
                                />
                              </div>
                              <div className="space-y-3">
                                <label htmlFor="max-price" className="text-sm text-gray-700 font-medium">Maximum Price</label>
                                <input
                                  id="max-price"
                                  type="range"
                                  min={priceRangeLimits[0]}
                                  max={priceRangeLimits[1]}
                                  value={filters.maxPrice}
                                  onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
                                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                  aria-label="Maximum price slider"
                                />
                              </div>
                            </div>
                            <div className="flex flex-col space-y-3 mt-5">
                              <div className="flex space-x-3">
                                <div className="flex-1">
                                  <label htmlFor="min-price-input" className="block text-sm text-gray-700 font-medium mb-1">Min Price</label>
                                  <input
                                    id="min-price-input"
                                    type="number"
                                    value={filters.minPrice}
                                    onChange={(e) => setFilters(prev => ({ ...prev, minPrice: Number(e.target.value) || 0 }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    placeholder="Min"
                                    aria-label="Minimum price"
                                  />
                                </div>
                                <div className="flex-1">
                                  <label htmlFor="max-price-input" className="block text-sm text-gray-700 font-medium mb-1">Max Price</label>
                                  <input
                                    id="max-price-input"
                                    type="number"
                                    value={filters.maxPrice}
                                    onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) || 0 }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    placeholder="Max"
                                    aria-label="Maximum price"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Gemstone Attributes Filters */}
                      <div className="border-b border-gray-200 pb-6">
                        <h3 className="flow-root">
                          <button
                            type="button"
                            className="py-3 bg-white w-full flex items-center justify-between text-sm font-medium text-gray-900"
                            aria-expanded="false"
                          >
                            <span className="flex items-center">
                              <Sliders className="h-4 w-4 mr-2 text-amber-600" />
                              Gemstone Attributes
                            </span>
                          </button>
                        </h3>
                        <div className="pt-6 space-y-6">
                          {/* Color Filter */}
                          {facets.colors.length > 0 && (
                            <div>
                              <label htmlFor="color-filter" className="block text-sm font-medium text-gray-700 mb-2">
                                Color
                              </label>
                              <select
                                id="color-filter"
                                value={filters.color}
                                onChange={(e) => setFilters(prev => ({ ...prev, color: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                              >
                                <option value="">All Colors</option>
                                {facets.colors
                                  .sort((a, b) => b.count - a.count)
                                  .map(color => (
                                    <option key={color.color} value={color.color}>
                                      {color.color} ({color.count})
                                    </option>
                                  ))}
                              </select>
                            </div>
                          )}
                          
                          {/* Clarity Filter */}
                          {facets.clarities.length > 0 && (
                            <div>
                              <label htmlFor="clarity-filter" className="block text-sm font-medium text-gray-700 mb-2">
                                Clarity
                              </label>
                              <select
                                id="clarity-filter"
                                value={filters.clarity}
                                onChange={(e) => setFilters(prev => ({ ...prev, clarity: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                              >
                                <option value="">All Clarities</option>
                                {facets.clarities
                                  .sort((a, b) => b.count - a.count)
                                  .map(clarity => (
                                    <option key={clarity.clarity} value={clarity.clarity}>
                                      {clarity.clarity} ({clarity.count})
                                    </option>
                                  ))}
                              </select>
                            </div>
                          )}
                          
                          {/* Cut Filter */}
                          {facets.cuts.length > 0 && (
                            <div>
                              <label htmlFor="cut-filter" className="block text-sm font-medium text-gray-700 mb-2">
                                Cut
                              </label>
                              <select
                                id="cut-filter"
                                value={filters.cut}
                                onChange={(e) => setFilters(prev => ({ ...prev, cut: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                              >
                                <option value="">All Cuts</option>
                                {facets.cuts
                                  .sort((a, b) => b.count - a.count)
                                  .map(cut => (
                                    <option key={cut.cut} value={cut.cut}>
                                      {cut.cut} ({cut.count})
                                    </option>
                                  ))}
                              </select>
                            </div>
                          )}
                          
                          {/* Origin Filter */}
                          {facets.origins.length > 0 && (
                            <div>
                              <label htmlFor="origin-filter" className="block text-sm font-medium text-gray-700 mb-2">
                                Origin
                              </label>
                              <select
                                id="origin-filter"
                                value={filters.origin}
                                onChange={(e) => setFilters(prev => ({ ...prev, origin: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                              >
                                <option value="">All Origins</option>
                                {facets.origins
                                  .sort((a, b) => b.count - a.count)
                                  .map(origin => (
                                    <option key={origin.origin} value={origin.origin}>
                                      {origin.origin} ({origin.count})
                                    </option>
                                  ))}
                              </select>
                            </div>
                          )}
                          
                          {/* Certificate Filter */}
                          {facets.certificates.length > 0 && (
                            <div>
                              <label htmlFor="certificate-filter" className="block text-sm font-medium text-gray-700 mb-2">
                                Certificate
                              </label>
                              <select
                                id="certificate-filter"
                                value={filters.certificate}
                                onChange={(e) => setFilters(prev => ({ ...prev, certificate: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                              >
                                <option value="">All Certificates</option>
                                {facets.certificates
                                  .sort((a, b) => b.count - a.count)
                                  .map(certificate => (
                                    <option key={certificate.certificate} value={certificate.certificate}>
                                      {certificate.certificate} ({certificate.count})
                                    </option>
                                  ))}
                              </select>
                            </div>
                          )}
                          
                          {/* Weight Range Filter */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Weight Range (ct)
                            </label>
                            <div className="flex justify-between text-sm text-gray-600 mb-3">
                              <span>{filters.weightRange[0]} ct</span>
                              <span>{filters.weightRange[1]} ct</span>
                            </div>
                            <div className="space-y-3">
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={filters.weightRange[0]}
                                onChange={(e) => setFilters(prev => ({ 
                                  ...prev, 
                                  weightRange: [Number(e.target.value), prev.weightRange[1]] 
                                }))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                aria-label="Minimum weight slider"
                              />
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={filters.weightRange[1]}
                                onChange={(e) => setFilters(prev => ({ 
                                  ...prev, 
                                  weightRange: [prev.weightRange[0], Number(e.target.value)] 
                                }))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                aria-label="Maximum weight slider"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Additional Filters */}
                      <div className="border-b border-gray-200 pb-6">
                        <h3 className="flow-root">
                          <button
                            type="button"
                            className="py-3 bg-white w-full flex items-center justify-between text-base font-bold text-gray-900"
                            aria-expanded="false"
                          >
                            <span className="flex items-center">
                              <Star className="h-5 w-5 mr-2 text-amber-600" />
                              Additional Filters
                            </span>
                          </button>
                        </h3>
                        <div className="pt-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                              <label
                                htmlFor="in-stock-filter"
                                className="flex items-center text-base font-medium text-gray-900"
                              >
                                <Check className="w-5 h-5 mr-2 text-amber-600" />
                                In Stock Only
                              </label>
                              <input
                                id="in-stock-filter"
                                name="additional-filters[]"
                                type="checkbox"
                                checked={filters.inStock}
                                onChange={(e) => setFilters(prev => ({ ...prev, inStock: e.target.checked }))}
                                className="h-5 w-5 border-gray-300 rounded text-amber-600 focus:ring-amber-500"
                                aria-label="Show in stock products only"
                              />
                            </div>
                            
                            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                              <label
                                htmlFor="featured-filter"
                                className="flex items-center text-base font-medium text-gray-900"
                              >
                                <Star className="w-5 h-5 mr-2 text-amber-600 fill-current" />
                                Featured Products
                              </label>
                              <input
                                id="featured-filter"
                                name="additional-filters[]"
                                type="checkbox"
                                checked={filters.featured}
                                onChange={(e) => setFilters(prev => ({ ...prev, featured: e.target.checked }))}
                                className="h-5 w-5 border-gray-300 rounded text-amber-600 focus:ring-amber-500"
                                aria-label="Show featured products only"
                              />
                            </div>
                            
                            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                              <label
                                htmlFor="cod-filter"
                                className="flex items-center text-base font-medium text-gray-900"
                              >
                                <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                                Cash on Delivery Available
                              </label>
                              <input
                                id="cod-filter"
                                name="payment-options[]"
                                type="checkbox"
                                checked={showCODOnly}
                                onChange={(e) => setShowCODOnly(e.target.checked)}
                                className="h-5 w-5 border-gray-300 rounded text-green-600 focus:ring-green-500"
                                aria-label="Show products available for Cash on Delivery"
                              />
                            </div>
                            <p className="text-sm text-gray-600">
                              Showing {filteredProducts.length} of {totalProducts} products
                              {showCODOnly && " with Cash on Delivery available"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 border border-transparent rounded-lg shadow-sm py-3 px-4 text-base font-medium text-white hover:from-amber-700 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all"
                        onClick={() => {
                          applyFilters();
                          setMobileFiltersOpen(false);
                        }}
                      >
                        Apply Filters
                      </button>
                      <button
                        type="button"
                        className="flex-1 bg-gray-100 border border-transparent rounded-lg shadow-sm py-3 px-4 text-base font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
                        onClick={resetFilters}
                      >
                        Clear all
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
            {/* Header and Filters */}
            <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Premium Gemstones Collection
                </h1>
                <p className="text-gray-600 mt-2 text-lg">Discover our exclusive collection of certified gemstones</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center border border-gray-200 rounded-xl overflow-hidden shadow-sm" role="radiogroup" aria-label="View mode">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 ${viewMode === 'grid' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                    aria-label="Grid view"
                    aria-checked={viewMode === 'grid'}
                    role="radio"
                  >
                    <Grid className="h-5 w-5" />
                  </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-3 border-l border-gray-200 ${viewMode === 'list' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                      aria-label="List view"
                      aria-checked={viewMode === 'list'}
                      role="radio"
                    >
                      <List className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="hidden lg:flex items-center space-x-2 bg-gradient-to-r from-gray-50 to-amber-50 p-2 rounded-xl border border-amber-200 shadow-sm">
                    <Truck className="h-5 w-5 text-green-600" />
                    <label htmlFor="cod-filter-desktop" className="text-sm font-medium text-gray-900 whitespace-nowrap">
                      COD Available
                    </label>
                    <input
                      id="cod-filter-desktop"
                      type="checkbox"
                      checked={showCODOnly}
                      onChange={(e) => setShowCODOnly(e.target.checked)}
                      className="h-5 w-5 border-gray-300 rounded text-green-600 focus:ring-green-500"
                      aria-label="Show products available for Cash on Delivery"
                    />
                  </div>
                  
                  <button
                    type="button"
                    className="inline-flex items-center lg:hidden px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all"
                    onClick={() => setMobileFiltersOpen(true)}
                  >
                    <Filter className="mr-2 h-5 w-5" />
                    Filters
                  </button>
                </div>
              </div>
              
              {/* Search and Filters */}
              <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                    <div className="flex-1">
                      {/* AI-Powered Search */}
                      <AIPoweredSearch />
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <button
                        type="button"
                        className="p-2 text-gray-400 hover:text-gray-500 lg:hidden"
                        onClick={() => setMobileFiltersOpen(true)}
                        aria-label="Open filters"
                      >
                        <span className="sr-only">Open filters</span>
                        <Filter className="h-5 w-5" />
                      </button>
                      
                      <div className="hidden lg:flex items-center space-x-1">
                        <button
                          onClick={() => setViewMode('grid')}
                          className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-500'}`}
                          aria-label="Grid view"
                        >
                          <Grid className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setViewMode('list')}
                          className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-500'}`}
                          aria-label="List view"
                        >
                          <List className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Count and Sorting */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <p className="text-sm sm:text-base text-gray-600">
                  Showing <span className="font-semibold">{filteredProducts.length}</span> of <span className="font-semibold">{totalProducts}</span> products
                </p>
                
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-700 hidden sm:block">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      const newSort = e.target.value as any;
                      setSortBy(newSort);
                      setFilters(prev => ({ ...prev, sortBy: newSort }));
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name A-Z</option>
                    <option value="featured">Featured</option>
                    <option value="rating">Top Rated</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>
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
                
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Breadcrumb 
              items={[
                { label: 'Home', href: '/' },
                { label: 'Shop' }
              ]} 
            />
          </div>
        </div>

                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Desktop Filters */}
                  <div className="hidden lg:block w-full lg:w-64 flex-shrink-0">
                    <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24 border border-gray-100">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                          <Filter className="h-5 w-5 mr-2 text-amber-600" />
                          Filters
                        </h3>
                        <button 
                          className="text-sm text-amber-600 hover:text-amber-800 font-medium"
                          onClick={resetFilters}
                          aria-label="Clear all filters"
                        >
                          Clear all
                        </button>
                      </div>
                      
                      {/* Sort By Filter */}
                      <div className="border-b border-gray-200 pb-6 mb-6">
                        <h3 className="flow-root">
                          <button
                            type="button"
                            className="py-3 bg-white w-full flex items-center justify-between text-sm font-semibold text-gray-900"
                            aria-expanded="false"
                          >
                            <span className="flex items-center">
                              <Sliders className="h-4 w-4 mr-2 text-amber-600" />
                              Sort By
                            </span>
                          </button>
                        </h3>
                        <div className="pt-4">
                          <select
                            value={filters.sortBy}
                            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          >
                            <option value="newest">Newest First</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="name">Name A-Z</option>
                            <option value="featured">Featured</option>
                            <option value="rating">Top Rated</option>
                            <option value="popular">Most Popular</option>
                          </select>
                        </div>
                      </div>
                      
                      {/* Category Filter */}
                      <div className="border-b border-gray-200 pb-6 mb-6">
                        <h3 className="flow-root">
                          <button
                            type="button"
                            className="py-3 bg-white w-full flex items-center justify-between text-sm font-semibold text-gray-900"
                            aria-expanded="false"
                          >
                            <span className="flex items-center">
                              <Sliders className="h-4 w-4 mr-2 text-amber-600" />
                              Category
                            </span>
                          </button>
                        </h3>
                        <div className="pt-4">
                          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                            <div className="flex items-center">
                              <input
                                id="desktop-category-all"
                                name="desktop-category[]"
                                type="radio"
                                checked={filters.category === ''}
                                onChange={() => setFilters(prev => ({ ...prev, category: '' }))}
                                className="h-4 w-4 border-gray-300 rounded text-amber-600 focus:ring-amber-500"
                                aria-label="All categories"
                              />
                              <label
                                htmlFor="desktop-category-all"
                                className="ml-3 text-sm text-gray-700"
                              >
                                All Categories
                              </label>
                            </div>
                            {facets.categories
                              .sort((a, b) => b.count - a.count)
                              .map((category) => (
                                <div key={category.id} className="flex items-center">
                                  <input
                                    id={`desktop-category-${category.id}`}
                                    name="desktop-category[]"
                                    type="radio"
                                    checked={filters.category === String(category.id)}
                                    onChange={() => setFilters(prev => ({ ...prev, category: String(category.id) }))}
                                    className="h-4 w-4 border-gray-300 rounded text-amber-600 focus:ring-amber-500"
                                    aria-label={`${category.name} (${category.count} products)`}
                                  />
                                  <label
                                    htmlFor={`desktop-category-${category.id}`}
                                    className="ml-3 text-sm text-gray-700"
                                  >
                                    {category.name} <span className="text-gray-500">({category.count})</span>
                                  </label>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-b border-gray-200 pb-6 mb-6">
                        <h3 className="flow-root">
                          <button
                            type="button"
                            className="py-3 bg-white w-full flex items-center justify-between text-sm font-semibold text-gray-900"
                            onClick={() => setShowFilters(!showFilters)}
                            aria-expanded={showFilters}
                            aria-controls="price-filters"
                          >
                            <span className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-2 text-amber-600" />
                              Price Range
                            </span>
                            <ChevronDown className={`h-5 w-5 transform ${showFilters ? 'rotate-180' : ''} text-gray-400`} />
                          </button>
                        </h3>
                        <div id="price-filters" className={`pt-4 ${showFilters ? 'block' : 'hidden'}`}>
                          <div>
                            <div className="flex justify-between text-sm text-gray-600 mb-3">
                              <span>${priceRange[0].toLocaleString()}</span>
                              <span>${priceRange[1].toLocaleString()}</span>
                            </div>
                            <div className="space-y-5">
                              <div className="space-y-3">
                                <label htmlFor="desktop-min-price" className="text-sm text-gray-700 font-medium">Minimum Price</label>
                                <input
                                  id="desktop-min-price"
                                  type="range"
                                  min={priceRangeLimits[0]}
                                  max={priceRangeLimits[1]}
                                  value={priceRange[0]}
                                  onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                  aria-label="Minimum price slider"
                                />
                              </div>
                              <div className="space-y-3">
                                <label htmlFor="desktop-max-price" className="text-sm text-gray-700 font-medium">Maximum Price</label>
                                <input
                                  id="desktop-max-price"
                                  type="range"
                                  min={priceRangeLimits[0]}
                                  max={priceRangeLimits[1]}
                                  value={priceRange[1]}
                                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                  aria-label="Maximum price slider"
                                />
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-5">
                              <div className="flex-1">
                                <label htmlFor="desktop-min-price-input" className="block text-sm text-gray-700 font-medium mb-1">Min Price</label>
                                <input
                                  id="desktop-min-price-input"
                                  type="number"
                                  value={priceRange[0]}
                                  onChange={(e) => setPriceRange([Number(e.target.value) || 0, priceRange[1]])}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                  placeholder="Min"
                                  aria-label="Minimum price"
                                />
                              </div>
                              <div className="flex-1">
                                <label htmlFor="desktop-max-price-input" className="block text-sm text-gray-700 font-medium mb-1">Max Price</label>
                                <input
                                  id="desktop-max-price-input"
                                  type="number"
                                  value={priceRange[1]}
                                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value) || 0])}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                  placeholder="Max"
                                  aria-label="Maximum price"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Gemstone Attributes Filters */}
                      <div className="border-b border-gray-200 pb-6 mb-6">
                        <h3 className="flow-root">
                          <button
                            type="button"
                            className="py-3 bg-white w-full flex items-center justify-between text-sm font-semibold text-gray-900"
                            aria-expanded="false"
                          >
                            <span className="flex items-center">
                              <Sliders className="h-4 w-4 mr-2 text-amber-600" />
                              Gemstone Attributes
                            </span>
                          </button>
                        </h3>
                        <div className="pt-4 space-y-4">
                          {/* Color Filter */}
                          {facets.colors.length > 0 && (
                            <div>
                              <label htmlFor="desktop-color-filter" className="block text-sm font-medium text-gray-700 mb-2">
                                Color
                              </label>
                              <select
                                id="desktop-color-filter"
                                value={filters.color}
                                onChange={(e) => setFilters(prev => ({ ...prev, color: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                              >
                                <option value="">All Colors</option>
                                {facets.colors
                                  .sort((a, b) => b.count - a.count)
                                  .map(color => (
                                    <option key={color.color} value={color.color}>
                                      {color.color} ({color.count})
                                    </option>
                                  ))}
                              </select>
                            </div>
                          )}
                          
                          {/* Clarity Filter */}
                          {facets.clarities.length > 0 && (
                            <div>
                              <label htmlFor="desktop-clarity-filter" className="block text-sm font-medium text-gray-700 mb-2">
                                Clarity
                              </label>
                              <select
                                id="desktop-clarity-filter"
                                value={filters.clarity}
                                onChange={(e) => setFilters(prev => ({ ...prev, clarity: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                              >
                                <option value="">All Clarities</option>
                                {facets.clarities
                                  .sort((a, b) => b.count - a.count)
                                  .map(clarity => (
                                    <option key={clarity.clarity} value={clarity.clarity}>
                                      {clarity.clarity} ({clarity.count})
                                    </option>
                                  ))}
                              </select>
                            </div>
                          )}
                          
                          {/* Cut Filter */}
                          {facets.cuts.length > 0 && (
                            <div>
                              <label htmlFor="desktop-cut-filter" className="block text-sm font-medium text-gray-700 mb-2">
                                Cut
                              </label>
                              <select
                                id="desktop-cut-filter"
                                value={filters.cut}
                                onChange={(e) => setFilters(prev => ({ ...prev, cut: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                              >
                                <option value="">All Cuts</option>
                                {facets.cuts
                                  .sort((a, b) => b.count - a.count)
                                  .map(cut => (
                                    <option key={cut.cut} value={cut.cut}>
                                      {cut.cut} ({cut.count})
                                    </option>
                                  ))}
                              </select>
                            </div>
                          )}
                          
                          {/* Origin Filter */}
                          {facets.origins.length > 0 && (
                            <div>
                              <label htmlFor="desktop-origin-filter" className="block text-sm font-medium text-gray-700 mb-2">
                                Origin
                              </label>
                              <select
                                id="desktop-origin-filter"
                                value={filters.origin}
                                onChange={(e) => setFilters(prev => ({ ...prev, origin: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                              >
                                <option value="">All Origins</option>
                                {facets.origins
                                  .sort((a, b) => b.count - a.count)
                                  .map(origin => (
                                    <option key={origin.origin} value={origin.origin}>
                                      {origin.origin} ({origin.count})
                                    </option>
                                  ))}
                              </select>
                            </div>
                          )}
                          
                          {/* Certificate Filter */}
                          {facets.certificates.length > 0 && (
                            <div>
                              <label htmlFor="desktop-certificate-filter" className="block text-sm font-medium text-gray-700 mb-2">
                                Certificate
                              </label>
                              <select
                                id="desktop-certificate-filter"
                                value={filters.certificate}
                                onChange={(e) => setFilters(prev => ({ ...prev, certificate: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                              >
                                <option value="">All Certificates</option>
                                {facets.certificates
                                  .sort((a, b) => b.count - a.count)
                                  .map(certificate => (
                                    <option key={certificate.certificate} value={certificate.certificate}>
                                      {certificate.certificate} ({certificate.count})
                                    </option>
                                  ))}
                              </select>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="pb-4">
                        <h3 className="flow-root">
                          <button
                            type="button"
                            className="py-3 bg-white w-full flex items-center justify-between text-sm font-semibold text-gray-900"
                            aria-expanded="false"
                          >
                            <span className="flex items-center">
                              <Truck className="h-4 w-4 mr-2 text-green-600" />
                              Payment Options
                            </span>
                          </button>
                        </h3>
                        <div className="pt-4">
                          <div className="space-y-3">
                            <div className="flex items-center">
                              <input
                                id="desktop-cod-filter"
                                name="desktop-payment-options[]"
                                type="checkbox"
                                checked={showCODOnly}
                                onChange={(e) => setShowCODOnly(e.target.checked)}
                                className="h-4 w-4 border-gray-300 rounded text-green-600 focus:ring-green-500"
                                aria-label="Show products available for Cash on Delivery"
                              />
                              <label
                                htmlFor="desktop-cod-filter"
                                className="ml-3 text-sm text-gray-700"
                              >
                                Cash on Delivery Available
                              </label>
                            </div>
                          </div>
                        </div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {loading && filteredProducts.length === 0 ? (
            <SkeletonLoader type="product-card" count={8} />
          ) : (
            filteredProducts.map((gemstone, index) => (
              <Link
                key={gemstone.id}
                href={`/product/${gemstone.id}`}
                className="group block"
                aria-label={`View details for ${gemstone.name}`}
              >
                <ShopProductCard 
                  gemstone={gemstone} 
                  viewMode={viewMode}
                  onQuickView={fetchProductForQuickView}
                />
              </Link>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {loading && filteredProducts.length === 0 ? (
            <SkeletonLoader type="product-card" count={4} />
          ) : (
            filteredProducts.map((gemstone, index) => (
              <Link
                key={gemstone.id}
                href={`/product/${gemstone.id}`}
                className="group block"
                aria-label={`View details for ${gemstone.name}`}
              >
                <ShopProductCard 
                  gemstone={gemstone} 
                  viewMode={viewMode}
                  onQuickView={fetchProductForQuickView}
                />
              </Link>
            ))
          )}
        </div>
      )}
      
      {/* Load More */}
      <div className="mt-10 sm:mt-12 text-center">
        {/* Infinite Scroll Loading State */}
        {loading && hasMore && filteredProducts.length > 0 && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="flex space-x-2 mb-4">
              <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <p className="text-gray-600 font-medium">Loading more exquisite gemstones...</p>
          </div>
        )}
        
        {/* Manual Load More Button */}
        {!loading && hasMore && (
          <button
            onClick={loadMoreProducts}
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all text-base font-bold disabled:opacity-50 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-transform duration-300 flex items-center justify-center mx-auto"
            aria-label="Load more products"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Loading...
              </>
            ) : (
              <>
                <Package className="w-5 h-5 mr-2" />
                Load More Products
              </>
            )}
          </button>
        )}
        
        {/* All Products Loaded State */}
        {!hasMore && filteredProducts.length > 0 && (
          <div className="py-8">
            <div className="inline-flex items-center px-4 py-2 bg-amber-50 text-amber-700 rounded-full">
              <Check className="w-5 h-5 mr-2" />
              <span className="font-medium">You've viewed all {totalProducts} products</span>
            </div>
          </div>
        )}
        
        {/* No Products Found State */}
        {filteredProducts.length === 0 && !loading && (
          <div className="text-center space-y-4 py-12">
            <div className="text-5xl mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No products found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Try adjusting your search or filter to find what you're looking for.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('');
                setSearchQuery('');
                setSortBy('newest');
                setPriceRange([priceRangeLimits[0], priceRangeLimits[1]]);
                setShowCODOnly(false);
              }}
              className="px-6 py-3 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 rounded-xl hover:from-amber-200 hover:to-orange-200 transition-colors text-base font-bold shadow-md"
              aria-label="Clear all filters"
            >
              Clear Filters
            </button>
          </div>
        )}
        
        <div ref={loadMoreRef} />
      </div>
    </div>
    <QuickViewModal 
      isOpen={isQuickViewOpen}
      onClose={() => setIsQuickViewOpen(false)}
      product={quickViewProduct}
    />
  </Layout>
);
};

export default ShopPage;
