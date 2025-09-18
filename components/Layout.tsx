import React from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import PersonalizedOffers from './ui/PersonalizedOffers';

// Dynamically import components that use client-side libraries
const Navbar = dynamic(() => import('./ui/Navbar'), { ssr: false });
const Footer = dynamic(() => import('./ui/Footer'), { ssr: false });

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogUrl?: string;
  canonical?: string;
  structuredData?: object;
  showPersonalizedOffers?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  description,
  keywords,
  ogImage,
  ogUrl,
  canonical,
  structuredData,
  showPersonalizedOffers = true,
}) => {
  // Default SEO settings - no API calls to prevent hydration issues
  const defaultTitle = 'Shankarmala - Luxury Gemstone Collection';
  const defaultDescription = 'Discover the finest gemstones from Shankarmala\'s heritage jewelry collection. GIA certified, worldwide shipping.';
  const defaultKeywords = 'gemstones, jewelry, luxury, GIA certified, diamonds, rubies, emeralds, sapphires';
  const defaultOgImage = '/images/placeholder-gemstone.jpg';
  const defaultOgUrl = 'https://shankarmala.com';
  const defaultCanonical = 'https://shankarmala.com';

  // Ensure title is always a string, never an array
  const finalTitle = typeof title === 'string' ? title : defaultTitle;
  const finalDescription = typeof description === 'string' ? description : defaultDescription;
  const finalKeywords = typeof keywords === 'string' ? keywords : defaultKeywords;
  const finalOgImage = typeof ogImage === 'string' ? ogImage : defaultOgImage;
  const finalOgUrl = typeof ogUrl === 'string' ? ogUrl : defaultOgUrl;
  const finalCanonical = typeof canonical === 'string' ? canonical : defaultCanonical;

  return (
    <>
      <Head>
        <title>{finalTitle}</title>
        <meta name="description" content={finalDescription} />
        <meta name="keywords" content={finalKeywords} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        
        {/* Favicon */}
        <link rel="icon" href="/images/logo-shankar.png" type="image/png" />
        <link rel="shortcut icon" href="/images/logo-shankar.png" type="image/png" />
        <link rel="apple-touch-icon" href="/images/logo-shankar.png" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Shankarmala" />
        <meta property="og:title" content={finalTitle} />
        <meta property="og:description" content={finalDescription} />
        <meta property="og:image" content={finalOgImage} />
        <meta property="og:url" content={finalOgUrl} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@shankarmala" />
        <meta name="twitter:title" content={finalTitle} />
        <meta name="twitter:description" content={finalDescription} />
        <meta name="twitter:image" content={finalOgImage} />
        
        {/* Theme */}
        <meta name="theme-color" content="#d4af37" />
        <meta name="msapplication-TileColor" content="#d4af37" />
        
        {/* Canonical */}
        {finalCanonical && <link rel="canonical" href={finalCanonical} />}
        
        {/* Structured Data */}
        {structuredData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(structuredData),
            }}
          />
        )}
        
        {/* Google Fonts for luxury typography */}
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-luxury-bg-cream via-luxury-bg-ivory to-luxury-bg-cream flex flex-col luxury-bg-gradient">
        <Navbar />
        <main className="pt-16 lg:pt-20 flex-1" id="main-content">
          {showPersonalizedOffers && <PersonalizedOffers />}
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Layout;