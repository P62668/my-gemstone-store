import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import type { PlaceholderValue } from 'next/dist/shared/lib/get-img-props';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  className?: string;
  priority?: boolean;
  quality?: number;
  onLoad?: () => void;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  style?: React.CSSProperties;
  placeholder?: PlaceholderValue;
  blurDataURL?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  fill = false,
  sizes,
  className = '',
  priority = false,
  quality = 75,
  onLoad,
  onError,
  style,
  placeholder = 'blur' as PlaceholderValue,
  blurDataURL = '/images/placeholder-blur.jpg'
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setLoaded(false);
    setError(false);
  }, [src]);

  const handleLoad = () => {
    setLoaded(true);
    onLoad?.();
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!error) {
      setError(true);
      setImgSrc('/images/placeholder-gemstone.jpg');
      onError?.(e);
    }
  };

  // For client-side only rendering to avoid hydration issues
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Render a placeholder on the server
    return (
      <div 
        className={`${className} bg-gray-200 animate-pulse`}
        style={{ 
          width: fill ? '100%' : width,
          height: fill ? '100%' : height,
          ...style
        }}
      />
    );
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      sizes={sizes}
      className={`${className} ${!loaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
      priority={priority}
      quality={quality}
      onLoad={handleLoad}
      onError={handleError}
      style={style}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
    />
  );
};

export default OptimizedImage;