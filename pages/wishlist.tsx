import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';

interface WishlistItem {
  id: number;
  gemstoneId: number;
  name?: string;
  gemstone?: {
    name: string;
  };
}

export default function Wishlist() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/users/wishlist');
        if (!res.ok) throw new Error('Failed to fetch wishlist');
        let data;
        try {
          data = await res.json();
        } catch {
          throw new Error('Wishlist data is corrupted or not valid JSON.');
        }
        if (!Array.isArray(data)) throw new Error('Wishlist data is not an array.');
        setWishlist(data);
      } catch (err) {
        setError((err as Error).message || 'Failed to load wishlist');
        setWishlist([]);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  const handleRemove = async (id: number) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/users/wishlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Failed to remove from wishlist');
      const updated = await res.json();
      setWishlist(updated);
    } catch (err) {
      setError((err as Error).message || 'Failed to remove from wishlist');
    } finally {
      setLoading(false);
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
                  {item.name || (item.gemstone && item.gemstone.name) || ''}
                </span>
                <Link
                  href={`/product/${item.gemstoneId}`}
                  className="text-xs text-amber-600 underline hover:text-amber-900 mb-2"
                >
                  View Details
                </Link>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="mt-2 px-4 py-2 rounded bg-amber-100 text-amber-900 font-semibold hover:bg-amber-200 transition"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
