import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { formatPriceUSD } from '../utils/numberFormat';
import LuxuryButton from '../components/ui/LuxuryButton';
import LuxuryCard from '../components/ui/LuxuryCard';

interface Category {
  id: number;
  name: string;
  description?: string;
  image?: string | null;
  active?: boolean;
  gemstoneCount?: number;
  priceRange?: { min: number; max: number };
}

const getGemstoneEmoji = (name: string) => {
  switch (name.toLowerCase()) {
    case 'sapphires':
      return '💎';
    case 'rubies':
      return '🔴';
    case 'emeralds':
      return '🟢';
    case 'diamonds':
      return '💎';
    case 'pearls':
      return '🫧';
    case 'rudraksha':
      return '🕉️';
    case 'custom jewelry':
      return '👑';
    case 'astrological gems':
      return '⭐';
    default:
      return '💎';
  }
};

const CategoriesPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'featured' | 'premium'>('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/categories', { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data = await res.json();
        setCategories(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Unknown error');
        }
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((cat) => {
    if (filter === 'all') return true;
    if (filter === 'featured') return cat.active;
    if (filter === 'premium')
      return cat.name && /diamond|ruby|emerald|sapphire|pearl/i.test(cat.name);
    return true;
  });

  if (loading) {
    return (
        <Layout title="Gemstone Categories - Shankarmala">
          <div className="max-w-7xl mx-auto py-12 px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white/80 rounded-3xl shadow-2xl border border-yellow-100/60 animate-pulse h-48"
                />
              ))}
            </div>
          </div>
        </Layout>
    );
  }

  if (error) {
    return (
        <Layout title="Gemstone Categories - Shankarmala">
          <div className="max-w-7xl mx-auto py-12 px-4">
            <div className="text-center text-red-600">{error}</div>
          </div>
        </Layout>
    );
  }

  // SEO structured data
  const categoriesJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Gemstone Categories',
    description: 'Browse all gemstone categories at Shankarmala Gemstore.',
    url: 'https://shankarmala.com/categories',
    hasPart: filteredCategories.map((cat) => ({
      '@type': 'CollectionPage',
      name: cat.name,
      description: cat.description,
      url: `https://shankarmala.com/categories/${cat.id}`,
      image: cat.image || '/images/placeholder-gemstone.jpg',
    })),
  };

  return (
      <Layout title="Gemstone Categories - Shankarmala" structuredData={categoriesJsonLd}>
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
          {/* Hero Section */}
          <section className="relative py-20 md:py-32 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10" />
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.h1 
                className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent font-serif"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                Discover Our Gemstone Collections
              </motion.h1>
              <motion.p 
                className="text-xl text-amber-800 mb-12 max-w-3xl mx-auto leading-relaxed font-serif"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Explore our carefully curated collections of the world's finest gemstones, each with its own unique story and heritage.
              </motion.p>
              
              {/* Stats */}
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-amber-100/50">
                  <div className="text-3xl font-bold text-amber-600 mb-2">{categories.length}</div>
                  <div className="text-amber-800 font-serif">Categories</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-amber-100/50">
                  <div className="text-3xl font-bold text-amber-600 mb-2">
                    {categories.reduce((sum, cat) => sum + (cat.gemstoneCount || 0), 0)}
                  </div>
                  <div className="text-amber-800 font-serif">Gemstones</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-amber-100/50">
                  <div className="text-3xl font-bold text-amber-600 mb-2">130+</div>
                  <div className="text-amber-800 font-serif">Years Heritage</div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Filter Section */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
            <div className="flex flex-wrap gap-3 justify-center">
              <LuxuryButton
                onClick={() => setFilter('all')}
                variant={filter === 'all' ? 'primary' : 'secondary'}
                size="md"
                className="px-6 py-3"
              >
                All Categories
              </LuxuryButton>
              <LuxuryButton
                onClick={() => setFilter('featured')}
                variant={filter === 'featured' ? 'primary' : 'secondary'}
                size="md"
                className="px-6 py-3"
              >
                Featured
              </LuxuryButton>
              <LuxuryButton
                onClick={() => setFilter('premium')}
                variant={filter === 'premium' ? 'primary' : 'secondary'}
                size="md"
                className="px-6 py-3"
              >
                Premium Collection
              </LuxuryButton>
            </div>
          </section>

          {/* Categories Grid */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence mode="wait">
                {filteredCategories.map((category, idx) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 30 }}
                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                    className="group relative"
                  >
                    <Link
                      href={`/shop?category=${category.id}`}
                      aria-label={`View ${category.name} category`}
                    >
                      <LuxuryCard className="h-full overflow-hidden transition-all duration-500 hover:-translate-y-2">
                        <div className="relative h-52 w-full overflow-hidden rounded-t-3xl">
                          <Image
                            src={
                              typeof category.image === 'string' &&
                              (category.image.startsWith('/') || category.image.startsWith('http')) &&
                              category.image.trim() !== '' &&
                              !Array.isArray(category.image)
                                ? category.image
                                : '/images/placeholder-gemstone.jpg'
                            }
                            alt={category.name + ' category'}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                            loading="lazy"
                            priority={idx < 3}
                          />
                          {/* Luxury overlay */}
                          <div
                            className="absolute inset-0 bg-gradient-to-t from-amber-900/70 via-amber-700/30 to-transparent opacity-60 group-hover:opacity-80 transition"
                            aria-hidden="true"
                          ></div>
                          
                          {/* Premium/Featured badge */}
                          {category.active && (
                            <span className="luxury-badge luxury-badge-gold absolute top-4 left-4">
                              Featured
                            </span>
                          )}
                          {/diamond|ruby|emerald|sapphire|pearl/i.test(category.name) && (
                            <span className="luxury-badge luxury-badge-amber absolute top-4 right-4">
                              Premium
                            </span>
                          )}
                        </div>
                        
                        <div className="p-6">
                          <h2 className="text-2xl font-bold text-amber-900 mb-3 flex items-center gap-2 luxury-font-serif">
                            <span aria-hidden="true">{getGemstoneEmoji(category.name)}</span>
                            {category.name}
                          </h2>
                          
                          <p className="text-gray-700 mb-4 line-clamp-2 min-h-[3rem] luxury-font-sans">
                            {category.description}
                          </p>
                          
                          {/* Category Stats */}
                          <div className="flex justify-between items-center pt-4 border-t border-amber-100">
                            <div className="text-sm">
                              <div className="text-amber-600 font-bold luxury-font-sans">
                                {category.gemstoneCount || 0} Items
                              </div>
                            </div>
                            
                            {category.priceRange && category.priceRange.min > 0 && (
                              <div className="text-sm text-right">
                                <div className="text-gray-500 text-xs luxury-font-sans">Starting at</div>
                                <div className="text-amber-700 font-bold luxury-font-sans">
                                  {formatPriceUSD(category.priceRange.min)}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-6">
                            <LuxuryButton variant="primary" size="md" className="w-full">
                              Explore Collection
                            </LuxuryButton>
                          </div>
                        </div>
                      </LuxuryCard>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            {filteredCategories.length === 0 && (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-amber-800 mb-2">No Categories Found</h3>
                <p className="text-amber-600 mb-6">Try selecting a different filter option</p>
                <LuxuryButton
                  onClick={() => setFilter('all')}
                  variant="primary"
                  size="md"
                >
                  View All Categories
                </LuxuryButton>
              </div>
            )}
          </section>

          {/* Trust Section */}
          <section className="bg-white/80 backdrop-blur-lg border-t border-yellow-100/60 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-amber-900 mb-8 font-serif">
                  Why Choose Shankarmala Gemstore?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    {
                      icon: '🏛️',
                      title: 'Heritage Since 1890',
                      description:
                        'Over 130 years of expertise in gemstone selection and craftsmanship',
                    },
                    {
                      icon: '🔒',
                      title: 'GIA Certified',
                      description:
                        'Every gemstone comes with authentic certification from leading laboratories',
                    },
                    {
                      icon: '💎',
                      title: 'Curated Collection',
                      description: "Handpicked gemstones from the world's most prestigious sources",
                    },
                  ].map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      className="text-center"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.2 }}
                      viewport={{ once: true }}
                    >
                      <div className="text-4xl mb-4">{feature.icon}</div>
                      <h3 className="text-xl font-bold text-amber-900 mb-2 font-serif">
                        {feature.title}
                      </h3>
                      <p className="text-amber-700 font-serif">{feature.description}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>
        </div>
      </Layout>
  );
};

export default CategoriesPage;