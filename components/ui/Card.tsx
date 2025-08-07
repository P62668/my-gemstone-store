import React from 'react';
import Button from './Button';

interface Gemstone {
  id: number;
  name: string;
  type: string;
  price: number;
  images: string[];
  certification: string;
  description?: string;
}

interface ProductCardProps {
  gemstone: Gemstone;
  onViewDetails: (id: number) => void;
  onAddToCart: (id: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  gemstone,
  onViewDetails,
  onAddToCart,
}) => {
  const images = gemstone.images || [];

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={images[0] || '/placeholder-gemstone.jpg'}
          alt={gemstone.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 right-4">
          <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
            {gemstone.certification}
          </span>
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{gemstone.name}</h3>
        <p className="text-gray-600 text-sm mb-3">{gemstone.type}</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-blue-800">
            ${gemstone.price.toLocaleString()}
          </span>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => onViewDetails(gemstone.id)}>
              View
            </Button>
            <Button variant="primary" size="sm" onClick={() => onAddToCart(gemstone.id)}>
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface InfoCardProps {
  title: string;
  children: React.ReactNode;
  variant?: 'default' | 'gradient' | 'bordered';
}

export const InfoCard: React.FC<InfoCardProps> = ({ title, children, variant = 'default' }) => {
  const variants = {
    default: 'bg-white border border-gray-200',
    gradient: 'bg-gradient-to-br from-yellow-50 to-white border border-yellow-200',
    bordered: 'bg-white border-2 border-blue-200',
  };

  return (
    <div className={`rounded-xl p-6 shadow-sm ${variants[variant]}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="text-gray-700 leading-relaxed">{children}</div>
    </div>
  );
};

interface BaseCardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<BaseCardProps> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-md ${className}`}>{children}</div>
);

export const CardHeader: React.FC<BaseCardProps> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>{children}</div>
);

export const CardBody: React.FC<BaseCardProps> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>{children}</div>
);

export const CardFooter: React.FC<BaseCardProps> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-t border-gray-200 ${className}`}>{children}</div>
);
