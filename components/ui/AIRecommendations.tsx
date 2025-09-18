import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getFirstImage } from '../../utils/imageUtils';
import { Sparkles, ChevronRight, Star, Zap, Gift, TrendingUp } from 'lucide-react';
import { useUser } from '../context/UserContext';
import dynamic from 'next/dynamic';

// Dynamically import framer-motion components
const MotionDiv = dynamic(() => import('framer-motion').then(mod => mod.motion.div), { ssr: false });

interface RecommendedProduct {
  id: number;
  name: string;
  price: number;
  images: string[];
  averageRating: number;
  reviewCount: number;
  aiScore?: number;
  discountPercentage?: number;
  isNew?: boolean;
  category?: {
    name: string;
  };
}

const AIRecommendations: React.FC = () => {
  const { user } = useUser();
  const [recommendations, setRecommendations] = useState<RecommendedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      fetchRecommendations();
    }
  }, [user, isClient]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const res = await fetch('/api/recommendations-ai', { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (res.ok) {
        const data = await res.json();
        setRecommendations(data.slice(0, 8)); // Limit to 8 recommendations
      } else {
        throw new Error(`Failed to fetch recommendations: ${res.status} ${res.statusText}`);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else {
        setError('Failed to load personalized recommendations');
      }
      
      // Fallback to basic recommendations
      fetchFallbackRecommendations();
    } finally {
      setLoading(false);
    }
  };

  const fetchFallbackRecommendations = async () => {
    try {
      const res = await fetch('/api/recommendations');
      if (res.ok) {
        const data = await res.json();
        setRecommendations(data.slice(0, 8)); // Limit to 8 recommendations
      }
    } catch (err) {
      console.error('Error fetching fallback recommendations:', err);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-gray-50 to-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-8">
            <Sparkles className="w-6 h-6 text-amber-500 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">AI-Powered Recommendations</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gradient-to-br from-gray-50 to-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-red-500 mb-4">{error}</div>
            <button 
              onClick={fetchRecommendations}
              className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-amber-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="relative">
              <Sparkles className="w-6 h-6 text-amber-500" />
              <Zap className="w-3 h-3 text-blue-500 absolute -top-1 -right-1" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 ml-2">
              {user ? 'Personalized for You' : 'Popular Picks'}
            </h2>
          </div>
          {isClient ? (
            <Link 
              href="/recommendations" 
              className="flex items-center text-amber-600 hover:text-amber-700 font-medium"
            >
              View All
              <ChevronRight className="w-5 h-5 ml-1" />
            </Link>
          ) : (
            <div className="flex items-center text-amber-600 font-medium">
              View All
              <ChevronRight className="w-5 h-5 ml-1" />
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {recommendations.map((product, index) => (
            isClient ? (
              <MotionDiv
                key={product.id}
                className="group bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 relative"
                whileHover={{ y: -8 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                viewport={{ once: true }}
              >
                {/* Badges */}
                <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
                  {product.isNew && (
                    <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                      <Gift className="w-3 h-3 mr-1" />
                      New
                    </span>
                  )}
                  {product.discountPercentage && product.discountPercentage > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      -{product.discountPercentage}%
                    </span>
                  )}
                  {product.aiScore && product.aiScore > 80 && (
                    <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                      <Zap className="w-3 h-3 mr-1" />
                      Hot
                    </span>
                  )}
                </div>
                
                <Link href={`/product/${product.id}`} className="block">
                  <div className="relative aspect-square mb-4 rounded-xl overflow-hidden">
                    <Image
                      src={getFirstImage(product.images)}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {product.averageRating && (
                      <div className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        <span>{product.averageRating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-amber-600 transition-colors">
                    {product.name}
                  </h3>
                  
                  {product.category && (
                    <p className="text-xs text-amber-600 font-medium mb-2">
                      {product.category.name}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-lg font-bold text-gray-900">
                        ${product.price.toLocaleString()}
                      </span>
                      {product.discountPercentage && product.discountPercentage > 0 && (
                        <span className="text-xs text-gray-500 line-through ml-2">
                          ${(product.price * 100 / (100 - product.discountPercentage)).toFixed(0)}
                        </span>
                      )}
                    </div>
                    {product.reviewCount > 0 && (
                      <span className="text-xs text-gray-500">
                        {product.reviewCount} reviews
                      </span>
                    )}
                  </div>
                  
                  {/* AI Confidence Indicator */}
                  {product.aiScore && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 flex items-center">
                          <Zap className="w-3 h-3 mr-1 text-amber-500" />
                          AI Match
                        </span>
                        <span className="font-medium text-amber-600">
                          {Math.min(100, Math.round(product.aiScore))}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          className="bg-amber-500 h-1.5 rounded-full" 
                          style={{ width: `${Math.min(100, product.aiScore || 0)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </Link>
              </MotionDiv>
            ) : (
              <div
                key={product.id}
                className="group bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 relative"
              >
                {/* Badges */}
                <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
                  {product.isNew && (
                    <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                      <Gift className="w-3 h-3 mr-1" />
                      New
                    </span>
                  )}
                  {product.discountPercentage && product.discountPercentage > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      -{product.discountPercentage}%
                    </span>
                  )}
                  {product.aiScore && product.aiScore > 80 && (
                    <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                      <Zap className="w-3 h-3 mr-1" />
                      Hot
                    </span>
                  )}
                </div>
                
                <Link href={`/product/${product.id}`} className="block">
                  <div className="relative aspect-square mb-4 rounded-xl overflow-hidden">
                    <Image
                      src={getFirstImage(product.images)}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {product.averageRating && (
                      <div className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        <span>{product.averageRating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-amber-600 transition-colors">
                    {product.name}
                  </h3>
                  
                  {product.category && (
                    <p className="text-xs text-amber-600 font-medium mb-2">
                      {product.category.name}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-lg font-bold text-gray-900">
                        ${product.price.toLocaleString()}
                      </span>
                      {product.discountPercentage && product.discountPercentage > 0 && (
                        <span className="text-xs text-gray-500 line-through ml-2">
                          ${(product.price * 100 / (100 - product.discountPercentage)).toFixed(0)}
                        </span>
                      )}
                    </div>
                    {product.reviewCount > 0 && (
                      <span className="text-xs text-gray-500">
                        {product.reviewCount} reviews
                      </span>
                    )}
                  </div>
                  
                  {/* AI Confidence Indicator */}
                  {product.aiScore && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 flex items-center">
                          <Zap className="w-3 h-3 mr-1 text-amber-500" />
                          AI Match
                        </span>
                        <span className="font-medium text-amber-600">
                          {Math.min(100, Math.round(product.aiScore))}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          className="bg-amber-500 h-1.5 rounded-full" 
                          style={{ width: `${Math.min(100, product.aiScore || 0)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </Link>
              </div>
            )
          ))}
        </div>
        
        {/* Personalization Note */}
        {user && isClient && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-500 mr-2" />
              Recommendations powered by AI, personalized to your preferences
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default AIRecommendations;