import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '../components/Layout';
import { useCart } from '../components/context/CartContext';
import { toast } from 'react-hot-toast';
import { Minus as MinusIcon, Plus as PlusIcon, Lock as LockClosedIcon, RefreshCw as RefreshIcon, Truck as TruckIcon, ShoppingBag, X } from 'lucide-react';
import { getFirstImage } from '../utils/imageUtils';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import LuxuryButton from '../components/ui/LuxuryButton';
import LuxuryCard from '../components/ui/LuxuryCard';

const CartPage: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { items: cartItems, updateQuantity, removeFromCart, clearCart, error, getCartTotal } = useCart();

  // Ensure cartItems is always an array
  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];

  useEffect(() => {
    setMounted(true);
  }, []);

  const TAX_RATE = 0.18;
  const subtotal = safeCartItems.reduce((sum, item) => sum + (item.gemstone?.price || 0) * item.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const handleRemoveItem = async (itemId: number) => {
    try {
      setIsLoading(true);
      await removeFromCart(itemId);
      toast.success('Item removed from cart');
    } catch (err) {
      toast.error('Failed to remove item');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
    try {
      if (newQuantity < 0) return;
      setIsLoading(true);
      await updateQuantity(itemId, newQuantity);
      if (newQuantity === 0) {
        toast.success('Item removed from cart');
      } else {
        toast.success('Cart updated');
      }
    } catch (err) {
      toast.error('Failed to update quantity');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCart = async () => {
    if (safeCartItems.length === 0) return;
    
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        setIsLoading(true);
        await clearCart();
        toast.success('Cart cleared');
      } catch (err) {
        toast.error('Failed to clear cart');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const seoJsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'ItemList',
    itemListElement: safeCartItems.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'Product',
        name: item.gemstone?.name || 'Unknown Product',
        image: getFirstImage(item.gemstone?.images),
        description: item.gemstone?.description,
        offers: {
          '@type': 'Offer',
          priceCurrency: 'USD',
          price: item.gemstone?.price || 0,
          availability: 'https://schema.org/InStock'
        }
      }
    }))
  } as const;

  if (!mounted) {
    return (
      <Layout title="Your Cart - Shankarmala Gemstore">
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8" />
            <div className="space-y-6">
              <SkeletonLoader type="cart-item" count={3} />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Your Cart - Shankarmala">
      {error && (
        <div className="max-w-3xl mx-auto mt-6 mb-4">
          <div className="bg-red-100 border border-red-300 text-red-800 px-6 py-4 rounded-xl text-center font-semibold shadow">
            {error}
          </div>
        </div>
      )}
      <Head>
        <title>Your Cart - Shankarmala Gemstore</title>
        <meta name="description" content="View and manage your gemstone cart at Shankarmala Gemstore. Secure checkout, free shipping, and 30-day returns." />
        <meta property="og:title" content="Your Cart - Shankarmala Gemstore" />
        <meta property="og:description" content="View and manage your gemstone cart at Shankarmala Gemstore. Secure checkout, free shipping, and 30-day returns." />
        <meta property="og:image" content={getFirstImage(safeCartItems[0]?.gemstone?.images)} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://shankarmala.com/cart" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Your Cart - Shankarmala Gemstore" />
        <meta name="twitter:description" content="View and manage your gemstone cart at Shankarmala Gemstore." />
        <meta name="twitter:image" content={getFirstImage(safeCartItems[0]?.gemstone?.images)} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(seoJsonLd) }} />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-orange-50 py-6 sm:py-8 px-3 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Shopping Cart</h1>
            {safeCartItems.length > 0 && (
              <LuxuryButton
                onClick={handleClearCart}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4 mr-1" />
                Clear Cart
              </LuxuryButton>
            )}
          </div>

          {isLoading && safeCartItems.length === 0 ? (
            <div className="space-y-6">
              <SkeletonLoader type="cart-item" count={3} />
            </div>
          ) : safeCartItems.length === 0 ? (
            <div className="text-center py-8 sm:py-16 bg-white rounded-3xl shadow-xl px-4 border border-stone-100">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <ShoppingBag className="w-8 h-8 text-amber-600" />
              </div>
              <p className="text-base sm:text-xl text-gray-600 mb-4 sm:mb-6">Your cart is empty</p>
              <Link href="/shop">
                <LuxuryButton variant="primary" size="lg">
                  Continue Shopping
                </LuxuryButton>
              </Link>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              <div className="bg-white shadow-xl rounded-3xl overflow-hidden border border-stone-100">
                <ul className="divide-y divide-gray-200">
                  {safeCartItems.map((item) => (
                    <li key={item.id} className="p-3 sm:p-4 md:p-6 hover:bg-amber-50/50 transition-all duration-300">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 md:gap-6">
                        <div className="w-full sm:w-24 md:w-32 h-20 sm:h-24 md:h-32 relative rounded-2xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-gray-100 to-stone-100 shadow-md">
                          <Image 
                            src={getFirstImage(item.gemstone?.images)} 
                            alt={item.gemstone?.name || 'Product image'} 
                            fill 
                            sizes="(max-width: 640px) 50vw, 25vw" 
                            className="rounded-2xl object-cover" 
                          />
                        </div>
                        <div className="flex-1 min-w-0 w-full">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                            <div>
                              <h3 className="text-sm sm:text-lg font-bold text-gray-900">{item.gemstone?.name || item.name}</h3>
                              <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-amber-600 font-medium">{(item.gemstone as any)?.category?.name || ''}</p>
                            </div>
                            <div className="text-right sm:text-left">
                              <p className="text-sm sm:text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">${((item.gemstone?.price || item.price || 0) * item.quantity).toFixed(2)}</p>
                              {item.quantity > 1 && (
                                <p className="text-xs text-gray-500 mt-1">
                                  ${item.gemstone?.price || item.price || 0} each
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <LuxuryButton 
                                onClick={() => handleQuantityChange(item.id, Math.max(0, item.quantity - 1))} 
                                variant="secondary"
                                size="sm"
                                aria-label="Decrease quantity"
                              >
                                <MinusIcon className="h-5 w-5 text-gray-600" />
                              </LuxuryButton>
                              <span className="text-base text-gray-900 font-bold min-w-[2rem] text-center bg-amber-50 px-3 py-1 rounded-lg luxury-font-sans">{item.quantity}</span>
                              <LuxuryButton 
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)} 
                                variant="secondary"
                                size="sm"
                                aria-label="Increase quantity"
                              >
                                <PlusIcon className="h-5 w-5 text-gray-600" />
                              </LuxuryButton>
                            </div>
                            <LuxuryButton 
                              onClick={() => handleRemoveItem(item.id)} 
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              aria-label="Remove item"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Remove
                            </LuxuryButton>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white shadow-xl rounded-3xl p-4 sm:p-6 border border-stone-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Order Summary</h2>
                <div className="space-y-3 sm:space-y-4 text-sm sm:text-base">
                  <div className="flex justify-between text-gray-600">
                    <p>Subtotal ({safeCartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</p>
                    <p className="font-bold">${subtotal.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <p>Shipping</p>
                    <p className="text-green-600 font-bold">Free</p>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <p>Tax</p>
                    <p className="font-bold">${tax.toFixed(2)}</p>
                  </div>
                  <div className="pt-3 sm:pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-base sm:text-2xl font-bold text-gray-900">
                      <p>Total</p>
                      <p className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">${total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 sm:mt-6">
                  <Link href="/checkout">
                    <LuxuryButton variant="primary" size="lg" className="w-full">
                      Proceed to Checkout
                    </LuxuryButton>
                  </Link>
                </div>

                <div className="mt-5 sm:mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                  <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 shadow-md">
                    <LockClosedIcon className="h-6 w-6 text-amber-600 mb-2" />
                    <span className="text-sm text-amber-700 font-bold">Secure checkout</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 shadow-md">
                    <TruckIcon className="h-6 w-6 text-amber-600 mb-2" />
                    <span className="text-sm text-amber-700 font-bold">Free shipping</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 shadow-md">
                    <RefreshIcon className="h-6 w-6 text-amber-600 mb-2" />
                    <span className="text-sm text-amber-700 font-bold">30-day returns</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-2xl flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-500 border-t-transparent"></div>
            <span className="text-gray-700 font-bold text-lg">Updating cart...</span>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default CartPage;