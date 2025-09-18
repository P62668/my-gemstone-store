import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { prisma } from '../lib/prisma';
import getSessionOrRedirect from '../utils/withServerAuth';
import AIRecommendations from '../components/ui/AIRecommendations';
import PersonalizedOffers from '../components/ui/PersonalizedOffers';
import { Search, Filter, Grid, List, ChevronDown, Sliders, Star, DollarSign } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getFirstImage } from '../utils/imageUtils';
import LuxuryButton from '../components/ui/LuxuryButton';

interface RecommendedProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  images: string[];
  averageRating: number;
  reviewCount: number;
  aiScore?: number;
  discountPercentage?: number;
  isNew?: boolean;
  categoryId: number;
  category?: {
    name: string;
  };
}

interface RecommendationPageProps {
  fallbackData: {
    recommendations: RecommendedProduct[];
  };
}

export const getServerSideProps: GetServerSideProps<RecommendationPageProps> = async (context) => {
  const res = await getSessionOrRedirect(context);
  if ('redirect' in res) return res;
  
  const userId = Number(res.session.user.id);
  
  try {
    // For server-side rendering, we'll provide fallback data
    // The client will fetch personalized data
    let recommendations: any[] = [];
    
    if (userId) {
      // Get user's purchase history to inform recommendations
      const userOrders = await prisma.order.findMany({
        where: {
          userId: userId,
          status: 'DELIVERED'
        },
        include: {
          items: {
            include: {
              gemstone: {
                include: { category: true }
              }
            }
          }
        }
      });
      
      // Get categories user has purchased from
      const purchasedCategories = new Set<number>();
      userOrders.forEach(order => {
        order.items.forEach(item => {
          if (item.gemstone.categoryId) {
            purchasedCategories.add(item.gemstone.categoryId);
          }
        });
      });
      
      // Get recommendations based on purchased categories
      if (purchasedCategories.size > 0) {
        recommendations = await prisma.gemstone.findMany({
          where: {
            active: true,
            categoryId: { in: Array.from(purchasedCategories) },
            stockCount: { gt: 0 }
          },
          include: { category: true },
          orderBy: { createdAt: 'desc' },
          take: 12
        });
      }
    }
    
    // If no personalized recommendations, get featured products
    if (recommendations.length === 0) {
      recommendations = await prisma.gemstone.findMany({
        where: {
          active: true,
          featured: true,
          stockCount: { gt: 0 }
        },
        include: { category: true },
        orderBy: { createdAt: 'desc' },
        take: 12
      });
    }
    
    // Transform recommendations for client
    const transformedRecommendations = recommendations.map(gemstone => ({
      id: gemstone.id,
      name: gemstone.name,
      description: gemstone.description,
      price: gemstone.price,
      images: Array.isArray(gemstone.images) 
        ? gemstone.images 
        : typeof gemstone.images === 'string'
          ? JSON.parse(gemstone.images)
          : ['/images/placeholder-gemstone.jpg'],
      averageRating: gemstone.averageRating || 0,
      reviewCount: gemstone.reviewCount || 0,
      categoryId: gemstone.categoryId,
      category: gemstone.category,
      aiScore: 50, // Default score for SSR
      isNew: (Date.now() - new Date(gemstone.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000
    }));
    
    return {
      props: {
        fallbackData: {
          recommendations: transformedRecommendations
        }
      }
    };
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return {
      props: {
        fallbackData: {
          recommendations: []
        }
      }
    };
  }
};

const RecommendationsPage: React.FC<RecommendationPageProps> = ({ fallbackData }) => {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'relevance' | 'price-low' | 'price-high' | 'rating' | 'newest'>('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [minRating, setMinRating] = useState<number>(0);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
              Personalized Recommendations
            </h1>
            <p className="mt-6 max-w-lg mx-auto text-xl text-amber-100">
              Discover gemstones and jewelry handpicked just for you
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Personalized Offers */}
          <PersonalizedOffers />
          
          {/* AI Recommendations */}
          <AIRecommendations />
          
          {/* Filter Section */}
          <div className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <h2 className="text-2xl font-bold text-gray-900">All Recommendations</h2>
              
              <div className="mt-4 md:mt-0 flex items-center space-x-4">
                <div className="flex items-center">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-amber-100 text-amber-700' : 'text-gray-400 hover:text-gray-700'}`}
                    aria-label="Grid view"
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-amber-100 text-amber-700' : 'text-gray-400 hover:text-gray-700'}`}
                    aria-label="List view"
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                    <option value="newest">Newest Arrivals</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </button>
              </div>
            </div>
            
            {/* Filter Panel */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Price Range */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Price Range</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">₹{priceRange[0]}</span>
                        <span className="text-sm text-gray-600">₹{priceRange[1]}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100000"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                  
                  {/* Category Filter */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Category</h3>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      <option value="">All Categories</option>
                      <option value="rings">Rings</option>
                      <option value="necklaces">Necklaces</option>
                      <option value="earrings">Earrings</option>
                      <option value="bracelets">Bracelets</option>
                    </select>
                  </div>
                  
                  {/* Rating Filter */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Minimum Rating</h3>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setMinRating(star)}
                          className={`p-1 ${star <= minRating ? 'text-amber-400' : 'text-gray-300'}`}
                        >
                          <Star className={`w-5 h-5 ${star <= minRating ? 'fill-current' : ''}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Apply Button */}
                  <div className="flex items-end">
                    <LuxuryButton
                      onClick={() => setShowFilters(false)}
                      variant="primary" size="md" className="w-full"
                    >
                      Apply Filters
                    </LuxuryButton>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Product Grid/List */}
          <div className="mt-8">
            {fallbackData.recommendations.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No recommendations found</h3>
                <p className="text-gray-500">Try adjusting your filters or check back later</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-6'}>
                {fallbackData.recommendations.map((product) => (
                  <div 
                    key={product.id} 
                    className={`bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                  >
                    <Link href={`/product/${product.id}`} className={viewMode === 'list' ? 'flex-shrink-0 w-1/3 relative' : 'relative aspect-square'}>
                      <Image
                        src={getFirstImage(product.images)}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                      {product.isNew && (
                        <span className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          NEW
                        </span>
                      )}
                      {product.discountPercentage && product.discountPercentage > 0 && (
                        <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {product.discountPercentage}% OFF
                        </span>
                      )}
                    </Link>
                    
                    <div className={viewMode === 'list' ? 'flex-1 p-6' : 'p-6'}>
                      <div className="flex flex-col h-full">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                              {product.category?.name || 'Gemstone'}
                            </span>
                            {product.aiScore && (
                              <span className="text-xs text-gray-500">
                                AI Score: {product.aiScore}
                              </span>
                            )}
                          </div>
                          
                          <h3 className="mt-2 text-lg font-semibold text-gray-900 line-clamp-2">
                            {product.name}
                          </h3>
                          
                          <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                            {product.description}
                          </p>
                          
                          <div className="mt-3 flex items-center">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < Math.floor(product.averageRating)
                                      ? 'text-amber-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="ml-2 text-sm text-gray-600">
                              {product.averageRating.toFixed(1)} ({product.reviewCount} reviews)
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex items-center justify-between">
                          <div>
                            <span className="text-lg font-bold text-gray-900">
                              ₹{product.price.toLocaleString()}
                            </span>
                            {product.reviewCount > 0 && (
                              <span className="text-xs text-gray-500">
                                {product.reviewCount} reviews
                              </span>
                            )}
                          </div>
                          <LuxuryButton variant="primary" size="md">
                            View Details
                          </LuxuryButton>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RecommendationsPage;