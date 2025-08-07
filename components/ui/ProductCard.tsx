import React, { useState } from 'react';
import Image from 'next/image';
import { useEffect } from 'react';
import axios from 'axios';
import { AiOutlineHeart, AiFillHeart, AiOutlineEye } from 'react-icons/ai';
import Button from './Button';
import { useCart } from '../context/CartContext';
import { Gemstone } from '../../interfaces';

interface ProductCardProps {
  gemstone: Gemstone;
  onViewDetails: (id: string) => void;
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  gemstone,
  onViewDetails,
  variant = 'default',
  className = '',
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCart();
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistSuccess, setWishlistSuccess] = useState(false);
  const [recentLoading, setRecentLoading] = useState(false);
  const [recentSuccess, setRecentSuccess] = useState(false);
  const [wishlistError, setWishlistError] = useState('');
  const [recentError, setRecentError] = useState('');

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const images = gemstone.images || [];
  const hasMultipleImages = images.length > 1;

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);
  const handleAddToWishlist = async () => {
    setWishlistLoading(true);
    setWishlistError('');
    try {
      await axios.post('/api/users/wishlist', { gemstoneId: gemstone.id });
      setWishlistSuccess(true);
      setTimeout(() => setWishlistSuccess(false), 1200);
    } catch (err) {
      setWishlistError('Failed to add to wishlist');
    }
    setWishlistLoading(false);
  };

  // Mark as Recently Viewed
  const handleMarkRecentlyViewed = async () => {
    setRecentLoading(true);
    setRecentError('');
    try {
      await axios.post('/api/users/recently-viewed', { gemstoneId: gemstone.id });
      setRecentSuccess(true);
      setTimeout(() => setRecentSuccess(false), 1200);
    } catch (err) {
      setRecentError('Failed to mark as viewed');
    }
    setRecentLoading(false);
  };

  const handleImageChange = (direction: 'next' | 'prev') => {
    if (!hasMultipleImages) return;
    if (direction === 'next') {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    } else {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const handleAddToCart = async () => {
    setIsAdding(true);
    addToCart(gemstone, 1);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setIsAdding(false);
  };

  if (variant === 'compact') {
    return (
      <div
        className={`group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 ${className}`}
        role="region"
        aria-label={`Product card for ${gemstone.name}`}
      >
        {showToast && (
          <div className="fixed top-6 right-6 z-50 bg-pink-600 text-white px-4 py-2 rounded shadow-lg animate-fade-in">
            {toastMessage}
          </div>
        )}
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={images[currentImageIndex] || '/placeholder-gemstone.jpg'}
            alt={`Image of ${gemstone.name}`}
            width={400}
            height={400}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />

          {/* Image Navigation */}
          {hasMultipleImages && (
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleImageChange('prev');
                }}
                aria-label="Previous image"
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center text-gray-700 hover:bg-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleImageChange('next');
                }}
                aria-label="Next image"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center text-gray-700 hover:bg-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* Badges */}
          {/* No type/certification badges for Gemstone */}

          {/* Luxury Quick Actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {/* Add to Wishlist */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddToWishlist();
              }}
              aria-label={`Add ${gemstone.name} to wishlist`}
              className={`w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-pink-600 hover:bg-pink-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 ${wishlistLoading ? 'opacity-50 pointer-events-none' : ''}`}
              disabled={wishlistLoading}
              title={wishlistSuccess ? 'Added to Wishlist!' : wishlistError || 'Add to Wishlist'}
            >
              {wishlistSuccess ? (
                <AiFillHeart className="w-5 h-5 text-pink-600" />
              ) : (
                <AiOutlineHeart className="w-5 h-5" />
              )}
            </button>
            {/* Mark as Recently Viewed */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleMarkRecentlyViewed();
              }}
              aria-label={`Mark ${gemstone.name} as recently viewed`}
              className={`w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${recentLoading ? 'opacity-50 pointer-events-none' : ''}`}
              disabled={recentLoading}
              title={recentSuccess ? 'Marked as Viewed!' : recentError || 'Mark as Recently Viewed'}
            >
              <AiOutlineEye className="w-5 h-5" />
            </button>
            {/* Add to Cart */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart();
              }}
              aria-label={`Add ${gemstone.name} to cart`}
              className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-700 hover:bg-white hover:text-blue-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              disabled={isAdding}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1 truncate group-hover:text-blue-600 transition-colors">
            {gemstone.name}
          </h3>
          <div className="text-2xl font-bold text-blue-600 mb-3">
            ${gemstone.price.toLocaleString()}
          </div>

          {/* Quick Specs */}
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(String(gemstone.id))}
              className="flex-1"
              aria-label={`View details for ${gemstone.name}`}
            >
              View Details
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddToCart}
              disabled={isAdding}
              aria-label={`Add ${gemstone.name} to cart`}
            >
              {isAdding ? 'Added!' : 'Add to Cart'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddToWishlist}
              disabled={wishlistLoading}
              aria-label={`Add ${gemstone.name} to wishlist`}
              className="flex items-center gap-1 text-pink-600 border-pink-400 hover:bg-pink-50"
            >
              <AiOutlineHeart className="w-4 h-4" /> Wishlist
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkRecentlyViewed}
              disabled={recentLoading}
              aria-label={`Mark ${gemstone.name} as recently viewed`}
              className="flex items-center gap-1 text-blue-600 border-blue-400 hover:bg-blue-50"
            >
              <AiOutlineEye className="w-4 h-4" /> Viewed
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'featured') {
    return (
      <div
        className={`group bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden border border-gray-200 ${className}`}
        role="region"
        aria-label={`Product card for ${gemstone.name}`}
      >
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={images[currentImageIndex] || '/placeholder-gemstone.jpg'}
            alt={`Image of ${gemstone.name}`}
            width={400}
            height={300}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            unoptimized
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Image Navigation */}
          {hasMultipleImages && (
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleImageChange('prev');
                }}
                aria-label="Previous image"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-gray-700 hover:bg-white transition-colors shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(String(gemstone.id))}
                  className="flex-1"
                  aria-label={`View details for ${gemstone.name}`}
                >
                  View Details
                </Button>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* Badges */}
          {/* No type/certification badges for Gemstone */}

          {/* Quick Actions */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart();
              }}
              aria-label={`Add ${gemstone.name} to cart`}
              className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-gray-700 hover:bg-white hover:text-blue-600 transition-colors shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              disabled={isAdding}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(String(gemstone.id));
              }}
              aria-label={`View details for ${gemstone.name}`}
              className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-gray-700 hover:bg-white hover:text-blue-600 transition-colors shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {gemstone.name}
          </h3>

          {/* Specifications */}
          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold text-blue-600">
              ${gemstone.price.toLocaleString()}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="md"
                onClick={() => onViewDetails(String(gemstone.id))}
                aria-label={`View details for ${gemstone.name}`}
              >
                View Details
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleAddToCart}
                disabled={isAdding}
                aria-label={`Add ${gemstone.name} to cart`}
              >
                {isAdding ? 'Added!' : 'Add to Cart'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div
      className={`group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 ${className}`}
      role="region"
      aria-label={`Product card for ${gemstone.name}`}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={images[currentImageIndex] || '/placeholder-gemstone.jpg'}
          alt={`Image of ${gemstone.name}`}
          width={400}
          height={400}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          unoptimized
        />

        {/* Image Navigation */}
        {hasMultipleImages && (
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleImageChange('prev');
              }}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center text-gray-700 hover:bg-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleImageChange('next');
              }}
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center text-gray-700 hover:bg-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Badges */}
        {/* No type/certification badges for Gemstone */}

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            aria-label={`Add ${gemstone.name} to cart`}
            className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-700 hover:bg-white hover:text-blue-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            disabled={isAdding}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 truncate group-hover:text-blue-600 transition-colors">
          {gemstone.name}
        </h3>
        <div className="text-2xl font-bold text-blue-600 mb-3">
          ${gemstone.price.toLocaleString()}
        </div>

        {/* Quick Specs */}
        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(String(gemstone.id))}
            className="flex-1"
            aria-label={`View details for ${gemstone.name}`}
          >
            View Details
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleAddToCart}
            disabled={isAdding}
            aria-label={`Add ${gemstone.name} to cart`}
          >
            {isAdding ? 'Added!' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
