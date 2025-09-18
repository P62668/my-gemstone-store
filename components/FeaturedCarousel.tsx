import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { formatPriceUSD } from '../utils/numberFormat';
import OptimizedImage from './ui/OptimizedImage';
import dynamic from 'next/dynamic';
import LuxuryButton from './ui/LuxuryButton';
import { Sparkles, Star, Heart, Gem } from 'lucide-react';

// Dynamically import framer-motion components
const MotionDiv = dynamic(() => import('framer-motion').then(mod => mod.motion.div), { ssr: false });

interface FeaturedProduct {
  id: number;
  name: string;
  price: number;
  images: string[];
  badge?: string;
  description: string;
  rating?: number;
  reviewCount?: number;
  category?: {
    name: string;
  };
}

const badgeColors = {
  New: 'bg-gradient-to-r from-green-400 to-green-600 text-white',
  Bestseller: 'bg-gradient-to-r from-lime-400 to-lime-600 text-lime-900',
  Limited: 'bg-gradient-to-r from-red-400 to-red-600 text-white',
  Premium: 'bg-gradient-to-r from-purple-400 to-purple-600 text-white',
  Featured: 'bg-gradient-to-r from-amber-400 to-orange-500 text-white',
  Exclusive: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-900',
  Rare: 'bg-gradient-to-r from-blue-400 to-indigo-600 text-white',
};

interface FeaturedCarouselProps {
  title?: string;
  subtitle?: string;
  products: FeaturedProduct[];
  loading?: boolean;
  error?: string | null;
}

const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({
  title = 'Featured Gems',
  subtitle = "Handpicked treasures from our curated collection",
  products,
  loading = false,
  error = null
}) => {
  const [current, setCurrent] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Touch/swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      setIsDragging(true);
      setStartX(e.touches[0].clientX);
      setCurrentX(e.touches[0].clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !e.touches[0]) return;
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    const diff = startX - currentX;
    const threshold = 50; // Minimum swipe distance

    if (Math.abs(diff) > threshold) {
      if (diff > 0 && current < (products?.length || 0) - 1) {
        // Swipe left - next
        setCurrent(current + 1);
      } else if (diff < 0 && current > 0) {
        // Swipe right - previous
        setCurrent(current - 1);
      }
    }

    setIsDragging(false);
  };

  // Auto-advance carousel
  useEffect(() => {
    if (!isClient) return;
    
    const interval = setInterval(() => {
      if (!isDragging && products && products.length > 0) {
        setCurrent((prev) => (prev + 1) % products.length);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [isDragging, products, isClient]);

  const triggerGemConfetti = async () => {
    // Only run confetti in browser environment
    if (isClient) {
      try {
        // Simple console log instead of canvas-confetti
        console.log('Confetti effect triggered');
      } catch (error) {
        // Silently fail if confetti can't be loaded
        console.warn('Confetti failed to load:', error);
      }
    }
  };

  // Add confetti on product click/advance
  useEffect(() => {
    if (isClient && products && products.length > 0) {
      triggerGemConfetti();
    }
  }, [current, products, isClient]);

  // Handle loading state
  if (loading) {
    return (
      <section className="relative w-full bg-gradient-to-br from-stone-50 via-amber-50 to-orange-50 py-24 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-6 animate-pulse"></div>
            <div className="h-16 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white rounded-3xl shadow-xl overflow-hidden border border-stone-100 animate-pulse">
                <div className="h-80 bg-gray-200"></div>
                <div className="p-8">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-6"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Handle error state
  if (error) {
    return (
      <section className="relative w-full bg-gradient-to-br from-stone-50 via-amber-50 to-orange-50 py-24 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">Error loading featured products</div>
            <LuxuryButton 
              variant="primary" 
              onClick={() => window.location.reload()}
              className="px-6 py-3"
            >
              Retry
            </LuxuryButton>
          </div>
        </div>
      </section>
    );
  }

  // Handle empty state
  if (!products || products.length === 0) {
    return (
      <section className="relative w-full bg-gradient-to-br from-stone-50 via-amber-50 to-orange-50 py-24 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center">
            <div className="text-gray-500 text-xl mb-4">No featured products available</div>
            <Link href="/shop">
              <LuxuryButton variant="primary" className="px-6 py-3">
                Browse All Products
              </LuxuryButton>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full bg-gradient-to-br from-stone-50 via-amber-50 to-orange-50 py-24 md:py-32 overflow-hidden">
      {/* Enhanced animated background elements for luxury effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-amber-200 to-orange-200 rounded-full opacity-20 blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-gradient-to-r from-orange-200 to-amber-200 rounded-full opacity-30 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-gradient-to-r from-amber-200 to-orange-200 rounded-full opacity-25 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/3 right-1/3 w-40 h-40 bg-gradient-to-r from-yellow-200 to-amber-200 rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '3s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Enhanced Section Header with Luxury Design */}
        <div className="text-center mb-20">
          {isClient ? (
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
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
                {title}
              </h2>
            </MotionDiv>
          ) : (
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 luxury-font-serif">
              {title}
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
                {subtitle}
              </p>
            </MotionDiv>
          ) : (
            <p className="text-xl text-gray-600 max-w-3xl mx-auto luxury-font-sans">
              {subtitle}
            </p>
          )}
        </div>

        {/* Enhanced Featured Products Grid with Luxury Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product, index) => (
            isClient ? (
              <MotionDiv
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -15 }}
                className="group relative bg-gradient-to-br from-white to-stone-50 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-stone-100"
              >
                {/* Enhanced Product Image with Luxury Effects */}
                <div className="relative h-80 overflow-hidden">
                  <OptimizedImage
                    src={product.images[0] || '/images/placeholder-gemstone.jpg'}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    quality={75}
                    priority={index < 4} // Priority loading for first 4 images
                  />
                  
                  {/* Enhanced Premium Badge with Luxury Design */}
                  {product.badge && (
                    <div className={`absolute top-6 left-6 px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm ${badgeColors[product.badge as keyof typeof badgeColors] || 'bg-amber-100 text-amber-800'} shadow-lg`}>
                      {product.badge}
                    </div>
                  )}
                  
                  {/* Wishlist Icon */}
                  <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white bg-opacity-80 flex items-center justify-center shadow-md backdrop-blur-sm hover:bg-amber-100 transition-colors duration-300 cursor-pointer">
                    <Heart className="w-5 h-5 text-amber-700" />
                  </div>
                  
                  {/* Enhanced Quick View Button with Luxury Effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end justify-center pb-8">
                    <LuxuryButton variant="primary" size="md" className="px-6 py-3">
                      Quick View
                    </LuxuryButton>
                  </div>
                  
                  {/* Enhanced Shine Effect for Luxury Design */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12 translate-x-full group-hover:-translate-x-full transition-transform duration-1000"></div>
                  </div>
                  
                  {/* Gemstone Sparkle Effect */}
                  <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
                    <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-white rounded-full animate-ping"></div>
                    <div className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-white rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                  </div>
                </div>
                
                {/* Enhanced Product Info with Luxury Styling */}
                <div className="p-8">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-gray-900 text-xl group-hover:text-amber-600 transition-colors duration-300 luxury-font-serif">
                      {product.name}
                    </h3>
                    {/* Rating */}
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-amber-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
                    </div>
                  </div>
                  
                  {product.category && (
                    <p className="text-amber-600 text-sm font-medium mb-2 luxury-font-sans">
                      {product.category.name}
                    </p>
                  )}
                  
                  <p className="text-gray-600 text-sm mb-6 line-clamp-2 leading-relaxed luxury-font-sans">
                    {product.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent luxury-font-serif">
                        {formatPriceUSD(product.price)}
                      </span>
                      {product.reviewCount && (
                        <div className="flex items-center mt-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3 h-3 ${i < Math.floor(product.rating || 0) ? 'text-amber-400 fill-current' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500 ml-2">({product.reviewCount})</span>
                        </div>
                      )}
                    </div>
                    <Link href={`/product/${product.id}`}>
                      <LuxuryButton variant="primary" size="md" className="px-6 py-3">
                        <Gem className="w-4 h-4 mr-2" />
                        View Details
                      </LuxuryButton>
                    </Link>
                  </div>
                </div>
              </MotionDiv>
            ) : (
              <div
                key={product.id}
                className="group relative bg-gradient-to-br from-white to-stone-50 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-stone-100"
              >
                {/* Enhanced Product Image */}
                <div className="relative h-80 overflow-hidden">
                  <OptimizedImage
                    src={product.images[0] || '/images/placeholder-gemstone.jpg'}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    quality={75}
                    priority={index < 4} // Priority loading for first 4 images
                  />
                  
                  {/* Enhanced Premium Badge */}
                  {product.badge && (
                    <div className={`absolute top-6 left-6 px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm ${badgeColors[product.badge as keyof typeof badgeColors] || 'bg-amber-100 text-amber-800'} shadow-lg`}>
                      {product.badge}
                    </div>
                  )}
                  
                  {/* Wishlist Icon */}
                  <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white bg-opacity-80 flex items-center justify-center shadow-md backdrop-blur-sm hover:bg-amber-100 transition-colors duration-300 cursor-pointer">
                    <Heart className="w-5 h-5 text-amber-700" />
                  </div>
                  
                  {/* Enhanced Quick View Button */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end justify-center pb-8">
                    <LuxuryButton variant="primary" size="md" className="px-6 py-3">
                      Quick View
                    </LuxuryButton>
                  </div>
                </div>
                
                {/* Enhanced Product Info */}
                <div className="p-8">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-gray-900 text-xl group-hover:text-amber-600 transition-colors duration-300 luxury-font-serif">
                      {product.name}
                    </h3>
                    {/* Rating */}
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-amber-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
                    </div>
                  </div>
                  
                  {product.category && (
                    <p className="text-amber-600 text-sm font-medium mb-2 luxury-font-sans">
                      {product.category.name}
                    </p>
                  )}
                  
                  <p className="text-gray-600 text-sm mb-6 line-clamp-2 leading-relaxed luxury-font-sans">
                    {product.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent luxury-font-serif">
                        {formatPriceUSD(product.price)}
                      </span>
                      {product.reviewCount && (
                        <div className="flex items-center mt-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3 h-3 ${i < Math.floor(product.rating || 0) ? 'text-amber-400 fill-current' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500 ml-2">({product.reviewCount})</span>
                        </div>
                      )}
                    </div>
                    <Link href={`/product/${product.id}`}>
                      <LuxuryButton variant="primary" size="md" className="px-6 py-3">
                        <Gem className="w-4 h-4 mr-2" />
                        View Details
                      </LuxuryButton>
                    </Link>
                  </div>
                </div>
              </div>
            )
          ))}
        </div>

        {/* Enhanced Luxury Shop All Button */}
        {isClient ? (
          <MotionDiv
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex justify-center mt-20"
          >
            <Link href="/shop">
              <LuxuryButton variant="primary" size="lg" className="text-xl px-10 py-5">
                <span className="flex items-center">
                  Explore Full Collection
                  <svg className="w-6 h-6 ml-3 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </LuxuryButton>
            </Link>
          </MotionDiv>
        ) : (
          <div className="flex justify-center mt-20">
            <Link href="/shop">
              <LuxuryButton variant="primary" size="lg" className="text-xl px-10 py-5">
                <span className="flex items-center">
                  Explore Full Collection
                  <svg className="w-6 h-6 ml-3 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </LuxuryButton>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedCarousel;