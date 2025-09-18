import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Star, Eye, Sparkles, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFirstImage } from '../../utils/imageUtils';
import { formatPriceUSD } from '../../utils/numberFormat';
import { useCart } from '../../components/context/CartContext';
import { useWishlist } from '../../components/context/WishlistContext';
import { useUser } from '../../components/context/UserContext';
import dynamic from 'next/dynamic';
import LuxuryCard from './LuxuryCard';

// Dynamically import framer-motion components
const MotionDiv = dynamic(() => import('framer-motion').then(mod => mod.motion.div), { ssr: false });
const AnimatePresenceClient = dynamic(() => import('framer-motion').then(mod => mod.AnimatePresence), { ssr: false });

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  images: string[];
  category?: {
    name: string;
  };
  averageRating?: number;
  reviewCount?: number;
  discountPercentage?: number;
  isNew?: boolean;
  isFeatured?: boolean;
  isExclusive?: boolean;
  onQuickView?: (id: number) => void;
  onCompare?: (product: any) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  price,
  images,
  category,
  averageRating,
  reviewCount,
  discountPercentage,
  isNew,
  isFeatured,
  isExclusive,
  onQuickView,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();
  const { items: wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { user } = useUser();
  
  const isInWishlist = wishlist.some(item => item.gemstoneId === id);
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({ 
      id,
      price
    }, 1);
  };
  
  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isInWishlist) {
      removeFromWishlist(id);
    } else {
      addToWishlist(id);
    }
  };

  // Calculate discounted price if applicable
  const discountedPrice = discountPercentage 
    ? price * (1 - discountPercentage / 100)
    : price;

  return (
    <LuxuryCard 
      className="group rounded-3xl border border-stone-100 hover:shadow-2xl transition-all duration-500 relative overflow-hidden transform hover:-translate-y-2 luxury-hover-glow luxury-ripple luxury-card-enter"
      padding="none"
      rounded="3xl"
      border={true}
      shadow="xl"
      hoverEffect={true}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Premium Shine Effect for Luxury Design */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12 translate-x-full group-hover:-translate-x-full transition-transform duration-1000"></div>
      </div>
      
      {/* Premium Border Glow Effect */}
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 rounded-3xl shadow-[0_0_20px_5px_rgba(212,175,55,0.3)] luxury-glow"></div>
      </div>
      
      {/* Luxury Badges */}
      <div className="absolute top-5 left-5 z-10 flex flex-col gap-2">
        {isNew && (
          <span className="luxury-badge luxury-badge-gold flex items-center">
            <Sparkles className="w-3 h-3 mr-1" />
            New
          </span>
        )}
        {discountPercentage && discountPercentage > 0 && (
          <span className="luxury-badge luxury-badge-amber">
            -{discountPercentage}%
          </span>
        )}
        {isFeatured && (
          <span className="luxury-badge luxury-badge-gold">
            Featured
          </span>
        )}
        {isExclusive && (
          <span className="luxury-badge luxury-badge-amber">
            Exclusive
          </span>
        )}
      </div>

      <Link href={`/product/${id}`} className="block">
        {/* Product Image with Luxury Styling */}
        <div className="relative aspect-square overflow-hidden rounded-t-3xl">
          <Image
            src={getFirstImage(images)}
            alt={name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Premium Wishlist Button with Luxury Design */}
          <button
            onClick={handleWishlistToggle}
            className="absolute top-5 right-5 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-300 hover:shadow-xl transform hover:scale-110 group/btn luxury-icon-gold luxury-ripple"
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart 
              className={`w-5 h-5 transition-all duration-300 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-700 group-hover/btn:text-red-500'}`} 
            />
          </button>
          
          {/* Premium Rating with Luxury Design */}
          {averageRating && (
            <div className="absolute bottom-5 left-5 bg-black/70 backdrop-blur-sm text-white text-sm font-bold px-3 py-1.5 rounded-full flex items-center shadow-lg">
              <Star className="w-4 h-4 mr-1.5 fill-current text-amber-400" />
              <span>{averageRating.toFixed(1)}</span>
              {reviewCount && reviewCount > 0 && (
                <span className="ml-1.5 text-gray-300">({reviewCount})</span>
              )}
            </div>
          )}
        </div>
        
        {/* Product Info with Luxury Styling */}
        <div className="p-6">
          {category && (
            <p className="text-sm text-amber-600 font-medium mb-2 flex items-center luxury-font-serif">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              {category.name}
            </p>
          )}
          
          <h3 className="font-bold text-luxury-text-primary text-lg mb-3 line-clamp-2 group-hover:text-luxury-gold-dark transition-colors duration-300 luxury-font-serif">
            {name}
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold bg-gradient-to-r from-luxury-gold to-luxury-amber bg-clip-text text-transparent luxury-font-serif">
                  {formatPriceUSD(discountedPrice)}
                </span>
                {discountPercentage && discountPercentage > 0 && (
                  <span className="text-base text-gray-500 line-through">
                    {formatPriceUSD(price)}
                  </span>
                )}
              </div>
              {reviewCount && reviewCount > 0 && (
                <div className="flex items-center mt-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < Math.floor(averageRating || 0) ? 'text-amber-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 ml-1">
                    ({reviewCount})
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* Hover Actions with Luxury Design */}
      {typeof window !== 'undefined' ? (
        <AnimatePresenceClient>
          {isHovered && (
            <MotionDiv
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-6 left-6 right-6"
            >
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 group/btn relative px-5 py-3 luxury-button-primary hover:from-luxury-gold-dark hover:to-luxury-amber-dark transition-all duration-300 shadow-lg overflow-hidden transform hover:scale-105 luxury-ripple"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-luxury-gold-dark to-luxury-amber-dark opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></span>
                </button>
                <div className="flex flex-col gap-2">
                  {onQuickView && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        onQuickView(id);
                      }}
                      className="p-3 bg-white text-gray-700 rounded-xl shadow-lg hover:bg-gray-50 transition-all duration-300 hover:shadow-xl transform hover:scale-105 group/btn luxury-icon-gold luxury-ripple"
                      aria-label="Quick view"
                    >
                      <Eye className="w-5 h-5 group-hover/btn:text-amber-600 transition-colors" />
                    </button>
                  )}
                </div>
              </div>
            </MotionDiv>
          )}
        </AnimatePresenceClient>
      ) : (
        isHovered && (
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                className="flex-1 group/btn relative px-5 py-3 luxury-button-primary hover:from-luxury-gold-dark hover:to-luxury-amber-dark transition-all duration-300 shadow-lg overflow-hidden transform hover:scale-105 luxury-ripple"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-luxury-gold-dark to-luxury-amber-dark opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></span>
              </button>
              <div className="flex flex-col gap-2">
                {onQuickView && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      onQuickView(id);
                    }}
                    className="p-3 bg-white text-gray-700 rounded-xl shadow-lg hover:bg-gray-50 transition-all duration-300 hover:shadow-xl transform hover:scale-105 group/btn luxury-icon-gold luxury-ripple"
                    aria-label="Quick view"
                  >
                    <Eye className="w-5 h-5 group-hover/btn:text-amber-600 transition-colors" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      )}
    </LuxuryCard>
  );
};

export default ProductCard;