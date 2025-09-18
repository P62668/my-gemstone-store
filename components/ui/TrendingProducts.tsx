import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getFirstImage } from '../../utils/imageUtils';
import { TrendingUp, Star } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import framer-motion components
const MotionDiv = dynamic(() => import('framer-motion').then(mod => mod.motion.div), { ssr: false });

interface TrendingProduct {
  id: number;
  name: string;
  price: number;
  images: string[];
  averageRating: number;
  reviewCount: number;
  viewCount: number;
  category?: {
    name: string;
  };
}

const TrendingProducts: React.FC = () => {
  const [trendingProducts, setTrendingProducts] = useState<TrendingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      fetchTrendingProducts();
    }
  }, [isClient]);

  const fetchTrendingProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const res = await fetch('/api/trending?limit=8', { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (res.ok) {
        const data = await res.json();
        setTrendingProducts(data);
      } else {
        throw new Error(`Failed to fetch trending products: ${res.status} ${res.statusText}`);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else {
        setError('Failed to load trending products');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-gray-50 to-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-8">
            <TrendingUp className="w-6 h-6 text-amber-500 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">Trending Now</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-lg mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
              onClick={fetchTrendingProducts}
              className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (trendingProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-amber-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center mb-8">
          <div className="relative">
            <TrendingUp className="w-6 h-6 text-amber-500" />
            <div className="absolute -top-2 -right-2 w-3 h-3 bg-red-500 rounded-full"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 ml-2">Trending Now</h2>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {trendingProducts.map((product, index) => (
            isClient ? (
              <MotionDiv
                key={product.id}
                className="group bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 relative"
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                viewport={{ once: true }}
              >
                <Link href={`/product/${product.id}`} className="block">
                  <div className="relative aspect-square mb-3 rounded-lg overflow-hidden">
                    <Image
                      src={getFirstImage(product.images)}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 20vw, 15vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {product.averageRating && (
                      <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-bold px-1.5 py-1 rounded-full flex items-center">
                        <Star className="w-2.5 h-2.5 mr-0.5 fill-current" />
                        <span>{product.averageRating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2 group-hover:text-amber-600 transition-colors">
                    {product.name}
                  </h3>
                  
                  {product.category && (
                    <p className="text-xs text-amber-600 font-medium mb-1">
                      {product.category.name}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-gray-900">
                      ${product.price.toLocaleString()}
                    </span>
                    {product.reviewCount > 0 && (
                      <span className="text-xs text-gray-500">
                        {product.reviewCount}
                      </span>
                    )}
                  </div>
                </Link>
              </MotionDiv>
            ) : (
              <div
                key={product.id}
                className="group bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 relative"
              >
                <Link href={`/product/${product.id}`} className="block">
                  <div className="relative aspect-square mb-3 rounded-lg overflow-hidden">
                    <Image
                      src={getFirstImage(product.images)}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 20vw, 15vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {product.averageRating && (
                      <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-bold px-1.5 py-1 rounded-full flex items-center">
                        <Star className="w-2.5 h-2.5 mr-0.5 fill-current" />
                        <span>{product.averageRating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2 group-hover:text-amber-600 transition-colors">
                    {product.name}
                  </h3>
                  
                  {product.category && (
                    <p className="text-xs text-amber-600 font-medium mb-1">
                      {product.category.name}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-gray-900">
                      ${product.price.toLocaleString()}
                    </span>
                    {product.reviewCount > 0 && (
                      <span className="text-xs text-gray-500">
                        {product.reviewCount}
                      </span>
                    )}
                  </div>
                </Link>
              </div>
            )
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingProducts;