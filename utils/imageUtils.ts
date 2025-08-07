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
