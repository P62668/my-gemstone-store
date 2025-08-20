import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { Diamond, Gem, Sparkles, Star, Heart, Circle, Square, Triangle } from 'lucide-react';
import Link from 'next/link';

interface Collection {
  id: string;
  name: string;
  description: string;
  image: string;
  count: number;
  icon: React.ReactNode;
  gradient: string;
}

const CollectionsPage: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>([
    {
      id: 'diamonds',
      name: 'Diamond Collection',
      description:
        'The king of gemstones, diamonds symbolize eternal love and unmatched brilliance.',
      image: '/images/diamond-collection.jpg',
      count: 24,
      icon: <Diamond className="w-8 h-8" />,
      gradient: 'from-blue-50 to-indigo-100',
    },
    {
      id: 'rubies',
      name: 'Ruby Collection',
      description: 'The stone of passion and courage, rubies represent love and energy.',
      image: '/images/ruby-collection.jpg',
      count: 18,
      icon: <Gem className="w-8 h-8" />,
      gradient: 'from-red-50 to-pink-100',
    },
    {
      id: 'emeralds',
      name: 'Emerald Collection',
      description: 'The stone of wisdom and growth, emeralds bring harmony and balance.',
      image: '/images/emerald-collection.jpg',
      count: 15,
      icon: <Sparkles className="w-8 h-8" />,
      gradient: 'from-green-50 to-emerald-100',
    },
    {
      id: 'sapphires',
      name: 'Sapphire Collection',
      description: 'The stone of truth and loyalty, sapphires represent wisdom and nobility.',
      image: '/images/sapphire-collection.jpg',
      count: 22,
      icon: <Star className="w-8 h-8" />,
      gradient: 'from-blue-50 to-sky-100',
    },
    {
      id: 'amethysts',
      name: 'Amethyst Collection',
      description: 'The stone of peace and tranquility, amethysts promote calm and clarity.',
      image: '/images/amethyst-collection.jpg',
      count: 12,
      icon: <Heart className="w-8 h-8" />,
      gradient: 'from-purple-50 to-violet-100',
    },
    {
      id: 'pearls',
      name: 'Pearl Collection',
      description: 'The stone of purity and innocence, pearls represent elegance and grace.',
      image: '/images/pearl-collection.jpg',
      count: 16,
      icon: <Circle className="w-8 h-8" />,
      gradient: 'from-gray-50 to-slate-100',
    },
    {
      id: 'opals',
      name: 'Opal Collection',
      description: 'The stone of creativity and inspiration, opals bring imagination and dreams.',
      image: '/images/opal-collection.jpg',
      count: 9,
      icon: <Square className="w-8 h-8" />,
      gradient: 'from-orange-50 to-amber-100',
    },
    {
      id: 'topaz',
      name: 'Topaz Collection',
      description: 'The stone of strength and protection, topaz brings confidence and courage.',
      image: '/images/topaz-collection.jpg',
      count: 14,
      icon: <Triangle className="w-8 h-8" />,
      gradient: 'from-yellow-50 to-orange-100',
    },
  ]);

  return (
    <Layout
      title="Collections - Shankarmala"
      description="Explore our curated gemstone collections. From diamonds to pearls, discover the perfect piece for every occasion."
    >
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-amber-50 via-white to-yellow-50 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">Our Collections</h1>
            <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto mb-8">
              Discover our carefully curated gemstone collections, each telling a unique story of
              heritage and craftsmanship.
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <span>8 Collections</span>
              <span>•</span>
              <span>129 Pieces</span>
              <span>•</span>
              <span>GIA Certified</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Collections Grid */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {collections.map((collection, index) => (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group"
              >
                <Link href={`/shop?category=${collection.id}`}>
                  <div
                    className={`bg-gradient-to-br ${collection.gradient} rounded-2xl p-6 h-full cursor-pointer transition-all duration-300 group-hover:shadow-xl`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-gray-700">{collection.icon}</div>
                      <span className="text-sm font-medium text-gray-600">
                        {collection.count} pieces
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
                      {collection.name}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {collection.description}
                    </p>

                    <div className="flex items-center text-amber-600 font-medium text-sm group-hover:text-amber-700 transition-colors">
                      Explore Collection
                      <svg
                        className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-amber-500 to-yellow-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Can&apos;t Find What You&apos;re Looking For?
            </h2>
            <p className="text-xl text-amber-100 mb-8 max-w-2xl mx-auto">
              Our expert gemologists can help you find the perfect piece or create a custom design
              just for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-amber-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
                >
                  Contact Expert
                </motion.button>
              </Link>
              <Link href="/shop">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-amber-600 transition-colors"
                >
                  Browse All Pieces
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default CollectionsPage;
