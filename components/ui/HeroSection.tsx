import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ArrowRight, Star, Shield, Truck, RotateCcw } from 'lucide-react';
import Link from 'next/link';

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  primaryCTA?: string;
  secondaryCTA?: string;
  primaryCTALink?: string;
  secondaryCTALink?: string;
  backgroundImage?: string;
  videoUrl?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  title = "Discover the World's Finest Gemstones",
  subtitle = 'Experience luxury, authenticity, and craftsmanship in every piece. From rare diamonds to vibrant emeralds, find your perfect gemstone.',
  primaryCTA = 'Shop Now',
  secondaryCTA = 'Watch Story',
  primaryCTALink = '/shop',
  secondaryCTALink = '#',
  backgroundImage = '/images/hero-bg.jpg',
  videoUrl = '/videos/hero-video.mp4',
}) => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    { icon: Star, text: 'Certified Authenticity', color: 'text-yellow-500' },
    { icon: Shield, text: 'Secure Payments', color: 'text-green-500' },
    { icon: Truck, text: 'Free Worldwide Shipping', color: 'text-blue-500' },
    { icon: RotateCcw, text: '30-Day Returns', color: 'text-purple-500' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [features.length]);

  const handleVideoPlay = () => {
    setIsVideoPlaying(true);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video/Image */}
      <div className="absolute inset-0 z-0">
        {videoUrl && (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
            poster={backgroundImage}
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        )}
        {!videoUrl && (
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
        )}
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Main Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6"
            >
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm font-medium">Live from Shankarmala Heritage</span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-5xl lg:text-7xl font-bold leading-tight mb-6"
            >
              {title.split(' ').map((word, index) => (
                <span
                  key={index}
                  className={`${index === 2 || index === 3 ? 'text-amber-400' : ''}`}
                >
                  {word}{' '}
                </span>
              ))}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-xl lg:text-2xl text-gray-200 mb-8 leading-relaxed"
            >
              {subtitle}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 mb-8"
            >
              <Link
                href={primaryCTALink}
                className="inline-flex items-center justify-center px-8 py-4 bg-amber-600 text-white text-lg font-bold rounded-xl hover:bg-amber-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                {primaryCTA}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>

              <button
                onClick={handleVideoPlay}
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-lg font-medium rounded-xl hover:bg-white/20 transition-all duration-300"
              >
                <Play className="mr-2 w-5 h-5" />
                {secondaryCTA}
              </button>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="grid grid-cols-2 gap-4"
            >
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + index * 0.1, duration: 0.6 }}
                    className="flex items-center space-x-3"
                  >
                    <Icon className={`w-5 h-5 ${feature.color}`} />
                    <span className="text-sm text-gray-200">{feature.text}</span>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>

          {/* Right Side - Interactive Elements */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="relative"
          >
            {/* Floating Stats */}
            <div className="relative">
              {/* Live Viewers */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="absolute top-0 right-0 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  <div>
                    <p className="text-sm text-gray-300">Live Viewers</p>
                    <p className="text-2xl font-bold text-white">1,247</p>
                  </div>
                </div>
              </motion.div>

              {/* Recent Purchase */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.4, duration: 0.6 }}
                className="absolute bottom-20 left-0 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">S</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">Sarah from Mumbai</p>
                    <p className="text-sm text-white">Just purchased Ruby Ring</p>
                  </div>
                </div>
              </motion.div>

              {/* Featured Product */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6, duration: 0.8 }}
                className="relative bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
              >
                <div className="aspect-square bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl mb-4 flex items-center justify-center">
                  <span className="text-white text-4xl">💎</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Featured Gemstone</h3>
                <p className="text-gray-300 text-sm mb-4">Exclusive collection available now</p>
                <button className="w-full bg-amber-600 text-white py-2 rounded-lg font-medium hover:bg-amber-700 transition-colors">
                  View Collection
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
      >
        <div className="flex flex-col items-center space-y-2">
          <span className="text-white text-sm">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-3 bg-white rounded-full mt-2"
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Video Modal */}
      <AnimatePresence>
        {isVideoPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsVideoPlaying(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsVideoPlaying(false)}
                className="absolute -top-12 right-0 text-white text-4xl hover:text-gray-300"
              >
                ×
              </button>
              <video controls autoPlay className="w-full rounded-2xl" src={videoUrl}>
                Your browser does not support the video tag.
              </video>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default HeroSection;
