import React from 'react';

interface ProductCardSkeletonProps {
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
}

const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = ({
  variant = 'default',
  className = '',
}) => {
  const baseClasses =
    'bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl';

  const variantClasses = {
    default: 'group cursor-pointer',
    compact: 'group cursor-pointer',
    featured: 'group cursor-pointer ring-2 ring-blue-100',
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {/* Image Skeleton */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
        {/* Shimmer Animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />

        {/* Badge Skeletons */}
        <div className="absolute top-3 left-3">
          <div className="w-16 h-6 bg-gray-300 rounded-full animate-pulse" />
        </div>
        <div className="absolute top-3 right-3">
          <div className="w-20 h-6 bg-gray-300 rounded-full animate-pulse" />
        </div>

        {/* Quick View Button Skeleton */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="w-12 h-12 bg-white/90 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Title Skeleton */}
        <div className="space-y-2">
          <div className="h-5 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
        </div>

        {/* Price Skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Rating Skeleton */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
          <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Button Skeleton */}
        <div className="pt-2">
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
};

// Grid Skeleton Component for multiple cards
interface ProductGridSkeletonProps {
  count?: number;
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
}

export const ProductGridSkeleton: React.FC<ProductGridSkeletonProps> = ({
  count = 8,
  variant = 'default',
  className = '',
}) => {
  const gridClasses = {
    default: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',
    compact: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4',
    featured: 'grid grid-cols-1 lg:grid-cols-2 gap-8',
  };

  return (
    <div className={`${gridClasses[variant]} ${className}`}>
      {[...Array(count)].map((_, index) => (
        <ProductCardSkeleton key={index} variant={variant} />
      ))}
    </div>
  );
};

// Product Detail Skeleton Component
export const ProductDetailSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb Skeleton */}
        <div className="mb-8">
          <div className="flex items-center space-x-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
                {i < 4 && <div className="w-2 h-4 bg-gray-200 rounded animate-pulse" />}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery Skeleton */}
          <div className="space-y-6">
            {/* Main Image Skeleton */}
            <div className="relative aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl shadow-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />

              {/* Badge Skeletons */}
              <div className="absolute top-4 left-4">
                <div className="w-24 h-8 bg-gray-300 rounded-full animate-pulse" />
              </div>
              <div className="absolute top-4 right-4">
                <div className="w-28 h-8 bg-gray-300 rounded-full animate-pulse" />
              </div>
            </div>

            {/* Thumbnail Gallery Skeleton */}
            <div className="grid grid-cols-5 gap-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg animate-pulse"
                />
              ))}
            </div>
          </div>

          {/* Product Information Skeleton */}
          <div className="space-y-8">
            {/* Product Header Skeleton */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-20 h-6 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
                  ))}
                </div>
                <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
              </div>

              <div className="space-y-2">
                <div className="h-12 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
              </div>

              <div className="flex items-center gap-4">
                <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>

            {/* Description Skeleton */}
            <div className="space-y-4">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse" />
              </div>
            </div>

            {/* Specifications Skeleton */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>

            {/* Add to Cart Section Skeleton */}
            <div className="space-y-6 bg-white p-6 rounded-2xl shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="w-16 h-10 bg-gray-200 rounded-lg animate-pulse" />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 h-12 bg-gray-200 rounded-lg animate-pulse" />
                <div className="flex-1 h-12 bg-gray-200 rounded-lg animate-pulse" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
                    <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
