import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from './ui/Navbar';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title = 'Shankarmala - Luxury Gemstone Collection',
  description = "Discover the finest gemstones from Kolkata's heritage jewelry district. GIA certified, worldwide shipping.",
}) => {
  const [currentYear, setCurrentYear] = useState('');
  const [seo, setSeo] = useState<{ title: string; description: string } | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear().toString());
    const fetchSeo = async () => {
      try {
        const res = await fetch('/api/public/seo');
        if (!res.ok) throw new Error('Failed to fetch SEO');
        const data = await res.json();
        setSeo({
          title: data.global.siteTitle || title,
          description: data.global.siteDescription || description,
        });
      } catch {
        setSeo(null);
      }
    };
    fetchSeo();
  }, [title, description]);

  return (
    <>
      <Head>
        <title>{seo?.title || title}</title>
        <meta name="description" content={seo?.description || description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main className="pt-16 lg:pt-20">{children}</main>

        <footer className="bg-gray-900 text-white py-8">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center">
              <p className="text-gray-400">© {currentYear} Kolkata Gems. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Layout;
