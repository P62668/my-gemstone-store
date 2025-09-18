import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '../components/Layout';
import { useWishlist } from '../components/context/WishlistContext';
import { useCart } from '../components/context/CartContext';
import { toast } from 'react-hot-toast';
import { Heart, ShoppingCart, X, ArrowLeft } from 'lucide-react';
import { getFirstImage } from '../utils/imageUtils';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import LuxuryButton from '../components/ui/LuxuryButton';
import LuxuryCard from '../components/ui/LuxuryCard';

export default function Wishlist() {
  const { items: wishlist, loading, removeFromWishlist, error, setError } = useWishlist();
  const { addToCart } = useCart();
  const [processingItems, setProcessingItems] = useState<Set<number>>(new Set());

  const handleRemove = async (itemId: number, gemstoneId: number) => {
    setError('');
    try {
      setProcessingItems(prev => new Set(prev).add(gemstoneId));
      await removeFromWishlist(gemstoneId);
      toast.success('Removed from wishlist');
    } catch (err) {
      setError((err as Error).message || 'Failed to remove from wishlist');
      toast.error('Failed to remove from wishlist');
    } finally {
      setProcessingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(gemstoneId);
        return newSet;
      });
    }
  };

  const handleAddToCart = async (gemstoneId: number, gemstoneName: string) => {
    try {
      setProcessingItems(prev => new Set(prev).add(gemstoneId));
      await addToCart({ id: gemstoneId }, 1);
      toast.success(`Added ${gemstoneName} to cart`);
    } catch (err) {
      toast.error('Failed to add to cart');
    } finally {
      setProcessingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(gemstoneId);
        return newSet;
      });
    }
  };

  // Defensive checks for wishlist data
  const safeWishlist = Array.isArray(wishlist)
    ? wishlist.filter((item) => item && item.gemstoneId)
    : [];

  return (
    <Layout title="My Wishlist - Shankarmala Gemstore">
      {error && (
        <div className="max-w-3xl mx-auto mt-6 mb-4">
          <div className="bg-red-100 border border-red-300 text-red-800 px-6 py-4 rounded-xl text-center font-semibold shadow">
            {error}
          </div>
        </div>
      )}
      <Head>
        <title>My Wishlist - Shankarmala Gemstore</title>
        <meta name="description" content="View and manage your wishlist at Shankarmala Gemstore." />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-orange-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent luxury-font-serif">
                <Heart className="w-6 h-6 text-red-500 mr-2" />
                Your Wishlist
              </h1>
              <p className="text-gray-600 mt-1 luxury-font-sans">{safeWishlist.length} items</p>
            </div>
            <Link href="/shop">
              <LuxuryButton variant="secondary" size="md">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Continue Shopping
              </LuxuryButton>
            </Link>
          </div>

          {loading && safeWishlist.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <SkeletonLoader type="wishlist-item" count={8} />
            </div>
          ) : !loading && safeWishlist.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl shadow-xl border border-stone-100">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-100 to-rose-100 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <Heart className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1 luxury-font-serif">Your wishlist is empty</h3>
              <p className="text-gray-500 mb-6 luxury-font-sans">Start adding items you love to your wishlist</p>
              <Link href="/shop">
                <LuxuryButton variant="primary" size="lg">
                  Browse Collection
                </LuxuryButton>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {safeWishlist.map((item) => {
                const isProcessing = processingItems.has(item.gemstoneId);
                return (
                  <LuxuryCard key={item.id} className="overflow-hidden flex flex-col">
                    <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-stone-100">
                      <Image
                        src={getFirstImage(item.gemstone?.images)}
                        alt={item.gemstone?.name || 'Product image'}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        className="object-cover rounded-t-3xl"
                      />
                      <button
                        onClick={() => handleRemove(item.id, item.gemstoneId)}
                        disabled={isProcessing}
                        className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-300 disabled:opacity-50 luxury-ripple"
                        aria-label="Remove from wishlist"
                      >
                        {isProcessing ? (
                          <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <X className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                    </div>
                    
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 text-lg luxury-font-serif">
                        {item.gemstone?.name || 'Unknown Product'}
                      </h3>
                      
                      <div className="flex items-center text-sm text-amber-600 font-medium mb-3 luxury-font-sans">
                        <span>{item.gemstone?.category?.name || 'Gemstone'}</span>
                      </div>
                      
                      <p className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-5 luxury-font-serif">
                        ${item.gemstone?.price?.toFixed(2) || '0.00'}
                      </p>
                      
                      <div className="flex gap-3 mt-auto">
                        <button
                          onClick={() => handleAddToCart(item.gemstoneId, item.gemstone?.name || 'Product')}
                          disabled={isProcessing}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-300 disabled:opacity-50 text-sm font-bold shadow-lg transform hover:-translate-y-0.5 luxury-button-primary"
                        >
                          {isProcessing ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Adding...</span>
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-4 h-4" />
                              <span>Add to Cart</span>
                            </>
                          )}
                        </button>
                        
                        <Link
                          href={`/product/${item.gemstoneId}`}
                          className="px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300 text-sm font-bold shadow-md luxury-button-secondary"
                          aria-label={`View details for ${item.gemstone?.name || 'product'}`}
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </LuxuryCard>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}