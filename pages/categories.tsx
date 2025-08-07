import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Head from 'next/head';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
// import { formatPriceUSD } from '../utils/numberFormat';

interface Category {
  id: number;
  name: string;
  description?: string;
  image?: string | null;
  active?: boolean;
}

// const getColorClasses = (color: string) => {
//   ...existing code...
// };

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
      <>
        <Head>
          <title>Gemstone Categories - Shankarmala Gemstore</title>
        </Head>
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
      </>
    );
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Gemstone Categories - Shankarmala Gemstore</title>
        </Head>
        <Layout title="Gemstone Categories - Shankarmala">
          <div className="max-w-7xl mx-auto py-12 px-4">
            <div className="text-center text-red-600">{error}</div>
          </div>
        </Layout>
      </>
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
    <>
      <Head>
        <title>Gemstone Categories - Shankarmala Gemstore</title>
        <meta
          name="description"
          content="Browse all gemstone categories at Shankarmala Gemstore. Discover luxury, certified gems and jewelry."
        />
        <link rel="canonical" href="https://shankarmala.com/categories" />
        <meta property="og:title" content="Gemstone Categories - Shankarmala Gemstore" />
        <meta
          property="og:description"
          content="Browse all gemstone categories at Shankarmala Gemstore. Discover luxury, certified gems and jewelry."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://shankarmala.com/categories" />
        <meta property="og:image" content="/images/placeholder-gemstone.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Gemstone Categories - Shankarmala Gemstore" />
        <meta
          name="twitter:description"
          content="Browse all gemstone categories at Shankarmala Gemstore. Discover luxury, certified gems and jewelry."
        />
        <meta name="twitter:image" content="/images/placeholder-gemstone.jpg" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(categoriesJsonLd) }}
        />
      </Head>
      <Layout title="Gemstone Categories - Shankarmala">
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
            <div className="flex flex-wrap gap-3 mb-8 justify-center">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-full font-semibold border ${filter === 'all' ? 'bg-amber-600 text-white border-amber-600' : 'bg-white/80 text-amber-900 border-amber-200'} shadow hover:bg-amber-100 transition`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('featured')}
                className={`px-4 py-2 rounded-full font-semibold border ${filter === 'featured' ? 'bg-amber-600 text-white border-amber-600' : 'bg-white/80 text-amber-900 border-amber-200'} shadow hover:bg-amber-100 transition`}
              >
                Featured
              </button>
              <button
                onClick={() => setFilter('premium')}
                className={`px-4 py-2 rounded-full font-semibold border ${filter === 'premium' ? 'bg-amber-600 text-white border-amber-600' : 'bg-white/80 text-amber-900 border-amber-200'} shadow hover:bg-amber-100 transition`}
              >
                Premium
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence>
                {filteredCategories.map((category, idx) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 30 }}
                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                    className="bg-white/90 rounded-3xl shadow-2xl border border-yellow-100/60 overflow-hidden hover:shadow-3xl transition-all duration-500 hover:scale-105 group relative"
                  >
                    <Link
                      href={`/categories/${category.id}`}
                      aria-label={`View ${category.name} category`}
                    >
                      <div className="relative h-44 w-full overflow-hidden">
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
                          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                          loading="lazy"
                          priority={idx < 3}
                        />
                        {/* Luxury overlay */}
                        <div
                          className="absolute inset-0 bg-gradient-to-t from-amber-100/80 via-white/10 to-transparent opacity-80 group-hover:opacity-100 transition"
                          aria-hidden="true"
                        ></div>
                        {/* Premium/Featured badge */}
                        {category.active && (
                          <span className="absolute top-3 left-3 bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                            Featured
                          </span>
                        )}
                        {/diamond|ruby|emerald|sapphire|pearl/i.test(category.name) && (
                          <span className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                            Premium
                          </span>
                        )}
                      </div>
                      <div className="p-6">
                        <h2 className="text-2xl font-bold text-amber-900 mb-2 flex items-center gap-2">
                          <span aria-hidden="true">{getGemstoneEmoji(category.name)}</span>
                          {category.name}
                        </h2>
                        <p className="text-gray-700 mb-4 line-clamp-3">{category.description}</p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            {filteredCategories.length === 0 && (
              <div className="text-center text-amber-700 font-semibold py-12">
                No categories found for this filter.
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
                <h2 className="text-3xl md:text-4xl font-bold text-yellow-900 mb-8 font-serif">
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
                      <h3 className="text-xl font-bold text-yellow-900 mb-2 font-serif">
                        {feature.title}
                      </h3>
                      <p className="text-yellow-700 font-serif">{feature.description}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>
        </div>
      </Layout>
    </>
  );
};

export default CategoriesPage;
