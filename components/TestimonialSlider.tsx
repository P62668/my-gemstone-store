import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  quote: string;
  image?: string | null;
  rating?: number;
}

const fadeVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -30 },
};

interface TestimonialSliderProps {
  title?: string;
  subtitle?: string;
}

const TestimonialSlider: React.FC<TestimonialSliderProps> = ({
  title = 'What Our Patrons Say',
  subtitle = "Real stories from connoisseurs who chose Kolkata's finest gems.",
}) => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const testimonial = testimonials[current];

  useEffect(() => {
    const fetchTestimonials = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/testimonials');
        if (!res.ok) throw new Error('Failed to fetch testimonials');
        const data = await res.json();
        setTestimonials(data);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  if (loading) {
    return <section className="py-20 text-center text-gray-500">Loading testimonials...</section>;
  }
  if (error) {
    return <section className="py-20 text-center text-red-500">{error}</section>;
  }
  if (!testimonials.length) {
    return <section className="py-20 text-center text-gray-500">No testimonials found.</section>;
  }

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
    const threshold = 50;
    if (Math.abs(diff) > threshold) {
      if (diff > 0 && current < testimonials.length - 1) {
        setCurrent(current + 1);
      } else if (diff < 0 && current > 0) {
        setCurrent(current - 1);
      }
    }
    setIsDragging(false);
  };

  return (
    <section className="relative w-full bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 py-20 md:py-28 overflow-hidden">
      <div className="max-w-3xl mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: 'serif', letterSpacing: '0.01em' }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent relative">
              {title}
              <motion.div
                className="absolute -top-1 -right-1 w-2 h-2 bg-purple-400 rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </span>
          </motion.h2>
          <motion.p
            className="text-lg text-gray-600 max-w-xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {subtitle}
          </motion.p>
        </div>
        <div
          ref={cardRef}
          className="relative flex items-center justify-center"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: 'pan-y' }}
        >
          {/* Left Arrow (desktop) */}
          <button
            onClick={() => setCurrent((prev) => Math.max(prev - 1, 0))}
            disabled={current === 0}
            aria-label="Previous testimonial"
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center rounded-full shadow-lg bg-white/70 backdrop-blur border-2 border-purple-200 text-purple-700 text-2xl font-bold transition-all duration-200 z-10
              disabled:opacity-40 disabled:cursor-not-allowed hover:bg-purple-100 active:scale-95"
            style={{ boxShadow: '0 2px 12px #a855f733' }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="11" stroke="#a855f7" strokeWidth="2" fill="white" />
              <polyline points="14 8 10 12 14 16" />
            </svg>
          </button>
          {/* Testimonial Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={testimonial.name}
              variants={fadeVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.6 }}
              className="relative w-full max-w-xl bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border-4 border-purple-100 px-8 py-10 flex flex-col items-center text-center"
              style={{ boxShadow: '0 8px 48px #a855f733' }}
            >
              {/* Sparkle accent */}
              <motion.div
                className="absolute top-6 right-8 w-4 h-4 bg-gradient-to-br from-purple-200 to-violet-300 rounded-full opacity-60"
                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              {/* Photo */}
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-purple-300 mb-4 shadow-lg bg-gradient-to-br from-purple-100 to-violet-200 flex items-center justify-center">
                {testimonial.image ? (
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-2xl text-purple-600">👤</div>
                )}
              </div>
              {/* Quote */}
              <p className="text-xl italic text-purple-900/90 mb-6 font-serif">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              {/* Name & City */}
              <div className="flex flex-col items-center gap-1">
                <span className="font-bold text-lg text-gray-900 tracking-wide">
                  {testimonial.name}
                </span>
                <span className="text-sm text-purple-700">{testimonial.role}</span>
              </div>
            </motion.div>
          </AnimatePresence>
          {/* Right Arrow (desktop) */}
          <button
            onClick={() => setCurrent((prev) => Math.min(prev + 1, testimonials.length - 1))}
            disabled={current === testimonials.length - 1}
            aria-label="Next testimonial"
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center rounded-full shadow-lg bg-white/70 backdrop-blur border-2 border-purple-200 text-purple-700 text-2xl font-bold transition-all duration-200 z-10
              disabled:opacity-40 disabled:cursor-not-allowed hover:bg-purple-100 active:scale-95"
            style={{ boxShadow: '0 2px 12px #a855f733' }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="11" stroke="#a855f7" strokeWidth="2" fill="white" />
              <polyline points="10 8 14 12 10 16" />
            </svg>
          </button>
        </div>
        {/* Dots navigation */}
        <div className="flex justify-center mt-8 gap-3">
          {testimonials.map((_, idx) => (
            <motion.button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`relative w-4 h-4 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                idx === current
                  ? 'bg-gradient-to-r from-purple-500 to-violet-500 scale-125 shadow-lg'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to testimonial ${idx + 1}`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              {idx === current && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-violet-400"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.button>
          ))}
        </div>
        {/* Swipe indicator for mobile */}
        <motion.div
          className="md:hidden mt-6 text-sm text-gray-500 flex items-center gap-2 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            ←
          </motion.div>
          <span>Swipe to read more</span>
          <motion.div animate={{ x: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            →
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialSlider;
