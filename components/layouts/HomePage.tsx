import React, { useEffect, useState } from 'react';
// Types for homepage data
interface HeroData {
  title?: string;
  subtitle?: string;
  primaryCTA?: string;
  secondaryCTA?: string;
  primaryCTALink?: string;
  secondaryCTALink?: string;
  backgroundImage?: string;
}

interface SectionData {
  key: string;
  title?: string;
  subtitle?: string;
}
import Head from 'next/head';
import HeroSection from '../ui/HeroSection';
import Navbar from '../ui/Navbar';
import FeaturedCarousel from '../FeaturedCarousel';
import TestimonialSlider from '../TestimonialSlider';
import CategoriesGrid from '../CategoriesGrid';
import PressAwardsSection from '../PressAwardsSection';
import FAQSection from '../FAQSection';
import FinalCTASection from '../FinalCTASection';
import { useRouter } from 'next/router';

const HomePage: React.FC = () => {
  // ...existing code...
  const router = useRouter();
  const [hero, setHero] = useState<HeroData | null>(null);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [newsletterMessage, setNewsletterMessage] = useState('');

  useEffect(() => {
    const fetchHomepage = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/public/homepage?t=${Date.now()}`);
        if (!res.ok) throw new Error('Failed to fetch homepage');
        const data = await res.json();
        setHero(data.hero || null);
        setSections(data.sections || []);
      } catch {
        setError('Unable to load homepage. Please try again later.');
        setHero(null);
        setSections([]);
      }
      setLoading(false);
    };
    fetchHomepage();
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterStatus('loading');
    setNewsletterMessage('');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewsletterStatus('success');
        setNewsletterMessage('Thank you for subscribing!');
        setNewsletterEmail('');
      } else {
        setNewsletterStatus('error');
        setNewsletterMessage(data.error || 'Subscription failed.');
      }
    } catch {
      setNewsletterStatus('error');
      setNewsletterMessage('An error occurred. Please try again.');
    }
  };

  return (
    <>
      <Head>
        <title>
          {Array.isArray(hero?.title)
            ? hero.title[0]
            : hero?.title || 'Luxury Gemstone Store | Shankarmala'}
        </title>
        <meta
          name="description"
          content={
            hero?.subtitle ||
            'Discover the finest gemstones from Shankarmala heritage jewelry collection.'
          }
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          property="og:title"
          content={
            Array.isArray(hero?.title)
              ? hero.title[0]
              : hero?.title || 'Luxury Gemstone Store | Shankarmala'
          }
        />
        <meta
          property="og:description"
          content={
            hero?.subtitle ||
            'Discover the finest gemstones from Shankarmala heritage jewelry collection.'
          }
        />
        <meta property="og:image" content={hero?.backgroundImage || '/images/banner1.jpg'} />
        <meta property="og:type" content="website" />
      </Head>
      <div className="min-h-screen bg-white" aria-label="Homepage">
        <Navbar />
        {loading ? (
          <div
            className="flex flex-col items-center justify-center h-[60vh] px-4"
            role="status"
            aria-live="polite"
          >
            <div className="animate-pulse w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-gray-200 to-gray-400 rounded-full mb-6" />
            <p className="text-base sm:text-lg text-gray-500 text-center">
              Loading luxury experience...
            </p>
          </div>
        ) : error ? (
          <div
            className="flex flex-col items-center justify-center h-[60vh] px-4"
            role="alert"
            aria-live="assertive"
          >
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-red-200 to-red-400 rounded-full mb-6 flex items-center justify-center">
              <span className="text-3xl sm:text-4xl text-red-700">&#9888;</span>
            </div>
            <p className="text-base sm:text-lg text-red-700 font-semibold text-center">{error}</p>
          </div>
        ) : (
          <>
            <HeroSection
              title={hero?.title || 'Timeless Elegance'}
              subtitle={
                hero?.subtitle ||
                "Discover the finest gemstones from Shankarmala's heritage jewelry collection"
              }
              primaryCTA={hero?.primaryCTA || 'Explore Collection'}
              secondaryCTA={hero?.secondaryCTA || 'Learn Our Story'}
              onPrimaryClick={() => router.push(hero?.primaryCTALink || '/shop')}
              onSecondaryClick={() => router.push(hero?.secondaryCTALink || '/about')}
              backgroundImage={hero?.backgroundImage || '/images/banner1.jpg'}
            />
            <CategoriesGrid
              title={sections.find((s) => s.key === 'categories')?.title || 'Shop by Category'}
              subtitle={
                sections.find((s) => s.key === 'categories')?.subtitle ||
                'Browse our curated gemstone categories.'
              }
            />
            <FeaturedCarousel
              title={sections.find((s) => s.key === 'featured')?.title || 'Featured Gemstones'}
              subtitle={
                sections.find((s) => s.key === 'featured')?.subtitle || 'Our most coveted pieces.'
              }
            />
            <TestimonialSlider
              title={sections.find((s) => s.key === 'testimonials')?.title || 'Testimonials'}
              subtitle={
                sections.find((s) => s.key === 'testimonials')?.subtitle ||
                'Hear from our delighted customers.'
              }
            />
            <section
              className="py-20 bg-gradient-to-r from-emerald-900 via-teal-800 to-cyan-900 border-t-2 border-emerald-200/20 shadow-lg"
              aria-label="Newsletter signup"
            >
              <div className="max-w-4xl mx-auto px-4 text-center">
                <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'serif' }}>
                  {sections.find((s) => s.key === 'newsletter')?.title ||
                    'Stay in the Circle of Luxury'}
                </h2>
                <p
                  className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto"
                  style={{ fontFamily: 'serif' }}
                >
                  {sections.find((s) => s.key === 'newsletter')?.subtitle ||
                    "Get exclusive access to new collections, gemstone insights, and heritage stories. Join our connoisseur's list."}
                </p>
                <form
                  className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
                  aria-label="Newsletter signup form"
                  onSubmit={handleNewsletterSubmit}
                >
                  <input
                    type="email"
                    placeholder="Enter your email"
                    aria-label="Email address"
                    className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-emerald-900 text-base sm:text-lg bg-white/90 placeholder-emerald-400 transition-all duration-200"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    disabled={newsletterStatus === 'loading'}
                  />
                  <button
                    type="submit"
                    className="px-6 sm:px-8 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-base sm:text-lg shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-300/40"
                    aria-label="Subscribe to newsletter"
                    disabled={newsletterStatus === 'loading'}
                  >
                    {newsletterStatus === 'loading' ? 'Subscribing...' : 'Subscribe'}
                  </button>
                </form>
                {newsletterMessage && (
                  <p
                    className={`text-xs sm:text-sm mt-4 ${newsletterStatus === 'success' ? 'text-emerald-200' : 'text-red-200'}`}
                    style={{ fontFamily: 'serif' }}
                    role={newsletterStatus === 'success' ? 'status' : 'alert'}
                    aria-live={newsletterStatus === 'success' ? 'polite' : 'assertive'}
                  >
                    {newsletterMessage}
                  </p>
                )}
              </div>
            </section>
            <PressAwardsSection
              title={sections.find((s) => s.key === 'press')?.title || 'Press & Awards'}
            />
            <FAQSection
              title={sections.find((s) => s.key === 'faq')?.title || 'Frequently Asked Questions'}
            />
            <FinalCTASection
              title={sections.find((s) => s.key === 'cta')?.title || 'Ready to Begin Your Journey?'}
              subtitle={
                sections.find((s) => s.key === 'cta')?.subtitle ||
                'Contact us for bespoke requests.'
              }
            />
          </>
        )}
      </div>
    </>
  );
};

export default HomePage;
