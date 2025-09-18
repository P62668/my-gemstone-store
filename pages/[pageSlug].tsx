import React from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Layout from '../components/Layout';
import PageRenderer from '../components/PageRenderer';
import { prisma } from '../lib/prisma';

interface PageProps {
  page: {
    id: number;
    title: string;
    slug: string;
    content: any;
    seo: any;
    createdAt: string;
    updatedAt: string;
  } | null;
  error?: string;
}

const DynamicPage: React.FC<PageProps> = ({ page, error }) => {
  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Page Not Found</h1>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!page) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Page Not Found</h1>
            <p className="text-gray-600">The page you are looking for does not exist.</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Parse content if it's a string
  let content = page.content;
  if (typeof content === 'string') {
    try {
      content = JSON.parse(content);
    } catch (e) {
      content = [];
    }
  }

  // Parse SEO data if it's a string
  let seo: any = {};
  if (typeof page.seo === 'string') {
    try {
      seo = JSON.parse(page.seo);
    } catch (e) {
      seo = {};
    }
  } else {
    seo = page.seo || {};
  }

  // SEO defaults
  const seoTitle = seo.title || page.title;
  const seoDescription = seo.description || `Page: ${page.title}`;
  const seoKeywords = seo.keywords || '';
  const ogImage = seo.ogImage || '/images/placeholder-gemstone.jpg';
  const canonicalUrl = seo.canonical || `https://shankarmala.com/${page.slug}`;

  // Meta tags
  const metaTags = seo.metaTags || [];

  // Structured data
  const structuredData = seo.structuredData || {};

  return (
    <Layout>
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        {seoKeywords && <meta name="keywords" content={seoKeywords} />}
        
        {/* Open Graph */}
        <meta property="og:title" content={structuredData.ogTitle || seoTitle} />
        <meta property="og:description" content={structuredData.ogDescription || seoDescription} />
        <meta property="og:type" content={structuredData.ogType || 'website'} />
        <meta property="og:url" content={structuredData.ogUrl || canonicalUrl} />
        <meta property="og:image" content={structuredData.ogImage || ogImage} />
        
        {/* Twitter */}
        <meta name="twitter:card" content={structuredData.twitterCard || 'summary_large_image'} />
        <meta name="twitter:title" content={structuredData.twitterTitle || seoTitle} />
        <meta name="twitter:description" content={structuredData.twitterDescription || seoDescription} />
        <meta name="twitter:image" content={structuredData.twitterImage || ogImage} />
        
        {/* Canonical */}
        <link rel="canonical" href={structuredData.ogUrl || canonicalUrl} />
        
        {/* Custom meta tags */}
        {metaTags.map((tag: any) => (
          <meta key={tag.id} name={tag.name} content={tag.content} />
        ))}
        
        {/* Schema markup */}
        {structuredData.schemaMarkup ? (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData.schemaMarkup }} />
        ) : (
          <>
            {/* Default schema markup if none exists */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `
              {
                "@context": "https://schema.org",
                "@type": "WebPage",
                "name": "${seoTitle}",
                "description": "${seoDescription}",
                "url": "https://shankarmala.com/${page.slug}"
              }
            ` }} />
          </>
        )}
      </Head>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-amber-900 mb-4">{page.title}</h1>
        </header>

        <main>
          <PageRenderer content={content} />
        </main>
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { pageSlug } = context.params || {};

  // Don't override existing pages like admin, api, product, etc.
  const reservedPaths = ['admin', 'api', 'shop', 'product', 'cart', 'checkout', 'account'];
  if (typeof pageSlug === 'string' && reservedPaths.includes(pageSlug)) {
    return {
      notFound: true,
    };
  }

  try {
    if (typeof pageSlug !== 'string') {
      return {
        props: {
          page: null,
          error: 'Invalid page slug',
        },
      };
    }

    const page = await prisma.page.findFirst({
      where: {
        slug: pageSlug,
        status: 'published',
      },
    });

    if (!page) {
      return {
        props: {
          page: null,
          error: 'Page not found',
        },
      };
    }

    // Update view count
    await prisma.page.update({
      where: { id: page.id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    return {
      props: {
        page: {
          ...page,
          content: page.content instanceof Object ? page.content : JSON.parse(page.content as string),
          seo: page.seo instanceof Object 
            ? page.seo 
            : (page.seo ? JSON.parse(page.seo as string) : {}),
        },
      },
    };
  } catch (error) {
    console.error('Error fetching page:', error);
    return {
      props: {
        page: null,
        error: 'Failed to load page',
      },
    };
  }
};

export default DynamicPage;