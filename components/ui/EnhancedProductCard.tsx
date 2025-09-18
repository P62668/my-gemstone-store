import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Heart, ShoppingCart, Eye, Star, Share2, Clock, Flame, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import LuxuryCard from './LuxuryCard';

// Dynamically import framer-motion components
const MotionImg = dynamic(() => import('framer-motion').then(mod => mod.motion.img), { ssr: false });
const MotionDiv = dynamic(() => import('framer-motion').then(mod => mod.motion.div), { ssr: false });
const AnimatePresence = dynamic(() => import('framer-motion').then(mod => mod.AnimatePresence), { ssr: false });
const MotionButton = dynamic(() => import('framer-motion').then(mod => mod.motion.button), { ssr: false });
const MotionSpan = dynamic(() => import('framer-motion').then(mod => mod.motion.span), { ssr: false });

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  category: string;
  discount?: number;
  stockCount: number;
  isNew?: boolean;
  isTrending?: boolean;
  isLimited?: boolean;
  views?: number;
  soldCount?: number;
  description?: string;
}

interface EnhancedProductCardProps {
  product: Product;
  onAddToCart: (productId: number) => void;
  onWishlistToggle: (productId: number) => void;
  onQuickView: (product: Product) => void;
  onClick: (productId: number) => void;
  className?: string;
}

const EnhancedProductCard: React.FC<EnhancedProductCardProps> = ({
  product,
  onAddToCart,
  onWishlistToggle,
  onQuickView,
  onClick,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const triggerConfetti = async (particleCount: number = 100) => {
    if (typeof window !== 'undefined' && typeof self !== 'undefined') {
      try {
        // Simple console log instead of canvas-confetti
        console.log('Confetti effect triggered with', particleCount, 'particles');
      } catch (error) {
        // Silently fail if confetti can't be loaded
        console.warn('Confetti failed to load:', error);
      }
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onAddToCart) {
      onAddToCart(product.id);
      
      // Trigger confetti effect when adding to cart
      if (typeof window !== 'undefined' && typeof self !== 'undefined') {
        try {
          // Simple console log instead of canvas-confetti
          console.log('Confetti effect triggered for adding to cart');
        } catch (error) {
          // Silently fail if confetti can't be loaded
          console.warn('Confetti failed to load:', error);
        }
      }
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    onWishlistToggle(product.id);

    if (!isWishlisted) {
      toast.success('Added to wishlist! ❤️');
    } else {
      toast.success('Removed from wishlist');
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickView(product);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: product.name,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <LuxuryCard
      className={`group relative bg-white border border-gray-200 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 ${className}`}
      padding="none"
      rounded="2xl"
      border={true}
      shadow="sm"
      hoverEffect={true}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick(product.id)}
    >
      {/* Product Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {/* Main Image */}
        {typeof window !== 'undefined' ? (
          <MotionImg
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ) : (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        )}

        {/* Gradient Overlay */}
        {typeof window !== 'undefined' ? (
          <MotionDiv
            className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-2">
          {typeof window !== 'undefined' ? (
            <AnimatePresence>
              {product.isNew && (
                <MotionSpan
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  NEW
                </MotionSpan>
              )}
              {product.isTrending && (
                <MotionSpan
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center"
                >
                  <Flame className="w-3 h-3 mr-1" />
                  TRENDING
                </MotionSpan>
              )}
              {product.isLimited && (
                <MotionSpan
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium"
                >
                  LIMITED
                </MotionSpan>
              )}
              {product.discount && (
                <MotionSpan
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium"
                >
                  -{discountPercentage}%
                </MotionSpan>
              )}
            </AnimatePresence>
          ) : (
            <>
              {product.isNew && (
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center">
                  <Sparkles className="w-3 h-3 mr-1" />
                  NEW
                </span>
              )}
              {product.isTrending && (
                <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center">
                  <Flame className="w-3 h-3 mr-1" />
                  TRENDING
                </span>
              )}
              {product.isLimited && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  LIMITED
                </span>
              )}
              {product.discount && (
                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  -{discountPercentage}%
                </span>
              )}
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex flex-col space-y-2">
          {typeof window !== 'undefined' ? (
            <>
              <MotionButton
                onClick={handleWishlistToggle}
                className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Heart
                  className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                />
              </MotionButton>

              <MotionButton
                onClick={handleQuickView}
                className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Eye className="w-5 h-5 text-gray-600" />
              </MotionButton>

              <MotionButton
                onClick={handleShare}
                className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Share2 className="w-5 h-5 text-gray-600" />
              </MotionButton>
            </>
          ) : (
            <>
              <button
                onClick={handleWishlistToggle}
                className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
              >
                <Heart
                  className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                />
              </button>

              <button
                onClick={handleQuickView}
                className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
              >
                <Eye className="w-5 h-5 text-gray-600" />
              </button>

              <button
                onClick={handleShare}
                className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
              >
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
            </>
          )}
        </div>

        {/* Add to Cart Button */}
        {typeof window !== 'undefined' ? (
          <AnimatePresence>
            {isHovered && (
              <MotionButton
                onClick={handleAddToCart}
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isAddingToCart}
              >
                <ShoppingCart className={`w-4 h-4 ${isAddingToCart ? 'animate-spin' : ''}`} />
                <span>{isAddingToCart ? 'Adding...' : 'Add to Cart'}</span>
              </MotionButton>
            )}
          </AnimatePresence>
        ) : (
          isHovered && (
            <button
              onClick={handleAddToCart}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
              disabled={isAddingToCart}
            >
              <ShoppingCart className={`w-4 h-4 ${isAddingToCart ? 'animate-spin' : ''}`} />
              <span>{isAddingToCart ? 'Adding...' : 'Add to Cart'}</span>
            </button>
          )
        )}

        {/* Stock Indicator */}
        <div className="absolute bottom-3 right-3 flex items-center text-xs text-gray-500">
          <Clock className="w-3 h-3 mr-1" />
          <span>{product.stockCount > 0 ? `${product.stockCount} left` : 'Out of stock'}</span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
          <div className="flex items-center">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
            <span className="text-xs text-gray-400 ml-1">({product.reviewCount})</span>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">${product.originalPrice.toFixed(2)}</span>
            )}
          </div>
          
          <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
            {product.category}
          </span>
        </div>
      </div>
    </LuxuryCard>
  );
};

export default EnhancedProductCard;