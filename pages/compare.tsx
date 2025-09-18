import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '../components/Layout';
import LuxuryButton from '../components/ui/LuxuryButton';
import LuxuryCard from '../components/ui/LuxuryCard';

interface CompareItem {
  id: number;
  name: string;
  price: number;
  type: string;
  image: string;
}

export default function ComparePage() {
  const [compareList, setCompareList] = useState<CompareItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('compareList');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCompareList(parsed);
      } catch (error) {
        console.error('Error parsing compare list:', error);
        setCompareList([]);
      }
    }
    setLoading(false);
  }, []);

  const removeFromCompare = (id: number) => {
    const updated = compareList.filter((item) => item.id !== id);
    setCompareList(updated);
    localStorage.setItem('compareList', JSON.stringify(updated));
  };

  const clearCompare = () => {
    setCompareList([]);
    localStorage.removeItem('compareList');
  };

  if (loading) {
    return (
      <Layout title="Compare Products - Shankarmala Gemstore">
        <div className="min-h-screen bg-gradient-to-br from-white via-amber-50 to-amber-100">
          <div className="max-w-7xl mx-auto py-12 px-4">
            <div className="text-center py-8 text-gray-500 luxury-font-sans">Loading...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Compare Products - Shankarmala Gemstore">
      <Head>
        <title>Compare Products - Shankarmala Gemstore</title>
        <meta name="description" content="Compare gemstones at Shankarmala Gemstore." />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-white via-amber-50 to-amber-100">
        <div className="max-w-7xl mx-auto py-12 px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-amber-900 luxury-font-serif">Compare Products</h1>
            <Link href="/shop">
              <LuxuryButton variant="secondary" size="md">
                ← Back to Shop
              </LuxuryButton>
            </Link>
          </div>

          {compareList.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-2xl font-semibold text-amber-900 mb-4 luxury-font-serif">No Products to Compare</h2>
              <p className="text-gray-600 mb-6 luxury-font-sans">
                Add products to your comparison list to see them here.
              </p>
              <Link href="/shop">
                <LuxuryButton variant="primary" size="lg">
                  Browse Products
                </LuxuryButton>
              </Link>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <p className="text-gray-600 luxury-font-sans">
                  Comparing {compareList.length} product{compareList.length !== 1 ? 's' : ''}
                </p>
                <button
                  onClick={clearCompare}
                  className="text-red-600 hover:text-red-800 font-medium text-sm luxury-font-sans"
                >
                  Clear All
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {compareList.map((item) => (
                  <LuxuryCard key={item.id} className="p-6">
                    <div className="relative mb-4">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={200}
                        height={200}
                        className="w-full h-48 object-cover rounded-xl"
                      />
                      <button
                        onClick={() => removeFromCompare(item.id)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition luxury-ripple"
                        aria-label="Remove from comparison"
                      >
                        ×
                      </button>
                    </div>

                    <h3 className="text-lg font-semibold text-amber-900 mb-2 luxury-font-serif">{item.name}</h3>
                    <p className="text-sm text-gray-600 mb-2 luxury-font-sans">Type: {item.type}</p>
                    <p className="text-xl font-bold text-amber-600 mb-4 luxury-font-serif">
                      ₹{item.price.toLocaleString()}
                    </p>

                    <Link href={`/product/${item.id}`}>
                      <LuxuryButton variant="primary" size="md" className="w-full">
                        View Details
                      </LuxuryButton>
                    </Link>
                  </LuxuryCard>
                ))}
              </div>

              {compareList.length >= 2 && (
                <LuxuryCard className="mt-8 p-6">
                  <h3 className="text-lg font-semibold text-amber-900 mb-4 luxury-font-serif">Comparison Summary</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-amber-200">
                          <th className="text-left py-2 font-semibold luxury-font-sans">Feature</th>
                          {compareList.map((item) => (
                            <th key={item.id} className="text-center py-2 font-semibold luxury-font-sans">
                              {item.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-amber-100">
                          <td className="py-2 font-medium luxury-font-sans">Price</td>
                          {compareList.map((item) => (
                            <td key={item.id} className="text-center py-2 luxury-font-sans">
                              ₹{item.price.toLocaleString()}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b border-amber-100">
                          <td className="py-2 font-medium luxury-font-sans">Type</td>
                          {compareList.map((item) => (
                            <td key={item.id} className="text-center py-2 luxury-font-sans">
                              {item.type}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </LuxuryCard>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}