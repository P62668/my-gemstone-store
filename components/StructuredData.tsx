import React from 'react';

interface StructuredDataProps {
  type: 'website' | 'breadcrumb' | 'product' | 'organization' | 'article' | 'schema' | 'webpage';
  data: any;
}

const StructuredData: React.FC<StructuredDataProps> = ({ type, data }) => {
  if (!data) return null;

  let schema = {};

  switch (type) {
    case 'website':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: data.name,
        url: data.url,
        potentialAction: {
          '@type': 'SearchAction',
          'target': `${data.url}?s={search_term_string}`,
          'query-input': 'required name=search_term_string'
        }
      };
      break;

    case 'breadcrumb':
      if (Array.isArray(data.items) && data.items.length > 0) {
        schema = {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: data.items.map((item: { name: string; url: string }, index: number) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url
          }))
        };
      }
      break;

    case 'product':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: data.name,
        description: data.description,
        image: data.image,
        url: data.url,
        offers: {
          '@type': 'Offer',
          price: data.price,
          priceCurrency: data.priceCurrency || 'USD',
          availability: data.availability || 'https://schema.org/InStock',
          seller: {
            '@type': 'Organization',
            name: 'Shankarmala'
          }
        }
      };
      break;

    case 'organization':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: data.name,
        url: data.url,
        description: data.description,
        logo: data.logo,
        address: data.address,
        contactPoint: data.contactPoint
      };
      break;

    case 'article':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: data.headline,
        description: data.description,
        image: data.image,
        datePublished: data.datePublished,
        author: {
          '@type': 'Person',
          name: data.author
        }
      };
      break;

    case 'webpage':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: data.name,
        description: data.description,
        url: data.url,
        datePublished: data.datePublished,
        dateModified: data.dateModified,
        author: data.author ? {
          '@type': 'Person',
          name: data.author
        } : undefined,
        publisher: data.publisher ? {
          '@type': 'Organization',
          name: data.publisher.name,
          logo: {
            '@type': 'ImageObject',
            url: data.publisher.logo
          }
        } : undefined,
        image: data.image ? {
          '@type': 'ImageObject',
          url: data.image,
          width: data.imageWidth || 1200,
          height: data.imageHeight || 630
        } : undefined,
        isPartOf: data.isPartOf ? {
          '@type': 'WebSite',
          name: data.isPartOf.name,
          url: data.isPartOf.url
        } : undefined
      };
      // Remove undefined properties to keep the schema clean
      Object.keys(schema).forEach(key => {
        if (schema[key] === undefined) {
          delete schema[key];
        }
      });
      break;

    case 'schema':
      try {
        // Try to parse if it's a string
        if (typeof data === 'string') {
          schema = JSON.parse(data);
        } else {
          schema = data;
        }
      } catch (e) {
        try {
          // If it's not valid JSON, check if it's a string with schema data
          if (typeof data === 'string' && data.includes('@context')) {
            const schemaString = data.replace(/\n/g, '').replace(/\s+/g, ' ');
            // eslint-disable-next-line no-eval
            eval(`schema = ${schemaString}`);
          } else {
            schema = {};
          }
        } catch (parseError) {
          console.error('Error parsing schema data:', parseError);
          schema = {};
        }
      }
      break;

    default:
      return null;
  }

  if (Object.keys(schema).length === 0) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
  );
};

export default StructuredData;