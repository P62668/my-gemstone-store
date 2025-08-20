import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Truck,
  RotateCcw,
  Star,
  CreditCard,
  Headphones,
  Award,
  Zap,
  Globe,
  Lock,
  CheckCircle,
  Sparkles,
} from 'lucide-react';

interface Feature {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  gradient: string;
  details: string[];
}

const InteractiveFeatures: React.FC = () => {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  const features: Feature[] = [
    {
      id: 'authenticity',
      icon: <Shield className="w-8 h-8" />,
      title: 'Certified Authenticity',
      description: 'Every gemstone comes with GIA certification and authenticity guarantee',
      color: 'text-green-600',
      gradient: 'from-green-500 to-emerald-500',
      details: [
        'GIA certified gemstones',
        'Detailed authenticity reports',
        'Origin verification',
        'Quality assurance guarantee',
      ],
    },
    {
      id: 'shipping',
      icon: <Truck className="w-8 h-8" />,
      title: 'Free Worldwide Shipping',
      description: 'Complimentary insured shipping to any location worldwide',
      color: 'text-blue-600',
      gradient: 'from-blue-500 to-cyan-500',
      details: [
        'Free shipping worldwide',
        'Insured delivery',
        'Express shipping available',
        'Real-time tracking',
      ],
    },
    {
      id: 'returns',
      icon: <RotateCcw className="w-8 h-8" />,
      title: '30-Day Returns',
      description: 'Hassle-free returns with full refund guarantee',
      color: 'text-purple-600',
      gradient: 'from-purple-500 to-pink-500',
      details: [
        '30-day return policy',
        'Full refund guarantee',
        'No questions asked',
        'Free return shipping',
      ],
    },
    {
      id: 'quality',
      icon: <Star className="w-8 h-8" />,
      title: 'Premium Quality',
      description: 'Handpicked gemstones of the highest quality standards',
      color: 'text-yellow-600',
      gradient: 'from-yellow-500 to-orange-500',
      details: [
        'Handpicked selection',
        'Premium quality standards',
        'Expert curation',
        'Quality inspection',
      ],
    },
    {
      id: 'payment',
      icon: <CreditCard className="w-8 h-8" />,
      title: 'Secure Payments',
      description: 'Multiple secure payment options with encryption',
      color: 'text-indigo-600',
      gradient: 'from-indigo-500 to-purple-500',
      details: ['SSL encryption', 'Multiple payment methods', 'Secure checkout', 'PCI compliance'],
    },
    {
      id: 'support',
      icon: <Headphones className="w-8 h-8" />,
      title: '24/7 Support',
      description: 'Round-the-clock customer support for all your needs',
      color: 'text-red-600',
      gradient: 'from-red-500 to-pink-500',
      details: [
        '24/7 customer support',
        'Live chat available',
        'Expert assistance',
        'Quick response time',
      ],
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-amber-50 to-orange-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
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
            <Award className="w-4 h-4 mr-2" />
            Why Choose Shankarmala
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
              Premium Experience
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We go above and beyond to ensure your gemstone shopping experience is nothing short of
            extraordinary
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              onHoverStart={() => setHoveredFeature(feature.id)}
              onHoverEnd={() => setHoveredFeature(null)}
              onClick={() => setSelectedFeature(selectedFeature === feature.id ? null : feature.id)}
              className="group cursor-pointer"
            >
              <div className="relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
                {/* Gradient Border */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                <div className="relative bg-white rounded-3xl p-8 m-1">
                  {/* Icon */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.gradient} text-white rounded-2xl mb-6 shadow-lg`}
                  >
                    {feature.icon}
                  </motion.div>

                  {/* Content */}
                  <div className="space-y-4">
                    <h3
                      className={`text-xl font-bold ${feature.color} group-hover:text-gray-900 transition-colors`}
                    >
                      {feature.title}
                    </h3>

                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>

                    {/* Details */}
                    <AnimatePresence>
                      {selectedFeature === feature.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-2 pt-4 border-t border-gray-100"
                        >
                          {feature.details.map((detail, detailIndex) => (
                            <motion.div
                              key={detailIndex}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: detailIndex * 0.1 }}
                              className="flex items-center space-x-2"
                            >
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span className="text-sm text-gray-600">{detail}</span>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Expand/Collapse Indicator */}
                    <motion.div
                      animate={{ rotate: selectedFeature === feature.id ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className={`inline-flex items-center text-sm font-medium ${feature.color} group-hover:text-gray-900 transition-colors`}
                    >
                      {selectedFeature === feature.id ? 'Show less' : 'Learn more'}
                      <motion.div
                        animate={{ y: selectedFeature === feature.id ? 2 : 0 }}
                        className="ml-1"
                      >
                        ↓
                      </motion.div>
                    </motion.div>
                  </div>

                  {/* Hover Effect */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hoveredFeature === feature.id ? 1 : 0 }}
                    className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl -z-10"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-white rounded-3xl shadow-xl p-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mr-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Ready to Experience Luxury?</h3>
            </div>

            <p className="text-gray-600 mb-6">
              Join thousands of satisfied customers who trust Shankarmala for their precious
              gemstone needs
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Sparkles className="w-5 h-5 inline mr-2" />
                Start Shopping
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 border-2 border-amber-500 text-amber-600 font-semibold rounded-2xl hover:bg-amber-50 transition-all duration-300"
              >
                <Globe className="w-5 h-5 inline mr-2" />
                Learn More
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
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

export default InteractiveFeatures;
