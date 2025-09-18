import React, { useEffect, useState } from 'react';
import OptimizedImage from './ui/OptimizedImage';

interface Gemstone {
  id: number;
  name: string;
  type: string;
  description: string;
  price: number;
  images: string[];
  certification: string;
  createdAt: string;
  updatedAt: string;
}

const GemstoneGrid: React.FC = () => {
  const [gemstones, setGemstones] = useState<Gemstone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGemstones = async () => {
      try {
        const res = await fetch('/api/gemstones');
        if (!res.ok) throw new Error('Failed to fetch gemstones');
        const data = await res.json();
        setGemstones(data);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchGemstones();
  }, []);

  if (loading) return <div className="text-center py-8 text-lg">Loading gemstones...</div>;
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;
  if (!gemstones || gemstones.length === 0)
    return <div className="text-center py-8 text-gray-500">No gemstones found.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-center luxury-font-serif">Gemstones</h2>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {gemstones.map((gem, index) => (
          <div
            key={gem.id}
            className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col hover:shadow-xl transition-shadow"
          >
            <div className="relative w-full h-48">
              <OptimizedImage
                src={gem.images && gem.images.length > 0 ? gem.images[0] : '/images/placeholder-gemstone.jpg'}
                alt={gem.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover rounded-t"
                quality={75}
                priority={index < 4} // Priority loading for first 4 images
              />
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="text-lg font-semibold mb-1 luxury-font-serif">{gem.name}</h3>
              <p className="text-sm text-gray-500 mb-2 luxury-font-sans">{gem.description?.substring(0, 50)}...</p>
              <p className="text-xl font-bold text-indigo-600 mb-2 luxury-font-serif">
                ${gem.price.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-auto luxury-font-sans">Certification: {gem.certification}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GemstoneGrid;