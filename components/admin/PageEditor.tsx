import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { X, Plus, GripVertical, Image as ImageIcon, Text, Video, Link, Settings, History, Eye } from 'lucide-react';
import SeoAudit from './SeoAudit';
import VersionHistory from './VersionHistory';
import PreviewModal from './PreviewModal';
import MetaTagsManager, { StructuredData } from './MetaTagsManager';

// Dynamically import the rich text editor to avoid SSR issues
const RichTextEditor = dynamic(() => import('./RichTextEditor'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>
});

interface ContentBlock {
  id: string;
  type: 'text' | 'image' | 'video' | 'button' | 'divider';
  content: any;
  settings?: {
    alignment?: 'left' | 'center' | 'right';
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
  };
}

interface MetaTag {
  id: string;
  name: string;
  content: string;
}

interface Version {
  id: number;
  version: number;
  createdAt: string;
  author: {
    firstName: string;
    lastName: string;
  };
}

interface PageEditorProps {
  initialContent: ContentBlock[];
  onChange: (content: ContentBlock[]) => void;
  initialSeo?: {
    title: string;
    description: string;
    keywords: string;
    ogImage?: string;
    canonical?: string;
    robots?: string;
    metaTags?: MetaTag[];
    structuredData?: StructuredData;
  };
  onSeoChange?: (seo: any) => void;
  pageTitle?: string;
  pageSlug?: string;
  versions?: Version[];
  currentPageVersion?: number;
  onViewVersion?: (version: number) => void;
  onRestoreVersion?: (version: number) => void;
}

const PageEditor: React.FC<PageEditorProps> = ({ 
  initialContent, 
  onChange,
  initialSeo = {
    title: '',
    description: '',
    keywords: '',
    ogImage: '',
    canonical: '',
    robots: '',
    metaTags: [],
  },
  onSeoChange,
  pageTitle = '',
  pageSlug = '',
  versions = [],
  currentPageVersion = 1,
  onViewVersion,
  onRestoreVersion
}) => {
  const [blocks, setBlocks] = useState<ContentBlock[]>(initialContent);
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);
  const [seo, setSeo] = useState({
    title: initialSeo.title,
    description: initialSeo.description,
    keywords: initialSeo.keywords,
    ogImage: initialSeo.ogImage || '',
    canonical: initialSeo.canonical || '',
    robots: initialSeo.robots || 'index, follow',
    metaTags: initialSeo.metaTags || [],
    structuredData: {
      ogTitle: initialSeo.title || '',
      ogDescription: initialSeo.description || '',
      ogImage: initialSeo.ogImage || '',
      ogUrl: initialSeo.canonical || '',
      ogType: initialSeo.structuredData?.ogType || 'website',
      twitterCard: initialSeo.structuredData?.twitterCard || 'summary_large_image',
      twitterTitle: initialSeo.title || '',
      twitterDescription: initialSeo.description || '',
      twitterImage: initialSeo.ogImage || '',
      schemaMarkup: initialSeo.structuredData?.schemaMarkup || JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": initialSeo.title || pageTitle || '',
        "description": initialSeo.description || '',
        "url": "https://shankarmala.com/" + (pageSlug || '')
      }, null, 2),
      robots: initialSeo.robots || '',
      canonical: initialSeo.canonical || ''
    }
  });
  const [showSeoSettings, setShowSeoSettings] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'seo'>('content');
  const dragCounter = useRef(0);

  useEffect(() => {
    setBlocks(initialContent);
  }, [initialContent]);

  useEffect(() => {
    setSeo({
      title: initialSeo.title,
      description: initialSeo.description,
      keywords: initialSeo.keywords,
      ogImage: initialSeo.ogImage || '',
      canonical: initialSeo.canonical || '',
      robots: initialSeo.robots || 'index, follow',
      metaTags: initialSeo.metaTags || [],
      structuredData: {
        ogTitle: initialSeo.title || '',
        ogDescription: initialSeo.description || '',
        ogImage: initialSeo.ogImage || '',
        ogUrl: initialSeo.canonical || '',
        ogType: initialSeo.structuredData?.ogType || 'website',
        twitterCard: initialSeo.structuredData?.twitterCard || 'summary_large_image',
        twitterTitle: initialSeo.title || '',
        twitterDescription: initialSeo.description || '',
        twitterImage: initialSeo.ogImage || '',
        schemaMarkup: initialSeo.structuredData?.schemaMarkup || JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": initialSeo.title || pageTitle || '',
          "description": initialSeo.description || '',
          "url": "https://shankarmala.com/" + (pageSlug || '')
        }, null, 2),
        robots: initialSeo.robots || '',
        canonical: initialSeo.canonical || ''
      }
    });
  }, [initialSeo, pageTitle, pageSlug]);

  const updateSeo = (field: string, value: string) => {
    const updatedSeo = { ...seo, [field]: value };
    
    // Update structured data when basic SEO fields change
    if (field === 'title') {
      updatedSeo.structuredData = {
        ...updatedSeo.structuredData,
        ogTitle: value,
        twitterTitle: value,
        schemaMarkup: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": value || pageTitle || '',
          "description": updatedSeo.description || '',
          "url": "https://shankarmala.com/" + (pageSlug || '')
        }, null, 2)
      };
    } else if (field === 'description') {
      updatedSeo.structuredData = {
        ...updatedSeo.structuredData,
        ogDescription: value,
        twitterDescription: value,
        schemaMarkup: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": updatedSeo.title || pageTitle || '',
          "description": value || '',
          "url": "https://shankarmala.com/" + (pageSlug || '')
        }, null, 2)
      };
    } else if (field === 'ogImage' || field === 'canonical' || field === 'robots') {
      // Update OG URL if canonical changes
      if (field === 'canonical') {
        updatedSeo.structuredData = {
          ...updatedSeo.structuredData,
          ogUrl: value
        };
      }
      
      // Update OG image if ogImage changes
      if (field === 'ogImage') {
        updatedSeo.structuredData = {
          ...updatedSeo.structuredData,
          ogImage: value,
          twitterImage: value
        };
      }
      
      // Update robots if robots changes
      if (field === 'robots') {
        // Update meta tags with robots value
        const updatedMetaTags = [...updatedSeo.metaTags];
        const robotsIndex = updatedMetaTags.findIndex(tag => tag.name === 'robots');
        
        if (robotsIndex > -1) {
          updatedMetaTags[robotsIndex] = {
            ...updatedMetaTags[robotsIndex],
            content: value
          };
        } else {
          updatedMetaTags.push({
            id: `tag-${Date.now()}-robots`,
            name: 'robots',
            content: value
          });
        }
        
        updatedSeo.metaTags = updatedMetaTags;
      }
    }
    
    setSeo(updatedSeo);
    if (onSeoChange) {
      onSeoChange(updatedSeo);
    }
  };

  const updateMetaTags = (metaTags: MetaTag[]) => {
    const updatedSeo = { ...seo, metaTags };
    setSeo(updatedSeo);
    if (onSeoChange) {
      onSeoChange(updatedSeo);
    }
  };

  const updateStructuredData = (structuredData: StructuredData) => {
    const updatedSeo = { 
      ...seo, 
      structuredData: {
        ogTitle: structuredData.ogTitle || '',
        ogDescription: structuredData.ogDescription || '',
        ogImage: structuredData.ogImage || '',
        ogUrl: structuredData.ogUrl || '',
        ogType: structuredData.ogType || 'website',
        twitterCard: structuredData.twitterCard || 'summary_large_image',
        twitterTitle: structuredData.twitterTitle || '',
        twitterDescription: structuredData.twitterDescription || '',
        twitterImage: structuredData.twitterImage || '',
        schemaMarkup: structuredData.schemaMarkup || '',
        robots: structuredData.robots || '',
        canonical: structuredData.canonical || ''
      }
    };
    setSeo(updatedSeo);
    if (onSeoChange) {
      onSeoChange(updatedSeo);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedBlock(id);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    setDraggedBlock(null);
    
    // Reorder blocks
    const draggedIndex = blocks.findIndex(block => block.id === draggedId);
    if (draggedIndex !== -1 && draggedIndex !== targetIndex) {
      const newBlocks = [...blocks];
      const [draggedBlock] = newBlocks.splice(draggedIndex, 1);
      newBlocks.splice(targetIndex, 0, draggedBlock);
      setBlocks(newBlocks);
      onChange(newBlocks);
    }
  };

  const handleDragLeave = (index: number) => {
    // Optional: handle drag leave logic
  };

  const removeBlock = (id: string) => {
    const newBlocks = blocks.filter(block => block.id !== id);
    setBlocks(newBlocks);
    onChange(newBlocks);
  };

  const renderBlock = (block: ContentBlock, index: number) => {
    switch (block.type) {
      case 'text':
        return (
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: block.content }} />
        );
      case 'image':
        return (
          <div className="relative h-64 rounded-lg overflow-hidden bg-gray-100">
            {block.content?.src ? (
              <Image 
                src={block.content.src} 
                alt={block.content.alt || 'Image'} 
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <ImageIcon className="h-12 w-12" />
                <span className="ml-2">No image selected</span>
              </div>
            )}
          </div>
        );
      default:
        return (
          <div className="text-gray-500 italic">
            Unsupported block type: {block.type}
          </div>
        );
    }
  };

  // Calculate content length for SEO audit
  const calculateContentLength = () => {
    return blocks.reduce((total, block) => {
      if (block.type === 'text') {
        // Strip HTML tags and count words
        const textContent = block.content.replace(/<[^>]*>/g, ' ');
        return total + textContent.split(/\s+/).filter(word => word.length > 0).length;
      }
      return total;
    }, 0);
  };

  return (
    <div className="border border-gray-200 rounded-lg">
      {/* SEO Settings Toggle */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex justify-between">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('content')}
              className={`px-4 py-2 rounded-lg ${activeTab === 'content' ? 'bg-amber-100 text-amber-800 font-medium' : 'text-gray-700 hover:text-gray-900'}`}
            >
              Content
            </button>
            <button
              onClick={() => setActiveTab('seo')}
              className={`px-4 py-2 rounded-lg ${activeTab === 'seo' ? 'bg-amber-100 text-amber-800 font-medium' : 'text-gray-700 hover:text-gray-900'}`}
            >
              SEO & Meta
            </button>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-2 text-amber-700 hover:text-amber-900 font-medium"
            >
              <Eye className="h-5 w-5" />
              Preview
            </button>
            
            <button
              onClick={() => setShowVersionHistory(!showVersionHistory)}
              className="flex items-center gap-2 text-amber-700 hover:text-amber-900 font-medium"
            >
              <History className="h-5 w-5" />
              {showVersionHistory ? 'Hide History' : 'Show History'}
            </button>
          </div>
        </div>
      </div>
      
      {activeTab === 'content' && (
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">Page Content</h3>
            <button
              onClick={() => setBlocks([...blocks, { 
                id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, 
                type: 'text', 
                content: '<p>Enter your text here...</p>',
                settings: {
                  alignment: 'left',
                  backgroundColor: '',
                  textColor: '',
                  padding: 'py-4'
                }
              }])}
              className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-amber-700 flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Text Block
            </button>
          </div>
          
          <div className="space-y-4">
            {blocks.map((block, index) => (
              <div 
                key={block.id} 
                className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
                draggable
                onDragStart={(e) => handleDragStart(e, block.id)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragLeave={() => handleDragLeave(index)}
                style={{ 
                  border: draggedBlock === block.id ? '2px dashed #f59e0b' : 'none',
                  backgroundColor: draggedBlock === block.id ? '#fff7ed' : 'white'
                }}
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-gray-500">{block.type}</span>
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    <button
                      onClick={() => removeBlock(block.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {renderBlock(block, index)}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {activeTab === 'seo' && (
        <div className="p-4 border-b border-gray-200 bg-white rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-6">SEO Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                <input
                  type="text"
                  value={seo.title}
                  onChange={(e) => updateSeo('title', e.target.value)}
                  placeholder="Page SEO title"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-amber-500 focus:border-amber-500"
                />
                <p className="text-xs text-gray-500 mt-1">{seo.title.length}/60 characters</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                <textarea
                  value={seo.description}
                  onChange={(e) => updateSeo('description', e.target.value)}
                  placeholder="Page SEO description"
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-amber-500 focus:border-amber-500"
                />
                <p className="text-xs text-gray-500 mt-1">{seo.description.length}/160 characters</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
                <input
                  type="text"
                  value={seo.keywords}
                  onChange={(e) => updateSeo('keywords', e.target.value)}
                  placeholder="keyword1, keyword2, keyword3"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-amber-500 focus:border-amber-500"
                />
                <p className="text-xs text-gray-500 mt-1">Comma-separated keywords</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">OG Image URL</label>
                <input
                  type="text"
                  value={seo.ogImage || ''}
                  onChange={(e) => updateSeo('ogImage', e.target.value)}
                  placeholder="https://example.com/og-image.jpg"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-amber-500 focus:border-amber-500"
                />
                <p className="text-xs text-gray-500 mt-1">Recommended size: 1200x630px</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Canonical URL</label>
                <input
                  type="text"
                  value={seo.canonical || ''}
                  onChange={(e) => updateSeo('canonical', e.target.value)}
                  placeholder="https://example.com/canonical-url"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-amber-500 focus:border-amber-500"
                />
                <p className="text-xs text-gray-500 mt-1">Use to specify the preferred version of a page when multiple URLs are available</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Robots Meta Tag</label>
                <select
                  value={seo.robots || 'index, follow'}
                  onChange={(e) => updateSeo('robots', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="index, follow">Index, Follow</option>
                  <option value="noindex, follow">Noindex, Follow</option>
                  <option value="index, nofollow">Index, Nofollow</option>
                  <option value="noindex, nofollow">Noindex, Nofollow</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Control search engine crawling and indexing</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <MetaTagsManager 
              initialMetaTags={seo.metaTags || []}
              onChange={updateMetaTags}
              initialStructuredData={seo.structuredData}
              onStructuredDataChange={updateStructuredData}
            />
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-800 mb-4">SEO Audit</h4>
            <SeoAudit
              title={seo.title}
              description={seo.description}
              keywords={seo.keywords}
              contentLength={calculateContentLength()}
              imageUrl={seo.ogImage}
              slug={pageSlug}
              robots={seo.robots}
              structuredData={seo.structuredData}
            />
          </div>
        </div>
      )}

      {showVersionHistory && versions && versions.length > 0 && (
        <div className="mt-4">
          <VersionHistory
            versions={versions}
            currentPageVersion={currentPageVersion}
            onViewVersion={onViewVersion || (() => {})}
            onRestoreVersion={onRestoreVersion || (() => {})}
          />
        </div>
      )}
    </div>
  );
};

export default PageEditor;