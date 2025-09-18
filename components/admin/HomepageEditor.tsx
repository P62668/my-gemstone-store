import React, { useState, useEffect } from 'react';
import PageEditor from './PageEditor';
import { Banner, FeaturedProducts, PromotionalSection } from './HomepageComponents';
import LuxuryCard from '../ui/LuxuryCard';

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

interface HomepageEditorProps {
  initialContent?: {
    banners?: any[];
    featuredProducts?: number[];
    promotionalSections?: any[];
    contentBlocks?: ContentBlock[];
  };
  onChange?: (content: any) => void;
  seo?: any;
  onSeoChange?: (seo: any) => void;
  onSave?: () => void;
}

const HomepageEditor: React.FC<HomepageEditorProps> = ({ 
  initialContent = {}, 
  onChange, 
  seo, 
  onSeoChange,
  onSave
}) => {
  const [banners, setBanners] = useState(initialContent.banners || []);
  const [featuredProducts, setFeaturedProducts] = useState(initialContent.featuredProducts || []);
  const [promotionalSections, setPromotionalSections] = useState(initialContent.promotionalSections || []);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>(initialContent.contentBlocks || []);
  const [activeTab, setActiveTab] = useState<'content' | 'seo'>('content');

  // Update parent when content changes
  useEffect(() => {
    if (onChange) {
      onChange({
        banners,
        featuredProducts,
        promotionalSections,
        contentBlocks
      });
    }
  }, [banners, featuredProducts, promotionalSections, contentBlocks]);

  const handleSave = () => {
    if (onSave) {
      onSave();
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('content')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'content'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Homepage Content
          </button>
          <button
            onClick={() => setActiveTab('seo')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'seo'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            SEO & Meta
          </button>
        </nav>
      </div>

      {activeTab === 'content' && (
        <div className="space-y-8">
          {/* Banners Section */}
          <LuxuryCard className="bg-white border border-gray-200" padding="lg" rounded="xl" shadow="sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Banners & Sliders</h2>
              <span className="text-sm text-gray-500">{banners.length} banners</span>
            </div>
            <Banner 
              banners={banners} 
              onChange={setBanners} 
            />
          </LuxuryCard>

          {/* Featured Products Section */}
          <LuxuryCard className="bg-white border border-gray-200" padding="lg" rounded="xl" shadow="sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Featured Products</h2>
              <span className="text-sm text-gray-500">{featuredProducts.length} products</span>
            </div>
            <FeaturedProducts 
              featuredProductIds={featuredProducts} 
              onChange={setFeaturedProducts} 
            />
          </LuxuryCard>

          {/* Promotional Sections */}
          <LuxuryCard className="bg-white border border-gray-200" padding="lg" rounded="xl" shadow="sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Promotional Sections</h2>
              <span className="text-sm text-gray-500">{promotionalSections.length} sections</span>
            </div>
            <PromotionalSection 
              sections={promotionalSections} 
              onChange={setPromotionalSections} 
            />
          </LuxuryCard>

          {/* Additional Content Blocks */}
          <LuxuryCard className="bg-white border border-gray-200" padding="lg" rounded="xl" shadow="sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Additional Content</h2>
              <span className="text-sm text-gray-500">{contentBlocks.length} blocks</span>
            </div>
            <PageEditor
              initialContent={contentBlocks}
              onChange={setContentBlocks}
              pageTitle="Homepage"
              pageSlug="homepage"
            />
          </LuxuryCard>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2 shadow-md"
            >
              <span>💾</span>
              <span>Save Homepage</span>
            </button>
          </div>
        </div>
      )}

      {activeTab === 'seo' && (
        <LuxuryCard className="bg-white border border-gray-200" padding="lg" rounded="xl" shadow="sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">SEO & Meta Settings</h2>
          
          <PageEditor
            initialContent={contentBlocks}
            onChange={setContentBlocks}
            initialSeo={seo}
            onSeoChange={onSeoChange}
            pageTitle="Homepage"
            pageSlug="homepage"
          />
        </LuxuryCard>
      )}
    </div>
  );
};

export default HomepageEditor;