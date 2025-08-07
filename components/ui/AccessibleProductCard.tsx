import React, { useState } from 'react';
import { StarIcon, HeartIcon, EyeIcon } from '@heroicons/react/24/outline';
import AccessibleButton from './AccessibleButton';
import { useAccessibility } from './AccessibilityProvider';

interface AccessibleProductCardProps {
  product: {
    id: string;
    name: string;
    type: string;
    price: number;
    originalPrice?: number;
    image: string;
    rating: number;
    reviewCount: number;
    certification: string;
    inStock: boolean;
    stockCount: number;
  };
  onAddToCart: (productId: string) => void;
  onQuickView: (productId: string) => void;
  onWishlist: (productId: string) => void;
  className?: string;
}

const AccessibleProductCard: React.FC<AccessibleProductCardProps> = ({
  product,
  onAddToCart,
  onQuickView,
  onWishlist,
  className = '',
}) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { announceToScreenReader } = useAccessibility();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = () => {
    onAddToCart(product.id);
    announceToScreenReader(`${product.name} added to cart`);
  };

  const handleQuickView = () => {
    onQuickView(product.id);
    announceToScreenReader(`Opening quick view for ${product.name}`);
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    onWishlist(product.id);
    announceToScreenReader(
      isWishlisted ? `${product.name} removed from wishlist` : `${product.name} added to wishlist`,
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleQuickView();
    }
  };

  return (
    <article
      className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-500 ease-out hover:shadow-2xl group cursor-pointer animate-fade-in-scale hover:scale-[1.02] hover:-translate-y-1 ${className}`}
      role="article"
      aria-labelledby={`product-${product.id}-name`}
      aria-describedby={`product-${product.id}-description`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Image Section */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
        <img
          src={product.image || '/images/placeholder-gemstone.jpg'}
          alt={`${product.name}, ${product.type}, ${product.certification} certified`}
          className="w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-110 group-hover:brightness-110"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = '/images/placeholder-gemstone.jpg';
          }}
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 animate-fade-in-up">
          <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
            {product.certification}
          </span>
        </div>

        <div className="absolute top-3 right-3 animate-fade-in-up">
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold shadow-lg ${
              product.inStock ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {product.inStock ? `${product.stockCount} left` : 'Out of Stock'}
          </span>
        </div>

        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out flex items-end justify-center pb-4">
          <div className="flex gap-2 animate-fade-in-up">
            <AccessibleButton
              variant="ghost"
              size="sm"
              onClick={handleQuickView}
              aria-label={`Quick view ${product.name}`}
              className="bg-white/95 hover:bg-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110"
            >
              <EyeIcon className="w-5 h-5" />
            </AccessibleButton>

            <AccessibleButton
              variant="ghost"
              size="sm"
              onClick={handleWishlist}
              aria-label={`${isWishlisted ? 'Remove from' : 'Add to'} wishlist`}
              className="bg-white/95 hover:bg-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110"
            >
              <HeartIcon
                className={`w-5 h-5 transition-all duration-300 ${isWishlisted ? 'text-red-500 fill-current' : ''}`}
              />
            </AccessibleButton>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-3 transition-all duration-300 ease-out group-hover:bg-gradient-to-br group-hover:from-gray-50 group-hover:to-white">
        {/* Product Type */}
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium transition-all duration-300 group-hover:bg-blue-200 group-hover:scale-105 inline-block">
          {product.type}
        </span>

        {/* Product Name */}
        <h3
          id={`product-${product.id}-name`}
          className="text-lg font-semibold text-gray-900 line-clamp-2 transition-all duration-300 group-hover:text-blue-900"
        >
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-blue-600 transition-all duration-300 group-hover:text-blue-700 group-hover:scale-105">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through transition-all duration-300 group-hover:text-gray-600">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1" role="img" aria-label={`${product.rating} out of 5 stars`}>
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                className={`w-4 h-4 transition-all duration-300 ${
                  i < Math.floor(product.rating)
                    ? 'text-yellow-400 fill-current group-hover:scale-110'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 transition-all duration-300 group-hover:text-gray-700">
            ({product.reviewCount} reviews)
          </span>
        </div>

        {/* Add to Cart Button */}
        <AccessibleButton
          variant="primary"
          size="lg"
          onClick={handleAddToCart}
          disabled={!product.inStock}
          announceOnClick={`${product.name} added to cart for ${formatPrice(product.price)}`}
          className="w-full transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
          aria-describedby={`stock-${product.id}`}
        >
          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
        </AccessibleButton>

        <p id={`stock-${product.id}`} className="sr-only">
          {product.inStock ? `${product.stockCount} available` : 'Out of stock'}
        </p>
      </div>
    </article>
  );
};

export default AccessibleProductCard;
