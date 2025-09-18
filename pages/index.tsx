import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Layout from '../components/Layout';
import FeaturedCarousel from '../components/FeaturedCarousel';
import AIRecommendations from '../components/ui/AIRecommendations';
import TrendingProducts from '../components/ui/TrendingProducts';
import { Star, Shield, Truck, Heart, Award, Globe, Phone, Clock, Sparkles, Gem, Crown } from 'lucide-react';
import LuxuryButton from '../components/ui/LuxuryButton';
import LuxuryCard from '../components/ui/LuxuryCard';
import { GetServerSideProps } from 'next';
import prisma from '../lib/prisma';
import { performanceCache as cache } from '../utils/clientCache';

// Dynamically import framer-motion to avoid SSR issues
const MotionDiv = dynamic(() => import('framer-motion').then(mod => mod.motion.div), { ssr: false });

interface HomepageData {
  hero: {
    title: string;
    subtitle: string;
    primaryCTA: string;
    secondaryCTA: string;
    primaryCTALink: string;
    secondaryCTALink: string;
  } | null;
  sections: any[];
  featuredProducts: any[];
  categories?: any[];
}

// Define types for our data
interface HomepageSection {
  id: number;
  content: any;
  key: string;
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Category {
  id: number;
  name: string;
  description: string | null;
  image: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    gemstones: number;
  };
}

interface Gemstone {
  id: number;
  name: string;
  price: number;
  images: string | string[];
  description: string;
  category: {
    name: string;
  };
  averageRating: number | null;
  reviewCount: number;
}

// Server-side rendering for better performance
export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  try {
    // Set cache headers for better performance
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=300, stale-while-revalidate=59'
    );

    // Create cache key for homepage data
    const cacheKey = 'homepage-data';
    
    // Try to get cached homepage data
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return {
        props: {
          homepageData: cachedData,
        },
      };
    }

    // Fetch homepage data from database
    let homepageContent: HomepageSection[] = [];
    let categories: Category[] = [];
    let featuredGemstones: Gemstone[] = [];

    try {
      // Fetch all data in parallel
      const [contentResult, categoriesResult, gemstonesResult] = await Promise.allSettled([
        prisma.homepageSection.findMany({
          orderBy: { order: 'asc' },
        }),
        prisma.category.findMany({
          where: { active: true },
          include: {
            _count: {
              select: { gemstones: true },
            },
          },
          orderBy: { name: 'asc' }
        }),
        prisma.gemstone.findMany({
          where: { 
            featured: true,
            active: true 
          },
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            description: true,
            category: {
              select: {
                name: true,
              },
            },
            averageRating: true,
            reviewCount: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 8,
        }),
      ]);

      // Handle results
      homepageContent = contentResult.status === 'fulfilled' ? contentResult.value : [];
      categories = categoriesResult.status === 'fulfilled' ? categoriesResult.value : [];
      featuredGemstones = gemstonesResult.status === 'fulfilled' ? gemstonesResult.value : [];
    } catch (dbError) {
      console.error('Database query error:', dbError);
      // Fallback to empty arrays if database queries fail
      homepageContent = [];
      categories = [];
      featuredGemstones = [];
    }

    // Process homepage content
    const heroSection = homepageContent.find(section => section.key === 'hero');
    const dynamicContent = homepageContent
      .filter(section => section.key !== 'hero')
      .map(section => ({
        id: section.id,
        type: section.key,
        content: section.content,
        order: section.order,
      }));

    // Process featured products
    const featuredProducts = featuredGemstones.map((gemstone: any) => {
      // Parse images if they're stored as JSON string
      let images: string[] = [];
      if (typeof gemstone.images === 'string') {
        try {
          images = JSON.parse(gemstone.images);
        } catch (e) {
          images = [gemstone.images];
        }
      } else if (Array.isArray(gemstone.images)) {
        images = gemstone.images;
      } else {
        images = ['/images/placeholder-gemstone.jpg'];
      }

      return {
        id: gemstone.id,
        name: gemstone.name,
        price: gemstone.price,
        images: images,
        description: gemstone.description || 'Beautiful gemstone',
        badge: 'Featured',
        rating: gemstone.averageRating || 4.8,
        reviewCount: gemstone.reviewCount || 24,
        category: gemstone.category
      };
    });

    // Prepare homepage data
    const homepageData = {
      hero: heroSection && heroSection.content && typeof heroSection.content === 'object' && !Array.isArray(heroSection.content) ? {
        title: (heroSection.content as any).title || 'Timeless Elegance',
        subtitle: (heroSection.content as any).subtitle || "Discover the finest gemstones from Kolkata's heritage jewelry district",
        primaryCTA: (heroSection.content as any).primaryCTA || 'Explore Collection',
        secondaryCTA: (heroSection.content as any).secondaryCTA || 'Learn Our Story',
        primaryCTALink: (heroSection.content as any).primaryCTALink || '/shop',
        secondaryCTALink: (heroSection.content as any).secondaryCTALink || '/about',
      } : null,
      sections: homepageContent,
      featuredProducts,
      categories,
    };

    // Cache the homepage data for 5 minutes
    cache.set(cacheKey, homepageData, 300000); // 5 minutes in milliseconds

    return {
      props: {
        homepageData,
      },
    };
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    
    // Return fallback data
    return {
      props: {
        homepageData: {
          hero: null,
          sections: [],
          featuredProducts: [],
          categories: [],
        },
      },
    };
  }
};

export default function Home({ homepageData }: { homepageData: HomepageData }) {
  const [mounted, setMounted] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsClient(true);
  }, []);

  if (!mounted) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-500 mx-auto"></div>
            <p className="mt-4 text-lg text-amber-700">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Determine if we should show personalized recommendations
  // This would typically be based on user data, but for now we'll show it to all users
  const showPersonalizedContent = true;

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Enhanced Hero Section with Luxury Design */}
        <div className="relative bg-gradient-to-r from-amber-900 via-amber-800 to-amber-700 text-white overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/luxury-texture.png')] opacity-10"></div>
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-400 rounded-full filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-orange-400 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-1/4 left-1/2 w-80 h-80 bg-yellow-400 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 py-24 md:py-32">
            <div className="max-w-3xl">
              {isClient ? (
                <MotionDiv
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="flex items-center mb-6"
                >
                  <Sparkles className="w-8 h-8 text-amber-300 mr-3" />
                  <span className="text-amber-200 text-lg font-medium luxury-font-sans">EST. 1975</span>
                </MotionDiv>
              ) : (
                <div className="flex items-center mb-6">
                  <Sparkles className="w-8 h-8 text-amber-300 mr-3" />
                  <span className="text-amber-200 text-lg font-medium luxury-font-sans">EST. 1975</span>
                </div>
              )}
              
              {isClient ? (
                <MotionDiv
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-5xl md:text-7xl font-bold mb-6 luxury-font-serif leading-tight"
                >
                  {homepageData?.hero?.title || 'Timeless Elegance'}
                </MotionDiv>
              ) : (
                <div className="text-5xl md:text-7xl font-bold mb-6 luxury-font-serif leading-tight">
                  {homepageData?.hero?.title || 'Timeless Elegance'}
                </div>
              )}
              
              {isClient ? (
                <MotionDiv
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="text-xl md:text-2xl mb-10 text-amber-100 luxury-font-serif max-w-2xl"
                >
                  {homepageData?.hero?.subtitle ||
                    "Discover the finest gemstones from Kolkata's heritage jewelry district"}
                </MotionDiv>
              ) : (
                <div className="text-xl md:text-2xl mb-10 text-amber-100 luxury-font-serif max-w-2xl">
                  {homepageData?.hero?.subtitle ||
                    "Discover the finest gemstones from Kolkata's heritage jewelry district"}
                </div>
              )}
              
              {isClient ? (
                <MotionDiv
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="flex flex-col sm:flex-row gap-6"
                >
                  <Link
                    href={homepageData?.hero?.primaryCTALink || '/shop'}
                  >
                    <LuxuryButton variant="primary" size="lg" className="text-xl px-10 py-5">
                      <Gem className="w-6 h-6 mr-2" />
                      {homepageData?.hero?.primaryCTA || 'Explore Collection'}
                    </LuxuryButton>
                  </Link>
                  <Link
                    href={homepageData?.hero?.secondaryCTALink || '/about'}
                  >
                    <LuxuryButton variant="secondary" size="lg" className="text-xl px-10 py-5">
                      <Crown className="w-6 h-6 mr-2" />
                      {homepageData?.hero?.secondaryCTA || 'Learn Our Story'}
                    </LuxuryButton>
                  </Link>
                </MotionDiv>
              ) : (
                <div className="flex flex-col sm:flex-row gap-6">
                  <Link
                    href={homepageData?.hero?.primaryCTALink || '/shop'}
                  >
                    <LuxuryButton variant="primary" size="lg" className="text-xl px-10 py-5">
                      <Gem className="w-6 h-6 mr-2" />
                      {homepageData?.hero?.primaryCTA || 'Explore Collection'}
                    </LuxuryButton>
                  </Link>
                  <Link
                    href={homepageData?.hero?.secondaryCTALink || '/about'}
                  >
                    <LuxuryButton variant="secondary" size="lg" className="text-xl px-10 py-5">
                      <Crown className="w-6 h-6 mr-2" />
                      {homepageData?.hero?.secondaryCTA || 'Learn Our Story'}
                    </LuxuryButton>
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
        </div>

        {/* Enhanced Featured Products Section */}
        <FeaturedCarousel 
          title="Featured Gemstones" 
          subtitle="Handpicked treasures from our curated collection"
          products={homepageData.featuredProducts}
        />

        {/* Enhanced Categories Section */}
        <div className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-20">
              {isClient ? (
                <MotionDiv
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                >
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 luxury-font-serif">
                    Shop by Category
                  </h2>
                </MotionDiv>
              ) : (
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 luxury-font-serif">
                  Shop by Category
                </h2>
              )}
              
              {isClient ? (
                <MotionDiv
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto luxury-font-sans">
                    Explore our curated collections of exquisite gemstones
                  </p>
                </MotionDiv>
              ) : (
                <p className="text-xl text-gray-600 max-w-3xl mx-auto luxury-font-sans">
                  Explore our curated collections of exquisite gemstones
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {homepageData?.categories?.map((category, index) => (
                isClient ? (
                  <MotionDiv
                    key={category.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -10 }}
                    className="h-full"
                  >
                    <Link 
                      href={`/categories/${encodeURIComponent(category.name.toLowerCase().replace(/\s+/g, '-'))}`}
                      className="group h-full"
                    >
                      <LuxuryCard className="p-8 text-center h-full transition-all duration-500 group-hover:shadow-2xl">
                        <div className="bg-gradient-to-br from-amber-100 to-amber-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md group-hover:shadow-lg transition-all duration-300">
                          <Gem className="text-amber-700 w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-amber-900 mb-3 luxury-font-serif group-hover:text-amber-700 transition-colors duration-300">
                          {category.name}
                        </h3>
                        <p className="text-amber-600 luxury-font-sans">
                          {category._count?.gemstones || 0} items
                        </p>
                      </LuxuryCard>
                    </Link>
                  </MotionDiv>
                ) : (
                  <Link 
                    key={category.id} 
                    href={`/categories/${encodeURIComponent(category.name.toLowerCase().replace(/\s+/g, '-'))}`}
                    className="group h-full"
                  >
                    <LuxuryCard className="p-8 text-center h-full transition-all duration-500 group-hover:shadow-2xl">
                      <div className="bg-gradient-to-br from-amber-100 to-amber-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md group-hover:shadow-lg transition-all duration-300">
                        <Gem className="text-amber-700 w-8 h-8" />
                      </div>
                      <h3 className="text-2xl font-bold text-amber-900 mb-3 luxury-font-serif group-hover:text-amber-700 transition-colors duration-300">
                        {category.name}
                      </h3>
                      <p className="text-amber-600 luxury-font-sans">
                        {category._count?.gemstones || 0} items
                      </p>
                    </LuxuryCard>
                  </Link>
                )
              ))}
            </div>
          </div>
        </div>

        {/* Personalized Content Section - Only shown to users who might benefit */}
        {showPersonalizedContent && (
          <div className="py-24 luxury-bg-cream">
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center mb-20">
                {isClient ? (
                  <MotionDiv
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="inline-flex items-center justify-center mb-8"
                  >
                    <div className="w-24 h-0.5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"></div>
                    <Sparkles className="mx-4 text-amber-500" />
                    <div className="w-24 h-0.5 bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"></div>
                  </MotionDiv>
                ) : (
                  <div className="inline-flex items-center justify-center mb-8">
                    <div className="w-24 h-0.5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"></div>
                    <Sparkles className="mx-4 text-amber-500" />
                    <div className="w-24 h-0.5 bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"></div>
                  </div>
                )}
                
                {isClient ? (
                  <MotionDiv
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 luxury-font-serif">
                      Curated Just For You
                    </h2>
                  </MotionDiv>
                ) : (
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 luxury-font-serif">
                    Curated Just For You
                  </h2>
                )}
                
                {isClient ? (
                  <MotionDiv
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                  >
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto luxury-font-sans">
                      Discover gemstones tailored to your preferences and browsing history
                    </p>
                  </MotionDiv>
                ) : (
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto luxury-font-sans">
                      Discover gemstones tailored to your preferences and browsing history
                    </p>
                )}
              </div>
              
              {/* AI Recommendations */}
              <AIRecommendations />
              
              {/* Trending Products */}
              <div className="mt-20">
                <TrendingProducts />
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Features Section with Luxury Design */}
        <div className="py-24 bg-gradient-to-br from-stone-50 to-amber-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-20">
              {isClient ? (
                <MotionDiv
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                >
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 luxury-font-serif">
                    Why Choose Shankarmala
                  </h2>
                </MotionDiv>
              ) : (
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 luxury-font-serif">
                  Why Choose Shankarmala
                </h2>
              )}
              
              {isClient ? (
                <MotionDiv
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto luxury-font-sans">
                    Experience the finest in gemstone curation and luxury service
                  </p>
                </MotionDiv>
              ) : (
                <p className="text-xl text-gray-600 max-w-3xl mx-auto luxury-font-sans">
                    Experience the finest in gemstone curation and luxury service
                  </p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {isClient ? (
                <>
                  <MotionDiv
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    whileHover={{ y: -10 }}
                    className="h-full"
                  >
                    <LuxuryCard className="p-8 text-center h-full transition-all duration-500">
                      <div className="bg-gradient-to-br from-amber-100 to-amber-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <Shield className="text-amber-700 w-10 h-10" />
                      </div>
                      <h3 className="text-2xl font-bold text-amber-900 mb-4 luxury-font-serif">GIA Certified</h3>
                      <p className="text-amber-700 luxury-font-sans leading-relaxed">
                        Every gemstone comes with a certificate of authenticity from the Gemological Institute of America
                      </p>
                    </LuxuryCard>
                  </MotionDiv>
                  
                  <MotionDiv
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    whileHover={{ y: -10 }}
                    className="h-full"
                  >
                    <LuxuryCard className="p-8 text-center h-full transition-all duration-500">
                      <div className="bg-gradient-to-br from-amber-100 to-amber-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <Truck className="text-amber-700 w-10 h-10" />
                      </div>
                      <h3 className="text-2xl font-bold text-amber-900 mb-4 luxury-font-serif">Worldwide Shipping</h3>
                      <p className="text-amber-700 luxury-font-sans leading-relaxed">
                        Express delivery to over 100 countries with secure packaging and insurance
                      </p>
                    </LuxuryCard>
                  </MotionDiv>
                  
                  <MotionDiv
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    whileHover={{ y: -10 }}
                    className="h-full"
                  >
                    <LuxuryCard className="p-8 text-center h-full transition-all duration-500">
                      <div className="bg-gradient-to-br from-amber-100 to-amber-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <Heart className="text-amber-700 w-10 h-10" />
                      </div>
                      <h3 className="text-2xl font-bold text-amber-900 mb-4 luxury-font-serif">Lifetime Warranty</h3>
                      <p className="text-amber-700 luxury-font-sans leading-relaxed">
                        Complimentary lifetime warranty on all purchases with our exclusive care program
                      </p>
                    </LuxuryCard>
                  </MotionDiv>
                  
                  <MotionDiv
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    whileHover={{ y: -10 }}
                    className="h-full"
                  >
                    <LuxuryCard className="p-8 text-center h-full transition-all duration-500">
                      <div className="bg-gradient-to-br from-amber-100 to-amber-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <Award className="text-amber-700 w-10 h-10" />
                      </div>
                      <h3 className="text-2xl font-bold text-amber-900 mb-4 luxury-font-serif">Heritage Craftsmanship</h3>
                      <p className="text-amber-700 luxury-font-sans leading-relaxed">
                        Over 50 years of expertise in gemstone curation and jewelry making traditions
                      </p>
                    </LuxuryCard>
                  </MotionDiv>
                </>
              ) : (
                <>
                  <LuxuryCard className="p-8 text-center h-full transition-all duration-500">
                    <div className="bg-gradient-to-br from-amber-100 to-amber-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Shield className="text-amber-700 w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-amber-900 mb-4 luxury-font-serif">GIA Certified</h3>
                    <p className="text-amber-700 luxury-font-sans leading-relaxed">
                      Every gemstone comes with a certificate of authenticity from the Gemological Institute of America
                    </p>
                  </LuxuryCard>
                  
                  <LuxuryCard className="p-8 text-center h-full transition-all duration-500">
                    <div className="bg-gradient-to-br from-amber-100 to-amber-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Truck className="text-amber-700 w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-amber-900 mb-4 luxury-font-serif">Worldwide Shipping</h3>
                    <p className="text-amber-700 luxury-font-sans leading-relaxed">
                      Express delivery to over 100 countries with secure packaging and insurance
                    </p>
                  </LuxuryCard>
                  
                  <LuxuryCard className="p-8 text-center h-full transition-all duration-500">
                    <div className="bg-gradient-to-br from-amber-100 to-amber-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Heart className="text-amber-700 w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-amber-900 mb-4 luxury-font-serif">Lifetime Warranty</h3>
                    <p className="text-amber-700 luxury-font-sans leading-relaxed">
                      Complimentary lifetime warranty on all purchases with our exclusive care program
                    </p>
                  </LuxuryCard>
                  
                  <LuxuryCard className="p-8 text-center h-full transition-all duration-500">
                    <div className="bg-gradient-to-br from-amber-100 to-amber-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Award className="text-amber-700 w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-amber-900 mb-4 luxury-font-serif">Heritage Craftsmanship</h3>
                    <p className="text-amber-700 luxury-font-sans leading-relaxed">
                      Over 50 years of expertise in gemstone curation and jewelry making traditions
                    </p>
                  </LuxuryCard>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Contact Section */}
        <div className="py-24 bg-gradient-to-r from-amber-900 to-amber-700 text-white relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/luxury-texture.png')] opacity-5"></div>
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-400 rounded-full filter blur-3xl opacity-10 animate-blob"></div>
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-400 rounded-full filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              {isClient ? (
                <MotionDiv
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                >
                  <h2 className="text-4xl md:text-5xl font-bold mb-6 luxury-font-serif">
                    Visit Our Showroom
                  </h2>
                </MotionDiv>
              ) : (
                <h2 className="text-4xl md:text-5xl font-bold mb-6 luxury-font-serif">
                  Visit Our Showroom
                </h2>
              )}
              
              {isClient ? (
                <MotionDiv
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <p className="text-xl text-amber-100 max-w-3xl mx-auto luxury-font-sans">
                    Experience our exquisite collection in person at our flagship store in Kolkata
                  </p>
                </MotionDiv>
              ) : (
                <p className="text-xl text-amber-100 max-w-3xl mx-auto luxury-font-sans">
                  Experience our exquisite collection in person at our flagship store in Kolkata
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {isClient ? (
                <>
                  <MotionDiv
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="text-center"
                  >
                    <div className="bg-amber-800 bg-opacity-30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Phone className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 luxury-font-serif">Call Us</h3>
                    <p className="text-amber-100 text-xl luxury-font-sans">+91 33 2287 1234</p>
                    <p className="text-amber-200 mt-2 luxury-font-sans">Mon-Sat: 10AM-8PM</p>
                  </MotionDiv>
                  
                  <MotionDiv
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-center"
                  >
                    <div className="bg-amber-800 bg-opacity-30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Globe className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 luxury-font-serif">Visit Us</h3>
                    <p className="text-amber-100 text-xl luxury-font-sans">123 Diamond Street</p>
                    <p className="text-amber-100 luxury-font-sans">Kolkata, West Bengal 700001</p>
                    <p className="text-amber-200 mt-2 luxury-font-sans">India</p>
                  </MotionDiv>
                  
                  <MotionDiv
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="text-center"
                  >
                    <div className="bg-amber-800 bg-opacity-30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Clock className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 luxury-font-serif">Open Hours</h3>
                    <p className="text-amber-100 text-xl luxury-font-sans">Monday - Saturday</p>
                    <p className="text-amber-100 luxury-font-sans">10:00 AM - 8:00 PM</p>
                    <p className="text-amber-200 mt-2 luxury-font-sans">Sunday by appointment</p>
                  </MotionDiv>
                </>
              ) : (
                <>
                  <div className="text-center">
                    <div className="bg-amber-800 bg-opacity-30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Phone className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 luxury-font-serif">Call Us</h3>
                    <p className="text-amber-100 text-xl luxury-font-sans">+91 33 2287 1234</p>
                    <p className="text-amber-200 mt-2 luxury-font-sans">Mon-Sat: 10AM-8PM</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-amber-800 bg-opacity-30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Globe className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 luxury-font-serif">Visit Us</h3>
                    <p className="text-amber-100 text-xl luxury-font-sans">123 Diamond Street</p>
                    <p className="text-amber-100 luxury-font-sans">Kolkata, West Bengal 700001</p>
                    <p className="text-amber-200 mt-2 luxury-font-sans">India</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-amber-800 bg-opacity-30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Clock className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 luxury-font-serif">Open Hours</h3>
                    <p className="text-amber-100 text-xl luxury-font-sans">Monday - Saturday</p>
                    <p className="text-amber-100 luxury-font-sans">10:00 AM - 8:00 PM</p>
                    <p className="text-amber-200 mt-2 luxury-font-sans">Sunday by appointment</p>
                  </div>
                </>
              )}
            </div>
            
            {isClient ? (
              <MotionDiv
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex justify-center mt-16"
              >
                <Link href="/contact">
                  <LuxuryButton variant="primary" size="lg" className="text-xl px-10 py-5">
                    Schedule a Visit
                  </LuxuryButton>
                </Link>
              </MotionDiv>
            ) : (
              <div className="flex justify-center mt-16">
                <Link href="/contact">
                  <LuxuryButton variant="primary" size="lg" className="text-xl px-10 py-5">
                    Schedule a Visit
                  </LuxuryButton>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}