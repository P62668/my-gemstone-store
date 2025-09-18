import React, { useState, useEffect } from 'react';
import { X, Star, Truck, Shield, RotateCcw, Package, ShoppingCart, Check } from 'lucide-react';
import Image from 'next/image';
import { getFirstImage } from '../../utils/imageUtils';
import { formatPriceUSD } from '../../utils/numberFormat';
import Modal from './Modal';

interface ComparisonProduct {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  rating: number;
  reviewCount: number;
  category: string;
  specifications: {
    weight: string;
    dimensions: string;
    color: string;
    clarity: string;
    cut: string;
    origin: string;
    certification: string;
  };
  stockCount: number;
  featured?: boolean;
}

interface ProductComparisonProps {
  products: ComparisonProduct[];
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (id: number) => void;
  onViewProduct: (id: number) => void;
}

const ProductComparison: React.FC<ProductComparisonProps> = ({
  products,
  isOpen,
  onClose,
  onAddToCart,
  onViewProduct,
}) => {
  const [selectedProducts, setSelectedProducts] = useState<ComparisonProduct[]>(products);

  useEffect(() => {
    setSelectedProducts(products);
  }, [products]);

  const removeProduct = (id: number) => {
    const updatedProducts = selectedProducts.filter(product => product.id !== id);
    setSelectedProducts(updatedProducts);
    if (updatedProducts.length === 0) {
      onClose();
    }
  };

  const renderSpecificationRow = (label: string, key: keyof ComparisonProduct['specifications']) => {
    return (
      <tr className="border-b border-gray-100">
        <td className="py-4 px-4 font-medium text-gray-700">{label}</td>
        {selectedProducts.map((product) => (
          <td key={`${product.id}-${key}`} className="py-4 px-4 text-center">
            {product.specifications[key] || 'N/A'}
          </td>
        ))}
      </tr>
    );
  };

  if (!isOpen || selectedProducts.length === 0) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Product Comparison" size="xl">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="py-4 px-4 text-left text-gray-500 font-normal">Product</th>
              {selectedProducts.map((product) => (
                <th key={product.id} className="py-4 px-4 text-center relative">
                  <button
                    onClick={() => removeProduct(product.id)}
                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                    aria-label="Remove product"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32 mb-3">
                      <Image
                        src={getFirstImage(product.images)}
                        alt={product.name}
                        fill
                        sizes="128px"
                        className="object-cover rounded-lg"
                      />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{product.name}</h3>
                    <p className="text-amber-600 text-sm mt-1">{product.category}</p>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-4 px-4 font-medium text-gray-700">Price</td>
              {selectedProducts.map((product) => (
                <td key={product.id} className="py-4 px-4 text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-xl font-bold text-gray-900">
                      {formatPriceUSD(product.price)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPriceUSD(product.originalPrice)}
                      </span>
                    )}
                  </div>
                </td>
              ))}
            </tr>
            
            <tr className="border-b border-gray-100">
              <td className="py-4 px-4 font-medium text-gray-700">Rating</td>
              {selectedProducts.map((product) => (
                <td key={product.id} className="py-4 px-4 text-center">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400 mr-1" />
                      <span className="font-medium">{product.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-xs text-gray-500">({product.reviewCount} reviews)</span>
                  </div>
                </td>
              ))}
            </tr>
            
            <tr className="border-b border-gray-100">
              <td className="py-4 px-4 font-medium text-gray-700">Availability</td>
              {selectedProducts.map((product) => (
                <td key={product.id} className="py-4 px-4 text-center">
                  {product.stockCount > 0 ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Check className="w-3 h-3 mr-1" />
                      In Stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <X className="w-3 h-3 mr-1" />
                      Out of Stock
                    </span>
                  )}
                </td>
              ))}
            </tr>
            
            {renderSpecificationRow('Weight', 'weight')}
            {renderSpecificationRow('Dimensions', 'dimensions')}
            {renderSpecificationRow('Color', 'color')}
            {renderSpecificationRow('Clarity', 'clarity')}
            {renderSpecificationRow('Cut', 'cut')}
            {renderSpecificationRow('Origin', 'origin')}
            {renderSpecificationRow('Certification', 'certification')}
            
            <tr>
              <td className="py-4 px-4 font-medium text-gray-700">Actions</td>
              {selectedProducts.map((product) => (
                <td key={product.id} className="py-4 px-4 text-center">
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => onAddToCart(product.id)}
                      className="w-full py-2 px-4 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors flex items-center justify-center"
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => onViewProduct(product.id)}
                      className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      
      {selectedProducts.length < 4 && (
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Add more products to compare (up to 4 products)
          </p>
        </div>
      )}
    </Modal>
  );
};

export default ProductComparison;