import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { useCart } from '../../components/context/CartContext';
import type { Gemstone as GemstoneType } from '../../interfaces';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import 'keen-slider/keen-slider.min.css';
import { useKeenSlider } from 'keen-slider/react';
import Head from 'next/head';
import { toast } from 'react-hot-toast';
import AddictiveFeatures from '../../components/ui/AddictiveFeatures';

interface Category {
  id: number;
  name: string;
  description?: string;
}

// Use GemstoneType from interfaces/index.ts for all product data
type Gemstone = GemstoneType & {
  images: string[];
  description?: string;
  categoryId?: number;
  category?: Category;
  origin?: string;
  sku?: string;
  mrp?: number;
  tags?: string[];
  type?: string;
  certification?: string;
  stockCount?: number;
  rating?: number;
  reviewCount?: number;
  discount?: number;
  flashSale?: boolean;
  views?: number;
  soldCount?: number;
};

// Loading skeleton component
const ProductSkeleton: React.FC = () => (
  <div className="max-w-7xl mx-auto py-12 px-4">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div className="space-y-6">
        <div className="aspect-square bg-gray-200 rounded-3xl animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
          <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
          <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded w-1/3 animate-pulse" />
        </div>
        <div className="space-y-3">
          <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
        </div>
        <div className="h-12 bg-gray-200 rounded w-full animate-pulse" />
      </div>
    </div>
  </div>
);

type Review = {
  id: number;
  gemstoneId: number;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

type RelatedGemstone = {
  id: number;
  name: string;
  type: string;
  price: number;
  images: string[];
};

const ProductDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const gemstoneId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '';
  const { addToCart } = useCart();
  const [gemstone, setGemstone] = useState<Gemstone | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  // Removed unused showZoom and zoomPosition
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistError, setWishlistError] = useState('');
  const [wishlistSuccess, setWishlistSuccess] = useState('');

  // Addictive features
  const [viewersCount, setViewersCount] = useState(0);
  const [socialProof, setSocialProof] = useState<{ name: string; action: string; time: string }[]>(
    [],
  );
  const [lastPurchased, setLastPurchased] = useState<{ name: string; time: string } | null>(null);
  const [showStockAlert, setShowStockAlert] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 2,
    minutes: 30,
    seconds: 0,
  });
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareSuccess, setCompareSuccess] = useState('');
  const [compareError, setCompareError] = useState('');
  const [isComparing, setIsComparing] = useState(false);
  // Check if product is in wishlist on load
  useEffect(() => {
    const checkWishlist = async () => {
      if (!gemstoneId) return;
      try {
        const res = await fetch('/api/users/wishlist');
        if (!res.ok) return;
        const data = await res.json();
        setWishlisted(
          data.some(
            (item: { gemstoneId: string | number }) =>
              String(item.gemstoneId) === String(gemstoneId),
          ),
        );
      } catch {}
    };
    checkWishlist();
  }, [gemstoneId]);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [related, setRelated] = useState<RelatedGemstone[]>([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [relatedLoading, setRelatedLoading] = useState(false);
  // Review form state
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    comment: '',
    userName: '',
    userId: '',
  });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  // Delivery checker state
  const [pincode, setPincode] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState<string | null>(null);

  // Optionally, get user info from context or cookie (for demo, allow name input)
  // In production, use real user auth
  const handleReviewInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setReviewForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleReviewRating = (r: number) => {
    setReviewForm((f) => ({ ...f, rating: r }));
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');
    if (!reviewForm.userName || !reviewForm.rating || !reviewForm.comment) {
      setReviewError('Please fill all fields and select a rating.');
      return;
    }
    setReviewSubmitting(true);
    try {
      const res = await fetch(`/api/gemstones/${gemstoneId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: reviewForm.userId || 1, // For demo, use 1. Replace with real user id if available
          userName: reviewForm.userName,
          rating: reviewForm.rating,
          comment: reviewForm.comment,
        }),
      });
      if (!res.ok) throw new Error('Failed to submit review');
      setReviewForm({ rating: 0, comment: '', userName: '', userId: '' });
      setReviewSuccess('Thank you for your review!');
      fetchReviews();
    } catch {
      setReviewError('Failed to submit review. Please try again.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Delivery checker handler (mock API)
  const handleCheckDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeliveryStatus(null);
    if (!/^\d{6}$/.test(pincode)) {
      setDeliveryStatus('Please enter a valid 6-digit pincode.');
      return;
    }
    // Simulate API call
    setDeliveryStatus('Checking...');
    setTimeout(() => {
      if (['700001', '110001', '560001', '400001'].includes(pincode)) {
        setDeliveryStatus('Delivery available! Estimated: 2-4 days');
      } else {
        setDeliveryStatus('Delivery not available to this pincode.');
      }
    }, 900);
  };

  // Show sticky bar on scroll (mobile only)
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth > 640) return setShowStickyBar(false);
      const y = window.scrollY;
      setShowStickyBar(y > 220);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (gemstoneId) {
      fetchGemstone();
      fetchReviews();
      fetchRelated();
    }
    // eslint-disable-next-line
  }, [gemstoneId]);

  // Simulate live viewers
  useEffect(() => {
    if (gemstone) {
      const interval = setInterval(() => {
        setViewersCount((prev) => {
          const change = Math.floor(Math.random() * 3) - 1;
          return Math.max(12, Math.min(25, prev + change));
        });
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [gemstone]);

  // Social proof simulation
  useEffect(() => {
    if (gemstone) {
      const names = ['Sarah', 'Mike', 'Emma', 'David', 'Lisa', 'John', 'Anna', 'Tom'];
      const actions = ['purchased', 'added to cart', 'viewed', 'wishlisted'];

      const interval = setInterval(() => {
        const newActivity = {
          name: names[Math.floor(Math.random() * names.length)],
          action: actions[Math.floor(Math.random() * actions.length)],
          time: 'just now',
        };

        setSocialProof((prev) => [newActivity, ...prev.slice(0, 4)]);
      }, 8000);

      return () => clearInterval(interval);
    }
  }, [gemstone]);

  // Stock alert
  useEffect(() => {
    if (gemstone && gemstone.stockCount && gemstone.stockCount < 5) {
      const timer = setTimeout(() => {
        setShowStockAlert(true);
        toast.error(`Only ${gemstone.stockCount} left in stock!`);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [gemstone]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Last purchase simulation
  useEffect(() => {
    if (gemstone && Math.random() > 0.7) {
      setLastPurchased({
        name: ['Sarah', 'Mike', 'Emma', 'David'][Math.floor(Math.random() * 4)],
        time: '2 minutes ago',
      });
    }
  }, [gemstone]);

  const fetchGemstone = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/gemstones/${gemstoneId}`);
      if (!res.ok) throw new Error('Gemstone not found');
      const data = await res.json();
      setGemstone(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    setReviewLoading(true);
    try {
      const res = await fetch(`/api/gemstones/${gemstoneId}/reviews`);
      if (!res.ok) throw new Error('Failed to fetch reviews');
      const data = await res.json();
      setReviews(data);
    } catch {
      setReviews([]);
    } finally {
      setReviewLoading(false);
    }
  };

  const fetchRelated = async () => {
    setRelatedLoading(true);
    try {
      const res = await fetch(`/api/gemstones/${gemstoneId}?related=true`);
      if (!res.ok) throw new Error('Failed to fetch related');
      const data = await res.json();
      setRelated(data);
    } catch {
      setRelated([]);
    } finally {
      setRelatedLoading(false);
    }
  };

  const triggerGemConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 80,
      origin: { y: 0.7 },
      shapes: ['circle', 'square'],
      colors: ['#FFD700', '#E0B0FF', '#B9F2FF', '#FFB6C1', '#FFF8DC'],
    });
  };

  const handleAddToCart = async () => {
    if (gemstone) {
      setIsAddingToCart(true);
      triggerGemConfetti();
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      addToCart(gemstone, quantity);
      setIsAddingToCart(false);
    }
  };

  // Add/remove from wishlist with API
  const handleWishlist = async () => {
    if (!gemstone) return;
    setWishlistLoading(true);
    setWishlistError('');
    setWishlistSuccess('');
    try {
      if (!wishlisted) {
        // Add to wishlist
        const res = await fetch('/api/users/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gemstoneId: gemstone.id }),
        });
        if (!res.ok) throw new Error('Failed to add to wishlist');
        setWishlisted(true);
        setWishlistSuccess('Added to wishlist!');
      } else {
        // Remove from wishlist
        // Find the wishlist item id first
        const resList = await fetch('/api/users/wishlist');
        const list = resList.ok ? await resList.json() : [];
        const item = list.find(
          (i: { gemstoneId: string | number }) => String(i.gemstoneId) === String(gemstone.id),
        );
        if (!item) throw new Error('Wishlist item not found');
        const res = await fetch('/api/users/wishlist', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item.id }),
        });
        if (!res.ok) throw new Error('Failed to remove from wishlist');
        setWishlisted(false);
        setWishlistSuccess('Removed from wishlist.');
      }
    } catch (err) {
      setWishlistError((err as Error).message || 'Wishlist action failed');
    } finally {
      setWishlistLoading(false);
      setTimeout(() => {
        setWishlistSuccess('');
        setWishlistError('');
      }, 2000);
    }
  };

  const handleCompare = async () => {
    if (!gemstone) return;
    setCompareLoading(true);
    setCompareError('');
    setCompareSuccess('');
    try {
      // Store in localStorage for comparison
      const compareList = JSON.parse(localStorage.getItem('compareList') || '[]');
      const exists = compareList.find((item: any) => item.id === gemstone.id);

      if (!exists) {
        compareList.push({
          id: gemstone.id,
          name: gemstone.name,
          price: gemstone.price,
          type: gemstone.type,
          image: gemstone.images?.[0] || '/images/placeholder-gemstone.jpg',
        });
        localStorage.setItem('compareList', JSON.stringify(compareList));
        setIsComparing(true);
        setCompareSuccess('Added to comparison!');
      } else {
        // Remove from comparison
        const updatedList = compareList.filter((item: any) => item.id !== gemstone.id);
        localStorage.setItem('compareList', JSON.stringify(updatedList));
        setIsComparing(false);
        setCompareSuccess('Removed from comparison.');
      }
    } catch (err) {
      setCompareError((err as Error).message || 'Comparison action failed');
    } finally {
      setCompareLoading(false);
      setTimeout(() => {
        setCompareSuccess('');
        setCompareError('');
      }, 2000);
    }
  };

  // Check if product is in comparison list
  useEffect(() => {
    if (gemstone) {
      const compareList = JSON.parse(localStorage.getItem('compareList') || '[]');
      setIsComparing(compareList.some((item: any) => item.id === gemstone.id));
    }
  }, [gemstone]);

  // Removed unused handleImageZoom and setZoomPosition

  const images = gemstone?.images ? gemstone.images : [];

  const [sliderRef] = useKeenSlider<HTMLDivElement>({
    slides: { perView: 1, spacing: 16 },
    loop: true,
    mode: 'free-snap',
    drag: true,
    rubberband: true,
    initial: selectedImage,
    slideChanged(s) {
      setSelectedImage(s.track.details.rel);
    },
  });

  // SEO structured data (JSON-LD)
  const seoJsonLd = gemstone
    ? {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: gemstone.name,
        image: gemstone.images?.[0] || '/images/placeholder-gemstone.jpg',
        description:
          gemstone.description ||
          `Buy ${gemstone.name} at Shankarmala Gemstore. 100% authentic, certified gemstones.`,
        sku: gemstone.sku,
        offers: {
          '@type': 'Offer',
          priceCurrency: 'INR',
          price: gemstone.price,
          availability:
            gemstone.stockCount && gemstone.stockCount > 0
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: gemstone.rating || 4.6,
          reviewCount: reviews.length || gemstone.reviewCount || 84,
        },
      }
    : null;

  if (loading) {
    return (
      <Layout title="Loading... - Kolkata Gems">
        <ProductSkeleton />
      </Layout>
    );
  }

  if (error || !gemstone) {
    return (
      <Layout title="Gemstone Not Found - Shankarmala">
        <div className="max-w-7xl mx-auto py-12 px-4">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-6xl mb-4">💎</div>
            <h1 className="text-2xl font-bold text-red-600 mb-4">Gemstone Not Found</h1>
            <p className="text-gray-600 mb-6">
              The gemstone you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <button
              onClick={() => router.push('/shop')}
              className="bg-amber-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-700 transition-all duration-200 hover:scale-105"
            >
              Back to Shop
            </button>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${gemstone.name} - Shankarmala`}>
      <Head>
        <title>{`${gemstone.name} - Shankarmala`}</title>
        <meta
          name="description"
          content={
            gemstone.description ||
            `Buy ${gemstone.name} at Shankarmala Gemstore. 100% authentic, certified gemstones.`
          }
        />
        <meta property="og:title" content={`${gemstone.name} - Shankarmala`} />
        <meta
          property="og:description"
          content={
            gemstone.description ||
            `Buy ${gemstone.name} at Shankarmala Gemstore. 100% authentic, certified gemstones.`
          }
        />
        <meta
          property="og:image"
          content={gemstone.images?.[0] || '/images/placeholder-gemstone.jpg'}
        />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={`https://shankarmala.com/product/${gemstone.id}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${gemstone.name} - Shankarmala`} />
        <meta
          name="twitter:description"
          content={gemstone.description || `Buy ${gemstone.name} at Shankarmala Gemstore.`}
        />
        <meta
          name="twitter:image"
          content={gemstone.images?.[0] || '/images/placeholder-gemstone.jpg'}
        />
        {seoJsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(seoJsonLd) }}
          />
        )}
      </Head>
      {/* Clean, subtle luxury background */}
      <div
        className="fixed inset-0 -z-30 bg-gradient-to-br from-white via-amber-50 to-amber-100"
        style={{ backgroundSize: '100% 100%' }}
      />
      {/* Hero + Breadcrumbs, clean and calm luxury */}
      <div
        className="relative max-w-4xl mx-auto pt-12 pb-12 px-4 sm:px-8 xl:px-16 flex flex-col gap-2"
        style={{ zIndex: 2 }}
      >
        <nav className="mb-6 flex items-center gap-2 text-sm text-amber-700/80 font-medium animate-fade-in-up whitespace-nowrap overflow-x-auto scrollbar-hide">
          <Link href="/shop" className="hover:underline hover:text-amber-900 transition-colors">
            Home
          </Link>
          <span className="mx-1">/</span>
          <Link href="/shop" className="hover:underline hover:text-amber-900 transition-colors">
            Shop
          </Link>
          <span className="mx-1">/</span>
          <span className="text-amber-900 font-bold">{gemstone.name}</span>
        </nav>
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,420px)] gap-10 xl:gap-16 items-start"
          style={{ zIndex: 2, position: 'relative' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Gallery */}
          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <motion.div
              ref={sliderRef}
              className="keen-slider aspect-square overflow-visible rounded-2xl shadow-xl border border-amber-100 bg-white/80 animate-fade-in cursor-zoom-in"
              style={{ perspective: '1000px', transition: 'box-shadow 0.3s' }}
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7, type: 'spring', bounce: 0.25 }}
              onClick={() => setShowImageModal(true)}
              tabIndex={0}
              aria-label="Open image gallery modal"
            >
              {images.map((img, i) => (
                <motion.div
                  key={i}
                  className="keen-slider__slide flex items-center justify-center relative group"
                  tabIndex={0}
                  aria-label={`View image ${i + 1}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(i);
                    setShowImageModal(true);
                  }}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelectedImage(i)}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.5, type: 'spring', bounce: 0.2 }}
                >
                  <Image
                    src={
                      typeof img === 'string' &&
                      (img.startsWith('/') || img.startsWith('http')) &&
                      img.trim() !== '' &&
                      !Array.isArray(img)
                        ? img
                        : '/images/placeholder-gemstone.jpg'
                    }
                    alt={gemstone.name}
                    width={600}
                    height={600}
                    className="w-full h-full object-cover transition-transform duration-700 shadow-xl rounded-2xl"
                    style={{
                      transform: selectedImage === i ? 'scale(1.06)' : 'scale(1)',
                      willChange: 'transform',
                    }}
                    loading="lazy"
                  />
                </motion.div>
              ))}
            </motion.div>
            {/* Thumbnails */}
            <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-2 -mx-2 px-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`aspect-square w-14 sm:w-16 h-14 sm:h-16 rounded-lg overflow-hidden border ${selectedImage === i ? 'border-amber-500 shadow-lg scale-105' : 'border-amber-100'} focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all duration-200 animate-fade-in`}
                  aria-label={`View image ${i + 1}`}
                >
                  <Image
                    src={img || '/images/placeholder-gemstone.jpg'}
                    alt={`Thumbnail ${i + 1}`}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>
          {/* Product Info Panel */}
          <div className="space-y-8 relative lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto lg:pr-2">
            {/* Addictive Features */}
            <AddictiveFeatures
              productId={gemstone?.id?.toString() || ''}
              productName={gemstone?.name || ''}
              price={gemstone?.price || 0}
              stockCount={gemstone?.stockCount}
              discount={gemstone?.discount}
            />

            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-amber-900 mb-2 leading-tight font-serif tracking-tight">
                {gemstone.name}
              </h1>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold tracking-wide">
                  {gemstone.type}
                </span>
                {gemstone.sku && (
                  <span className="inline-block px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
                    SKU: {gemstone.sku}
                  </span>
                )}
              </div>
              {/* Star Ratings */}
              <div
                className="flex items-center gap-2 mb-2"
                aria-label={`Rated ${gemstone.rating || 4.6} out of 5`}
              >
                {[1, 2, 3, 4].map((i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-amber-500 fill-amber-400"
                    viewBox="0 0 20 20"
                  >
                    <polygon points="10,1 12.59,7.36 19.51,7.36 13.97,11.64 16.56,18 10,13.72 3.44,18 6.03,11.64 0.49,7.36 7.41,7.36" />
                  </svg>
                ))}
                <svg className="w-5 h-5 text-amber-500 fill-amber-400" viewBox="0 0 20 20">
                  <defs>
                    <linearGradient id="half">
                      <stop offset="50%" stopColor="#f59e42" />
                      <stop offset="50%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                  <polygon
                    points="10,1 12.59,7.36 19.51,7.36 13.97,11.64 16.56,18 10,13.72 3.44,18 6.03,11.64 0.49,7.36 7.41,7.36"
                    fill="url(#half)"
                  />
                </svg>
                <span className="ml-2 text-amber-800 font-semibold">
                  {gemstone.rating || 4.6}{' '}
                  <span className="text-gray-500 font-normal">
                    ({reviews.length || gemstone.reviewCount || 84} reviews)
                  </span>
                </span>
              </div>
              {/* Price Section */}
              <div className="flex items-center gap-4 mb-4">
                <span className="text-3xl font-extrabold text-amber-700">
                  ₹{gemstone.price?.toLocaleString('en-IN') || '7,499'}
                </span>
                {gemstone.mrp && gemstone.mrp > gemstone.price && (
                  <span className="text-lg text-gray-400 line-through">
                    ₹{gemstone.mrp.toLocaleString('en-IN')}
                  </span>
                )}
                {gemstone.mrp && gemstone.mrp > gemstone.price && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-200 text-amber-900 text-xs font-semibold">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M9 14l6-6M15 10v4h-4" />
                    </svg>{' '}
                    {Math.round(((gemstone.mrp - gemstone.price) / gemstone.mrp) * 100)}% OFF
                  </span>
                )}
                {!gemstone.mrp && (
                  <span className="inline-block px-3 py-1 rounded-full bg-amber-200 text-amber-900 text-xs font-semibold tracking-wide">
                    Inclusive of all taxes
                  </span>
                )}
              </div>
              {/* Features */}
              <ul className="flex flex-wrap gap-3 text-sm text-gray-700/90 mb-2">
                <li className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>{' '}
                  Authenticity Certificate
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 22s8-4 8-10V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7c0 6 8 10 8 10z" />
                  </svg>{' '}
                  Energized & Lab-tested
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-amber-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <polygon points="12 2 15 8 22 9 17 14 18 21 12 18 6 21 7 14 2 9 9 8 12 2" />
                  </svg>{' '}
                  Astrological Benefits
                </li>
                {typeof gemstone.stockCount === 'number' && (
                  <li
                    className={`flex items-center gap-2 ${gemstone.stockCount > 0 ? 'text-green-700' : 'text-red-600'}`}
                  >
                    {gemstone.stockCount > 0 ? 'In Stock' : 'Out of Stock'}
                    <span className="ml-1">({gemstone.stockCount})</span>
                  </li>
                )}
              </ul>
              {/* Delivery Checker */}
              <form
                className="flex items-center gap-2 text-sm text-gray-700/90 mb-2"
                onSubmit={handleCheckDelivery}
                aria-label="Check delivery availability"
              >
                <svg
                  className="w-5 h-5 text-amber-700"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 17v-6a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v6" />
                  <circle cx="7.5" cy="17.5" r="2.5" />
                  <circle cx="16.5" cy="17.5" r="2.5" />
                </svg>
                <span>Delivery to</span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  minLength={6}
                  placeholder="Pincode"
                  className="w-24 px-2 py-1 rounded-lg border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-base bg-white"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/[^\d]/g, ''))}
                  aria-label="Enter pincode"
                  required
                />
                <button
                  type="submit"
                  className="px-3 py-1 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  Check
                </button>
                <span className="mx-2">|</span>
                <span>7-Day Easy Returns</span>
                <span className="mx-2">|</span>
                <span>
                  {gemstone.stockCount && gemstone.stockCount > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              </form>
              {deliveryStatus && (
                <div
                  className={`text-xs mt-1 ${deliveryStatus.includes('available') ? 'text-green-700' : 'text-red-600'}`}
                >
                  {deliveryStatus}
                </div>
              )}
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-2">
                {(gemstone.tags || ['wealth', 'shani dosh', 'saturn protection']).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
            {/* Add to Cart & Wishlist */}
            <div className="flex gap-3 items-center mt-2 mb-4">
              <div className="flex items-center gap-2">
                <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                  Qty:
                </label>
                <input
                  id="quantity"
                  type="number"
                  min={1}
                  max={10}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-14 px-2 py-1 rounded-lg border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-lg text-center bg-white/80"
                />
              </div>
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold shadow-md transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-amber-300/40 text-base"
                aria-label="Add to cart"
              >
                {isAddingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
              {/* Wishlist/Heart Button */}
              <button
                onClick={handleWishlist}
                aria-pressed={wishlisted}
                aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                className={`ml-2 p-3 rounded-full bg-white/80 border border-amber-200 shadow hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-400 ${wishlisted ? 'scale-110' : ''}`}
                disabled={wishlistLoading}
              >
                <svg
                  className={`w-6 h-6 ${wishlisted ? 'text-rose-500' : 'text-amber-400'}`}
                  fill={wishlisted ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 21C12 21 4 13.5 4 8.5C4 5.42 6.42 3 9.5 3C11.24 3 12.91 3.81 14 5.08C15.09 3.81 16.76 3 18.5 3C21.58 3 24 5.42 24 8.5C24 13.5 16 21 16 21H12Z"
                  />
                </svg>
              </button>
              {/* Compare Button */}
              <button
                onClick={handleCompare}
                aria-pressed={isComparing}
                aria-label={isComparing ? 'Remove from comparison' : 'Add to comparison'}
                className={`ml-2 p-3 rounded-full bg-white/80 border border-amber-200 shadow hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-400 ${isComparing ? 'scale-110' : ''}`}
                disabled={compareLoading}
              >
                <svg
                  className={`w-6 h-6 ${isComparing ? 'text-blue-500' : 'text-amber-400'}`}
                  fill={isComparing ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </button>
              {/* Wishlist feedback */}
              {wishlistSuccess && (
                <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-100 text-green-800 px-6 py-3 rounded-xl shadow-lg font-bold text-lg animate-fadeIn">
                  {wishlistSuccess}
                </div>
              )}
              {wishlistError && (
                <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-red-100 text-red-800 px-6 py-3 rounded-xl shadow-lg font-bold text-lg animate-fadeIn">
                  {wishlistError}
                </div>
              )}
              {/* Compare feedback */}
              {compareSuccess && (
                <div className="fixed top-32 left-1/2 transform -translate-x-1/2 z-50 bg-blue-100 text-blue-800 px-6 py-3 rounded-xl shadow-lg font-bold text-lg animate-fadeIn">
                  {compareSuccess}
                </div>
              )}
              {compareError && (
                <div className="fixed top-32 left-1/2 transform -translate-x-1/2 z-50 bg-red-100 text-red-800 px-6 py-3 rounded-xl shadow-lg font-bold text-lg animate-fadeIn">
                  {compareError}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Sticky Add-to-Cart Bar (Mobile) */}
      <div
        className={`fixed bottom-0 left-0 w-full z-40 bg-white/90 border-t border-amber-100 shadow-lg flex items-center justify-between px-4 py-3 gap-3 sm:hidden transition-transform duration-300 ${showStickyBar ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ backdropFilter: 'blur(8px)' }}
      >
        <div className="flex flex-col">
          <span className="text-lg font-bold text-amber-800">
            ₹{gemstone.price.toLocaleString('en-IN')}
          </span>
          <span className="text-xs text-gray-500">Incl. all taxes</span>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={isAddingToCart}
          className="px-5 py-2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold shadow-md transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-amber-300/40 text-base"
          aria-label="Add to cart"
        >
          {isAddingToCart ? 'Adding...' : 'Add to Cart'}
        </button>
        <button
          onClick={handleWishlist}
          aria-pressed={wishlisted}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`ml-2 p-2 rounded-full bg-white/80 border border-amber-200 shadow hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-400 ${wishlisted ? 'scale-110' : ''}`}
        >
          <svg
            className={`w-6 h-6 ${wishlisted ? 'text-rose-500' : 'text-amber-400'}`}
            fill={wishlisted ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 21C12 21 4 13.5 4 8.5C4 5.42 6.42 3 9.5 3C11.24 3 12.91 3.81 14 5.08C15.09 3.81 16.76 3 18.5 3C21.58 3 24 5.42 24 8.5C24 13.5 16 21 16 21H12Z"
            />
          </svg>
        </button>
        {/* Share Button */}
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: gemstone.name,
                url: window.location.href,
              });
            } else {
              navigator.clipboard.writeText(window.location.href);
              alert('Link copied!');
            }
          }}
          className="ml-2 p-2 rounded-full bg-white/80 border border-amber-200 shadow hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
          aria-label="Share product"
        >
          <svg
            className="w-6 h-6 text-amber-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 8a3 3 0 11-6 0 3 3 0 016 0zm6 8a3 3 0 11-6 0 3 3 0 016 0zm-6 4a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      </div>
      {/* Related Products Row (real data) */}
      <div className="max-w-4xl mx-auto px-4 sm:px-8 xl:px-16 pb-8 pt-8">
        <h2 className="text-lg font-bold text-amber-900 mb-4">You may also like</h2>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide">
          {relatedLoading ? (
            <div className="text-gray-500">Loading...</div>
          ) : related.length === 0 ? (
            <div className="text-gray-400 italic">No related products found.</div>
          ) : (
            related.map((gem) => (
              <div
                key={gem.id}
                className="min-w-[180px] max-w-[200px] bg-white/80 rounded-xl shadow border border-amber-100 p-3 flex flex-col items-center hover:shadow-lg transition-all duration-200 cursor-pointer"
                tabIndex={0}
                role="link"
                aria-label={`View ${gem.name}`}
                onClick={() => router.push(`/product/${gem.id}`)}
                onKeyDown={(e) =>
                  (e.key === 'Enter' || e.key === ' ') && router.push(`/product/${gem.id}`)
                }
              >
                <div className="aspect-square w-full rounded-lg bg-amber-50 flex items-center justify-center mb-2">
                  <Image
                    src={gem.images?.[0] || '/images/placeholder-gemstone.jpg'}
                    alt={gem.name}
                    width={80}
                    height={80}
                    className="w-20 h-20 object-contain"
                    loading="lazy"
                  />
                </div>
                <div className="text-sm font-semibold text-amber-900 mb-1">{gem.name}</div>
                <div className="text-xs text-gray-500 mb-1">{gem.type}</div>
                <div className="text-base font-bold text-amber-700">
                  ₹{gem.price.toLocaleString('en-IN')}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowImageModal(false)}
          >
            <div
              className="relative max-w-2xl w-full mx-auto p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-2 right-2 z-10 p-2 bg-white/80 rounded-full shadow hover:bg-white"
                onClick={() => setShowImageModal(false)}
                aria-label="Close image gallery"
              >
                <svg
                  className="w-6 h-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <div className="flex flex-col items-center">
                <Image
                  src={images[selectedImage] || '/images/placeholder-gemstone.jpg'}
                  alt={gemstone.name}
                  width={600}
                  height={600}
                  className="w-full max-h-[70vh] object-contain rounded-2xl shadow-xl bg-white"
                  loading="eager"
                />
                <div className="flex gap-2 mt-4 overflow-x-auto">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`aspect-square w-12 h-12 rounded-lg overflow-hidden border ${selectedImage === i ? 'border-amber-500 shadow-lg scale-105' : 'border-amber-100'} focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all duration-200 animate-fade-in`}
                      aria-label={`View image ${i + 1}`}
                    >
                      <Image
                        src={img || '/images/placeholder-gemstone.jpg'}
                        alt={`Thumbnail ${i + 1}`}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-8 xl:px-16 pb-8 pt-4">
        <h2 className="text-lg font-bold text-amber-900 mb-4">Customer Reviews</h2>
        {/* Review Form */}
        <form
          className="mb-8 bg-white/90 rounded-xl shadow border border-amber-100 p-5 max-w-lg"
          onSubmit={handleReviewSubmit}
          aria-label="Submit a review"
        >
          <div className="mb-3">
            <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              id="userName"
              name="userName"
              type="text"
              value={reviewForm.userName}
              onChange={handleReviewInput}
              className="w-full px-3 py-2 rounded-lg border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-base bg-white"
              required
              disabled={reviewSubmitting}
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleReviewRating(i)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center border ${reviewForm.rating >= i ? 'bg-amber-400 border-amber-500' : 'bg-gray-100 border-amber-100'} focus:outline-none focus:ring-2 focus:ring-amber-400`}
                  aria-label={`Rate ${i} star${i > 1 ? 's' : ''}`}
                  tabIndex={0}
                >
                  <svg
                    className="w-5 h-5"
                    fill={reviewForm.rating >= i ? '#f59e42' : 'none'}
                    stroke="#f59e42"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <polygon points="12 2 15 8 22 9 17 14 18 21 12 18 6 21 7 14 2 9 9 8 12 2" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
              Your Review
            </label>
            <textarea
              id="comment"
              name="comment"
              value={reviewForm.comment}
              onChange={handleReviewInput}
              className="w-full px-3 py-2 rounded-lg border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-base bg-white"
              rows={3}
              required
              disabled={reviewSubmitting}
            />
          </div>
          {reviewError && <div className="text-red-600 text-sm mb-2">{reviewError}</div>}
          {reviewSuccess && <div className="text-green-700 text-sm mb-2">{reviewSuccess}</div>}
          <button
            type="submit"
            className="mt-2 px-6 py-2 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-amber-300/40"
            disabled={reviewSubmitting}
            aria-busy={reviewSubmitting}
          >
            {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
        {/* Review List */}
        {reviewLoading ? (
          <div className="text-gray-500">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-gray-400 italic">No reviews yet.</div>
        ) : (
          <ul className="divide-y divide-amber-100">
            {reviews.map((r) => (
              <li key={r.id} className="py-4">
                <div className="flex items-center gap-2 mb-1">
                  {[...Array(Math.floor(r.rating))].map((_, i) => (
                    <svg
                      key={i}
                      className="w-4 h-4 text-amber-500 fill-amber-400"
                      viewBox="0 0 20 20"
                    >
                      <polygon points="10,1 12.59,7.36 19.51,7.36 13.97,11.64 16.56,18 10,13.72 3.44,18 6.03,11.64 0.49,7.36 7.41,7.36" />
                    </svg>
                  ))}
                  <span className="text-xs text-gray-600 ml-2">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="font-semibold text-amber-800">{r.userName}</div>
                <div className="text-gray-700 text-sm mt-1">{r.comment}</div>
                <div className="mt-1">
                  <a
                    href={`mailto:abuse@shankarmala.com?subject=Report%20Abuse%20Review%20ID%20${r.id}`}
                    className="text-xs text-blue-500 underline hover:text-blue-700"
                    tabIndex={0}
                    aria-label="Report abuse for this review"
                  >
                    Report abuse
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Minimal CSS for fade-in only */}
      <style>{`
        .animate-fade-in { animation: fade-in 1s cubic-bezier(.4,0,.2,1) both; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </Layout>
  );
};

export default ProductDetailPage;
