import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Star, Heart, Eye, ShoppingCart, Sparkles, TrendingUp, Clock, Zap } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { getFirstImage } from '../../utils/imageUtils';

// Dynamically import framer-motion components
const MotionDiv = dynamic(() => import('framer-motion').then(mod => mod.motion.div), { ssr: false });
const MotionImg = dynamic(() => import('framer-motion').then(mod => mod.motion.img), { ssr: false });
const MotionButton = dynamic(() => import('framer-motion').then(mod => mod.motion.button), { ssr: false });

interface Product {
  id: number;
  name: string;
  type: string;
  price: number;
  images: string[];
  rating?: number;
  reviewCount?: number;
  discount?: number;
  flashSale?: boolean;
  stockCount?: number;
  views?: number;
  soldCount?: number;
  category?: {
    id: number;
    name: string;
  };
}

interface AnimatedProductShowcaseProps {
  products: Product[];
  title?: string;
  subtitle?: string;
  showViewAll?: boolean;
  viewAllLink?: string;
  maxItems?: number;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

const AnimatedProductShowcase: React.FC<AnimatedProductShowcaseProps> = ({
  products,
  title = 'Featured Gemstones',
  subtitle = 'Handpicked treasures from our exclusive collection',
  showViewAll = true,
  viewAllLink = '/shop',
  maxItems = 6,
}) => {
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  const [isAddingToCart, setIsAddingToCart] = useState<number | null>(null);
  const { addToCart } = useCart();

  const displayedProducts = products.slice(0, maxItems);

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

  const handleAddToCart = async (product: Product) => {
    setIsAddingToCart(product.id);
    try {
      await addToCart(product, 1);
      toast.success(`${product.name} added to cart!`);
      // Only trigger confetti in browser environment
      if (typeof window !== 'undefined' && typeof self !== 'undefined') {
        triggerConfetti(100);
      }
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setIsAddingToCart(null);
    }
  };

  const toggleWishlist = async (productId: number) => {
    try {
      const isInWishlist = wishlist.has(productId);
      const method = isInWishlist ? 'DELETE' : 'POST';
      
      const response = await fetch('/api/users/wishlist', {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ gemstoneId: productId }),
      });

      if (response.ok) {
        setWishlist((prev) => {
          const newSet = new Set(prev);
          if (isInWishlist) {
            newSet.delete(productId);
            toast.success('Removed from wishlist');
          } else {
            newSet.add(productId);
            toast.success('Added to wishlist');
            // Only trigger confetti in browser environment
            if (typeof window !== 'undefined' && typeof self !== 'undefined') {
              triggerConfetti(50);
            }
          }
          return newSet;
        });
      } else {
        toast.error('Failed to update wishlist');
      }
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 via-amber-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        {typeof window !== 'undefined' ? (
          <MotionDiv
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <MotionDiv
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-sm font-medium shadow-lg mb-4"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Premium Collection
            </MotionDiv>

            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                {title}
              </span>
            </h2>

            <p className="text-xl text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
          </MotionDiv>
        ) : (
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-sm font-medium shadow-lg mb-4">
              <Sparkles className="w-4 h-4 mr-2" />
              Premium Collection
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                {title}
              </span>
            </h2>

            <p className="text-xl text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
          </div>
        )}

        {/* Products Grid */}
        <div className="relative">
          {typeof window !== 'undefined' ? (
            <MotionDiv
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {displayedProducts.map((product, index) => (
                <MotionDiv
                  key={product.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                  className="group relative"
                >
                  <div className="relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
                    {/* Product Image */}
                    <div className="relative aspect-square overflow-hidden">
                      <MotionImg
                        src={getFirstImage(product.images)}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        whileHover={{ scale: 1.1 }}
                      />

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Action Buttons */}
                      <div className="absolute top-4 right-4 space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                        <MotionButton
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggleWishlist(product.id)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                            wishlist.has(product.id)
                              ? 'bg-red-500 text-white'
                              : 'bg-white/90 text-gray-700 hover:bg-red-500 hover:text-white'
                          }`}
                        >
                          <Heart
                            className={`w-5 h-5 ${wishlist.has(product.id) ? 'fill-current' : ''}`}
                          />
                        </MotionButton>

                        <Link href={`/product/${product.id}`}>
                          <MotionButton
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-10 h-10 rounded-full bg-white/90 text-gray-700 hover:bg-blue-500 hover:text-white flex items-center justify-center shadow-lg transition-all duration-300"
                          >
                            <Eye className="w-5 h-5" />
                          </MotionButton>
                        </Link>
                      </div>

                      {/* Badges */}
                      <div className="absolute top-4 left-4 space-y-2">
                        {product.discount && product.discount > 0 && (
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                            -{product.discount}%
                          </span>
                        )}
                        {product.flashSale && (
                          <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center">
                            <Zap className="w-3 h-3 mr-1" />
                            Flash
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-6">
                      {product.category && (
                        <span className="text-xs font-medium text-amber-600 uppercase tracking-wide">
                          {product.category.name}
                        </span>
                      )}
                      
                      <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-amber-600 transition-colors">
                        {product.name}
                      </h3>

                      <div className="flex items-center mb-3">
                        {product.rating && (
                          <div className="flex items-center">
                            <Star className="w-4 h-4 fill-current text-amber-400" />
                            <span className="text-sm font-medium text-gray-700 ml-1">
                              {product.rating.toFixed(1)}
                            </span>
                            {product.reviewCount && (
                              <span className="text-sm text-gray-500 ml-1">
                                ({product.reviewCount})
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-2xl font-bold text-gray-900">
                            {formatPrice(product.price)}
                          </span>
                          {product.discount && product.discount > 0 && (
                            <span className="text-sm text-gray-500 line-through ml-2">
                              {formatPrice(product.price * (1 + product.discount / 100))}
                            </span>
                          )}
                        </div>

                        <MotionButton
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAddToCart(product)}
                          disabled={isAddingToCart === product.id}
                          className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full font-medium hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg disabled:opacity-50"
                        >
                          {isAddingToCart === product.id ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Adding...
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <ShoppingCart className="w-4 h-4 mr-1" />
                              Add to Cart
                            </span>
                          )}
                        </MotionButton>
                      </div>

                      {/* Product Stats */}
                      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                        {product.stockCount !== undefined && (
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-1 ${product.stockCount > 5 ? 'bg-green-500' : product.stockCount > 0 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                            <span>{product.stockCount} in stock</span>
                          </div>
                        )}
                        {product.views && (
                          <div className="flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            <span>{product.views}</span>
                          </div>
                        )}
                        {product.soldCount && (
                          <div className="flex items-center">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            <span>{product.soldCount} sold</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </MotionDiv>
              ))}
            </MotionDiv>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedProducts.map((product) => (
                <div key={product.id} className="group relative">
                  <div className="relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
                    {/* Product Image */}
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={getFirstImage(product.images)}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Action Buttons */}
                      <div className="absolute top-4 right-4 space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                        <button
                          onClick={() => toggleWishlist(product.id)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                            wishlist.has(product.id)
                              ? 'bg-red-500 text-white'
                              : 'bg-white/90 text-gray-700 hover:bg-red-500 hover:text-white'
                          }`}
                        >
                          <Heart
                            className={`w-5 h-5 ${wishlist.has(product.id) ? 'fill-current' : ''}`}
                          />
                        </button>

                        <Link href={`/product/${product.id}`}>
                          <button
                            className="w-10 h-10 rounded-full bg-white/90 text-gray-700 hover:bg-blue-500 hover:text-white flex items-center justify-center shadow-lg transition-all duration-300"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </Link>
                      </div>

                      {/* Badges */}
                      <div className="absolute top-4 left-4 space-y-2">
                        {product.discount && product.discount > 0 && (
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                            -{product.discount}%
                          </span>
                        )}
                        {product.flashSale && (
                          <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center">
                            <Zap className="w-3 h-3 mr-1" />
                            Flash
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-6">
                      {product.category && (
                        <span className="text-xs font-medium text-amber-600 uppercase tracking-wide">
                          {product.category.name}
                        </span>
                      )}
                      
                      <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-amber-600 transition-colors">
                        {product.name}
                      </h3>

                      <div className="flex items-center mb-3">
                        {product.rating && (
                          <div className="flex items-center">
                            <Star className="w-4 h-4 fill-current text-amber-400" />
                            <span className="text-sm font-medium text-gray-700 ml-1">
                              {product.rating.toFixed(1)}
                            </span>
                            {product.reviewCount && (
                              <span className="text-sm text-gray-500 ml-1">
                                ({product.reviewCount})
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-2xl font-bold text-gray-900">
                            {formatPrice(product.price)}
                          </span>
                          {product.discount && product.discount > 0 && (
                            <span className="text-sm text-gray-500 line-through ml-2">
                              {formatPrice(product.price * (1 + product.discount / 100))}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={isAddingToCart === product.id}
                          className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full font-medium hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg disabled:opacity-50"
                        >
                          {isAddingToCart === product.id ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Adding...
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <ShoppingCart className="w-4 h-4 mr-1" />
                              Add to Cart
                            </span>
                          )}
                        </button>
                      </div>

                      {/* Product Stats */}
                      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                        {product.stockCount !== undefined && (
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-1 ${product.stockCount > 5 ? 'bg-green-500' : product.stockCount > 0 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                            <span>{product.stockCount} in stock</span>
                          </div>
                        )}
                        {product.views && (
                          <div className="flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            <span>{product.views}</span>
                          </div>
                        )}
                        {product.soldCount && (
                          <div className="flex items-center">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            <span>{product.soldCount} sold</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* View All Button */}
        {showViewAll && (
          <div className="text-center mt-12">
            <Link
              href={viewAllLink}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-full hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              View All Products
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default AnimatedProductShowcase;
