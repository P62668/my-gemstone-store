import React from 'react';

// Simple in-memory cache for image processing
const imageCache = new Map();
const CACHE_TTL = 60000; // 1 minute

/**
 * Safely get image source with fallback
 * Prevents 500 errors when image URLs are invalid
 */
export function getSafeImageSrc(imageSrc: string | null | undefined): string {
  // Default fallback
  const fallback = '/images/placeholder-gemstone.jpg';

  // If no image source, return fallback
  if (!imageSrc) return fallback;

  // If it's not a string, return fallback
  if (typeof imageSrc !== 'string') return fallback;

  // If it's empty or whitespace, return fallback
  if (imageSrc.trim() === '') return fallback;

  // If it's a base64 data URL, return as is
  if (imageSrc.startsWith('data:')) return imageSrc;

  // If it's a full URL (http/https), return as is
  if (imageSrc.startsWith('http://') || imageSrc.startsWith('https://')) return imageSrc;

  // If it starts with /, it's a relative path, return as is
  if (imageSrc.startsWith('/')) return imageSrc;

  // Otherwise, treat as relative path and add /
  return `/${imageSrc}`;
}

/**
 * Handle image error with fallback
 */
export function handleImageError(e: React.SyntheticEvent<HTMLImageElement, Event>): void {
  console.warn('Image failed to load:', e.currentTarget.src);
  e.currentTarget.src = '/images/placeholder-gemstone.jpg';
  e.currentTarget.onerror = null; // Prevent infinite loop
}

/**
 * Validate image URL format
 */
export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;

  // Allow data URLs
  if (url.startsWith('data:')) return true;

  // Allow http/https URLs
  if (url.startsWith('http://') || url.startsWith('https://')) return true;

  // Allow relative paths starting with /
  if (url.startsWith('/')) return true;

  return false;
}

/**
 * Utility functions for handling image data from the database
 */

export function parseImages(images: any): string[] {
  // Create cache key
  const cacheKey = typeof images === 'string' ? images : JSON.stringify(images);
  
  // Check cache first
  const cached = imageCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  if (!images) {
    const result = ['/images/placeholder-gemstone.jpg'];
    imageCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  }

  // If it's already an array, filter out empty strings and return
  if (Array.isArray(images)) {
    const filteredImages = images.filter(img => img && typeof img === 'string' && img.trim() !== '');
    const result = filteredImages.length > 0 ? filteredImages : ['/images/placeholder-gemstone.jpg'];
    imageCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  }

  // If it's a string, try to parse it as JSON
  if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images);
      if (Array.isArray(parsed)) {
        const filteredImages = parsed.filter(img => img && typeof img === 'string' && img.trim() !== '');
        const result = filteredImages.length > 0 ? filteredImages : ['/images/placeholder-gemstone.jpg'];
        imageCache.set(cacheKey, { data: result, timestamp: Date.now() });
        return result;
      }
    } catch (error) {
      console.warn('Failed to parse images JSON:', error);
    }
    
    // If parsing fails or result is empty, treat as single image
    if (images.trim()) {
      const result = [images];
      imageCache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    }
  }

  // Default fallback
  const result = ['/images/placeholder-gemstone.jpg'];
  imageCache.set(cacheKey, { data: result, timestamp: Date.now() });
  return result;
}

export function getFirstImage(images: any): string {
  const parsedImages = parseImages(images);
  return parsedImages[0] || '/images/placeholder-gemstone.jpg';
}

export function getImageCount(images: any): number {
  const parsedImages = parseImages(images);
  return parsedImages.length;
}

// Function to optimize image URLs for faster loading
export function optimizeImageUrl(url: string, width: number = 300, quality: number = 75): string {
  // Don't optimize external images or already optimized images
  if (!url || typeof url !== 'string') return '/images/placeholder-gemstone.jpg';
  
  // Return placeholder for empty URLs
  if (url.trim() === '') return '/images/placeholder-gemstone.jpg';
  
  // Don't optimize external images or already optimized images
  if (url.startsWith('http') || url.includes('?w=')) {
    return url;
  }
  
  // Add optimization parameters
  return `${url}?w=${width}&q=${quality}`;
}

// Enhanced function to generate responsive image sources with multiple formats
export function generateImageSrcSet(url: string): string {
  if (!url || typeof url !== 'string') return '';
  
  // Don't generate srcset for external images
  if (url.startsWith('http')) {
    return '';
  }
  
  // Generate srcset for different screen sizes and formats
  const widths = [300, 600, 900, 1200];
  return widths.map(width => `${optimizeImageUrl(url, width)} ${width}w`).join(', ');
}

// Enhanced function to get appropriate image sizes attribute
export function getImageSizes(): string {
  return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
}

// New function to preload critical images
export function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
}

// New function to batch preload images
export async function preloadImages(urls: string[]): Promise<void> {
  // Limit concurrent preloading to prevent overwhelming the browser
  const concurrencyLimit = 4;
  const results: Promise<void>[] = [];
  
  for (let i = 0; i < urls.length; i += concurrencyLimit) {
    const batch = urls.slice(i, i + concurrencyLimit);
    const batchPromises = batch.map(url => preloadImage(url));
    results.push(...batchPromises);
    // Wait for current batch to complete before starting next
    await Promise.all(batchPromises);
  }
  
  await Promise.all(results);
}

// New function to generate optimized image URLs with format selection
export function getOptimizedImageUrl(url: string, width: number = 300, quality: number = 75): string {
  // Don't optimize external images or already optimized images
  if (!url || typeof url !== 'string') return '/images/placeholder-gemstone.jpg';
  
  // Return placeholder for empty URLs
  if (url.trim() === '') return '/images/placeholder-gemstone.jpg';
  
  // Don't optimize external images
  if (url.startsWith('http')) {
    return url;
  }
  
  // Add optimization parameters
  return `${url}?w=${width}&q=${quality}`;
}
