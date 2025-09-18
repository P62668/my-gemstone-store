import React from 'react';
import Link from 'next/link';
import { Sparkles, Gem, ShieldCheck, Truck } from 'lucide-react';
import dynamic from 'next/dynamic';
import LuxuryButton from './LuxuryButton';

// Dynamically import framer-motion components
const MotionDiv = dynamic(() => import('framer-motion').then(mod => mod.motion.div), { ssr: false });

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  primaryCTA?: string;
  secondaryCTA?: string;
  primaryCTALink?: string;
  secondaryCTALink?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  title = 'Discover Rare & Exquisite Gemstones',
  subtitle = 'Handpicked treasures from the finest mines worldwide. GIA certified, ethically sourced, and expertly crafted.',
  primaryCTA = 'Explore Collection',
  secondaryCTA = 'Our Story',
  primaryCTALink = '/shop',
  secondaryCTALink = '/about',
}) => {
  const features = [
    {
      icon: ShieldCheck,
      title: 'GIA Certified',
      description: 'Every gemstone comes with GIA certification for authenticity',
    },
    {
      icon: Truck,
      title: 'Worldwide Shipping',
      description: 'Secure, insured delivery to your doorstep anywhere',
    },
    {
      icon: Gem,
      title: 'Lifetime Care',
      description: 'Personalized after-sales care and maintenance for life',
    },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-yellow-500/5"></div>
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-amber-200 to-orange-200 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-gradient-to-r from-orange-200 to-amber-200 rounded-full opacity-30 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-gradient-to-r from-amber-200 to-orange-200 rounded-full opacity-25 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
        <div className="mb-8">
          {typeof window !== 'undefined' ? (
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium mb-6"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              <span>New Collection Available</span>
            </MotionDiv>
          ) : (
            <div className="inline-flex items-center px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              <span>New Collection Available</span>
            </div>
          )}
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
          {title.split(' ').map((word, index) => (
            <span key={index}>
              {word === 'Rare' || word === 'Exquisite' ? (
                <span className="bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                  {word}
                </span>
              ) : (
                word
              )}
              {index < title.split(' ').length - 1 && ' '}
            </span>
          ))}
        </h1>

        <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto mb-10 leading-relaxed">
          {subtitle}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          {primaryCTALink && (
            <Link href={primaryCTALink}>
              <LuxuryButton variant="primary" size="lg">
                {primaryCTA}
              </LuxuryButton>
            </Link>
          )}
          {secondaryCTALink && (
            <Link href={secondaryCTALink}>
              <LuxuryButton variant="secondary" size="lg">
                {secondaryCTA}
              </LuxuryButton>
            </Link>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return typeof window !== 'undefined' ? (
              <MotionDiv
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-amber-100"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-400 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </MotionDiv>
            ) : (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-amber-100"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-400 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;