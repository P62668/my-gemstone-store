import React, { useState } from 'react';
import dynamic from 'next/dynamic';
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

// Dynamically import framer-motion components
const MotionDiv = dynamic(() => import('framer-motion').then(mod => mod.motion.div), { ssr: false });
const AnimatePresence = dynamic(() => import('framer-motion').then(mod => mod.AnimatePresence), { ssr: false });

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
        {typeof window !== 'undefined' ? (
          <MotionDiv
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <MotionDiv
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-sm font-medium shadow-lg mb-4"
            >
              <Award className="w-4 h-4 mr-2" />
              Why Choose Shankarmala
            </MotionDiv>

            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                Premium Experience
              </span>
            </h2>

            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We go above and beyond to ensure your gemstone shopping experience is nothing short of
              extraordinary
            </p>
          </MotionDiv>
        ) : (
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-sm font-medium shadow-lg mb-4">
              <Award className="w-4 h-4 mr-2" />
              Why Choose Shankarmala
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                Premium Experience
              </span>
            </h2>

            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We go above and beyond to ensure your gemstone shopping experience is nothing short of
              extraordinary
            </p>
          </div>
        )}

        {/* Features Grid */}
        {typeof window !== 'undefined' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <MotionDiv
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
                    <MotionDiv
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.gradient} text-white rounded-2xl mb-6 shadow-lg`}
                    >
                      {feature.icon}
                    </MotionDiv>

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
                          <MotionDiv
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-4 pt-4 border-t border-gray-100"
                          >
                            <ul className="space-y-2">
                              {feature.details.map((detail, detailIndex) => (
                                <li key={detailIndex} className="flex items-start">
                                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                  <span className="text-gray-600">{detail}</span>
                                </li>
                              ))}
                            </ul>
                          </MotionDiv>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </MotionDiv>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.id}
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
                    <div
                      className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.gradient} text-white rounded-2xl mb-6 shadow-lg`}
                    >
                      {feature.icon}
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                      <h3
                        className={`text-xl font-bold ${feature.color} group-hover:text-gray-900 transition-colors`}
                      >
                        {feature.title}
                      </h3>

                      <p className="text-gray-600 leading-relaxed">{feature.description}</p>

                      {/* Details */}
                      {selectedFeature === feature.id && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <ul className="space-y-2">
                            {feature.details.map((detail, detailIndex) => (
                              <li key={detailIndex} className="flex items-start">
                                <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-600">{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default InteractiveFeatures;
