import React from 'react';
import { Star } from 'lucide-react';

interface LuxuryRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  reviewCount?: number;
  className?: string;
}

const LuxuryRating: React.FC<LuxuryRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  showCount = false,
  reviewCount,
  className = '',
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className={`luxury-rating flex items-center ${className}`}>
      <div className="flex">
        {[...Array(maxRating)].map((_, i) => (
          <Star
            key={i}
            className={`${sizes[size]} ${
              i < Math.floor(rating) 
                ? 'luxury-rating-star filled' 
                : 'luxury-rating-star'
            }`}
          />
        ))}
      </div>
      {showCount && reviewCount !== undefined && (
        <span className="ml-2 text-sm text-luxury-text-tertiary">
          ({reviewCount})
        </span>
      )}
      {!showCount && (
        <span className="ml-2 text-sm text-luxury-text-tertiary">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default LuxuryRating;