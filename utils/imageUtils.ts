import React from 'react';

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
  if (!images) {
    return ['/images/placeholder-gemstone.jpg'];
  }

  // If it's already an array, filter out empty strings and return
  if (Array.isArray(images)) {
    const filteredImages = images.filter(img => img && typeof img === 'string' && img.trim() !== '');
    return filteredImages.length > 0 ? filteredImages : ['/images/placeholder-gemstone.jpg'];
  }

  // If it's a string, try to parse it as JSON
  if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images);
      if (Array.isArray(parsed)) {
        const filteredImages = parsed.filter(img => img && typeof img === 'string' && img.trim() !== '');
        return filteredImages.length > 0 ? filteredImages : ['/images/placeholder-gemstone.jpg'];
      }
    } catch (error) {
      console.warn('Failed to parse images JSON:', error);
    }
    
    // If parsing fails or result is empty, treat as single image
    if (images.trim()) {
      return [images];
    }
  }

  // Default fallback
  return ['/images/placeholder-gemstone.jpg'];
}

export function getFirstImage(images: any): string {
  const parsedImages = parseImages(images);
  return parsedImages[0] || '/images/placeholder-gemstone.jpg';
}

export function getImageCount(images: any): number {
  const parsedImages = parseImages(images);
  return parsedImages.length;
}
