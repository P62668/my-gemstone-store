import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Plus, Upload, GripVertical, Eye, EyeOff } from 'lucide-react';

// Types for homepage components
export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  isActive: boolean;
  order: number;
}

export interface PromotionalSection {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  isActive: boolean;
  order: number;
  layout: 'left' | 'right' | 'center';
}

// Banner Component for managing homepage banners
interface BannerProps {
  banners: Banner[];
  onChange: (banners: Banner[]) => void;
}

export const Banner: React.FC<BannerProps> = ({ banners, onChange }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newBanner, setNewBanner] = useState<Omit<Banner, 'id' | 'order'>>({
    title: '',
    subtitle: '',
    imageUrl: '',
    ctaText: '',
    ctaLink: '',
    isActive: true
  });

  const addBanner = () => {
    const newId = `banner-${Date.now()}`;
    const newOrder = banners.length > 0 ? Math.max(...banners.map(b => b.order)) + 1 : 1;
    
    const updatedBanners = [...banners, {
      ...newBanner,
      id: newId,
      order: newOrder
    }];
    
    onChange(updatedBanners);
    setIsAdding(false);
    setNewBanner({
      title: '',
      subtitle: '',
      imageUrl: '',
      ctaText: '',
      ctaLink: '',
      isActive: true
    });
  };

  const updateBanner = (id: string, field: keyof Banner, value: any) => {
    const updatedBanners = banners.map(banner => 
      banner.id === id ? { ...banner, [field]: value } : banner
    );
    onChange(updatedBanners);
  };

  const removeBanner = (id: string) => {
    const updatedBanners = banners.filter(banner => banner.id !== id);
    // Reorder remaining banners
    const reorderedBanners = updatedBanners.map((banner, index) => ({
      ...banner,
      order: index + 1
    }));
    onChange(reorderedBanners);
  };

  // Drag and drop handlers
  const [draggedBanner, setDraggedBanner] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    setDraggedBanner(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();
    if (!draggedBanner || draggedBanner === targetId) return;

    const sourceIndex = banners.findIndex(b => b.id === draggedBanner);
    const targetIndex = banners.findIndex(b => b.id === targetId);

    if (sourceIndex === -1 || targetIndex === -1) return;

    const updatedBanners = [...banners];
    const [movedBanner] = updatedBanners.splice(sourceIndex, 1);
    updatedBanners.splice(targetIndex, 0, movedBanner);

    // Update order numbers
    const orderedBanners = updatedBanners.map((banner, index) => ({
      ...banner,
      order: index + 1
    }));

    onChange(orderedBanners);
    setDraggedBanner(null);
  };

  const handleDragEnd = () => {
    setDraggedBanner(null);
  };

  return (
    <div className="space-y-4">
      {/* Banner List */}
      {banners.length > 0 && (
        <div className="space-y-3">
          {banners
            .sort((a, b) => a.order - b.order)
            .map((banner, index) => (
              <div 
                key={banner.id} 
                className={`border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors ${
                  draggedBanner === banner.id ? 'bg-amber-50 border-amber-300' : ''
                }`}
                draggable
                onDragStart={(e) => handleDragStart(e, banner.id)}
                onDragOver={(e) => handleDragOver(e, banner.id)}
                onDragEnd={handleDragEnd}
                onDrop={(e) => handleDrop(e, banner.id)}
                style={{ cursor: 'grab' }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">Order: {banner.order}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateBanner(banner.id, 'isActive', !banner.isActive)}
                      className={`p-1 rounded ${banner.isActive ? 'text-green-600 hover:text-green-800' : 'text-gray-400 hover:text-gray-600'}`}
                      title={banner.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {banner.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => removeBanner(banner.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Remove"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Title</label>
                    <input
                      type="text"
                      value={banner.title}
                      onChange={(e) => updateBanner(banner.id, 'title', e.target.value)}
                      className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:ring-amber-500 focus:border-amber-500"
                      placeholder="Banner title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={banner.subtitle}
                      onChange={(e) => updateBanner(banner.id, 'subtitle', e.target.value)}
                      className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:ring-amber-500 focus:border-amber-500"
                      placeholder="Banner subtitle"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">CTA Text</label>
                    <input
                      type="text"
                      value={banner.ctaText}
                      onChange={(e) => updateBanner(banner.id, 'ctaText', e.target.value)}
                      className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:ring-amber-500 focus:border-amber-500"
                      placeholder="Call to action text"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">CTA Link</label>
                    <input
                      type="text"
                      value={banner.ctaLink}
                      onChange={(e) => updateBanner(banner.id, 'ctaLink', e.target.value)}
                      className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:ring-amber-500 focus:border-amber-500"
                      placeholder="/collection/rings"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Image URL</label>
                    <input
                      type="text"
                      value={banner.imageUrl}
                      onChange={(e) => updateBanner(banner.id, 'imageUrl', e.target.value)}
                      className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:ring-amber-500 focus:border-amber-500"
                      placeholder="https://example.com/banner-image.jpg"
                    />
                  </div>
                  
                  {banner.imageUrl && (
                    <div className="mt-2">
                      <label className="block text-xs text-gray-500 mb-1">Preview</label>
                      <div className="relative w-full h-32 rounded-md overflow-hidden border border-gray-200">
                        <Image
                          src={banner.imageUrl}
                          alt={banner.title}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}
      
      {/* Add New Banner Form */}
      {isAdding && (
        <div className="border border-dashed border-gray-300 rounded-lg p-4 mb-4 bg-amber-50">
          <h3 className="font-medium text-gray-800 mb-3">Add New Banner</h3>
          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-xs text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={newBanner.title}
                onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:ring-amber-500 focus:border-amber-500"
                placeholder="Banner title"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-700 mb-1">Subtitle</label>
              <input
                type="text"
                value={newBanner.subtitle}
                onChange={(e) => setNewBanner({ ...newBanner, subtitle: e.target.value })}
                className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:ring-amber-500 focus:border-amber-500"
                placeholder="Banner subtitle"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-700 mb-1">CTA Text</label>
              <input
                type="text"
                value={newBanner.ctaText}
                onChange={(e) => setNewBanner({ ...newBanner, ctaText: e.target.value })}
                className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:ring-amber-500 focus:border-amber-500"
                placeholder="Shop now"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-700 mb-1">CTA Link</label>
              <input
                type="text"
                value={newBanner.ctaLink}
                onChange={(e) => setNewBanner({ ...newBanner, ctaLink: e.target.value })}
                className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:ring-amber-500 focus:border-amber-500"
                placeholder="/collection/rings"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-700 mb-1">Image URL</label>
              <input
                type="text"
                value={newBanner.imageUrl}
                onChange={(e) => setNewBanner({ ...newBanner, imageUrl: e.target.value })}
                className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:ring-amber-500 focus:border-amber-500"
                placeholder="https://example.com/banner-image.jpg"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsAdding(false)}
              className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1"
            >
              Cancel
            </button>
            <button
              onClick={addBanner}
              className="bg-amber-600 text-white text-sm px-3 py-1 rounded hover:bg-amber-700 flex items-center gap-1 disabled:opacity-50"
              disabled={!newBanner.title || !newBanner.imageUrl}
            >
              <Plus className="h-4 w-4" />
              Add Banner
            </button>
          </div>
        </div>
      )}
      
      {/* Add Banner Button */}
      <div className="mt-4">
        <button
          onClick={() => setIsAdding(true)}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-amber-400 hover:text-amber-600 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add New Banner
        </button>
      </div>
    </div>
  );
};

// Featured Products Component for managing featured products on homepage
interface FeaturedProductsProps {
  featuredProductIds: number[];
  onChange: (ids: number[]) => void;
}

export const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ featuredProductIds, onChange }) => {
  const [search, setSearch] = useState('');
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulate fetching products from API
  useEffect(() => {
    const fetchProducts = async () => {
      // In a real application, this would be an API call to fetch all products
      // For now, we'll simulate with some mock data
      setTimeout(() => {
        setAllProducts([
          { id: 1, name: 'Emerald Necklace', price: 899.99, image: '/images/emerald-necklace.jpg' },
          { id: 2, name: 'Ruby Earrings', price: 599.99, image: '/images/ruby-earrings.jpg' },
          { id: 3, name: 'Sapphire Ring', price: 1299.99, image: '/images/sapphire-ring.jpg' },
          { id: 4, name: 'Diamond Bracelet', price: 1999.99, image: '/images/diamond-bracelet.jpg' },
          { id: 5, name: 'Pearl Set', price: 699.99, image: '/images/pearl-set.jpg' },
        ]);
        setLoading(false);
      }, 500);
    };
    
    fetchProducts();
  }, []);

  const toggleFeatured = (productId: number) => {
    if (featuredProductIds.includes(productId)) {
      onChange(featuredProductIds.filter(id => id !== productId));
    } else {
      onChange([...featuredProductIds, productId]);
    }
  };

  const removeFeatured = (productId: number) => {
    onChange(featuredProductIds.filter(id => id !== productId));
  };

  const filteredProducts = allProducts.filter(product => 
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  // Get featured products in order
  const orderedFeaturedProducts = featuredProductIds
    .map(id => allProducts.find(p => p.id === id))
    .filter(Boolean) as any[];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-gray-800">Featured Products</h3>
        <div className="text-sm text-gray-600">
          {featuredProductIds.length} of {allProducts.length} products
        </div>
      </div>
      
      <div>
        <label className="block text-xs text-gray-500 mb-1">Search</label>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:ring-amber-500 focus:border-amber-500"
        />
      </div>
      
      {/* Featured Products List with Drag and Drop */}
      {orderedFeaturedProducts.length > 0 && (
        <div className="space-y-2 mb-4">
          <h4 className="text-sm font-medium text-gray-700">Featured Products (Drag to reorder)</h4>
          <div className="space-y-2">
            {orderedFeaturedProducts.map((product, index) => (
              <div key={`featured-${product.id}`} className="flex items-center gap-3 p-2 border border-gray-200 rounded-lg">
                <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                <div className="relative w-12 h-12 flex-shrink-0">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-800 text-sm truncate">{product.name}</h4>
                  <p className="text-sm text-gray-600">${product.price}</p>
                </div>
                <button
                  onClick={() => removeFeatured(product.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Remove from featured"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map(product => (
          <div 
            key={product.id} 
            className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="relative w-16 h-16 flex-shrink-0">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover rounded-md"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-800 text-sm mb-1 truncate">{product.name}</h4>
                <p className="text-sm text-gray-600 mb-2">${product.price}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleFeatured(product.id)}
                    className={`text-xs font-medium px-2 py-1 rounded ${
                      featuredProductIds.includes(product.id) 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {featuredProductIds.includes(product.id) ? 'Featured' : 'Feature'}
                  </button>
                  {featuredProductIds.includes(product.id) && (
                    <button
                      onClick={() => removeFeatured(product.id)}
                      className="text-xs font-medium px-2 py-1 rounded bg-red-100 text-red-800 hover:bg-red-200"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Promotional Section Component for managing promotional sections on homepage
interface PromotionalSectionProps {
  sections: PromotionalSection[];
  onChange: (sections: PromotionalSection[]) => void;
}

export const PromotionalSection: React.FC<PromotionalSectionProps> = ({ sections, onChange }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newSection, setNewSection] = useState<Omit<PromotionalSection, 'id' | 'order'>>({ 
    title: '',
    subtitle: '',
    content: '',
    imageUrl: '',
    ctaText: '',
    ctaLink: '',
    isActive: true,
    layout: 'left'
  });

  const addSection = () => {
    const newId = `section-${Date.now()}`;
    const newOrder = sections.length > 0 ? Math.max(...sections.map(s => s.order)) + 1 : 1;
    
    const updatedSections = [...sections, {
      ...newSection,
      id: newId,
      order: newOrder
    }];
    
    onChange(updatedSections);
    setIsAdding(false);
    setNewSection({
      title: '',
      subtitle: '',
      content: '',
      imageUrl: '',
      ctaText: '',
      ctaLink: '',
      isActive: true,
      layout: 'left'
    });
  };

  const updateSection = (id: string, field: keyof PromotionalSection, value: any) => {
    const updatedSections = sections.map(section => 
      section.id === id ? { ...section, [field]: value } : section
    );
    onChange(updatedSections);
  };

  const removeSection = (id: string) => {
    const updatedSections = sections.filter(section => section.id !== id);
    // Reorder remaining sections
    const reorderedSections = updatedSections.map((section, index) => ({
      ...section,
      order: index + 1
    }));
    onChange(reorderedSections);
  };

  // Drag and drop handlers
  const [draggedSection, setDraggedSection] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    setDraggedSection(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();
    if (!draggedSection || draggedSection === targetId) return;

    const sourceIndex = sections.findIndex(s => s.id === draggedSection);
    const targetIndex = sections.findIndex(s => s.id === targetId);

    if (sourceIndex === -1 || targetIndex === -1) return;

    const updatedSections = [...sections];
    const [movedSection] = updatedSections.splice(sourceIndex, 1);
    updatedSections.splice(targetIndex, 0, movedSection);

    // Update order numbers
    const orderedSections = updatedSections.map((section, index) => ({
      ...section,
      order: index + 1
    }));

    onChange(orderedSections);
    setDraggedSection(null);
  };

  const handleDragEnd = () => {
    setDraggedSection(null);
  };

  return (
    <div className="space-y-4">
      {/* Section List */}
      {sections.length > 0 && (
        <div className="space-y-3">
          {sections
            .sort((a, b) => a.order - b.order)
            .map((section, index) => (
              <div 
                key={section.id} 
                className={`border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors ${
                  draggedSection === section.id ? 'bg-amber-50 border-amber-300' : ''
                }`}
                draggable
                onDragStart={(e) => handleDragStart(e, section.id)}
                onDragOver={(e) => handleDragOver(e, section.id)}
                onDragEnd={handleDragEnd}
                onDrop={(e) => handleDrop(e, section.id)}
                style={{ cursor: 'grab' }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">Order: {section.order}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateSection(section.id, 'isActive', !section.isActive)}
                      className={`p-1 rounded ${section.isActive ? 'text-green-600 hover:text-green-800' : 'text-gray-400 hover:text-gray-600'}`}
                      title={section.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {section.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => removeSection(section.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Remove"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Title</label>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                      className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:ring-amber-500 focus:border-amber-500"
                      placeholder="Section title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={section.subtitle}
                      onChange={(e) => updateSection(section.id, 'subtitle', e.target.value)}
                      className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:ring-amber-500 focus:border-amber-500"
                      placeholder="Section subtitle"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Content</label>
                    <textarea
                      value={section.content}
                      onChange={(e) => updateSection(section.id, 'content', e.target.value)}
                      rows={3}
                      className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:ring-amber-500 focus:border-amber-500"
                      placeholder="Section content"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">CTA Text</label>
                    <input
                      type="text"
                      value={section.ctaText}
                      onChange={(e) => updateSection(section.id, 'ctaText', e.target.value)}
                      className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:ring-amber-500 focus:border-amber-500"
                      placeholder="Call to action text"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">CTA Link</label>
                    <input
                      type="text"
                      value={section.ctaLink}
                      onChange={(e) => updateSection(section.id, 'ctaLink', e.target.value)}
                      className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:ring-amber-500 focus:border-amber-500"
                      placeholder="/collection/rings"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Image URL</label>
                    <input
                      type="text"
                      value={section.imageUrl}
                      onChange={(e) => updateSection(section.id, 'imageUrl', e.target.value)}
                      className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:ring-amber-500 focus:border-amber-500"
                      placeholder="https://example.com/section-image.jpg"
                    />
                  </div>
                  
                  {section.imageUrl && (
                    <div className="mt-2">
                      <label className="block text-xs text-gray-500 mb-1">Preview</label>
                      <div className="relative w-full h-32 rounded-md overflow-hidden border border-gray-200">
                        <Image
                          src={section.imageUrl}
                          alt={section.title}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Layout</label>
                    <select
                      value={section.layout}
                      onChange={(e) => updateSection(section.id, 'layout', e.target.value)}
                      className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:ring-amber-500 focus:border-amber-500"
                    >
                      <option value="left">Left Image</option>
                      <option value="right">Right Image</option>
                      <option value="center">Centered</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
      
      {/* Add New Section Form */}
      {isAdding && (
        <div className="border border-dashed border-gray-300 rounded-lg p-4 mb-4 bg-amber-50">
          <h3 className="font-medium text-gray-800 mb-3">Add New Promotional Section</h3>
          
          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-xs text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={newSection.title}
                onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:ring-amber-500 focus:border-amber-500"
                placeholder="Section title"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-700 mb-1">Subtitle</label>
              <input
                type="text"
                value={newSection.subtitle}
                onChange={(e) => setNewSection({ ...newSection, subtitle: e.target.value })}
                className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:ring-amber-500 focus:border-amber-500"
                placeholder="Section subtitle"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-700 mb-1">Content</label>
              <textarea
                value={newSection.content}
                onChange={(e) => setNewSection({ ...newSection, content: e.target.value })}
                rows={3}
                className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:ring-amber-500 focus:border-amber-500"
                placeholder="Section content"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-700 mb-1">CTA Text</label>
              <input
                type="text"
                value={newSection.ctaText}
                onChange={(e) => setNewSection({ ...newSection, ctaText: e.target.value })}
                className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:ring-amber-500 focus:border-amber-500"
                placeholder="Shop now"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-700 mb-1">CTA Link</label>
              <input
                type="text"
                value={newSection.ctaLink}
                onChange={(e) => setNewSection({ ...newSection, ctaLink: e.target.value })}
                className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:ring-amber-500 focus:border-amber-500"
                placeholder="/collection/rings"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-700 mb-1">Image URL</label>
              <input
                type="text"
                value={newSection.imageUrl}
                onChange={(e) => setNewSection({ ...newSection, imageUrl: e.target.value })}
                className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:ring-amber-500 focus:border-amber-500"
                placeholder="https://example.com/section-image.jpg"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-700 mb-1">Layout</label>
              <select
                value={newSection.layout}
                onChange={(e) => setNewSection({ ...newSection, layout: e.target.value as 'left' | 'right' | 'center' })}
                className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="left">Left Image</option>
                <option value="right">Right Image</option>
                <option value="center">Centered</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsAdding(false)}
              className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1"
            >
              Cancel
            </button>
            <button
              onClick={addSection}
              className="bg-amber-600 text-white text-sm px-3 py-1 rounded hover:bg-amber-700 flex items-center gap-1 disabled:opacity-50"
              disabled={!newSection.title || !newSection.imageUrl}
            >
              <Plus className="h-4 w-4" />
              Add Section
            </button>
          </div>
        </div>
      )}
      
      {/* Add Section Button */}
      <div className="mt-4">
        <button
          onClick={() => setIsAdding(true)}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-amber-400 hover:text-amber-600 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add New Promotional Section
        </button>
      </div>
    </div>
  );
};