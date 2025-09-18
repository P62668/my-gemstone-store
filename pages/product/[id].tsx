import React, { useState, useMemo, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Layout from '../../components/Layout';
import PageRenderer from '../../components/PageRenderer';
import { prisma } from '../../lib/prisma';
import Image from 'next/image';
import { Star, Heart, Share2, Truck, Shield, RotateCcw, Gem, MapPin, FileText, Eye, Ruler, Scale } from 'lucide-react';
import { useCart } from '../../components/context/CartContext';
import { useWishlist } from '../../components/context/WishlistContext';
import { toast } from 'react-hot-toast';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Link from 'next/link';
import LuxuryButton from '../../components/ui/LuxuryButton';
import LuxuryCard from '../../components/ui/LuxuryCard';

interface ProductPageProps {
  product: {
    id: number;
    name: string;
    description: string;
    price: number;
    salePrice?: number;
    images: string[];
    weight?: number;
    dimensions?: string;
    clarity?: string;
    color?: string;
    cut?: string;
    origin?: string;
    certificate?: string;
    stockCount: number;
    featured?: boolean;
    dynamicContent?: any[];
    category?: {
      id: number;
      name: string;
    };
  } | null;
  relatedProducts: any[];
  error?: string;
}

const ProductPage: React.FC<ProductPageProps> = ({ product, relatedProducts, error }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (product) {
      setIsWishlisted(isInWishlist(product.id));
    }
  }, [product, isInWishlist]);

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-white">
          <div className="text-center luxury-card p-12 rounded-3xl shadow-xl">
            <h1 className="text-2xl font-bold text-gray-800 mb-4 luxury-font-serif">Product Not Found</h1>
            <p className="text-gray-600 luxury-font-sans">{error}</p>
            <Link href="/shop" className="mt-6 inline-block">
              <LuxuryButton variant="primary" size="md">
                Back to Shop
              </LuxuryButton>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-white">
          <div className="text-center luxury-card p-12 rounded-3xl shadow-xl">
            <h1 className="text-2xl font-bold text-gray-800 mb-4 luxury-font-serif">Product Not Found</h1>
            <p className="text-gray-600 luxury-font-sans">The product you are looking for does not exist.</p>
            <Link href="/shop" className="mt-6 inline-block">
              <LuxuryButton variant="primary" size="md">
                Back to Shop
              </LuxuryButton>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // Parse dynamic content if it exists
  let dynamicContent = product.dynamicContent;
  if (dynamicContent && typeof dynamicContent === 'string') {
    try {
      dynamicContent = JSON.parse(dynamicContent);
    } catch (e) {
      dynamicContent = [];
    }
  }

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      price: product.salePrice || product.price,
    }, quantity);
    toast.success('Added to cart!');
  };

  const handleAddToWishlist = () => {
    addToWishlist(product.id);
    setIsWishlisted(true);
    toast.success('Added to wishlist!');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const isInStock = product.stockCount > 0;
  const isLowStock = product.stockCount <= 5 && product.stockCount > 0;
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercentage = hasDiscount ? Math.round(((product.price - product.salePrice!) / product.price) * 100) : 0;

  return (
    <Layout>
      <Head>
        <title>{product.name} - Shankarmala Gemstones</title>
        <meta name="description" content={product.description} />
      </Head>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumb 
          items={[
            { label: 'Home', href: '/' },
            { label: 'Shop', href: '/shop' },
            { label: product.category?.name || 'Category', href: product.category ? `/categories/${product.category.id}` : '/shop' },
            { label: product.name }
          ]} 
          className="mb-6"
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <div>
            <div className="relative aspect-square bg-gradient-to-br from-white to-stone-50 rounded-3xl overflow-hidden shadow-xl mb-4 border border-stone-100">
              <Image 
                src={product.images[selectedImage]} 
                alt={product.name} 
                layout="fill" 
                objectFit="cover" 
                className="transition-transform duration-700 hover:scale-105"
              />
              {/* Badges */}
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                {product.featured && (
                  <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                    Featured
                  </span>
                )}
                {isLowStock && isInStock && (
                  <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                    Low Stock
                  </span>
                )}
                {hasDiscount && (
                  <span className="bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                    {discountPercentage}% OFF
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square bg-gradient-to-br from-white to-stone-50 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                    selectedImage === index ? 'border-amber-500 shadow-lg' : 'border-stone-200 hover:border-amber-300'
                  }`}
                >
                  <Image src={image} alt={`${product.name} ${index + 1}`} layout="fill" objectFit="cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div>
            <h1 className="text-4xl font-bold text-amber-900 mb-4 luxury-font-serif">{product.name}</h1>
            
            <div className="flex items-center gap-2 mb-6">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />
                ))}
              </div>
              <span className="text-gray-600 luxury-font-sans">(24 reviews)</span>
            </div>

            <div className="mb-8">
              {hasDiscount ? (
                <div className="flex items-baseline gap-4">
                  <span className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent luxury-font-serif">
                    ₹{product.salePrice!.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-2xl text-gray-500 line-through luxury-font-sans">
                    ₹{product.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="bg-gradient-to-r from-red-100 to-rose-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold luxury-font-sans">
                    Save {discountPercentage}%
                  </span>
                </div>
              ) : (
                <span className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent luxury-font-serif">
                  ₹{product.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              )}
            </div>

            <p className="text-gray-700 mb-8 luxury-font-sans text-lg leading-relaxed">
              {product.description}
            </p>

            {/* Product Specifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {product.weight && (
                <LuxuryCard className="p-5 flex items-center">
                  <Scale className="text-amber-600 w-6 h-6 mr-3" />
                  <div>
                    <span className="text-gray-500 text-sm luxury-font-sans">Weight</span>
                    <span className="font-semibold block luxury-font-serif">{product.weight} carats</span>
                  </div>
                </LuxuryCard>
              )}
              {product.dimensions && (
                <LuxuryCard className="p-5 flex items-center">
                  <Ruler className="text-amber-600 w-6 h-6 mr-3" />
                  <div>
                    <span className="text-gray-500 text-sm luxury-font-sans">Dimensions</span>
                    <span className="font-semibold block luxury-font-serif">{product.dimensions}</span>
                  </div>
                </LuxuryCard>
              )}
              {product.clarity && (
                <LuxuryCard className="p-5 flex items-center">
                  <Eye className="text-amber-600 w-6 h-6 mr-3" />
                  <div>
                    <span className="text-gray-500 text-sm luxury-font-sans">Clarity</span>
                    <span className="font-semibold block luxury-font-serif">{product.clarity}</span>
                  </div>
                </LuxuryCard>
              )}
              {product.color && (
                <LuxuryCard className="p-5 flex items-center">
                  <Gem className="text-amber-600 w-6 h-6 mr-3" />
                  <div>
                    <span className="text-gray-500 text-sm luxury-font-sans">Color</span>
                    <span className="font-semibold block luxury-font-serif">{product.color}</span>
                  </div>
                </LuxuryCard>
              )}
              {product.cut && (
                <LuxuryCard className="p-5 flex items-center">
                  <Star className="text-amber-600 w-6 h-6 mr-3" />
                  <div>
                    <span className="text-gray-500 text-sm luxury-font-sans">Cut</span>
                    <span className="font-semibold block luxury-font-serif">{product.cut}</span>
                  </div>
                </LuxuryCard>
              )}
              {product.origin && (
                <LuxuryCard className="p-5 flex items-center">
                  <MapPin className="text-amber-600 w-6 h-6 mr-3" />
                  <div>
                    <span className="text-gray-500 text-sm luxury-font-sans">Origin</span>
                    <span className="font-semibold block luxury-font-serif">{product.origin}</span>
                  </div>
                </LuxuryCard>
              )}
              {product.certificate && (
                <LuxuryCard className="p-5 flex items-center">
                  <FileText className="text-amber-600 w-6 h-6 mr-3" />
                  <div>
                    <span className="text-gray-500 text-sm luxury-font-sans">Certificate</span>
                    <span className="font-semibold block luxury-font-serif">{product.certificate}</span>
                  </div>
                </LuxuryCard>
              )}
            </div>

            {/* Stock Status */}
            <div className="mb-8">
              {isInStock ? (
                <div className="flex items-center text-green-600">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="font-semibold luxury-font-sans">In Stock</span>
                  {isLowStock && (
                    <span className="ml-2 text-amber-600 luxury-font-sans">Only {product.stockCount} left!</span>
                  )}
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <span className="font-semibold luxury-font-sans">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Actions */}
            {isInStock && (
              <div className="flex flex-wrap gap-4 mb-10">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 text-gray-600 hover:bg-gray-100 transition-colors luxury-font-sans"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-4 py-3 luxury-font-sans">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-3 text-gray-600 hover:bg-gray-100 transition-colors luxury-font-sans"
                  >
                    +
                  </button>
                </div>
                
                <LuxuryButton
                  onClick={handleAddToCart}
                  className="flex-1"
                >
                  Add to Cart
                </LuxuryButton>
                
                <button
                  onClick={handleAddToWishlist}
                  className={`p-3 rounded-lg border transition-all duration-300 ${
                    isWishlisted 
                      ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' 
                      : 'border-gray-300 hover:bg-gray-50 hover:border-amber-300'
                  }`}
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart className={`${isWishlisted ? 'fill-current' : ''}`} />
                </button>
                
                <button
                  onClick={handleShare}
                  className="p-3 rounded-lg border border-gray-300 hover:bg-gray-50 hover:border-amber-300 transition-all duration-300"
                  aria-label="Share product"
                >
                  <Share2 />
                </button>
              </div>
            )}

            {/* Additional Info */}
            <div className="border-t border-gray-200 pt-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 p-3 rounded-full">
                    <Truck className="text-amber-600 w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-semibold luxury-font-serif">Free Shipping</span>
                    <span className="block text-gray-600 text-sm luxury-font-sans">on orders over ₹50,000</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 p-3 rounded-full">
                    <Shield className="text-amber-600 w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-semibold luxury-font-serif">GIA Certified</span>
                    <span className="block text-gray-600 text-sm luxury-font-sans">Authenticity guaranteed</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 p-3 rounded-full">
                    <RotateCcw className="text-amber-600 w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-semibold luxury-font-serif">30-Day Returns</span>
                    <span className="block text-gray-600 text-sm luxury-font-sans">Hassle-free returns</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Content Section */}
        {dynamicContent && dynamicContent.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-amber-900 mb-8 luxury-font-serif">About This Gemstone</h2>
            <LuxuryCard className="p-8">
              <PageRenderer content={dynamicContent} />
            </LuxuryCard>
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-amber-900 mb-8 luxury-font-serif">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <LuxuryCard key={relatedProduct.id} className="overflow-hidden transition-all duration-500 hover:-translate-y-2">
                  <div className="relative h-48">
                    <Image 
                      src={Array.isArray(relatedProduct.images) ? relatedProduct.images[0] : relatedProduct.images || '/images/placeholder-gemstone.jpg'} 
                      alt={relatedProduct.name} 
                      layout="fill" 
                      objectFit="cover" 
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-amber-900 mb-2 truncate luxury-font-serif">{relatedProduct.name}</h3>
                    <p className="text-amber-600 font-bold luxury-font-serif">
                      ₹{relatedProduct.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <Link href={`/product/${relatedProduct.id}`} className="mt-4 inline-block">
                      <LuxuryButton variant="secondary" size="sm" className="w-full">
                        View Details
                      </LuxuryButton>
                    </Link>
                  </div>
                </LuxuryCard>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params || {};

  try {
    if (typeof id !== 'string') {
      return {
        props: {
          product: null,
          relatedProducts: [],
          error: 'Invalid product ID',
        },
      };
    }

    const productId = parseInt(id);

    // Fetch product with category information
    const product = await prisma.gemstone.findUnique({
      where: {
        id: productId,
        active: true,
      },
      include: {
        category: true,
      },
    });

    if (!product) {
      return {
        props: {
          product: null,
          relatedProducts: [],
          error: 'Product not found',
        },
      };
    }

    // Parse images
    let images: string[] = [];
    if (typeof product.images === 'string') {
      try {
        images = JSON.parse(product.images);
      } catch (e) {
        images = [product.images];
      }
    } else if (Array.isArray(product.images)) {
      images = product.images;
    } else {
      images = ['/images/placeholder-gemstone.jpg'];
    }

    // Fetch related products (from same category)
    const relatedProducts = await prisma.gemstone.findMany({
      where: {
        categoryId: product.categoryId,
        id: {
          not: product.id,
        },
        active: true,
      },
      take: 4,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Check for dynamic product page content
    const dynamicPage = await prisma.page.findFirst({
      where: {
        slug: `product-${productId}`,
        status: 'published',
      },
    });

    return {
      props: {
        product: {
          ...product,
          images,
          dynamicContent: dynamicPage ? (typeof dynamicPage.content === 'string' ? JSON.parse(dynamicPage.content) : dynamicPage.content) : null,
        },
        relatedProducts: relatedProducts.map(rp => ({
          ...rp,
          images: typeof rp.images === 'string' ? JSON.parse(rp.images) : rp.images,
        })),
      },
    };
  } catch (error) {
    console.error('Error fetching product page:', error);
    return {
      props: {
        product: null,
        relatedProducts: [],
        error: 'Failed to load product page',
      },
    };
  }
};

export default ProductPage;