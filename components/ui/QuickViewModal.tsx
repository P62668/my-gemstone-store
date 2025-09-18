import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  X,
  Heart,
  ShoppingCart,
  Star,
  Eye,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  MessageCircle,
  Package,
  Tag,
  Globe,
  Check
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { useCart } from '../../components/context/CartContext';
import { useWishlist } from '../../components/context/WishlistContext';
import SkeletonLoader from '../ui/SkeletonLoader';
import LuxuryButton from './LuxuryButton';

// Dynamically import framer-motion components
const MotionDiv = dynamic(() => import('framer-motion').then(mod => mod.motion.div), { ssr: false });
const AnimatePresence = dynamic(() => import('framer-motion').then(mod => mod.AnimatePresence), { ssr: false });

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  rating: number;
  reviewCount: number;
  description: string;
  category: string;
  discount?: number;
  stockCount: number;
  featured?: boolean;
  specifications: {
    weight: string;
    dimensions: string;
    color: string;
    clarity: string;
    cut: string;
    origin: string;
    certification: string;
  };
  reviews: {
    id: number;
    user: string;
    rating: number;
    comment: string;
    date: string;
    verified: boolean;
  }[];
}

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>(
    'description',
  );
  const { addToCart, loading: cartLoading } = useCart();
  const { items: wishlistItems, addToWishlist, removeFromWishlist, loading: wishlistLoading } = useWishlist();
  
  const isInWishlist = wishlistItems.some(item => item.gemstoneId === product?.id);

  useEffect(() => {
    if (product) {
      setSelectedImage(0);
      setQuantity(1);
    }
  }, [product]);

  const handleAddToCart = useCallback(async () => {
    if (!product) return;

    try {
      await addToCart({ id: product.id, price: product.price }, quantity);
      toast.success(
        <div className="flex items-center">
          <Check className="w-5 h-5 mr-2" />
          <span>Added to cart successfully!</span>
        </div>,
        { 
          duration: 3000,
          icon: <ShoppingCart className="w-5 h-5 text-amber-600" />
        }
      );
      onClose();
    } catch (error) {
      toast.error('Failed to add to cart. Please try again.');
    }
  }, [product, quantity, addToCart, onClose]);

  const handleWishlistToggle = useCallback(async () => {
    if (!product) return;
    
    try {
      if (isInWishlist) {
        await removeFromWishlist(product.id);
        toast.success('Removed from wishlist');
      } else {
        await addToWishlist(product.id);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      toast.error('Failed to update wishlist. Please try again.');
    }
  }, [product, isInWishlist, addToWishlist, removeFromWishlist]);

  const handleShare = useCallback(() => {
    if (!product) return;
    
    const shareData = {
      title: product.name,
      text: product.description,
      url: `${window.location.origin}/product/${product.id}`
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareData.url);
        toast.success('Link copied to clipboard!');
      });
    } else {
      navigator.clipboard.writeText(shareData.url);
      toast.success('Link copied to clipboard!');
    }
  }, [product]);

  if (!product) return null;

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const isInStock = product.stockCount > 0;
  const isLowStock = product.stockCount <= 5 && product.stockCount > 0;

  return (
    typeof window !== 'undefined' ? (
      <AnimatePresence>
        {isOpen && (
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <MotionDiv
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Quick View</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                {/* Left Side - Images */}
                <div className="lg:w-1/2 p-6 bg-gray-50">
                  <div className="space-y-4 h-full flex flex-col">
                    {/* Main Image */}
                    <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-white shadow-sm">
                      <Image
                        src={product.images[selectedImage] || '/images/placeholder-gemstone.jpg'}
                        alt={product.name}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="w-full h-full object-cover"
                        priority
                      />
                    </div>

                    {/* Thumbnail Images */}
                    {product.images.length > 1 && (
                      <div className="flex space-x-2 overflow-x-auto pb-2">
                        {product.images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImage(index)}
                            className={`relative aspect-square w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                              selectedImage === index
                                ? 'border-amber-500 ring-2 ring-amber-200'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            aria-label={`View image ${index + 1}`}
                          >
                            <Image
                              src={image || '/images/placeholder-gemstone.jpg'}
                              alt={`${product.name} ${index + 1}`}
                              fill
                              sizes="64px"
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side - Product Info */}
                <div className="lg:w-1/2 p-6 overflow-y-auto">
                  <div className="space-y-6">
                    {/* Product Header */}
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-sm text-amber-600 font-medium">{product.category}</span>
                        {product.discount && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                            {discountPercentage}% OFF
                          </span>
                        )}
                        {product.featured && (
                          <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-medium">
                            Featured
                          </span>
                        )}
                      </div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>

                      {/* Rating */}
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < Math.floor(product.rating)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">{product.rating}</span>
                        <span className="text-sm text-gray-400">({product.reviewCount} reviews)</span>
                      </div>

                      {/* Price */}
                      <div className="flex flex-wrap items-baseline gap-3 mb-4">
                        <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                          ${product.price.toLocaleString()}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-xl text-gray-500 line-through">
                            ${product.originalPrice.toLocaleString()}
                          </span>
                        )}
                        {isLowStock && (
                          <span className="text-amber-600 text-sm font-medium">
                            Only {product.stockCount} left!
                          </span>
                        )}
                      </div>

                      {/* Stock Status */}
                      <div className="mb-4">
                        {isInStock ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            <Check className="w-4 h-4 mr-1" />
                            In Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                            <X className="w-4 h-4 mr-1" />
                            Out of Stock
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-4">
                      {isInStock ? (
                        <>
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center border border-gray-300 rounded-lg">
                              <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="px-4 py-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
                                disabled={quantity <= 1}
                                aria-label="Decrease quantity"
                              >
                                -
                              </button>
                              <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                              <button
                                onClick={() => setQuantity(Math.min(product.stockCount, quantity + 1))}
                                className="px-4 py-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
                                disabled={quantity >= product.stockCount}
                                aria-label="Increase quantity"
                              >
                                +
                              </button>
                            </div>
                            
                            <button
                              onClick={handleWishlistToggle}
                              disabled={wishlistLoading}
                              className={`p-3 rounded-lg border transition-colors ${
                                isInWishlist
                                  ? 'border-red-300 bg-red-50 text-red-600'
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}
                              aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                            >
                              <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
                            </button>
                            
                            <button
                              onClick={handleShare}
                              className="p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                              aria-label="Share product"
                            >
                              <Share2 className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3">
                            <LuxuryButton
                              onClick={handleAddToCart}
                              disabled={cartLoading}
                              variant="primary"
                              size="lg"
                              className="flex-1"
                            >
                              {cartLoading ? (
                                <>
                                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  <span>Adding...</span>
                                </>
                              ) : (
                                <>
                                  <ShoppingCart className="w-5 h-5" />
                                  <span>Add to Cart</span>
                                </>
                              )}
                            </LuxuryButton>

                            <LuxuryButton
                              variant="secondary"
                              size="lg"
                              className="flex-1"
                            >
                              <Package className="w-5 h-5" />
                              <span>Buy Now</span>
                            </LuxuryButton>
                          </div>
                        </>
                      ) : (
                        <button
                          disabled
                          className="w-full px-6 py-3 bg-gray-400 text-white rounded-xl font-bold text-lg cursor-not-allowed"
                        >
                          Out of Stock
                        </button>
                      )}

                      {/* Trust Indicators */}
                      <div className="grid grid-cols-3 gap-4 py-4 border-t border-gray-200">
                        <div className="text-center">
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 text-amber-600 mb-2">
                            <Shield className="w-6 h-6" />
                          </div>
                          <p className="text-xs text-gray-600">Secure Payment</p>
                        </div>
                        <div className="text-center">
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 text-amber-600 mb-2">
                            <Truck className="w-6 h-6" />
                          </div>
                          <p className="text-xs text-gray-600">Free Shipping</p>
                        </div>
                        <div className="text-center">
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 text-amber-600 mb-2">
                            <RotateCcw className="w-6 h-6" />
                          </div>
                          <p className="text-xs text-gray-600">Easy Returns</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs Section */}
              <div className="border-t border-gray-200">
                <div className="flex overflow-x-auto border-b border-gray-200">
                  {[
                    { key: 'description', label: 'Description', icon: Eye },
                    { key: 'specifications', label: 'Specifications', icon: Tag },
                    { key: 'reviews', label: 'Reviews', icon: Star },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as any)}
                        className={`flex items-center space-x-2 px-6 py-4 font-medium whitespace-nowrap transition-colors border-b-2 ${
                          activeTab === tab.key
                            ? 'text-amber-600 border-amber-600'
                            : 'text-gray-600 hover:text-gray-900 border-transparent'
                        }`}
                        aria-pressed={activeTab === tab.key}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="p-6 max-h-96 overflow-y-auto">
                  <AnimatePresence mode="wait">
                    {activeTab === 'description' && (
                      <MotionDiv
                        key="description"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="prose max-w-none"
                      >
                        <p className="text-gray-700 leading-relaxed">{product.description}</p>
                      </MotionDiv>
                    )}

                    {activeTab === 'specifications' && (
                      <MotionDiv
                        key="specifications"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        {Object.entries(product.specifications).map(([key, value]) => (
                          <div
                            key={key}
                            className="flex justify-between py-3 border-b border-gray-100 last:border-0 last:pb-0"
                          >
                            <span className="font-medium text-gray-700 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <span className="text-gray-600">{value}</span>
                          </div>
                        ))}
                      </MotionDiv>
                    )}

                    {activeTab === 'reviews' && (
                      <MotionDiv
                        key="reviews"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        {product.reviews.length > 0 ? (
                          product.reviews.map((review) => (
                            <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-gray-900">{review.user}</span>
                                  {review.verified && (
                                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center">
                                      <Check className="w-3 h-3 mr-1" />
                                      Verified
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < review.rating
                                          ? 'fill-amber-400 text-amber-400'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-gray-700 mb-2">{review.comment}</p>
                              <span className="text-sm text-gray-500">{review.date}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
                          </div>
                        )}
                      </MotionDiv>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </MotionDiv>
          </MotionDiv>
        )}
      </AnimatePresence>
    ) : null
  );
};

export default QuickViewModal;