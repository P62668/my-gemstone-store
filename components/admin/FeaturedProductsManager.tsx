'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

// Dynamically import @dnd-kit components only on the client side
const DndKitComponents = dynamic(() => import('./DndKitComponents'), { 
  ssr: false,
  loading: () => <div>Loading drag and drop features...</div>
});

interface Gemstone {
  id: number;
  name: string;
  price?: number;
  images?: string[] | string;
  category?: { name: string };
}

interface FeaturedProductsManagerProps {
  allGemstones: Gemstone[];
  featuredIds: number[];
  onFeaturedIdsChange: (ids: number[]) => void;
  onRemoveFeatured: (id: number) => void;
  onToggleFeatured: (id: number, isFeatured: boolean) => Promise<void>;
}

// Enhanced SortableProductCard Component
const SortableProductCard = ({ 
  gem, 
  isFeatured, 
  onToggleFeatured 
}: { 
  gem: Gemstone; 
  isFeatured: boolean; 
  onToggleFeatured: (id: number, isFeatured: boolean) => Promise<void>;
}) => {
  const [isToggling, setIsToggling] = useState(false);

  // Parse images from JSON string if needed
  const images = typeof gem.images === 'string' ? JSON.parse(gem.images) : gem.images || [];
  const mainImage = images[0] || '/images/placeholder-gemstone.jpg';

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (isToggling) {
      return;
    }

    setIsToggling(true);

    try {
      await onToggleFeatured(gem.id, isFeatured);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div
      className={`relative bg-white rounded-2xl shadow-lg border-2 ${
        isFeatured ? 'border-amber-400' : 'border-gray-200'
      } overflow-hidden transition-all duration-200 cursor-grab`}
    >
      {/* Product Image */}
      <div className="relative h-48 bg-gray-100">
        <Image
          src={mainImage}
          alt={gem.name}
          fill
          className="object-cover"
          onError={(e) => {
            e.currentTarget.src = '/images/placeholder-gemstone.jpg';
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/30 transition-opacity">
          <div className="bg-white rounded-full p-2 shadow-lg">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </div>
        </div>
        {isFeatured && (
          <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            FEATURED
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">{gem.name}</h3>
        <p className="text-sm text-gray-500 mb-2">{gem.category?.name || 'Uncategorized'}</p>
        <div className="flex justify-between items-center">
          <span className="font-bold text-amber-600">₹{gem.price?.toLocaleString() || '0'}</span>
          <span className="text-xs text-gray-400">ID: {gem.id}</span>
        </div>
      </div>

      {/* Toggle Button - FIXED FOR PROPER CLICK HANDLING */}
      <button
        onClick={handleToggle}
        disabled={isToggling}
        className={`absolute bottom-2 right-2 px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-300 ${
          isFeatured
            ? 'bg-amber-500 text-white hover:bg-amber-600'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
        onMouseDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onMouseUp={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onTouchEnd={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onPointerUp={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
      >
        {isToggling ? (
          <span className="flex items-center gap-1">
            <span className="animate-spin">⏳</span>
            <span>{isFeatured ? 'Unfeaturing...' : 'Featuring...'}</span>
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <span>{isFeatured ? '⭐' : '☆'}</span>
            <span>{isFeatured ? 'Featured' : 'Set Featured'}</span>
          </span>
        )}
      </button>

      {/* Featured Indicator */}
      {isFeatured && (
        <div className="absolute bottom-2 right-2">
          <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 text-xs border border-amber-200">
            ↕
          </div>
        </div>
      )}
    </div>
  );
};

const FeaturedProductsManager: React.FC<FeaturedProductsManagerProps> = ({
  allGemstones,
  featuredIds,
  onFeaturedIdsChange,
  onRemoveFeatured,
  onToggleFeatured,
}) => {
  return (
    <div className="space-y-6">
      {/* Client-side drag and drop component */}
      {typeof window !== 'undefined' ? (
        <DndKitComponents
          allGemstones={allGemstones}
          featuredIds={featuredIds}
          onFeaturedIdsChange={onFeaturedIdsChange}
          onRemoveFeatured={onRemoveFeatured}
          onToggleFeatured={onToggleFeatured}
        />
      ) : (
        // Server-side fallback without drag and drop
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {allGemstones.map((gem) => {
            const isFeatured = featuredIds.includes(gem.id);
            return (
              <SortableProductCard
                key={gem.id}
                gem={gem}
                isFeatured={isFeatured}
                onToggleFeatured={onToggleFeatured}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FeaturedProductsManager;