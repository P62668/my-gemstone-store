import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import { useCart } from '../components/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Shield,
  Truck,
  CreditCard,
  Heart,
  Star,
  Sparkles,
  ArrowRight,
  Trash2,
  Plus,
  Minus,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const CartPage: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const { items: cart, updateQuantity, removeFromCart } = useCart();
  const [removingItem, setRemovingItem] = useState<string | null>(null);

  if (!mounted) {
    return (
      <Layout title="Your Cart - Shankarmala Gemstore">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-500"></div>
        </div>
      </Layout>
    );
  }
      const total = cart.reduce((sum, item) => sum + (item.gemstone?.price || 0) * item.quantity, 0);

  const handleRemoveItem = async (itemId: string) => {
    setRemovingItem(itemId);
    // Add a small delay for animation
    await new Promise((resolve) => setTimeout(resolve, 300));
    removeFromCart(Number(itemId));
    setRemovingItem(null);
    toast.success('Item removed from cart');
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(Number(itemId), newQuantity);
    toast.success('Cart updated');
  };

  // SEO structured data (JSON-LD)
  const seoJsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'ShoppingCart',
    name: 'Your Cart - Shankarmala Gemstore',
    description:
      'View and manage your gemstone cart at Shankarmala Gemstore. Secure checkout, free shipping, and 30-day returns.',
    url: 'https://shankarmala.com/cart',
    itemListElement: cart.map((item, idx) => ({
      '@type': 'Product',
      position: idx + 1,
      name: item.gemstone?.name || 'Unknown Product',
      images: item.gemstone?.images ? [item.gemstone.images] : ['/images/placeholder-gemstone.jpg'],
      sku: item.gemstone?.id || 0,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'INR',
        price: item.gemstone?.price || 0,
        availability: 'https://schema.org/InStock',
      },
    })),
  };

  return (
    <Layout title="Your Cart - Shankarmala">
      <Head>
        <title>Your Cart - Shankarmala Gemstore</title>
        <meta
          name="description"
          content="View and manage your gemstone cart at Shankarmala Gemstore. Secure checkout, free shipping, and 30-day returns."
        />
        <meta property="og:title" content="Your Cart - Shankarmala Gemstore" />
        <meta
          property="og:description"
          content="View and manage your gemstone cart at Shankarmala Gemstore. Secure checkout, free shipping, and 30-day returns."
        />
        <meta
          property="og:image"
          content={cart[0]?.gemstone?.images || '/images/placeholder-gemstone.jpg'}
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://shankarmala.com/cart" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Your Cart - Shankarmala Gemstore" />
        <meta
          name="twitter:description"
          content="View and manage your gemstone cart at Shankarmala Gemstore."
        />
        <meta
          name="twitter:image"
          content={cart[0]?.gemstone?.images || '/images/placeholder-gemstone.jpg'}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(seoJsonLd) }}
        />
      </Head>

      <div className="max-w-6xl mx-auto py-12 px-4">
        {/* Premium Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-4"
          >
            <Sparkles className="w-4 h-4" />
            <span>Premium Shopping Cart</span>
          </motion.div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Your Luxury Cart
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Review your selected gemstones and proceed to secure checkout
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {cart.length === 0 ? (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', bounce: 0.4 }}
                className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center"
              >
                <ShoppingBag className="w-16 h-16 text-amber-600" />
              </motion.div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
                Discover our exclusive collection of premium gemstones and start building your
                luxury collection
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                <Sparkles className="w-5 h-5" />
                <span>Start Shopping</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          ) : (
            <motion.div
              className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-amber-100 p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Cart Items ({cart.length})</h2>
                    <p className="text-gray-600">Premium gemstones selected</p>
                  </div>
                </div>
                <Link
                  href="/shop"
                  className="flex items-center space-x-2 text-amber-600 hover:text-amber-700 font-medium transition-colors group"
                >
                  <span>Continue Shopping</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <ul className="divide-y divide-amber-100">
                <AnimatePresence>
                  {cart.map((item, index) => (
                    <motion.li
                      key={item.id}
                      className="flex flex-col md:flex-row items-center gap-6 py-8"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="relative group">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="relative overflow-hidden rounded-2xl shadow-lg"
                        >
                          <img
                            src={item.images?.[0] || '/images/placeholder-gemstone.jpg'}
                            alt={item.name}
                            className="w-24 h-24 object-cover border border-amber-200"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.div>
                        {removingItem === String(item.id) && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 bg-red-500/20 rounded-2xl flex items-center justify-center"
                          >
                            <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                          </motion.div>
                        )}
                      </div>

                      <div className="flex-1 w-full">
                        <div className="font-bold text-xl text-gray-900 mb-2">{item.name}</div>
                        <div className="text-amber-700 font-bold text-2xl mb-3">
                          ₹{item.price.toLocaleString('en-IN')}
                        </div>
                        <div className="flex items-center gap-1 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-amber-400 fill-current" />
                          ))}
                          <span className="text-sm text-gray-600 ml-2">Premium Quality</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            GIA Certified
                          </span>
                          <span className="text-green-600 text-sm font-medium flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            In Stock
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-amber-200 rounded-xl overflow-hidden shadow-sm">
                          <button
                            onClick={() => handleQuantityChange(String(item.id), item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-2 bg-amber-50 hover:bg-amber-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-4 py-2 bg-white font-bold min-w-[3rem] text-center text-lg">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(String(item.id), item.quantity + 1)}
                            className="p-2 bg-amber-50 hover:bg-amber-100 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                                              <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900 mb-3">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </div>
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => handleQuantityChange(String(item.id), item.quantity)}
                              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-semibold transition-colors"
                            >
                              <span>Update Cart</span>
                            </button>
                            <button
                              onClick={() => handleRemoveItem(String(item.id))}
                              disabled={removingItem === String(item.id)}
                              className="flex items-center space-x-1 text-red-600 hover:text-red-700 text-sm font-semibold transition-colors disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>

              {/* Premium Order Summary */}
              <motion.div
                className="mt-8 pt-8 border-t border-amber-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 border border-amber-200">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Order Summary</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between text-gray-700 text-lg">
                      <span>Subtotal ({cart.length} items)</span>
                      <span className="font-semibold">₹{total.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-gray-700 text-lg">
                      <span>Shipping</span>
                      <span className="text-green-600 font-semibold">Free</span>
                    </div>
                    <div className="flex justify-between text-gray-700 text-lg">
                      <span>Tax</span>
                      <span>₹{(total * 0.18).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="border-t border-amber-300 pt-4">
                      <div className="flex justify-between text-3xl font-bold text-gray-900">
                        <span>Total</span>
                        <span>₹{(total * 1.18).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/checkout"
                    className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 text-center flex items-center justify-center space-x-2"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    href="/shop"
                    className="flex-1 border-2 border-amber-600 text-amber-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-amber-50 transition-all duration-200 text-center"
                  >
                    Continue Shopping
                  </Link>
                </div>

                {/* Premium Trust indicators */}
                <div className="mt-8 pt-8 border-t border-amber-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-amber-100">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Shield className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Secure Checkout</div>
                        <div className="text-sm text-gray-600">SSL Encrypted</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-amber-100">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Truck className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Free Shipping</div>
                        <div className="text-sm text-gray-600">Worldwide</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-amber-100">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Heart className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">30-Day Returns</div>
                        <div className="text-sm text-gray-600">No Questions</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default CartPage;
