import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { getFirstImage } from '../../utils/imageUtils';
import { Sparkles, ChevronRight } from 'lucide-react';

// Dynamically import framer-motion components
const MotionDiv = dynamic(() => import('framer-motion').then(mod => mod.motion.div), { ssr: false });

interface RecommendedProduct {
  id: number;
  name: string;
  price: number;
  images: string[];
  averageRating: number;
  reviewCount: number;
  category?: {
    name: string;
  };
}

const SmartRecommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<RecommendedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/recommendations');
      if (res.ok) {
        const data = await res.json();
        setRecommendations(data.slice(0, 8)); // Limit to 8 recommendations
      } else {
        throw new Error('Failed to fetch recommendations');
      }
    } catch (err) {
      setError('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-gray-50 to-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-8">
            <Sparkles className="w-6 h-6 text-amber-500 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">Personalized Recommendations</h2>
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

  if (error || recommendations.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-amber-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {typeof window !== 'undefined' ? (
          <MotionDiv 
            className="flex items-center justify-between mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center">
              <Sparkles className="w-6 h-6 text-amber-500 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Personalized Recommendations</h2>
            </div>
            <Link 
              href="/recommendations" 
              className="flex items-center text-amber-600 hover:text-amber-700 font-medium"
            >
              View All
              <ChevronRight className="w-5 h-5 ml-1" />
            </Link>
          </MotionDiv>
        ) : (
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Sparkles className="w-6 h-6 text-amber-500 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Personalized Recommendations</h2>
            </div>
            <Link 
              href="/recommendations" 
              className="flex items-center text-amber-600 hover:text-amber-700 font-medium"
            >
              View All
              <ChevronRight className="w-5 h-5 ml-1" />
            </Link>
          </div>
        )}
        
        {typeof window !== 'undefined' ? (
          <MotionDiv 
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            {recommendations.map((product, index) => (
              <MotionDiv
                key={product.id}
                className="group bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
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
                      <div className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
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
                    <span className="text-lg font-bold text-gray-900">
                      ${product.price.toLocaleString()}
                    </span>
                    {product.reviewCount > 0 && (
                      <span className="text-xs text-gray-500">
                        {product.reviewCount} reviews
                      </span>
                    )}
                  </div>
                </Link>
              </MotionDiv>
            ))}
          </MotionDiv>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recommendations.map((product) => (
              <div
                key={product.id}
                className="group bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
              >
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
                      <div className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
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
                    <span className="text-lg font-bold text-gray-900">
                      ${product.price.toLocaleString()}
                    </span>
                    {product.reviewCount > 0 && (
                      <span className="text-xs text-gray-500">
                        {product.reviewCount} reviews
                      </span>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default SmartRecommendations;
