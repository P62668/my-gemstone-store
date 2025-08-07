import React from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Link from 'next/link';
import { formatPriceUSD } from '../../utils/numberFormat';

const categories = [
  {
    id: 'sapphires',
    name: 'Sapphires',
    description:
      'Rare blue sapphires from Kashmir, known for their deep color and exceptional clarity.',
    image: null,
    productCount: 24,
    priceRange: { min: 50000, max: 500000 },
    badge: 'Premium',
    color: 'blue',
    featured: true,
  },
  {
    id: 'rubies',
    name: 'Rubies',
    description:
      'Burmese rubies with the coveted pigeon blood red color, the rarest of all gemstones.',
    image: null,
    productCount: 18,
    priceRange: { min: 75000, max: 750000 },
    badge: 'Rare',
    color: 'red',
    featured: true,
  },
  {
    id: 'emeralds',
    name: 'Emeralds',
    description:
      'Colombian emeralds with vivid green color and natural inclusions that prove authenticity.',
    image: null,
    productCount: 15,
    priceRange: { min: 60000, max: 600000 },
    badge: 'Heritage',
    color: 'green',
    featured: true,
  },
  {
    id: 'diamonds',
    name: 'Diamonds',
    description:
      'Flawless diamonds with exceptional cut, color, and clarity for the ultimate luxury.',
    image: null,
    productCount: 32,
    priceRange: { min: 100000, max: 1000000 },
    badge: 'Luxury',
    color: 'white',
    featured: true,
  },
  {
    id: 'pearls',
    name: 'Pearls',
    description:
      'South Sea pearls with perfect luster and rare natural colors from pristine waters.',
    image: null,
    productCount: 12,
    priceRange: { min: 25000, max: 250000 },
    badge: 'Natural',
    color: 'pearl',
    featured: false,
  },
  {
    id: 'rudraksha',
    name: 'Rudraksha',
    description: 'Sacred beads from the Himalayas, used for spiritual wellness and meditation.',
    image: null,
    productCount: 8,
    priceRange: { min: 5000, max: 50000 },
    badge: 'Sacred',
    color: 'brown',
    featured: false,
  },
  {
    id: 'custom-jewelry',
    name: 'Custom Jewelry',
    description:
      'Bespoke designs crafted by master artisans, combining heritage techniques with modern aesthetics.',
    image: null,
    productCount: 6,
    priceRange: { min: 100000, max: 2000000 },
    badge: 'Bespoke',
    color: 'gold',
    featured: false,
  },
  {
    id: 'astrological',
    name: 'Astrological Gems',
    description:
      'Gemstones selected for planetary alignment and spiritual benefits according to Vedic astrology.',
    image: null,
    productCount: 10,
    priceRange: { min: 15000, max: 150000 },
    badge: 'Vedic',
    color: 'purple',
    featured: false,
  },
];

const getColorClasses = (color: string) => {
  switch (color) {
    case 'blue':
      return 'from-blue-500 to-cyan-500';
    case 'red':
      return 'from-red-500 to-pink-500';
    case 'green':
      return 'from-emerald-500 to-teal-500';
    case 'white':
      return 'from-gray-400 to-slate-500';
    case 'pearl':
      return 'from-pink-300 to-rose-400';
    case 'brown':
      return 'from-amber-600 to-orange-600';
    case 'gold':
      return 'from-yellow-500 to-amber-500';
    case 'purple':
      return 'from-purple-500 to-violet-500';
    default:
      return 'from-gray-500 to-slate-600';
  }
};

const CategoryDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const category = categories.find((cat) => cat.id === id);

  if (!category) {
    return (
      <Layout title="Category Not Found">
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
          <h1 className="text-4xl font-bold text-yellow-800 mb-4">Category Not Found</h1>
          <p className="text-lg text-yellow-700 mb-8">
            Sorry, we couldn&apos;t find that category.
          </p>
          <Link href="/categories">
            <span className="px-6 py-3 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-semibold shadow-lg cursor-pointer">
              Back to Categories
            </span>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${category.name} - Category Details`}>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div
            className={`absolute inset-0 bg-gradient-to-br ${getColorClasses(
              category.color,
            )} opacity-20`}
          />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent font-serif">
              {category.name}
            </h1>
            <span className="inline-block px-4 py-2 rounded-full bg-white/90 text-yellow-800 text-lg font-semibold shadow mb-4">
              {category.badge}
            </span>
            <p className="text-xl text-yellow-800 mb-8 max-w-2xl mx-auto leading-relaxed font-serif">
              {category.description}
            </p>
            <div className="flex flex-col md:flex-row justify-center items-center gap-6 mb-8">
              <div className="bg-white/90 rounded-2xl shadow p-6 min-w-[200px]">
                <div className="text-sm text-yellow-600 font-serif mb-1">Product Count</div>
                <div className="text-2xl font-bold text-yellow-900">{category.productCount}</div>
              </div>
              <div className="bg-white/90 rounded-2xl shadow p-6 min-w-[200px]">
                <div className="text-sm text-yellow-600 font-serif mb-1">Price Range</div>
                <div className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                  {formatPriceUSD(category.priceRange.min)} -{' '}
                  {formatPriceUSD(category.priceRange.max)}
                </div>
              </div>
            </div>
            <Link href="/shop">
              <span className="px-8 py-4 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-bold shadow-lg text-lg cursor-pointer inline-block mt-4">
                Shop {category.name}
              </span>
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default CategoryDetailPage;
