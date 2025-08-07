import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import { useCart } from '../components/context/CartContext';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';

const CartPage: React.FC = () => {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const [removingItem, setRemovingItem] = useState<string | null>(null);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleRemoveItem = async (itemId: string) => {
    setRemovingItem(itemId);
    // Add a small delay for animation
    await new Promise((resolve) => setTimeout(resolve, 300));
    removeFromCart(Number(itemId));
    setRemovingItem(null);
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(Number(itemId), newQuantity);
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
      name: item.name,
      images: item.images,
      sku: item.id,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'INR',
        price: item.price,
        availability: 'https://schema.org/InStock',
      },
    })),
  };

  return (
    <Layout title="Your Cart - Kolkata Gems">
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
          content={cart[0]?.images?.[0] || '/images/placeholder-gemstone.jpg'}
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
          content={cart[0]?.images?.[0] || '/images/placeholder-gemstone.jpg'}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(seoJsonLd) }}
        />
      </Head>
      <div className="max-w-4xl mx-auto py-12 px-4">
        <motion.h1
          className="text-4xl font-bold text-amber-900 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Your Cart
        </motion.h1>

        <AnimatePresence mode="wait">
          {cart.length === 0 ? (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-8xl mb-6">🛒</div>
              <h2 className="text-2xl font-bold text-gray-700 mb-4">Your cart is empty</h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Looks like you haven&apos;t added any gemstones to your cart yet. Start exploring
                our collection!
              </p>
              <Link
                href="/shop"
                className="inline-block bg-amber-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-amber-700 transition-all duration-200 hover:scale-105"
              >
                Start Shopping
              </Link>
            </motion.div>
          ) : (
            <motion.div
              className="bg-white/80 rounded-3xl shadow-xl border border-amber-100 p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-amber-900">Cart Items ({cart.length})</h2>
                <Link
                  href="/shop"
                  className="text-amber-600 hover:text-amber-700 font-medium transition-colors"
                >
                  Continue Shopping →
                </Link>
              </div>

              <ul className="divide-y divide-amber-100">
                <AnimatePresence>
                  {cart.map((item, index) => (
                    <motion.li
                      key={item.id}
                      className="flex flex-col md:flex-row items-center gap-6 py-6"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="relative">
                        <img
                          src={item.images?.[0] || '/images/placeholder-gemstone.jpg'}
                          alt={item.name}
                          className="w-24 h-24 rounded-2xl object-cover border border-amber-200 shadow-lg"
                        />
                        {removingItem === String(item.id) && (
                          <div className="absolute inset-0 bg-red-500/20 rounded-2xl flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 w-full">
                        <div className="font-semibold text-lg text-amber-900 mb-1">{item.name}</div>
                        <div className="text-amber-700 font-bold text-xl mb-2">
                          ₹{item.price.toLocaleString('en-IN')}
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <StarIconSolid key={i} className={`w-4 h-4 text-gray-200`} />
                          ))}
                          {/* Review count not available on CartItem */}
                        </div>
                        <div className="text-xs text-gray-500 mb-3 flex items-center gap-2">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            {/* Certification not available on CartItem */}
                          </span>
                          <span className="text-green-600">● In Stock</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-amber-200 rounded-xl overflow-hidden">
                          <button
                            onClick={() => handleQuantityChange(String(item.id), item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="px-3 py-2 bg-amber-50 hover:bg-amber-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            -
                          </button>
                          <span className="px-4 py-2 bg-white font-medium min-w-[3rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(String(item.id), item.quantity + 1)}
                            className="px-3 py-2 bg-amber-50 hover:bg-amber-100 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-bold text-amber-900 mb-2">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </div>
                        <button
                          onClick={() => handleRemoveItem(String(item.id))}
                          disabled={removingItem === String(item.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-semibold transition-colors disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>

              {/* Order Summary */}
              <motion.div
                className="mt-8 pt-6 border-t border-amber-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="bg-amber-50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-amber-900 mb-4">Order Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal ({cart.length} items)</span>
                      <span>₹{total.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span className="text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Tax</span>
                      <span>₹{(total * 0.18).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="border-t border-amber-200 pt-3">
                      <div className="flex justify-between text-2xl font-bold text-amber-900">
                        <span>Total</span>
                        <span>₹{(total * 1.18).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/checkout"
                    className="flex-1 bg-amber-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-amber-700 transition-all duration-200 hover:scale-105 text-center"
                  >
                    Proceed to Checkout
                  </Link>
                  <Link
                    href="/shop"
                    className="flex-1 border-2 border-amber-600 text-amber-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-amber-50 transition-all duration-200 text-center"
                  >
                    Continue Shopping
                  </Link>
                </div>

                {/* Trust indicators */}
                <div className="mt-6 pt-6 border-t border-amber-200">
                  <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>Secure Checkout</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>30-Day Returns</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>Free Shipping</span>
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
