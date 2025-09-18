import React, { useState, useEffect } from 'react';
import { X, Eye } from 'lucide-react';
import PageRenderer from '../PageRenderer';
import StructuredData from '../StructuredData';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: any;
  title: string;
  seo?: {
    title: string;
    description: string;
    keywords: string;
    ogImage: string;
    structuredData: any;
  };
}

const PreviewModal: React.FC<PreviewModalProps> = ({ 
  isOpen, 
  onClose, 
  content,
  title,
  seo = {
    title: '',
    description: '',
    ogImage: '',
    structuredData: {}
  }
}) => {
  const [seoData, setSeoData] = useState(seo);
  const [structuredData, setStructuredData] = useState(seo.structuredData || {
    ogTitle: seo.title,
    ogDescription: seo.description,
    ogImage: seo.ogImage,
    ogUrl: '',
    ogType: 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: seo.title,
    twitterDescription: seo.description,
    twitterImage: seo.ogImage,
    schemaMarkup: `{
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "${seo.title}",
      "description": "${seo.description}",
      "url": "https://shankarmala.com"
    }`
  });

  useEffect(() => {
    if (isOpen) {
      // Update structured data when preview opens
      setStructuredData(seo.structuredData || {
        ogTitle: seo.title,
        ogDescription: seo.description,
        ogImage: seo.ogImage,
        ogUrl: '',
        ogType: 'website',
        twitterCard: 'summary_large_image',
        twitterTitle: seo.title,
        twitterDescription: seo.description,
        twitterImage: seo.ogImage,
        schemaMarkup: `{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "${seo.title}",
          "description": "${seo.description}",
          "url": "https://shankarmala.com"
        }`
      });
    }
  }, [isOpen, seo]);

  const updateStructuredData = (newStructuredData: any) => {
    setStructuredData(newStructuredData);
    // Update SEO data with structured data
    setSeoData({
      ...seoData,
      structuredData: newStructuredData
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-amber-900">Page Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-8">
          <div className="mb-6">
            <h3 className="font-bold text-gray-800 mb-3">SEO Preview</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-blue-600 mb-1">{structuredData.ogUrl || 'https://shankarmala.com'}</div>
              <div className="text-green-600 font-bold mb-2">{structuredData.ogTitle || title || 'Page Title'}</div>
              <div className="text-gray-700 mb-3">{structuredData.ogDescription || seo.description || 'Page description'}</div>
              {structuredData.ogImage && (
                <div className="mt-3">
                  <img 
                    src={structuredData.ogImage} 
                    alt="Preview" 
                    className="max-w-full h-auto rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-bold text-gray-800 mb-3">Structured Data Preview</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start gap-3 mb-4">
                <div className="text-sm">
                  <div className="text-gray-500">Open Graph</div>
                  <div className="font-medium">{structuredData.ogType || 'website'}</div>
                </div>
                <div className="text-sm">
                  <div className="text-gray-500">Title</div>
                  <div>{structuredData.ogTitle || 'N/A'}</div>
                </div>
                <div className="text-sm">
                  <div className="text-gray-500">Description</div>
                  <div>{structuredData.ogDescription || 'N/A'}</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 mb-4">
                <div className="text-sm">
                  <div className="text-gray-500">Twitter Card</div>
                  <div>{structuredData.twitterCard || 'summary_large_image'}</div>
                </div>
                <div className="text-sm">
                  <div className="text-gray-500">Image</div>
                  <div>{structuredData.twitterImage ? 'Yes' : 'No'}</div>
                </div>
              </div>
              
              <div>
                <div className="text-gray-500 text-sm mb-2">Schema Markup</div>
                <div className="bg-white p-3 rounded-lg border border-gray-200 font-mono text-sm">
                  {structuredData.schemaMarkup ? (
                    <pre className="overflow-x-auto">
                      {structuredData.schemaMarkup}
                    </pre>
                  ) : (
                    <div className="text-gray-500">No schema markup defined</div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-bold text-gray-800 mb-3">Page Preview</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                <div className="text-sm text-gray-600">https://shankarmala.com/page</div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500">Live Preview</span>
                </div>
              </div>
              <div className="p-6">
                <PageRenderer content={content} />
                <StructuredData type="website" data={JSON.parse(structuredData.schemaMarkup)} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;