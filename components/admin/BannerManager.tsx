import React, { useState, useEffect } from 'react';
import { Plus, X, GripVertical } from 'lucide-react';
import LuxuryCard from '../ui/LuxuryCard';

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  active: boolean;
  order: number;
}

interface BannerManagerProps {
  initialBanners: Banner[];
  onChange: (banners: Banner[]) => void;
}

const BannerManager: React.FC<BannerManagerProps> = ({ initialBanners, onChange }) => {
  const [banners, setBanners] = useState<Banner[]>(initialBanners);
  const [newBanner, setNewBanner] = useState<Omit<Banner, 'id' | 'order'>>({
    title: '',
    subtitle: '',
    imageUrl: '',
    linkUrl: '',
    active: true,
  });
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    setBanners(initialBanners);
  }, [initialBanners]);

  const addBanner = () => {
    if (!newBanner.title || !newBanner.imageUrl) return;
    
    const banner: Banner = {
      id: `banner-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...newBanner,
      order: banners.length + 1
    };
    
    const updatedBanners = [...banners, banner];
    setBanners(updatedBanners);
    onChange(updatedBanners);
    
    // Reset form
    setNewBanner({
      title: '',
      subtitle: '',
      imageUrl: '',
      linkUrl: '',
      active: true,
    });
  };

  const updateBanner = (index: number, field: keyof Banner, value: any) => {
    const updatedBanners = banners.map((banner, i) => 
      i === index ? { ...banner, [field]: value } : banner
    );
    setBanners(updatedBanners);
    onChange(updatedBanners);
  };

  const removeBanner = (index: number) => {
    const updatedBanners = banners.filter((_, i) => i !== index);
    setBanners(updatedBanners);
    onChange(updatedBanners);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    
    const updatedBanners = [...banners];
    const [movedBanner] = updatedBanners.splice(draggedIndex, 1);
    updatedBanners.splice(targetIndex, 0, movedBanner);
    
    // Update order numbers
    const orderedBanners = updatedBanners.map((banner, index) => ({
      ...banner,
      order: index + 1
    }));
    
    setBanners(orderedBanners);
    onChange(orderedBanners);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-6">
      <LuxuryCard className="bg-white border border-gray-200" padding="lg" rounded="xl" shadow="lg">
        <h3 className="font-bold text-amber-900 mb-4">Banners</h3>
        
        <div className="space-y-4">
          {banners.map((banner, index) => (
            <div 
              key={banner.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`border border-gray-200 rounded-lg p-4 ${draggedIndex === index ? 'bg-amber-50 border-amber-300' : ''}`}
              style={{ cursor: 'grab' }}
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-500">Order: {banner.order}</span>
                </div>
                <button
                  onClick={() => removeBanner(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={banner.title}
                    onChange={(e) => updateBanner(index, 'title', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={banner.subtitle || ''}
                    onChange={(e) => updateBanner(index, 'subtitle', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input
                    type="text"
                    value={banner.imageUrl}
                    onChange={(e) => updateBanner(index, 'imageUrl', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-amber-500 focus:border-amber-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
                  <input
                    type="text"
                    value={banner.linkUrl || ''}
                    onChange={(e) => updateBanner(index, 'linkUrl', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-amber-500 focus:border-amber-500"
                    placeholder="https://example.com"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`active-${banner.id}`}
                    checked={banner.active}
                    onChange={(e) => updateBanner(index, 'active', e.target.checked)}
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`active-${banner.id}`} className="ml-2 text-sm text-gray-700">
                    Active
                  </label>
                </div>
              </div>
            </div>
          ))}
          
          <div className="border border-dashed border-gray-300 rounded-lg p-4">
            <h4 className="font-medium text-gray-700 mb-4">Add New Banner</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newBanner.title}
                  onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle (optional)</label>
                <input
                  type="text"
                  value={newBanner.subtitle}
                  onChange={(e) => setNewBanner({ ...newBanner, subtitle: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="text"
                  value={newBanner.imageUrl}
                  onChange={(e) => setNewBanner({ ...newBanner, imageUrl: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-amber-500 focus:border-amber-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link URL (optional)</label>
                <input
                  type="text"
                  value={newBanner.linkUrl}
                  onChange={(e) => setNewBanner({ ...newBanner, linkUrl: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-amber-500 focus:border-amber-500"
                  placeholder="https://example.com"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="banner-active"
                  checked={newBanner.active}
                  onChange={(e) => setNewBanner({ ...newBanner, active: e.target.checked })}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                />
                <label htmlFor="banner-active" className="ml-2 text-sm text-gray-700">
                  Active
                </label>
              </div>
              
              <button
                onClick={addBanner}
                disabled={!newBanner.title || !newBanner.imageUrl}
                className="w-full bg-amber-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-amber-700 disabled:bg-gray-300 flex items-center justify-center gap-1"
              >
                <Plus className="h-4 w-4" />
                <span>Add Banner</span>
              </button>
            </div>
          </div>
        </div>
      </LuxuryCard>
    </div>
  );
};

export default BannerManager;

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  active: boolean;
  order: number;
}

export type { Banner };
