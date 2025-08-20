import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface HeroData {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundImage?: string;
}

interface SectionData {
  key: string;
  title?: string;
  subtitle?: string;
  active?: boolean;
  order?: number;
  products?: any[];
}

interface HomePageProps {
  initialData?: {
    hero: HeroData | null;
    sections: SectionData[];
  };
}

const HomePage: React.FC<HomePageProps> = ({ initialData }) => {
  const [hero, setHero] = useState<HeroData | null>(initialData?.hero || null);
  const [sections, setSections] = useState<SectionData[]>(initialData?.sections || []);
  const [loading, setLoading] = useState(!initialData);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);

  useEffect(() => {
    // If we have initialData, extract featured products from it
    if (initialData) {
      const featuredSection = initialData.sections?.find((s: any) => s.key === 'featured_products');
      if (featuredSection?.products) {
        setFeaturedProducts(featuredSection.products);
      }
      return;
    }

    // Only fetch if we don't have initialData
    const fetchHomepage = async () => {
      setLoading(true);
      try {
        const homepageRes = await fetch('/api/public/homepage');

        if (!homepageRes.ok) throw new Error('Failed to fetch homepage');
        const homepageData = await homepageRes.json();
        
        console.log('Homepage data received:', homepageData);
        
        setHero(homepageData.hero || null);
        setSections(homepageData.sections || []);

        const featuredSection = homepageData.sections?.find((s: any) => s.key === 'featured_products');
        if (featuredSection?.products) {
          setFeaturedProducts(featuredSection.products);
        }
      } catch (error) {
        console.error('Error fetching homepage:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomepage();
  }, [initialData]);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewsletterStatus('success');
        toast.success('Welcome to the circle of luxury!');
        setNewsletterEmail('');
      } else {
        setNewsletterStatus('error');
        toast.error(data.error || 'Subscription failed.');
      }
    } catch {
      setNewsletterStatus('error');
      toast.error('An error occurred. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading luxury experience...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Simple Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            {hero?.title || "Timeless Elegance"}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            {hero?.subtitle || "Discover the finest gemstones from Shankarmala's heritage jewelry collection"}
          </p>
          <button className="px-8 py-4 bg-amber-500 text-white font-semibold rounded-2xl">
            {hero?.ctaText || "Explore Collection"}
          </button>
        </div>
      </section>

      {/* Featured Products */}
      {sections.find((s: any) => s.key === 'featured_products')?.products && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12">Featured Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sections.find((s: any) => s.key === 'featured_products')?.products?.map((product: any) => (
                <div key={product.id} className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                  <p className="text-gray-600 mb-4">{product.description}</p>
                  <p className="text-2xl font-bold text-amber-600">${product.price}</p>
                </div>
              ))}
                        </div>
                  </div>
                </section>
      )}
      </div>
  );
};

export default HomePage;
