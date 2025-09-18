import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import OptimizedImage from './ui/OptimizedImage';
import dynamic from 'next/dynamic';

// Dynamically import framer-motion components
const MotionDiv = dynamic(() => import('framer-motion').then(mod => mod.motion.div), { ssr: false });

interface Category {
  id: number;
  name: string;
  description: string;
  image: string;
  productCount: number;
}

interface CategoriesGridProps {
  categories: Category[];
}

const CategoriesGrid: React.FC<CategoriesGridProps> = ({ categories }) => {
  return (
    <section className="py-16 bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 luxury-font-serif">
            Explore Our Collections
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto luxury-font-sans">
            Discover the perfect gemstone for every occasion and preference
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            typeof window !== 'undefined' ? (
              <MotionDiv
                key={category.id}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-amber-100"
                whileHover={{ y: -8 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link href={`/shop?category=${category.id}`}>
                  <div className="relative h-56 overflow-hidden">
                    <OptimizedImage
                      src={category.image || '/images/placeholder-category.jpg'}
                      alt={category.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      quality={75}
                      priority={index < 6} // Priority loading for first 6 images
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white mb-1 luxury-font-serif">{category.name}</h3>
                      <p className="text-amber-200 text-sm luxury-font-sans">{category.productCount} products</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600 line-clamp-2 luxury-font-sans">{category.description}</p>
                  </div>
                </Link>
              </MotionDiv>
            ) : (
              <div
                key={category.id}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-amber-100"
              >
                <Link href={`/shop?category=${category.id}`}>
                  <div className="relative h-56 overflow-hidden">
                    <OptimizedImage
                      src={category.image || '/images/placeholder-category.jpg'}
                      alt={category.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      quality={75}
                      priority={index < 6} // Priority loading for first 6 images
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white mb-1 luxury-font-serif">{category.name}</h3>
                      <p className="text-amber-200 text-sm luxury-font-sans">{category.productCount} products</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600 line-clamp-2 luxury-font-sans">{category.description}</p>
                  </div>
                </Link>
              </div>
            )
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesGrid;