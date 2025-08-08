import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, Eye, Star, Share2, Clock, Fire, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import confetti from 'canvas-confetti';

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
  const [showQuickView, setShowQuickView] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAddingToCart(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call
      onAddToCart(product.id);
      
      // Trigger confetti effect
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      toast.success('Added to cart! 🛒');
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
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
    <motion.div
      className={`group relative bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick(product.id)}
      whileHover={{ 
        y: -8,
        scale: 1.02,
        rotateY: 2,
      }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 20 
      }}
    >
      {/* Product Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {/* Main Image */}
        <motion.img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />

        {/* Gradient Overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-2">
          <AnimatePresence>
            {product.isNew && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                NEW
              </motion.span>
            )}
            {product.isTrending && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center"
              >
                <Fire className="w-3 h-3 mr-1" />
                TRENDING
              </motion.span>
            )}
            {product.isLimited && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium"
              >
                LIMITED
              </motion.span>
            )}
            {product.discount && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium"
              >
                -{discountPercentage}%
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex flex-col space-y-2">
          <motion.button
            onClick={handleWishlistToggle}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart
              className={`w-5 h-5 ${
                isWishlisted
                  ? 'fill-red-500 text-red-500'
                  : 'text-gray-600'
              }`}
            />
          </motion.button>
          
          <motion.button
            onClick={handleQuickView}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Eye className="w-5 h-5 text-gray-600" />
          </motion.button>
        </div>

        {/* Quick Actions Overlay */}
        <motion.div
          className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
        >
          <div className="flex space-x-3">
            <motion.button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className="bg-amber-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-amber-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isAddingToCart ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <ShoppingCart className="w-4 h-4" />
              )}
              <span>{isAddingToCart ? 'Adding...' : 'Add to Cart'}</span>
            </motion.button>
            
            <motion.button
              onClick={handleShare}
              className="bg-white/90 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-white transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Share2 className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>

        {/* Stock Indicator */}
        {product.stockCount <= 5 && product.stockCount > 0 && (
          <motion.div
            className="absolute bottom-3 left-3 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Clock className="w-3 h-3 mr-1" />
            Only {product.stockCount} left
          </motion.div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Category & Rating */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500 font-medium">{product.category}</span>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-gray-600">{product.rating}</span>
            <span className="text-xs text-gray-400">({product.reviewCount})</span>
          </div>
        </div>

        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {product.originalPrice && (
              <span className="text-sm text-gray-400 line-through">
                ₹{product.originalPrice.toLocaleString()}
              </span>
            )}
            <span className="text-lg font-bold text-gray-900">
              ₹{product.price.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Social Proof */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span>{product.views?.toLocaleString()} views</span>
          <span>{product.soldCount} sold</span>
        </div>

        {/* Stock Status */}
        <div className="flex items-center justify-between">
          {product.stockCount > 0 ? (
            <span className="text-green-600 text-sm font-medium">
              ✓ In Stock
            </span>
          ) : (
            <span className="text-red-600 text-sm font-medium">✗ Out of Stock</span>
          )}
          
          {/* Add to Cart Button */}
          <motion.button
            onClick={handleAddToCart}
            disabled={isAddingToCart || product.stockCount === 0}
            className="bg-amber-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-amber-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isAddingToCart ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ShoppingCart className="w-4 h-4" />
            )}
            <span>{isAddingToCart ? 'Adding...' : 'Add to Cart'}</span>
          </motion.button>
        </div>
      </div>

      {/* Hover Effect Border */}
      <motion.div
        className="absolute inset-0 border-2 border-amber-500 rounded-2xl opacity-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 0.3 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

export default EnhancedProductCard;
