import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import confetti from 'canvas-confetti';
import Link from 'next/link';

interface EnhancedProductCardProps {
  product: {
    id: number;
    name: string;
    price: number;
    images: string[];
    description?: string;
    rating?: number;
    reviewCount?: number;
    stockCount?: number;
    discount?: number;
    flashSale?: boolean;
    views?: number;
    soldCount?: number;
    category?: {
      id: number;
      name: string;
    };
  };
  onAddToCart: (product: any, quantity?: number) => void;
  onWishlistToggle: (productId: number) => void;
  isWishlisted: boolean;
  isAddingToCart: boolean;
}

const EnhancedProductCard: React.FC<EnhancedProductCardProps> = ({
  product,
  onAddToCart,
  onWishlistToggle,
  isWishlisted,
  isAddingToCart,
}) => {
  const [viewersCount, setViewersCount] = useState(0);
  const [showStockAlert, setShowStockAlert] = useState(false);
  const [lastPurchased, setLastPurchased] = useState<{ name: string; time: string } | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Simulate live viewers
  useEffect(() => {
    const interval = setInterval(() => {
      setViewersCount((prev) => {
        const change = Math.floor(Math.random() * 3) - 1;
        return Math.max(2, Math.min(8, prev + change));
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Stock alert simulation
  useEffect(() => {
    if (product.stockCount && product.stockCount < 3) {
      const timer = setTimeout(() => {
        setShowStockAlert(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [product.stockCount]);

  // Last purchase simulation
  useEffect(() => {
    if (Math.random() > 0.8) {
      setLastPurchased({
        name: ['Sarah', 'Mike', 'Emma', 'David'][Math.floor(Math.random() * 4)],
        time: '5 minutes ago',
      });
    }
  }, []);

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    confetti({
      particleCount: 50,
      spread: 30,
      origin: { y: 0.6 },
      colors: ['#fbbf24', '#f59e0b', '#d97706'],
    });
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    onAddToCart(product, quantity);
    // Redirect to checkout
    window.location.href = '/checkout';
  };

  const isOutOfStock = product.stockCount !== undefined && product.stockCount === 0;
  const isLowStock = product.stockCount !== undefined && product.stockCount < 5;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-3xl shadow-xl border border-amber-100 p-6 group cursor-pointer relative overflow-hidden"
    >
      {/* Flash sale badge */}
      {product.flashSale && (
        <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse z-10">
          FLASH SALE
        </div>
      )}

      {/* Stock alert */}
      {isLowStock && (
        <div className="absolute top-4 right-4 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold z-10">
          {isOutOfStock ? 'Out of Stock' : `Only ${product.stockCount} left`}
        </div>
      )}

      {/* Live viewers indicator */}
      {viewersCount > 0 && (
        <div className="absolute top-4 left-4 bg-black/70 text-white px-2 py-1 rounded-full text-xs z-10">
          <div className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            <span>{viewersCount} viewing</span>
          </div>
        </div>
      )}

      {/* Product image */}
      <div className="relative aspect-square overflow-hidden rounded-xl mb-4">
        <Image
          src={
            product.images[selectedImage] || product.images[0] || '/images/placeholder-gemstone.jpg'
          }
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
        />

        {/* Image gallery dots */}
        {product.images && product.images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {product.images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(index);
                }}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === selectedImage ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Wishlist button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onWishlistToggle(product.id);
          }}
          className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors z-10"
        >
          <svg
            className={`w-5 h-5 ${isWishlisted ? 'text-red-500 fill-current' : 'text-gray-400'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Quick view button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="absolute bottom-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors opacity-0 group-hover:opacity-100 z-10"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
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

      {/* Product info */}
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 group-hover:text-amber-600 transition-colors line-clamp-2">
              {product.name}
            </h3>
            {product.category && (
              <p className="text-sm text-gray-500 mt-1">{product.category.name}</p>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center space-x-1">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-4 h-4 ${star <= (product.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-gray-500">({product.reviewCount || 0})</span>
          </div>
        )}

        {/* Price section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-2xl font-bold text-amber-600">
                ₹{product.price.toLocaleString()}
              </span>
              {product.discount && product.discount > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 line-through">
                    ₹{(product.price / (1 - product.discount / 100)).toLocaleString()}
                  </span>
                  <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                    {product.discount}% OFF
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quantity selector (when expanded) */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Quantity:</label>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1 text-gray-600 hover:text-gray-800"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-gray-900 font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-1 text-gray-600 hover:text-gray-800"
                      disabled={isOutOfStock}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart();
                    }}
                    disabled={isAddingToCart || isOutOfStock}
                    className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAddingToCart ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Adding...</span>
                      </div>
                    ) : (
                      'Add to Cart'
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBuyNow();
                    }}
                    disabled={isOutOfStock}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Buy Now
                  </button>
                </div>

                {/* Product details */}
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Stock:</span>
                    <span
                      className={
                        isOutOfStock
                          ? 'text-red-600'
                          : isLowStock
                            ? 'text-orange-600'
                            : 'text-green-600'
                      }
                    >
                      {isOutOfStock ? 'Out of Stock' : `${product.stockCount || 'Available'} units`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Views:</span>
                    <span>{product.views || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sold:</span>
                    <span>{product.soldCount || 0}</span>
                  </div>
                </div>

                {/* View details link */}
                <Link
                  href={`/product/${product.id}`}
                  className="block text-center text-amber-600 hover:text-amber-700 font-medium text-sm"
                >
                  View Full Details →
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Collapsed action buttons */}
          {!isExpanded && (
            <div className="flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart();
                }}
                disabled={isAddingToCart || isOutOfStock}
                className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingToCart ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Adding...</span>
                  </div>
                ) : (
                  'Add to Cart'
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleBuyNow();
                }}
                disabled={isOutOfStock}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
            </div>
          )}
        </div>

        {/* Social proof */}
        <AnimatePresence>
          {lastPurchased && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-2"
            >
              <div className="flex items-center space-x-2 text-xs text-blue-700">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>
                  {lastPurchased.name} purchased {lastPurchased.time}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stock alert */}
        <AnimatePresence>
          {showStockAlert && isLowStock && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-orange-50 border border-orange-200 rounded-lg p-2"
            >
              <div className="flex items-center space-x-2 text-xs text-orange-700">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Only {product.stockCount} left!</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Product stats */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{product.views || 0} views</span>
          <span>{product.soldCount || 0} sold</span>
        </div>
      </div>
    </motion.div>
  );
};

export default EnhancedProductCard;
