import React from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Layout from '../../components/Layout';
import PageRenderer from '../../components/PageRenderer';
import { prisma } from '../../lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { Filter, SortAsc } from 'lucide-react';

interface CategoryPageProps {
  category: {
    id: number;
    name: string;
    description: string | null;
    image: string | null;
    slug: string;
    dynamicContent?: any[];
  } | null;
  products: any[];
  error?: string;
}

const CategoryPage: React.FC<CategoryPageProps> = ({ category, products, error }) => {
  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Category Not Found</h1>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!category) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Category Not Found</h1>
            <p className="text-gray-600">The category you are looking for does not exist.</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Parse dynamic content if it exists
  let dynamicContent = category.dynamicContent;
  if (dynamicContent && typeof dynamicContent === 'string') {
    try {
      dynamicContent = JSON.parse(dynamicContent);
    } catch (e) {
      dynamicContent = [];
    }
  }

  return (
    <Layout>
      <Head>
        <title>{category.name} - Shankarmala Gemstones</title>
        <meta name="description" content={category.description || `Explore our collection of ${category.name}`} />
      </Head>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Category Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-amber-900 mb-4 font-serif">{category.name}</h1>
          {category.description && (
            <p className="text-lg text-amber-700 max-w-3xl mx-auto">{category.description}</p>
          )}
        </div>

        {/* Dynamic Content Section */}
        {dynamicContent && dynamicContent.length > 0 && (
          <div className="mb-12">
            <PageRenderer content={dynamicContent} />
          </div>
        )}

        {/* Product Listing */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="md:w-1/4">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="text-amber-600" />
                <h3 className="text-lg font-semibold text-amber-900">Filters</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Price Range</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="luxury-checkbox rounded text-amber-600" />
                      <span className="ml-2 text-gray-600">Under ₹10,000</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="luxury-checkbox rounded text-amber-600" />
                      <span className="ml-2 text-gray-600">₹10,000 - ₹50,000</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="luxury-checkbox rounded text-amber-600" />
                      <span className="ml-2 text-gray-600">₹50,000 - ₹1,00,000</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="luxury-checkbox rounded text-amber-600" />
                      <span className="ml-2 text-gray-600">Above ₹1,00,000</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Stone Type</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="luxury-checkbox rounded text-amber-600" />
                      <span className="ml-2 text-gray-600">Natural</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="luxury-checkbox rounded text-amber-600" />
                      <span className="ml-2 text-gray-600">Treated</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="md:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">{products.length} products found</p>
              <div className="flex items-center gap-2">
                <SortAsc className="text-amber-600" />
                <select className="luxury-select">
                  <option>Sort by: Featured</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest First</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative h-64">
                    <Image 
                      src={Array.isArray(product.images) ? product.images[0] : product.images || '/images/placeholder-gemstone.jpg'} 
                      alt={product.name} 
                      layout="fill" 
                      objectFit="cover" 
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-amber-900 mb-2">{product.name}</h3>
                    <p className="text-amber-600 font-bold text-xl">
                      ₹{product.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <Link href={`/product/${product.id}`} className="mt-4 inline-block bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors">
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { categorySlug } = context.params || {};

  try {
    if (typeof categorySlug !== 'string') {
      return {
        props: {
          category: null,
          products: [],
          error: 'Invalid category slug',
        },
      };
    }

    // Fetch category by name (converting slug to name)
    const categoryName = categorySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const category = await prisma.category.findFirst({
      where: {
        name: categoryName,
      },
    });

    if (!category) {
      return {
        props: {
          category: null,
          products: [],
          error: 'Category not found',
        },
      };
    }

    // Fetch products in this category
    const products = await prisma.gemstone.findMany({
      where: {
        categoryId: category.id,
        active: true,
      },
      take: 12,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Check for dynamic category page content
    const dynamicPage = await prisma.page.findFirst({
      where: {
        slug: `category-${categorySlug}`,
        status: 'published',
      },
    });

    return {
      props: {
        category: {
          ...category,
          dynamicContent: dynamicPage ? (typeof dynamicPage.content === 'string' ? JSON.parse(dynamicPage.content) : dynamicPage.content) : null,
        },
        products: products.map(product => ({
          ...product,
          images: typeof product.images === 'string' ? JSON.parse(product.images) : product.images,
        })),
      },
    };
  } catch (error) {
    console.error('Error fetching category page:', error);
    return {
      props: {
        category: null,
        products: [],
        error: 'Failed to load category page',
      },
    };
  }
};

export default CategoryPage;