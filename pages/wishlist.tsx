import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import { useWishlist } from '../components/context/WishlistContext';
import { apiClient } from '../utils/apiClient';

export default function Wishlist() {
  const { items: wishlist, loading, removeFromWishlist, refreshWishlist } = useWishlist();
  const [error, setError] = React.useState('');

  const handleRemove = async (gemstoneId: number) => {
    setError('');
    try {
      await removeFromWishlist(gemstoneId);
      await refreshWishlist();
    } catch (err) {
      setError((err as Error).message || 'Failed to remove from wishlist');
    }
  };

  const handleAddToCart = async (gemstoneId: number) => {
    try {
      const res = await apiClient.post('/api/cart/add', { productId: gemstoneId, quantity: 1 }, { credentials: 'include' });
      if (res.ok) {
        alert('Added to cart successfully!');
      } else {
        alert('Failed to add to cart');
      }
    } catch (err) {
      alert('Failed to add to cart');
    }
  };

  // Defensive checks for wishlist data
  const safeWishlist = Array.isArray(wishlist)
    ? wishlist.filter((item) => item && item.gemstoneId)
    : [];

  return (
    <Layout title="My Wishlist - Shankarmala Gemstore">
      <Head>
        <title>My Wishlist - Shankarmala Gemstore</title>
        <meta name="description" content="View and manage your wishlist at Shankarmala Gemstore." />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-white via-amber-50 to-amber-100">
        <div className="max-w-3xl mx-auto py-12 px-4">
          <h1 className="text-3xl font-bold text-amber-900 mb-8">Your Wishlist</h1>
          <Link
            href="/account"
            className="inline-block mb-6 text-amber-700 hover:text-amber-900 font-semibold text-sm bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 transition"
          >
            ← Back to Account
          </Link>
          {error && (
            <div className="bg-red-100 text-red-800 px-4 py-2 rounded mb-4 font-semibold">
              {error}
            </div>
          )}
          {loading && <div className="text-center py-8 text-gray-500">Loading...</div>}
          {!loading && safeWishlist.length === 0 && (
            <div className="text-center py-8 text-gray-500">No items in your wishlist.</div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {safeWishlist.map((item) => (
              <div
                key={item.id}
                className="bg-white/90 rounded-2xl shadow-xl border border-amber-100 p-6 flex flex-col items-center"
              >
                <span className="text-lg text-amber-900 font-semibold mb-2">
                  {(item.gemstone && item.gemstone.name) || ''}
                </span>
                <Link
                  href={`/product/${item.gemstoneId}`}
                  className="text-xs text-amber-600 underline hover:text-amber-900 mb-2"
                >
                  View Details
                </Link>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleAddToCart(item.gemstoneId)}
                    className="px-4 py-2 rounded bg-amber-600 text-white font-semibold hover:bg-amber-700 transition"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="px-4 py-2 rounded bg-red-100 text-red-900 font-semibold hover:bg-red-200 transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
