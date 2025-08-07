import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { formatPriceUSD } from '../utils/numberFormat';
import confetti from 'canvas-confetti';

interface FeaturedProduct {
  id: number;
  name: string;
  price: number;
  images: string[];
  badge?: string;
  description: string;
}

const badgeColors = {
  New: 'bg-gradient-to-r from-green-400 to-green-600 text-white',
  Bestseller: 'bg-gradient-to-r from-lime-400 to-lime-600 text-lime-900',
  Limited: 'bg-gradient-to-r from-red-400 to-red-600 text-white',
  Premium: 'bg-gradient-to-r from-purple-400 to-purple-600 text-white',
};

const fadeVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

interface FeaturedCarouselProps {
  title?: string;
  subtitle?: string;
}

const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({
  title = 'Featured Gems of Kolkata',
  subtitle = "Handpicked treasures from the City of Joy's legendary jewelers. Each piece tells a story of heritage, artistry, and timeless luxury.",
}) => {
  const [products, setProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const product = products[current];

  useEffect(() => {
    const fetchFeatured = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/gemstones?featured=true');
        if (!res.ok) throw new Error('Failed to fetch featured products');
        const data = await res.json();
        setProducts(data);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  // Touch/swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    const diff = startX - currentX;
    const threshold = 50; // Minimum swipe distance

    if (Math.abs(diff) > threshold) {
      if (diff > 0 && current < products.length - 1) {
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
    const interval = setInterval(() => {
      if (!isDragging) {
        setCurrent((prev) => (prev + 1) % products.length);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [isDragging, products.length]);

  const triggerGemConfetti = () => {
    confetti({
      particleCount: 40,
      spread: 70,
      origin: { y: 0.6 },
      shapes: ['circle', 'square'],
      colors: ['#FFD700', '#E0B0FF', '#B9F2FF', '#FFB6C1', '#FFF8DC'],
    });
  };

  // Add confetti on product click/advance
  useEffect(() => {
    if (!loading && products.length) {
      triggerGemConfetti();
    }
    // eslint-disable-next-line
  }, [current]);

  if (loading) {
    return (
      <section className="relative w-full bg-gradient-to-br from-lime-50 via-green-50 to-emerald-50 py-24 md:py-32 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="text-center text-gray-500">Loading featured products...</div>
        </div>
      </section>
    );
  }
  if (error) {
    return (
      <section className="relative w-full bg-gradient-to-br from-lime-50 via-green-50 to-emerald-50 py-24 md:py-32 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="text-center text-red-500">{error}</div>
        </div>
      </section>
    );
  }
  if (!products.length) {
    return (
      <section className="relative w-full bg-gradient-to-br from-lime-50 via-green-50 to-emerald-50 py-24 md:py-32 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="text-center text-gray-500">No featured products found.</div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full bg-gradient-to-br from-lime-50 via-green-50 to-emerald-50 py-24 md:py-32 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-lime-200 to-green-200 rounded-full opacity-20 animate-pulse"
          style={{ animationDuration: '4s' }}
        />
        <div
          className="absolute bottom-20 right-10 w-24 h-24 bg-gradient-to-r from-emerald-200 to-lime-200 rounded-full opacity-30 animate-pulse"
          style={{ animationDuration: '6s' }}
        />
        <div
          className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-r from-green-200 to-lime-200 rounded-full opacity-25 animate-pulse"
          style={{ animationDuration: '5s' }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            className="w-24 h-1 mx-auto mb-8 rounded-full"
            style={{ background: 'linear-gradient(90deg, #f7fee7 0%, #84cc16 50%, #65a30d 100%)' }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          />
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
            style={{ fontFamily: 'serif', letterSpacing: '0.01em' }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <span className="bg-gradient-to-r from-lime-600 to-green-600 bg-clip-text text-transparent relative">
              {title}
              <motion.div
                className="absolute -top-1 -right-1 w-2 h-2 bg-lime-400 rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </span>
          </motion.h2>
          <motion.p
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {subtitle}
          </motion.p>
        </div>

        {/* Hero Product Display */}
        <div
          ref={containerRef}
          className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-20"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: 'pan-y' }}
        >
          {/* Mobile Arrow Navigation */}
          <div className="md:hidden absolute left-2 top-1/2 z-20 -translate-y-1/2 flex flex-col items-center">
            <button
              aria-label="Previous featured product"
              onClick={() => setCurrent((prev) => (prev > 0 ? prev - 1 : products.length - 1))}
              className="bg-white/80 rounded-full p-2 shadow-lg hover:bg-lime-100 focus:outline-none focus:ring-2 focus:ring-lime-400 transition-all duration-200 animate-pulse"
            >
              <svg
                className="w-7 h-7 text-lime-600"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
          {/* Product Card with 3D tilt and shine */}
          <motion.div
            className="relative bg-white rounded-3xl shadow-2xl border border-lime-100 p-8 flex flex-col items-center text-center max-w-md w-full group cursor-pointer overflow-hidden"
            style={{ perspective: '800px' }}
            whileHover={{ scale: 1.04, boxShadow: '0 12px 40px #a3e63544' }}
            onClick={triggerGemConfetti}
            onMouseMove={(e) => {
              const card = e.currentTarget;
              const rect = card.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              const rotateY = (x / rect.width - 0.5) * 10;
              const rotateX = (y / rect.height - 0.5) * -10;
              card.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(1.04)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = '';
            }}
            tabIndex={0}
            aria-label={`Featured product: ${product?.name}`}
          >
            {/* Shine sweep on image */}
            <span className="absolute inset-0 pointer-events-none z-10">
              <span
                className="block w-full h-full animate-shine-sweep bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ mixBlendMode: 'screen' }}
              />
            </span>
            <div className="relative aspect-square w-64 h-64 mb-6 rounded-2xl overflow-hidden bg-gradient-to-br from-lime-100 to-green-100 flex items-center justify-center border border-lime-200 shadow">
              {product?.images?.[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-gemstone.jpg';
                  }}
                />
              ) : (
                <div className="text-4xl text-lime-600">💎</div>
              )}
              {/* Badge with sparkle */}
              {product?.badge && (
                <span
                  className={`absolute top-4 left-4 px-4 py-2 rounded-full font-bold text-xs shadow-lg sparkle ${badgeColors[product.badge as keyof typeof badgeColors] || 'bg-lime-200 text-lime-900'}`}
                >
                  {product.badge}
                </span>
              )}
            </div>
            <h3
              className="text-2xl font-bold mb-2 bg-gradient-to-r from-lime-700 to-green-600 bg-clip-text text-transparent group-hover:underline group-hover:decoration-lime-400 group-hover:decoration-2 transition-all duration-200 relative"
              style={{ fontFamily: 'serif' }}
            >
              {product?.name}
              {/* Sparkle icon */}
              <svg
                className="w-5 h-5 text-lime-400 sparkle inline ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 2l2 7 7 2-7 2-2 7-2-7-7-2 7-2z"
                />
              </svg>
            </h3>
            <p className="text-lg text-gray-700 mb-4 opacity-80" style={{ fontFamily: 'serif' }}>
              {product?.description}
            </p>
            <div className="text-3xl font-extrabold text-lime-700 mb-4">
              {formatPriceUSD(product?.price)}
            </div>
            <Link href={`/product/${product?.id}`} className="inline-block mt-2">
              <span className="px-8 py-3 rounded-full bg-gradient-to-r from-lime-500 to-green-500 hover:from-lime-600 hover:to-green-600 text-white font-bold shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-lime-300/40 text-lg relative overflow-hidden">
                <span className="relative z-10">View Details</span>
                {/* Shine sweep */}
                <span className="absolute inset-0 pointer-events-none">
                  <span
                    className="block w-full h-full animate-shine-sweep bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ mixBlendMode: 'screen' }}
                  />
                </span>
              </span>
            </Link>
          </motion.div>
          {/* Mobile Arrow Navigation */}
          <div className="md:hidden absolute right-2 top-1/2 z-20 -translate-y-1/2 flex flex-col items-center">
            <button
              aria-label="Next featured product"
              onClick={() => setCurrent((prev) => (prev < products.length - 1 ? prev + 1 : 0))}
              className="bg-white/80 rounded-full p-2 shadow-lg hover:bg-lime-100 focus:outline-none focus:ring-2 focus:ring-lime-400 transition-all duration-200 animate-pulse"
            >
              <svg
                className="w-7 h-7 text-lime-600"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Enhanced Dots navigation */}
        <div className="flex justify-center md:justify-start mt-10 gap-3">
          {products.map((_, idx) => (
            <motion.button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`relative w-4 h-4 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-lime-400 ${
                idx === current
                  ? 'bg-gradient-to-r from-lime-500 to-green-500 scale-125 shadow-lg'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              {idx === current && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-lime-400 to-green-400"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* Shop All Button */}
        <motion.div
          className="flex justify-center mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Link href="/shop">
            <motion.button
              className="px-8 py-4 rounded-full border-2 border-lime-400 text-lime-700 font-bold bg-white/90 hover:bg-lime-50 shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-lime-200 text-lg"
              whileHover={{ scale: 1.05, boxShadow: '0 4px 24px #84cc1622' }}
              whileTap={{ scale: 0.95 }}
            >
              Shop All Products
            </motion.button>
          </Link>
        </motion.div>

        {/* Swipe indicator for mobile */}
        <motion.div
          className="md:hidden mt-6 text-sm text-gray-500 flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            ←
          </motion.div>
          <span>Swipe to explore</span>
          <motion.div animate={{ x: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            →
          </motion.div>
        </motion.div>
      </div>
      <style>{`
        .animate-shine-sweep {
          background-size: 200% 200%;
          animation: shine-sweep 2.5s cubic-bezier(.4,0,.2,1) infinite;
        }
        @keyframes shine-sweep {
          0% { opacity: 0; transform: translateX(-100%); }
          60% { opacity: 1; transform: translateX(120%); }
          100% { opacity: 0; transform: translateX(120%); }
        }
        .sparkle {
          animation: sparkle 1.5s infinite alternate;
        }
        @keyframes sparkle {
          0% { filter: drop-shadow(0 0 0px #fffbe6); opacity: 1; }
          100% { filter: drop-shadow(0 0 12px #fffbe6); opacity: 0.7; }
        }
      `}</style>
    </section>
  );
};

export default FeaturedCarousel;
