import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface MetaTag {
  id: string;
  name: string;
  content: string;
}

export interface StructuredData {
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogUrl: string;
  ogType: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  schemaMarkup: string;
  robots?: string;
  canonical?: string;
}

interface MetaTagsManagerProps {
  initialMetaTags: MetaTag[];
  onChange: (metaTags: MetaTag[]) => void;
  initialStructuredData?: StructuredData;
  onStructuredDataChange?: (structuredData: StructuredData) => void;
}

const MetaTagsManager: React.FC<MetaTagsManagerProps> = ({ 
  initialMetaTags = [],
  onChange,
  initialStructuredData = {
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    ogUrl: '',
    ogType: 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: '',
    twitterDescription: '',
    twitterImage: '',
    schemaMarkup: `{
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "",
      "description": "",
      "url": ""
    }`,
    robots: '',
    canonical: ''
  },
  onStructuredDataChange
}) => {
  const [metaTags, setMetaTags] = useState<MetaTag[]>(initialMetaTags);
  const [newTag, setNewTag] = useState({ name: '', content: '' });
  const [activeTab, setActiveTab] = useState<'basic' | 'structured'>('basic');
  const [structuredData, setStructuredData] = useState<StructuredData>(initialStructuredData);
  const [showStructuredDataHelp, setShowStructuredDataHelp] = useState(false);

  useEffect(() => {
    setMetaTags(initialMetaTags);
    updateSeoData(initialMetaTags);
  }, [initialMetaTags]);

  useEffect(() => {
    setStructuredData(initialStructuredData);
  }, [initialStructuredData]);

  const updateSeoData = (updatedMetaTags: MetaTag[]) => {
    // Extract basic meta tags
    const basicTags = updatedMetaTags.filter(tag => 
      !tag.name.startsWith('og:') && 
      !tag.name.startsWith('twitter:') && 
      tag.name !== 'schema'
    );
    
    // Extract structured data
    const structured: StructuredData = {
      ogTitle: updatedMetaTags.find(tag => tag.name === 'og:title')?.content || '',
      ogDescription: updatedMetaTags.find(tag => tag.name === 'og:description')?.content || '',
      ogImage: updatedMetaTags.find(tag => tag.name === 'og:image')?.content || '',
      ogUrl: updatedMetaTags.find(tag => tag.name === 'og:url')?.content || '',
      ogType: updatedMetaTags.find(tag => tag.name === 'og:type')?.content || 'website',
      twitterCard: updatedMetaTags.find(tag => tag.name === 'twitter:card')?.content || 'summary_large_image',
      twitterTitle: updatedMetaTags.find(tag => tag.name === 'twitter:title')?.content || '',
      twitterDescription: updatedMetaTags.find(tag => tag.name === 'twitter:description')?.content || '',
      twitterImage: updatedMetaTags.find(tag => tag.name === 'twitter:image')?.content || '',
      schemaMarkup: updatedMetaTags.find(tag => tag.name === 'schema')?.content || `{
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "",
        "description": "",
        "url": ""
      }`,
      robots: updatedMetaTags.find(tag => tag.name === 'robots')?.content || '',
      canonical: updatedMetaTags.find(tag => tag.name === 'canonical')?.content || ''
    };
    
    setStructuredData(structured);
    
    if (onStructuredDataChange) {
      onStructuredDataChange(structured);
    }
  };

  useEffect(() => {
    updateSeoData(metaTags);
  }, [metaTags]);

  const addMetaTag = () => {
    if (newTag.name && newTag.content) {
      const tag: MetaTag = {
        id: `tag-${Date.now()}`,
        name: newTag.name,
        content: newTag.content,
      };
      
      const updatedTags = [...metaTags, tag];
      setMetaTags(updatedTags);
      onChange(updatedTags);
      
      setNewTag({ name: '', content: '' });
    }
  };

  const updateMetaTag = (id: string, field: keyof MetaTag, value: string) => {
    const updatedTags = metaTags.map(tag => 
      tag.id === id ? { ...tag, [field]: value } : tag
    );
    setMetaTags(updatedTags);
    onChange(updatedTags);
  };

  const removeMetaTag = (id: string) => {
    const updatedTags = metaTags.filter(tag => tag.id !== id);
    setMetaTags(updatedTags);
    onChange(updatedTags);
  };

  const handleStructuredDataChange = (field: keyof StructuredData, value: string) => {
    const updatedStructuredData = { ...structuredData, [field]: value };
    setStructuredData(updatedStructuredData);
    
    // Update meta tags with structured data
    const updatedTags = [...metaTags];
    
    // Update or add OG tags
    const ogFields: Record<string, keyof StructuredData> = {
      'og:title': 'ogTitle',
      'og:description': 'ogDescription',
      'og:image': 'ogImage',
      'og:url': 'ogUrl',
      'og:type': 'ogType'
    };
    
    Object.entries(ogFields).forEach(([tagName, fieldKey]) => {
      const index = updatedTags.findIndex(tag => tag.name === tagName);
      const fieldValue = updatedStructuredData[fieldKey];
      if (fieldValue) {
        if (index > -1) {
          updatedTags[index] = { ...updatedTags[index], content: fieldValue };
        } else {
          updatedTags.push({
            id: `tag-${Date.now()}-${Math.random()}`,
            name: tagName,
            content: fieldValue
          });
        }
      } else if (index > -1) {
        updatedTags.splice(index, 1);
      }
    });
    
    // Update or add Twitter tags
    const twitterFields: Record<string, keyof StructuredData> = {
      'twitter:card': 'twitterCard',
      'twitter:title': 'twitterTitle',
      'twitter:description': 'twitterDescription',
      'twitter:image': 'twitterImage'
    };
    
    Object.entries(twitterFields).forEach(([tagName, fieldKey]) => {
      const index = updatedTags.findIndex(tag => tag.name === tagName);
      const fieldValue = updatedStructuredData[fieldKey];
      if (fieldValue) {
        if (index > -1) {
          updatedTags[index] = { ...updatedTags[index], content: fieldValue };
        } else {
          updatedTags.push({
            id: `tag-${Date.now()}-${Math.random()}`,
            name: tagName,
            content: fieldValue
          });
        }
      } else if (index > -1) {
        updatedTags.splice(index, 1);
      }
    });
    
    // Update or add schema markup
    const schemaIndex = updatedTags.findIndex(tag => tag.name === 'schema');
    if (updatedStructuredData.schemaMarkup) {
      try {
        // Validate JSON
        JSON.parse(updatedStructuredData.schemaMarkup);
        
        if (schemaIndex > -1) {
          updatedTags[schemaIndex] = { 
            ...updatedTags[schemaIndex], 
            content: updatedStructuredData.schemaMarkup 
          };
        } else {
          updatedTags.push({
            id: `tag-${Date.now()}-${Math.random()}`,
            name: 'schema',
            content: updatedStructuredData.schemaMarkup
          });
        }
      } catch (e) {
        console.error('Invalid schema markup:', e);
      }
    } else if (schemaIndex > -1) {
      updatedTags.splice(schemaIndex, 1);
    }
    
    // Update or add basic meta tags
    // Update robots tag
    const robotsIndex = updatedTags.findIndex(tag => tag.name === 'robots');
    if (updatedStructuredData.robots) {
      if (robotsIndex > -1) {
        updatedTags[robotsIndex] = { 
          ...updatedTags[robotsIndex], 
          content: updatedStructuredData.robots 
        };
      } else {
        updatedTags.push({
          id: `tag-${Date.now()}-${Math.random()}`,
          name: 'robots',
          content: updatedStructuredData.robots
        });
      }
    } else if (robotsIndex > -1) {
      updatedTags.splice(robotsIndex, 1);
    }
    
    // Update canonical tag
    const canonicalIndex = updatedTags.findIndex(tag => tag.name === 'canonical');
    if (updatedStructuredData.canonical) {
      if (canonicalIndex > -1) {
        updatedTags[canonicalIndex] = { 
          ...updatedTags[canonicalIndex], 
          content: updatedStructuredData.canonical 
        };
      } else {
        updatedTags.push({
          id: `tag-${Date.now()}-${Math.random()}`,
          name: 'canonical',
          content: updatedStructuredData.canonical
        });
      }
    } else if (canonicalIndex > -1) {
      updatedTags.splice(canonicalIndex, 1);
    }
    
    setMetaTags(updatedTags);
    onChange(updatedTags);
    
    if (onStructuredDataChange) {
      onStructuredDataChange(updatedStructuredData);
    }
  };

  // Add new structured data tags
  const addStructuredDataTags = () => {
    // Add basic OG tags if they don't exist
    if (!metaTags.some(tag => tag.name === 'og:title')) {
      const newTag: MetaTag = {
        id: `tag-${Date.now()}-og-title`,
        name: 'og:title',
        content: structuredData.ogTitle || ''
      };
      setMetaTags([...metaTags, newTag]);
      onChange([...metaTags, newTag]);
    }

    if (!metaTags.some(tag => tag.name === 'og:description')) {
      const newTag: MetaTag = {
        id: `tag-${Date.now()}-og-desc`,
        name: 'og:description',
        content: structuredData.ogDescription || ''
      };
      setMetaTags([...metaTags, newTag]);
      onChange([...metaTags, newTag]);
    }

    if (!metaTags.some(tag => tag.name === 'og:image')) {
      const newTag: MetaTag = {
        id: `tag-${Date.now()}-og-image`,
        name: 'og:image',
        content: structuredData.ogImage || ''
      };
      setMetaTags([...metaTags, newTag]);
      onChange([...metaTags, newTag]);
    }

    if (!metaTags.some(tag => tag.name === 'og:url')) {
      const newTag: MetaTag = {
        id: `tag-${Date.now()}-og-url`,
        name: 'og:url',
        content: structuredData.ogUrl || ''
      };
      setMetaTags([...metaTags, newTag]);
      onChange([...metaTags, newTag]);
    }

    if (!metaTags.some(tag => tag.name === 'og:type')) {
      const newTag: MetaTag = {
        id: `tag-${Date.now()}-og-type`,
        name: 'og:type',
        content: structuredData.ogType || 'website'
      };
      setMetaTags([...metaTags, newTag]);
      onChange([...metaTags, newTag]);
    }

    // Add Twitter tags if they don't exist
    if (!metaTags.some(tag => tag.name === 'twitter:card')) {
      const newTag: MetaTag = {
        id: `tag-${Date.now()}-twitter-card`,
        name: 'twitter:card',
        content: structuredData.twitterCard || 'summary_large_image'
      };
      setMetaTags([...metaTags, newTag]);
      onChange([...metaTags, newTag]);
    }

    if (!metaTags.some(tag => tag.name === 'twitter:title')) {
      const newTag: MetaTag = {
        id: `tag-${Date.now()}-twitter-title`,
        name: 'twitter:title',
        content: structuredData.twitterTitle || ''
      };
      setMetaTags([...metaTags, newTag]);
      onChange([...metaTags, newTag]);
    }

    if (!metaTags.some(tag => tag.name === 'twitter:description')) {
      const newTag: MetaTag = {
        id: `tag-${Date.now()}-twitter-desc`,
        name: 'twitter:description',
        content: structuredData.twitterDescription || ''
      };
      setMetaTags([...metaTags, newTag]);
      onChange([...metaTags, newTag]);
    }

    if (!metaTags.some(tag => tag.name === 'twitter:image')) {
      const newTag: MetaTag = {
        id: `tag-${Date.now()}-twitter-image`,
        name: 'twitter:image',
        content: structuredData.twitterImage || ''
      };
      setMetaTags([...metaTags, newTag]);
      onChange([...metaTags, newTag]);
    }

    // Add schema markup if it doesn't exist
    if (!metaTags.some(tag => tag.name === 'schema')) {
      const newTag: MetaTag = {
        id: `tag-${Date.now()}-schema`,
        name: 'schema',
        content: structuredData.schemaMarkup || `{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "",
          "description": "",
          "url": ""
        }`
      };
      setMetaTags([...metaTags, newTag]);
      onChange([...metaTags, newTag]);
    }
  };

  // Remove structured data tags
  const removeStructuredDataTags = () => {
    const updatedTags = metaTags.filter(tag => 
      !['og:title', 'og:description', 'og:image', 'og:url', 'og:type', 
       'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image', 
       'schema'].includes(tag.name)
    );
    
    setMetaTags(updatedTags);
    onChange(updatedTags);
  };

  return (
    <div className="space-y-6">
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('basic')}
          className={`px-4 py-2 font-medium text-sm ${activeTab === 'basic' 
            ? 'text-amber-700 border-b-2 border-amber-700' 
            : 'text-gray-500 hover:text-gray-700'}`}
        >
          Custom Meta Tags
        </button>
        <button
          onClick={() => setActiveTab('structured')}
          className={`px-4 py-2 font-medium text-sm ${activeTab === 'structured' 
            ? 'text-amber-700 border-b-2 border-amber-700' 
            : 'text-gray-500 hover:text-gray-700'}`}
        >
          Structured Data
        </button>
      </div>
      
      {activeTab === 'basic' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag.name}
              onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
              placeholder="Tag name (e.g., robots)"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-amber-500 focus:border-amber-500"
            />
            <input
              type="text"
              value={newTag.content}
              onChange={(e) => setNewTag({ ...newTag, content: e.target.value })}
              placeholder="Content (e.g., noindex, nofollow)"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-amber-500 focus:border-amber-500"
            />
            <button
              onClick={addMetaTag}
              disabled={!newTag.name || !newTag.content}
              className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-amber-700 disabled:bg-gray-300"
            >
              Add
            </button>
          </div>
          
          <div className="space-y-2">
            {metaTags.map((tag) => (
              !['og:title', 'og:description', 'og:image', 'og:url', 'og:type', 
                'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image', 
                'schema'].includes(tag.name) && (
              <div key={tag.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <input
                  type="text"
                  value={tag.name}
                  onChange={(e) => updateMetaTag(tag.id, 'name', e.target.value)}
                  className="w-1/3 rounded border border-gray-300 px-2 py-1 text-sm"
                />
                <input
                  type="text"
                  value={tag.content}
                  onChange={(e) => updateMetaTag(tag.id, 'content', e.target.value)}
                  className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm"
                />
                <button
                  onClick={() => removeMetaTag(tag.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              )
            ))}
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
            <h4 className="font-medium mb-2">Common Meta Tags</h4>
            <ul className="space-y-1">
              <li><strong>robots:</strong> control search engine indexing (e.g., noindex, nofollow)</li>
              <li><strong>viewport:</strong> for responsive design (e.g., width=device-width, initial-scale=1)</li>
              <li><strong>author:</strong> specify the page author</li>
              <li><strong>copyright:</strong> specify copyright information</li>
            </ul>
          </div>
        </div>
      )}
      
      {activeTab === 'structured' && (
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-gray-800">Open Graph Tags</h3>
              <button
                onClick={addStructuredDataTags}
                className="text-sm text-amber-700 hover:text-amber-900"
              >
                Add Missing OG Tags
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={structuredData.ogTitle}
                  onChange={(e) => handleStructuredDataChange('ogTitle', e.target.value)}
                  placeholder="Page title for social sharing"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={structuredData.ogDescription}
                  onChange={(e) => handleStructuredDataChange('ogDescription', e.target.value)}
                  placeholder="Page description for social sharing"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="text"
                  value={structuredData.ogImage}
                  onChange={(e) => handleStructuredDataChange('ogImage', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-amber-500 focus:border-amber-500"
                />
                <p className="text-xs text-gray-500 mt-1">Recommended size: 1200x630px</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <input
                  type="text"
                  value={structuredData.ogUrl}
                  onChange={(e) => handleStructuredDataChange('ogUrl', e.target.value)}
                  placeholder="https://example.com/page-url"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={structuredData.ogType}
                  onChange={(e) => handleStructuredDataChange('ogType', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="website">Website</option>
                  <option value="article">Article</option>
                  <option value="product">Product</option>
                  <option value="profile">Profile</option>
                </select>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-800 mb-4">Twitter Card</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Type</label>
                <select
                  value={structuredData.twitterCard}
                  onChange={(e) => handleStructuredDataChange('twitterCard', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="summary">Summary</option>
                  <option value="summary_large_image">Summary with Large Image</option>
                  <option value="app">App Card</option>
                  <option value="player">Player Card</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={structuredData.twitterTitle}
                  onChange={(e) => handleStructuredDataChange('twitterTitle', e.target.value)}
                  placeholder="Page title for Twitter"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={structuredData.twitterDescription}
                  onChange={(e) => handleStructuredDataChange('twitterDescription', e.target.value)}
                  placeholder="Page description for Twitter"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="text"
                  value={structuredData.twitterImage}
                  onChange={(e) => handleStructuredDataChange('twitterImage', e.target.value)}
                  placeholder="https://example.com/twitter-image.jpg"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-amber-500 focus:border-amber-500"
                />
                <p className="text-xs text-gray-500 mt-1">Recommended size: 1200x600px</p>
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-gray-800">Schema Markup (JSON-LD)</h3>
              <button
                onClick={() => setShowStructuredDataHelp(!showStructuredDataHelp)}
                className="text-sm text-amber-700 hover:text-amber-900"
              >
                {showStructuredDataHelp ? 'Hide Help' : 'Show Help'}
              </button>
            </div>
            
            <textarea
              value={structuredData.schemaMarkup}
              onChange={(e) => handleStructuredDataChange('schemaMarkup', e.target.value)}
              rows={8}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-amber-500 focus:border-amber-500 font-mono"
            />
            
            {showStructuredDataHelp && (
              <div className="mt-4 bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
                <h4 className="font-medium mb-2">Schema Markup Examples</h4>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium">WebPage</p>
                    <pre className="bg-white p-2 rounded overflow-x-auto text-xs">
{`{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Page Title",
  "description": "Page description",
  "url": "https://example.com/page-url"
}`}
                    </pre>
                  </div>
                  
                  <div>
                    <p className="font-medium">Product</p>
                    <pre className="bg-white p-2 rounded overflow-x-auto text-xs">
{`{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Product Name",
  "description": "Product description",
  "image": "https://example.com/product-image.jpg",
  "url": "https://example.com/product-url",
  "offers": {
    "@type": "Offer",
    "price": "99.99",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  }
}`}
                    </pre>
                  </div>
                  
                  <div>
                    <p className="font-medium">Organization</p>
                    <pre className="bg-white p-2 rounded overflow-x-auto text-xs">
{`{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Organization Name",
  "url": "https://example.com",
  "description": "Organization description",
  "logo": "https://example.com/logo.jpg",
  "address": "123 Main St, City"
}`}
                    </pre>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="font-medium mb-2">Tips:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Use valid JSON format</li>
                    <li>Use https://schema.org/ for schema types</li>
                    <li>Validate your schema at https://validator.schema.org/</li>
                    <li>Use structured data for rich search results</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={addStructuredDataTags}
              className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-amber-700"
            >
              Add Structured Data Tags
            </button>
            <button
              onClick={removeStructuredDataTags}
              className="ml-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm hover:bg-gray-300"
            >
              Remove Structured Data Tags
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetaTagsManager;