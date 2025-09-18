import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getFirstImage } from '../utils/imageUtils';
import { Eye } from 'lucide-react';

interface RecentlyViewedProduct {
  id: number;
  name: string;
  price: number;
  images: string[];
}

const RecentlyViewed: React.FC = () => {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load recently viewed products from the database
    const loadRecentlyViewed = async () => {
      try {
        const response = await fetch('/api/recently-viewed');
        if (response.ok) {
          const data = await response.json();
          // Validate the data structure
          const validItems = data
            .filter((item: any) => 
              item && 
              typeof item.id === 'number' && 
              typeof item.name === 'string' && 
              typeof item.price === 'number' && 
              Array.isArray(item.images)
            );
          setRecentlyViewed(validItems);
        }
      } catch (error) {
        console.error('Error loading recently viewed products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecentlyViewed();
  }, []);

  if (loading) {
    return (
      <div className="mt-16 pt-8 border-t border-gray-200">
        <div className="flex items-center gap-2 mb-6">
          <Eye className="w-5 h-5 text-amber-600" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 luxury-font-serif">Recently Viewed</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-4 animate-pulse">
              <div className="aspect-square mb-3 bg-gray-200 rounded-lg"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recentlyViewed.length === 0) {
    return null;
  }

  return (
    <div className="mt-16 pt-8 border-t border-gray-200">
      <div className="flex items-center gap-2 mb-6">
        <Eye className="w-5 h-5 text-amber-600" />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 luxury-font-serif">Recently Viewed</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {recentlyViewed.map((product) => (
          <Link 
            key={product.id} 
            href={`/product/${product.id}`}
            className="group block"
          >
            <div className="bg-white rounded-xl p-4 hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-amber-200">
              <div className="relative aspect-square mb-3">
                <Image
                  src={getFirstImage(product.images)}
                  alt={product.name}
                  fill
                  sizes="20vw"
                  className="object-cover rounded-lg"
                />
              </div>
              <h3 className="font-medium text-gray-900 text-sm group-hover:text-amber-600 line-clamp-2 transition-colors luxury-font-serif">
                {product.name}
              </h3>
              <p className="text-amber-600 font-bold text-sm mt-1 luxury-font-serif">
                ${product.price.toLocaleString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecentlyViewed;