import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { prisma } from '../lib/prisma';

interface Category {
  id: number;
  name: string;
  description?: string;
}

interface Gemstone {
  id: number;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  categoryId: number;
  images: string[];
  weight?: number;
  dimensions?: string;
  clarity?: string;
  color?: string;
  cut?: string;
  origin?: string;
  certificate?: string;
  stockCount: number;
  stockQuantity: number;
  lowStockThreshold: number;
  featured: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  category?: Category;
}

interface ShopProps {
  initialData: {
    gemstones: Gemstone[];
    categories: Category[];
  };
}

export const getServerSideProps: GetServerSideProps<ShopProps> = async () => {
  try {
    // Read directly from the database to avoid SSR network calls/port issues
    const [gemstonesRaw, categories] = await Promise.all([
      prisma.gemstone.findMany({
        where: { active: true },
        orderBy: { name: 'asc' },
      }),
      prisma.category.findMany({
        where: { active: true },
        orderBy: { name: 'asc' },
        select: { id: true, name: true, description: true },
      }),
    ]);

    // Normalize images and attach category reference (name only) for display
    const categoryById = new Map(categories.map((c) => [c.id, c]));
    const gemstones = gemstonesRaw.map((g: any) => {
      let images: string[] = [];
      if (Array.isArray(g.images)) {
        images = g.images;
      } else if (typeof g.images === 'string') {
        try {
          const parsed = JSON.parse(g.images);
          images = Array.isArray(parsed) ? parsed : [];
        } catch {
          images = [];
        }
      }

      return {
        ...g,
        images,
        // Ensure JSON-serializable values for dates
        createdAt: typeof g.createdAt === 'string' ? g.createdAt : g.createdAt?.toISOString?.() ?? null,
        updatedAt: typeof g.updatedAt === 'string' ? g.updatedAt : g.updatedAt?.toISOString?.() ?? null,
        category: categoryById.get(g.categoryId)
          ? { id: g.categoryId, name: categoryById.get(g.categoryId)!.name }
          : undefined,
      } as Gemstone;
    });

    return {
      props: {
        initialData: {
          gemstones,
          categories,
        },
      },
    };
  } catch (error) {
    console.error('Error fetching shop data:', error);
    return {
      props: {
        initialData: {
          gemstones: [],
          categories: [],
        },
      },
    };
  }
};

const ShopPage: React.FC<ShopProps> = ({ initialData }) => {
  const router = useRouter();
  const [gemstones, setGemstones] = useState<Gemstone[]>(initialData.gemstones);
  const [categories, setCategories] = useState<Category[]>(initialData.categories);
  const [loading, setLoading] = useState(!initialData.gemstones.length);
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');

  // Filtered and sorted products
  const filteredProducts = gemstones.filter((gemstone) => {
      const matchesCategory = !selectedCategory || gemstone.categoryId === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        gemstone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gemstone.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'featured':
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const handleProductClick = (productId: number) => {
      router.push(`/product/${productId}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-8" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-3xl shadow-lg p-6 animate-pulse">
                    <div className="aspect-square bg-gray-200 rounded-xl mb-4" />
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-6 bg-gray-200 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Shop Gemstones | Shankarmala"
      description="Discover our exclusive collection of fine gemstones. Browse by category, filter by price, and find your perfect piece."
    >
        <div className="min-h-screen bg-gray-50">
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Luxury Gemstones
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Discover our exclusive collection of fine gemstones, each hand-selected for their exceptional quality and beauty
              </p>
                  </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Search */}
                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>

                  {/* Categories */}
                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="">All Categories</option>
                      {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                          {category.name}
                      </option>
                    ))}
                    </select>
                  </div>

                {/* Sort */}
                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      <option value="name">Name A-Z</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="newest">Newest First</option>
                      <option value="featured">Featured First</option>
                    </select>
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-6">
              <p className="text-gray-600">
                {filteredProducts.length} of {gemstones.length} products
                      </p>
                    </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
                    onClick={() => handleProductClick(product.id)}
                  >
                    {/* Image */}
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={product.images?.[0] || '/images/placeholder-gemstone.jpg'}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      {product.featured && (
                        <div className="absolute top-4 right-4">
                          <span className="bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            Featured
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl font-bold text-amber-600">
                          ${product.price.toLocaleString()}
                        </span>
                        {product.stockCount > 0 ? (
                          <span className="text-sm text-green-600">In Stock</span>
                        ) : (
                          <span className="text-sm text-red-600">Out of Stock</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{product.category?.name || 'Gemstone'}</span>
                        {product.weight && <span>{product.weight}ct</span>}
                      </div>
                    </div>
                  </div>
                ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <svg
                          className="w-12 h-12 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No products found
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Try adjusting your filters or search terms
                      </p>
                      <button
                  onClick={() => {
                    setSelectedCategory('');
                    setSearchQuery('');
                    setSortBy('name');
                  }}
                        className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                      >
                        Clear Filters
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
      </Layout>
  );
};

export default ShopPage;
