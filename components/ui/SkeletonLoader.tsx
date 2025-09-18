import React from 'react';

interface SkeletonLoaderProps {
  type?: 'product-card' | 'product-detail' | 'cart-item' | 'wishlist-item';
  count?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  type = 'product-card', 
  count = 1 
}) => {
  const renderProductCardSkeleton = () => (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-200 rounded-t-xl" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="flex justify-between pt-2">
          <div className="h-3 bg-gray-200 rounded w-1/4" />
          <div className="h-3 bg-gray-200 rounded w-1/4" />
        </div>
      </div>
    </div>
  );

  const renderProductDetailSkeleton = () => (
    <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image gallery skeleton */}
        <div>
          <div className="aspect-square bg-gray-200 rounded-2xl" />
          <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square w-20 bg-gray-200 rounded-lg flex-shrink-0" />
            ))}
          </div>
        </div>
        
        {/* Product info skeleton */}
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="flex gap-3">
            <div className="h-6 bg-gray-200 rounded w-1/4" />
            <div className="h-6 bg-gray-200 rounded w-1/4" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded" />
            ))}
          </div>
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="flex gap-3">
            <div className="h-12 bg-gray-200 rounded-xl flex-1" />
            <div className="h-12 bg-gray-200 rounded-xl flex-1" />
            <div className="h-12 bg-gray-200 rounded-xl w-12" />
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCartItemSkeleton = () => (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-sm animate-pulse">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-24 h-24 bg-gray-200 rounded-md" />
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="flex gap-3">
            <div className="h-8 bg-gray-200 rounded-md w-24" />
            <div className="h-8 bg-gray-200 rounded-md w-20" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderWishlistItemSkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="flex gap-2 pt-2">
          <div className="h-10 bg-gray-200 rounded-lg flex-1" />
          <div className="h-10 bg-gray-200 rounded-lg w-16" />
        </div>
      </div>
    </div>
  );

  const skeletons = {
    'product-card': renderProductCardSkeleton,
    'product-detail': renderProductDetailSkeleton,
    'cart-item': renderCartItemSkeleton,
    'wishlist-item': renderWishlistItemSkeleton,
  };

  const renderSkeleton = skeletons[type] || renderProductCardSkeleton;

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>
          {renderSkeleton()}
        </div>
      ))}
    </>
  );
};

export default SkeletonLoader;