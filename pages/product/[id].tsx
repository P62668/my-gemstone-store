import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { apiClient } from '../../utils/apiClient';
import Layout from '../../components/Layout';
import { GetServerSideProps } from 'next';
import { prisma } from '../../lib/prisma';
import { parseImages, getFirstImage } from '../../utils/imageUtils';

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

interface ProductDetailProps {
  gemstone: Gemstone | null;
  relatedProducts: Gemstone[];
}

export const getServerSideProps: GetServerSideProps<ProductDetailProps> = async (context) => {
  const { id } = context.params!;
  
  try {
    const numericId = Number(id);
    if (!numericId || Number.isNaN(numericId)) {
      return { notFound: true };
    }

    const gemstoneRaw = await prisma.gemstone.findUnique({
      where: { id: numericId },
      include: { category: true },
    });

    if (!gemstoneRaw || !gemstoneRaw.active) {
      return { notFound: true };
    }

    // Normalize images and dates for JSON serialization
    let images: string[] = [];
    if (Array.isArray((gemstoneRaw as any).images)) {
      images = (gemstoneRaw as any).images as string[];
    } else if (typeof (gemstoneRaw as any).images === 'string') {
      try {
        const parsed = JSON.parse((gemstoneRaw as any).images as unknown as string);
        images = Array.isArray(parsed) ? parsed : [];
      } catch {
        images = [];
      }
    }

    const gemstone: Gemstone = {
      id: gemstoneRaw.id,
      name: gemstoneRaw.name,
      description: gemstoneRaw.description || '',
      price: Number(gemstoneRaw.price || 0),
      salePrice: gemstoneRaw.salePrice ? Number(gemstoneRaw.salePrice) : null,
      categoryId: gemstoneRaw.categoryId,
      images,
      weight: gemstoneRaw.weight ?? null,
      dimensions: gemstoneRaw.dimensions ?? null,
      clarity: gemstoneRaw.clarity ?? null,
      color: gemstoneRaw.color ?? null,
      cut: gemstoneRaw.cut ?? null,
      origin: gemstoneRaw.origin ?? null,
      certificate: gemstoneRaw.certificate ?? null,
      stockCount: gemstoneRaw.stockCount ?? 0,
      stockQuantity: gemstoneRaw.stockQuantity ?? 0,
      lowStockThreshold: gemstoneRaw.lowStockThreshold ?? 0,
      featured: Boolean(gemstoneRaw.featured),
      active: Boolean(gemstoneRaw.active),
      createdAt: (gemstoneRaw.createdAt as any)?.toISOString?.() ?? String(gemstoneRaw.createdAt),
      updatedAt: (gemstoneRaw.updatedAt as any)?.toISOString?.() ?? String(gemstoneRaw.updatedAt),
      category: gemstoneRaw.category
        ? { id: gemstoneRaw.category.id, name: gemstoneRaw.category.name }
        : null,
    } as Gemstone;

    const relatedRaw = await prisma.gemstone.findMany({
      where: {
        active: true,
        id: { not: numericId },
        categoryId: gemstoneRaw.categoryId,
      },
      orderBy: { createdAt: 'desc' },
      take: 4,
    });

    const relatedProducts: Gemstone[] = relatedRaw.map((g: any) => {
      let imgs: string[] = [];
      if (Array.isArray(g.images)) imgs = g.images;
      else if (typeof g.images === 'string') {
        try {
          const parsed = JSON.parse(g.images);
          imgs = Array.isArray(parsed) ? parsed : [];
        } catch {
          imgs = [];
        }
      }
      return {
        id: g.id,
        name: g.name,
        description: g.description || '',
        price: Number(g.price || 0),
        salePrice: g.salePrice ? Number(g.salePrice) : null,
        categoryId: g.categoryId,
        images: imgs,
        stockCount: g.stockCount ?? 0,
        stockQuantity: g.stockQuantity ?? 0,
        lowStockThreshold: g.lowStockThreshold ?? 0,
        featured: Boolean(g.featured),
        active: Boolean(g.active),
        createdAt: g.createdAt?.toISOString?.() ?? String(g.createdAt),
        updatedAt: g.updatedAt?.toISOString?.() ?? String(g.updatedAt),
        category: gemstone.category,
      } as Gemstone;
    });

    return {
      props: {
        gemstone,
        relatedProducts,
      },
    };
    } catch (error) {
    console.error('Error fetching product data:', error);
    return { notFound: true };
  }
};

const ProductDetail: React.FC<ProductDetailProps> = ({ gemstone, relatedProducts }) => {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  if (!gemstone) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto py-12 px-4">
          <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-6">The product you&apos;re looking for doesn&apos;t exist.</p>
            <Link
              href="/shop"
              className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              Continue Shopping
          </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const processedImages = parseImages(gemstone.images);

  return (
    <Layout
      title={`${gemstone.name} | Shankarmala`}
      description={gemstone.description}
    >
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-6">
            {/* Main Image */}
            <div className="aspect-square bg-gray-100 rounded-3xl overflow-hidden">
              <Image
                src={processedImages[selectedImage] || '/images/placeholder-gemstone.jpg'}
                alt={gemstone.name}
                width={600}
                height={600}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Thumbnail Images */}
            {processedImages.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {processedImages.map((image, index) => (
                <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-gray-100 rounded-xl overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-amber-500' : 'border-transparent'
                  }`}
                >
                  <Image
                      src={image}
                      alt={`${gemstone.name} - Image ${index + 1}`}
                      width={150}
                      height={150}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-8">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm text-gray-500">
              <Link href="/" className="hover:text-amber-600">Home</Link>
              <span>/</span>
              <Link href="/shop" className="hover:text-amber-600">Shop</Link>
              <span>/</span>
              <span className="text-gray-900">{gemstone.name}</span>
            </nav>

          {/* Product Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                {gemstone.featured && (
                  <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Featured
                  </span>
                )}
                {gemstone.category && (
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    {gemstone.category.name}
                  </span>
                )}
            </div>

              <h1 className="text-4xl font-bold text-gray-900">{gemstone.name}</h1>
              
              <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-amber-600">
                  ${gemstone.price.toLocaleString()}
              </span>
                {gemstone.salePrice && (
                  <span className="text-xl text-gray-500 line-through">
                    ${gemstone.salePrice.toLocaleString()}
                </span>
              )}
            </div>

              <p className="text-gray-600 leading-relaxed">{gemstone.description}</p>
            </div>

            {/* Specifications */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Specifications</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {gemstone.weight && (
                  <div>
                    <span className="font-medium text-gray-700">Weight:</span>
                    <span className="ml-2 text-gray-600">{gemstone.weight} carats</span>
                  </div>
                )}
                {gemstone.dimensions && (
                  <div>
                    <span className="font-medium text-gray-700">Dimensions:</span>
                    <span className="ml-2 text-gray-600">{gemstone.dimensions}</span>
                  </div>
                )}
                {gemstone.clarity && (
                  <div>
                    <span className="font-medium text-gray-700">Clarity:</span>
                    <span className="ml-2 text-gray-600">{gemstone.clarity}</span>
                  </div>
                )}
                {gemstone.color && (
                  <div>
                    <span className="font-medium text-gray-700">Color:</span>
                    <span className="ml-2 text-gray-600">{gemstone.color}</span>
                  </div>
                )}
                {gemstone.cut && (
                  <div>
                    <span className="font-medium text-gray-700">Cut:</span>
                    <span className="ml-2 text-gray-600">{gemstone.cut}</span>
                  </div>
                )}
                {gemstone.origin && (
                  <div>
                    <span className="font-medium text-gray-700">Origin:</span>
                    <span className="ml-2 text-gray-600">{gemstone.origin}</span>
                  </div>
                )}
                {gemstone.certificate && (
                  <div>
                    <span className="font-medium text-gray-700">Certificate:</span>
                    <span className="ml-2 text-gray-600">{gemstone.certificate}</span>
                </div>
              )}
              </div>
            </div>

            {/* Stock Status */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Availability:</span>
                {gemstone.stockCount > 0 ? (
                  <span className="text-sm text-green-600 font-medium">
                    In Stock ({gemstone.stockCount} available)
                  </span>
                ) : (
                  <span className="text-sm text-red-600 font-medium">Out of Stock</span>
                )}
              </div>
            </div>

            {/* Add to Cart Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Quantity:</label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  {[...Array(Math.min(10, gemstone.stockCount))].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-4">
                <button
                  className="flex-1 bg-amber-600 text-white py-3 px-6 rounded-lg hover:bg-amber-700 transition-colors font-semibold"
                  disabled={gemstone.stockCount === 0 || adding}
                  onClick={async () => {
                    try {
                      setAdding(true);
                      const res = await apiClient.post('/api/cart/add', {
                        productId: gemstone.id,
                        quantity,
                      });
                      if (!res.ok) throw new Error('Failed to add to cart');
                    } catch (e) {
                      // no-op UI toast here to keep code minimal
                    } finally {
                      setAdding(false);
                    }
                  }}
                >
                  {adding ? 'Adding...' : 'Add to Cart'}
                </button>
                <button
                  className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  disabled={gemstone.stockCount === 0 || adding}
                  onClick={async () => {
                    try {
                      setAdding(true);
                      const res = await apiClient.post('/api/cart/add', {
                        productId: gemstone.id,
                        quantity,
                      });
                      if (!res.ok) throw new Error('Failed');
                      window.location.href = '/cart';
                    } finally {
                      setAdding(false);
                    }
                  }}
                >
                  Buy Now
                </button>
                <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="border-t pt-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">GIA Certified</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">Free Shipping</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">30-Day Returns</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">Secure Payment</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">You may also like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="group block"
                >
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="aspect-square overflow-hidden">
                    <Image
                        src={getFirstImage(product.images)}
                        alt={product.name}
                      width={300}
                      height={300}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-2xl font-bold text-amber-600">
                        ${product.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetail;
