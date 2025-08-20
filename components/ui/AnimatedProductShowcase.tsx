import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Heart, Eye, ShoppingCart, Sparkles, TrendingUp, Clock } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import { getFirstImage } from '../../utils/imageUtils';

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



  const handleAddToCart = async (product: Product) => {
    setIsAddingToCart(product.id);
    try {
      await addToCart(product, 1);
      toast.success(`${product.name} added to cart!`);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
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
            confetti({
              particleCount: 50,
              spread: 50,
              origin: { y: 0.6 },
            });
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
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-sm font-medium shadow-lg mb-4"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Premium Collection
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
              {title}
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
        </motion.div>

        {/* Products Grid */}
        <div className="relative">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {displayedProducts.map((product, index) => (
              <motion.div
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
                    <motion.img
                      src={getFirstImage(product.images)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      whileHover={{ scale: 1.1 }}
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Action Buttons */}
                    <div className="absolute top-4 right-4 space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                      <motion.button
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
                      </motion.button>

                      <Link href={`/product/${product.id}`}>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="w-10 h-10 rounded-full bg-white/90 text-gray-700 hover:bg-amber-500 hover:text-white flex items-center justify-center shadow-lg transition-all duration-300"
                        >
                          <Eye className="w-5 h-5" />
                        </motion.button>
                      </Link>
                    </div>

                    {/* Badges */}
                    <div className="absolute top-4 left-4 space-y-2">
                      {product.flashSale && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center"
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          Flash Sale
                        </motion.div>
                      )}

                      {product.discount && product.discount > 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.1 + 0.1 }}
                          className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold"
                        >
                          {product.discount}% OFF
                        </motion.div>
                      )}
                    </div>

                    {/* Stock Indicator */}
                    {product.stockCount !== undefined && (
                      <div className="absolute bottom-4 left-4">
                        <div className="bg-black/70 text-white px-2 py-1 rounded-full text-xs">
                          {product.stockCount > 0
                            ? `${product.stockCount} in stock`
                            : 'Out of stock'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-6">
                    <div className="mb-3">
                      <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-amber-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-500">{product.type}</p>
                    </div>

                    {/* Rating */}
                    {product.rating && (
                      <div className="flex items-center mb-3">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(product.rating!)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500 ml-2">
                          ({product.reviewCount || 0})
                        </span>
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {formatPrice(product.price)}
                        </span>
                        {product.discount && product.discount > 0 && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(product.price * (1 + product.discount / 100))}
                          </span>
                        )}
                      </div>

                      {product.views && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Eye className="w-4 h-4 mr-1" />
                          {product.views}
                        </div>
                      )}
                    </div>

                    {/* Add to Cart Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAddToCart(product)}
                      disabled={
                        isAddingToCart === product.id ||
                        (product.stockCount !== undefined && product.stockCount <= 0)
                      }
                      className={`w-full py-3 px-4 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                        product.stockCount !== undefined && product.stockCount <= 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {isAddingToCart === product.id ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Adding...</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-5 h-5" />
                          <span>
                            {product.stockCount !== undefined && product.stockCount <= 0
                              ? 'Out of Stock'
                              : 'Add to Cart'}
                          </span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* View All Button */}
        {showViewAll && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link href={viewAllLink}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                View All Gemstones
              </motion.button>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default AnimatedProductShowcase;
