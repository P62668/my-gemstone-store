import React, { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import { useCallback } from 'react';

// --- World-Class UX HeroSection ---
interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  primaryCTA?: string;
  secondaryCTA?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  backgroundImage?: string;
  backgroundVideo?: string;
  className?: string;
}

const gemSvgs = [
  // SVGs for floating gems (can be expanded)
  <svg
    key="ruby"
    className="w-10 h-10 text-red-400 drop-shadow-lg animate-gem-float"
    viewBox="0 0 32 32"
    fill="currentColor"
  >
    <polygon points="16,2 30,12 24,30 8,30 2,12" />
  </svg>,
  <svg
    key="emerald"
    className="w-8 h-8 text-green-400 drop-shadow-lg animate-gem-float2"
    viewBox="0 0 32 32"
    fill="currentColor"
  >
    <rect x="8" y="8" width="16" height="16" rx="4" />
  </svg>,
  <svg
    key="diamond"
    className="w-12 h-12 text-blue-200 drop-shadow-lg animate-gem-float3"
    viewBox="0 0 32 32"
    fill="currentColor"
  >
    <polygon points="16,2 30,12 16,30 2,12" />
  </svg>,
];

// Parallax effect for floating gems
const useParallax = (ref: React.RefObject<HTMLDivElement>) => {
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return;
      const { left, top, width, height } = ref.current.getBoundingClientRect();
      const x = (e.clientX - left) / width - 0.5;
      const y = (e.clientY - top) / height - 0.5;
      ref.current.style.setProperty('--parallax-x', `${x * 20}px`);
      ref.current.style.setProperty('--parallax-y', `${y * 20}px`);
    };
    const node = ref.current;
    if (node) node.addEventListener('mousemove', handleMouseMove);
    return () => {
      if (node) node.removeEventListener('mousemove', handleMouseMove);
    };
  }, [ref]);
};

const HeroSection: React.FC<HeroSectionProps> = ({
  title = 'Discover Exquisite Gemstones',
  subtitle = "Discover the finest gemstones from Shankarmala's heritage jewelry collection",
  primaryCTA = 'Explore Collection',
  secondaryCTA = 'Learn Our Story',
  onPrimaryClick,
  onSecondaryClick,
  className = '',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showTrust, setShowTrust] = useState(false);
  const [ctaHovered, setCtaHovered] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoaded(true);
    const timer = setTimeout(() => setShowTrust(true), 800);
    return () => clearTimeout(timer);
  }, []);

  useParallax(heroRef);

  // Fixed particle positions to prevent hydration mismatch
  const particles = [
    { id: 1, style: { width: '60px', height: '60px', top: '20%', left: '10%' } },
    { id: 2, style: { width: '80px', height: '40px', top: '60%', left: '80%' } },
    { id: 3, style: { width: '40px', height: '80px', top: '80%', left: '30%' } },
    { id: 4, style: { width: '70px', height: '50px', top: '30%', left: '70%' } },
    { id: 5, style: { width: '50px', height: '70px', top: '70%', left: '60%' } },
  ];

  const handleScrollClick = () => {
    const nextSection = document.getElementById('main-content');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCtaClick = () => {
    if (onPrimaryClick) onPrimaryClick();
  };

  return (
    <>
      <Head>
        <style>{`
          .gold-foil-text {
            background: linear-gradient(92deg, #fffbe6 0%, #fbc531 40%, #e1c699 60%, #fffbe6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-fill-color: transparent;
            filter: drop-shadow(0 2px 20px rgba(234, 179, 8, 0.3));
            position: relative;
          }
          .gold-foil-text .shine {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            pointer-events: none;
            background: linear-gradient(120deg, transparent 30%, #fffbe6 50%, transparent 70%);
            mix-blend-mode: screen;
            opacity: 0.7;
            transform: translateX(-100%);
            animation: shine-sweep 2.5s cubic-bezier(.4,0,.2,1) infinite;
          }
          @keyframes shine-sweep {
            0% { transform: translateX(-100%); }
            60% { transform: translateX(120%); }
            100% { transform: translateX(120%); }
          }
          .cta-shine {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            pointer-events: none;
            background: linear-gradient(100deg, transparent 40%, #fffbe6 50%, transparent 60%);
            opacity: 0.5;
            mix-blend-mode: screen;
            transform: translateX(-100%);
            animation: shine-sweep 2.5s cubic-bezier(.4,0,.2,1) infinite;
          }
          .sparkle {
            animation: sparkle 1.5s infinite alternate;
          }
          @keyframes sparkle {
            0% { filter: drop-shadow(0 0 0px #fffbe6); opacity: 1; }
            100% { filter: drop-shadow(0 0 12px #fffbe6); opacity: 0.7; }
          }
          .animate-gem-float { animation: gem-float 7s ease-in-out infinite alternate; }
          .animate-gem-float2 { animation: gem-float2 9s ease-in-out infinite alternate; }
          .animate-gem-float3 { animation: gem-float3 11s ease-in-out infinite alternate; }
          @keyframes gem-float { 0% { transform: translateY(0) scale(1); } 100% { transform: translateY(-30px) scale(1.08); } }
          @keyframes gem-float2 { 0% { transform: translateY(0) scale(1); } 100% { transform: translateY(20px) scale(0.95); } }
          @keyframes gem-float3 { 0% { transform: translateY(0) scale(1); } 100% { transform: translateY(-15px) scale(1.12); } }
          @keyframes gradient-x {
            0% { background-position: 0% 50%; }
            100% { background-position: 100% 50%; }
          }
          .animate-gradient-x {
            background-size: 200% 200%;
            animation: gradient-x 8s ease-in-out infinite alternate;
          }
          @keyframes bokeh0 {
            0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
            50% { transform: translateY(-20px) scale(1.1); opacity: 0.5; }
          }
          @keyframes bokeh1 {
            0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
            50% { transform: translateY(20px) scale(0.9); opacity: 0.4; }
          }
          @keyframes bokeh2 {
            0%, 100% { transform: translateX(0) scale(1); opacity: 0.3; }
            50% { transform: translateX(20px) scale(1.05); opacity: 0.5; }
          }
          .animate-bokeh0 { animation: bokeh0 8s ease-in-out infinite; }
          .animate-bokeh1 { animation: bokeh1 10s ease-in-out infinite; }
          .animate-bokeh2 { animation: bokeh2 12s ease-in-out infinite; }
        `}</style>
      </Head>
      <section
        ref={heroRef}
        className={`relative h-screen flex items-center justify-center overflow-hidden ${className}`}
        aria-label="Luxury Gemstone Collection"
      >
        {/* --- Animated Bokeh/Gradient Background --- */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1333] via-[#3a1c71] to-[#fbc531] animate-gradient-x" />
          {/* Bokeh circles */}
          <div className="absolute w-full h-full overflow-hidden pointer-events-none">
            {particles.map((particle, i) => (
              <div
                key={particle.id}
                className={`absolute rounded-full opacity-30 blur-2xl animate-bokeh${i % 3}`}
                style={{
                  ...particle.style,
                  background: `radial-gradient(circle, #fffbe6 0%, #fbc531 60%, transparent 100%)`,
                  animationDelay: `${i * 0.7}s`,
                }}
              />
            ))}
          </div>
        </div>
        {/* --- Luxury Gem Illustration (background) --- */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 opacity-30 blur-2xl pointer-events-none"
          style={{ width: '60vw', height: '60vw' }}
        >
          <svg
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            <polygon points="100,10 190,60 160,190 40,190 10,60" fill="#fffbe6" opacity="0.15" />
            <polygon points="100,30 170,70 150,170 50,170 30,70" fill="#fbc531" opacity="0.12" />
          </svg>
        </div>
        {/* --- Floating Gems (parallax) --- */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{ transform: `translate(calc(var(--parallax-x,0)),calc(var(--parallax-y,0)))` }}
        >
          <div className="absolute top-24 left-12">{gemSvgs[0]}</div>
          <div className="absolute bottom-32 right-24">{gemSvgs[1]}</div>
          <div className="absolute top-1/2 right-1/4">{gemSvgs[2]}</div>
        </div>
        {/* --- Luxury Gradient Overlay --- */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 via-purple-900/50 to-indigo-900/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/60" />
        {/* --- Main Content --- */}
        <div className="relative z-20 text-center text-white max-w-4xl mx-auto px-6 transition-all duration-1000 ease-out">
          {/* --- Heritage Badge --- */}
          <div
            className={`mb-8 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 shadow-lg sparkle">
              <svg
                className="w-4 h-4 mr-2 text-yellow-300 sparkle"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8 12.967 17.256a1 1 0 01-1.934 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732L9.854 7.2 11.033 2.744A1 1 0 0112 2z"
                  clipRule="evenodd"
                />
              </svg>
              Heritage Since 1890
            </span>
          </div>
          {/* --- Gold Foil Headline with Shine --- */}
          <h1
            className={`text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight transition-all duration-700 delay-300 gold-foil-text ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{
              background:
                'linear-gradient(92deg, #fffbe6 0%, #fbc531 40%, #e1c699 60%, #fffbe6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 20px rgba(234, 179, 8, 0.3)',
              position: 'relative',
            }}
          >
            {title}
            <span className="shine" />
          </h1>
          {/* --- Subtitle --- */}
          <p
            className={`text-lg md:text-xl lg:text-2xl mb-10 opacity-90 max-w-2xl mx-auto leading-relaxed transition-all duration-700 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            {subtitle}
          </p>
          {/* --- CTA Buttons with Shine --- */}
          <div
            className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-700 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <div
              onMouseEnter={() => setCtaHovered(true)}
              onMouseLeave={() => setCtaHovered(false)}
              className="inline-block relative"
            >
              <button
                onClick={handleCtaClick}
                className={`group relative overflow-hidden transition-all duration-300 bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 font-bold shadow-xl hover:shadow-2xl hover:scale-105 px-8 py-4 rounded-full text-lg focus:outline-none focus:ring-4 focus:ring-yellow-300/40 ${ctaHovered ? 'ring-4 ring-yellow-300/40' : ''}`}
              >
                <span className="relative z-10">{primaryCTA}</span>
                <div
                  className={`absolute inset-0 bg-gradient-to-r from-yellow-200/40 to-yellow-400/10 transition-opacity duration-300 ${ctaHovered ? 'opacity-100' : 'opacity-0'}`}
                />
                <span className="cta-shine" />
              </button>
            </div>
            <button
              onClick={onSecondaryClick}
              className="text-white border border-white/60 hover:bg-white/10 hover:text-yellow-300 transition-all duration-300 backdrop-blur-sm px-8 py-4 rounded-full text-lg"
            >
              {secondaryCTA}
            </button>
          </div>
          {/* --- Trust Indicators --- */}
          <div
            className={`mt-12 flex flex-wrap justify-center items-center gap-6 text-sm text-white/80 transition-all duration-700 delay-600 ${showTrust ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>GIA Certified</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Worldwide Shipping</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>30-Day Returns</span>
            </div>
          </div>
        </div>
        {/* --- Scroll Indicator --- */}
        <div
          className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 cursor-pointer group transition-all duration-700 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          onClick={handleScrollClick}
          tabIndex={0}
          aria-label="Scroll to explore"
          role="button"
        >
          <div className="flex flex-col items-center text-white/80">
            <span className="text-sm mb-2 group-hover:text-white transition-colors">
              Scroll to explore
            </span>
            <svg
              className="w-8 h-8 group-hover:text-yellow-300 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>
        {/* --- Social Proof (Subtle) --- */}
        <div
          className={`absolute top-8 right-8 z-20 transition-all duration-700 delay-800 ${showTrust ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <div className="bg-white/80 backdrop-blur-sm text-blue-900 font-medium px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm">12 people viewing</span>
          </div>
        </div>
        {/* --- Animated Scroll Down Gem --- */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
          <div className="w-10 h-10 animate-bounce">
            <svg
              className="w-full h-full text-yellow-300 drop-shadow-lg sparkle"
              fill="currentColor"
              viewBox="0 0 32 32"
            >
              <polygon points="16,2 30,12 24,30 8,30 2,12" />
            </svg>
          </div>
          <button
            onClick={handleScrollClick}
            aria-label="Scroll to main content"
            className="mt-2 text-yellow-200 hover:text-yellow-400 transition-colors"
          >
            <svg
              className="w-6 h-6 mx-auto animate-bounce"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
