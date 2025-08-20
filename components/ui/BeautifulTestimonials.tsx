import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight, Heart, Award, Users } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  location: string;
  rating: number;
  comment: string;
  avatar: string;
  purchase: string;
  verified: boolean;
  date: string;
}

interface BeautifulTestimonialsProps {
  testimonials?: Testimonial[];
  title?: string;
  subtitle?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

const BeautifulTestimonials: React.FC<BeautifulTestimonialsProps> = ({
  testimonials = [],
  title = 'What Our Customers Say',
  subtitle = 'Real experiences from satisfied customers worldwide',
  autoPlay = true,
  autoPlayInterval = 5000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);

  // Default testimonials if none provided
  const defaultTestimonials: Testimonial[] = [
    {
      id: 1,
      name: 'Priya Sharma',
      location: 'Mumbai, India',
      rating: 5,
      comment:
        "The emerald ring I purchased is absolutely stunning! The quality exceeded my expectations and the customer service was exceptional. I couldn't be happier with my purchase.",
      avatar: '/images/testimonial1.jpg',
      purchase: 'Natural Emerald Ring',
      verified: true,
      date: '2 days ago',
    },
    {
      id: 2,
      name: 'Rajesh Patel',
      location: 'Delhi, India',
      rating: 5,
      comment:
        "Shankarmala has the most authentic gemstones I've ever seen. The certification process gave me complete peace of mind. Highly recommended!",
      avatar: '/images/testimonial2.jpg',
      purchase: 'Diamond Pendant',
      verified: true,
      date: '1 week ago',
    },
    {
      id: 3,
      name: 'Anjali Desai',
      location: 'Bangalore, India',
      rating: 5,
      comment:
        'The ruby necklace is a masterpiece! The craftsmanship is impeccable and the stone quality is outstanding. Thank you for making my special day even more memorable.',
      avatar: '/images/testimonial3.jpg',
      purchase: 'Ruby Necklace',
      verified: true,
      date: '3 days ago',
    },
    {
      id: 4,
      name: 'Vikram Singh',
      location: 'Chennai, India',
      rating: 5,
      comment:
        'Outstanding service and premium quality gemstones. The sapphire earrings I bought for my wife are simply beautiful. Will definitely shop here again!',
      avatar: '/images/testimonial1.jpg',
      purchase: 'Sapphire Earrings',
      verified: true,
      date: '5 days ago',
    },
    {
      id: 5,
      name: 'Meera Reddy',
      location: 'Hyderabad, India',
      rating: 5,
      comment:
        'The attention to detail and personalized service is unmatched. My diamond bracelet is perfect in every way. Shankarmala truly understands luxury.',
      avatar: '/images/testimonial2.jpg',
      purchase: 'Diamond Bracelet',
      verified: true,
      date: '1 week ago',
    },
  ];

  const displayTestimonials = testimonials.length > 0 ? testimonials : defaultTestimonials;

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || displayTestimonials.length <= 1) return;

    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % displayTestimonials.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isAutoPlaying, autoPlayInterval, displayTestimonials.length]);

  const nextTestimonial = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % displayTestimonials.length);
  };

  const prevTestimonial = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + displayTestimonials.length) % displayTestimonials.length);
  };

  const goToTestimonial = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-amber-50 to-orange-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-sm font-medium shadow-lg mb-4"
          >
            <Heart className="w-4 h-4 mr-2" />
            Customer Love
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
              {title}
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">{subtitle}</p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-amber-600 mb-2">4.9/5</div>
              <div className="text-gray-600">Average Rating</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-amber-600 mb-2">10K+</div>
              <div className="text-gray-600">Happy Customers</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-amber-600 mb-2">98%</div>
              <div className="text-gray-600">Satisfaction Rate</div>
            </motion.div>
          </div>
        </motion.div>

        {/* Testimonials Carousel */}
        <div className="relative max-w-4xl mx-auto">
          {/* Main Testimonial */}
          <div className="relative">
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                initial={{ opacity: 0, x: direction * 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -100 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="relative"
              >
                <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 relative overflow-hidden">
                  {/* Quote Icon */}
                  <div className="absolute top-6 right-6 text-amber-200">
                    <Quote className="w-16 h-16" />
                  </div>

                  {/* Testimonial Content */}
                  <div className="relative z-10">
                    {/* Rating */}
                    <div className="flex items-center mb-6">
                      <div className="flex items-center mr-4">
                        {renderStars(displayTestimonials[currentIndex]?.rating || 0)}
                      </div>
                      {displayTestimonials[currentIndex]?.verified && (
                        <div className="flex items-center text-green-600 text-sm">
                          <Award className="w-4 h-4 mr-1" />
                          Verified Purchase
                        </div>
                      )}
                    </div>

                    {/* Comment */}
                    <blockquote className="text-lg md:text-xl text-gray-700 leading-relaxed mb-8 italic">
                      &quot;{displayTestimonials[currentIndex]?.comment || ''}&quot;
                    </blockquote>

                    {/* Customer Info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <img
                            src={displayTestimonials[currentIndex]?.avatar || ''}
                            alt={displayTestimonials[currentIndex]?.name || ''}
                            className="w-16 h-16 rounded-full object-cover border-4 border-amber-100"
                          />
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {displayTestimonials[currentIndex]?.name || ''}
                          </div>
                          <div className="text-sm text-gray-500">
                            {displayTestimonials[currentIndex]?.location || ''}
                          </div>
                          <div className="text-sm text-amber-600 font-medium">
                            Purchased: {displayTestimonials[currentIndex]?.purchase || ''}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-400">
                        {displayTestimonials[currentIndex]?.date || ''}
                      </div>
                    </div>
                  </div>

                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-yellow-400 to-amber-400 rounded-full translate-y-12 -translate-x-12"></div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-center mt-8 space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={prevTestimonial}
              className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-amber-600 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>

            {/* Dots */}
            <div className="flex space-x-2">
              {displayTestimonials.map((_, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                  onClick={() => goToTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'bg-amber-500 scale-125'
                      : 'bg-gray-300 hover:bg-amber-300'
                  }`}
                />
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={nextTestimonial}
              className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-amber-600 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </motion.button>

            {/* Auto-play Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleAutoPlay}
              className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
                isAutoPlaying
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-amber-100'
              }`}
            >
              <div className={`w-4 h-4 ${isAutoPlaying ? 'animate-pulse' : ''}`}>
                {isAutoPlaying ? '⏸' : '▶'}
              </div>
            </motion.button>
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-white rounded-3xl shadow-xl p-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mr-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Join Our Happy Customers</h3>
            </div>

            <p className="text-gray-600 mb-6">
              Experience the same level of satisfaction and quality that our customers rave about
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Heart className="w-5 h-5 inline mr-2" />
              Start Shopping Today
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-amber-400 rounded-full opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </section>
  );
};

export default BeautifulTestimonials;
