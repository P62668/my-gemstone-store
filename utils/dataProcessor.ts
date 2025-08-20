import { parseImages, getFirstImage } from './imageUtils';

/**
 * Process gemstone data to ensure consistency and proper formatting
 */
export function processGemstoneData(gemstone: any) {
  if (!gemstone) return null;

  // Process images
  const processedImages = parseImages(gemstone.images);
  
  // Ensure stock consistency
  const stockCount = gemstone.stockCount || gemstone.stockQuantity || 0;
  const stockQuantity = gemstone.stockQuantity || gemstone.stockCount || 0;
  
  // Process dimensions if it's a JSON string
  let dimensions = gemstone.dimensions;
  if (typeof dimensions === 'string') {
    try {
      const parsed = JSON.parse(dimensions);
      dimensions = parsed;
    } catch {
      // Keep as string if parsing fails
    }
  }

  return {
    ...gemstone,
    images: processedImages,
    firstImage: getFirstImage(processedImages),
    stockCount,
    stockQuantity,
    dimensions,
    // Ensure price is a number
    price: Number(gemstone.price) || 0,
    salePrice: gemstone.salePrice ? Number(gemstone.salePrice) : null,
    // Ensure weight is a number
    weight: Number(gemstone.weight) || null,
    // Ensure active is boolean
    active: Boolean(gemstone.active),
    featured: Boolean(gemstone.featured),
  };
}

/**
 * Process multiple gemstones
 */
export function processGemstonesData(gemstones: any[]) {
  if (!Array.isArray(gemstones)) return [];
  
  return gemstones
    .map(processGemstoneData)
    .filter(Boolean); // Remove null entries
}

/**
 * Process category data
 */
export function processCategoryData(category: any) {
  if (!category) return null;

  return {
    ...category,
    active: Boolean(category.active),
  };
}

/**
 * Process order data
 */
export function processOrderData(order: any) {
  if (!order) return null;

  return {
    ...order,
    total: Number(order.total) || 0,
    // Process shipping address if it's a JSON string
    shippingAddress: typeof order.shippingAddress === 'string' 
      ? JSON.parse(order.shippingAddress) 
      : order.shippingAddress,
  };
}

/**
 * Process user data (remove sensitive information)
 */
export function processUserData(user: any) {
  if (!user) return null;

  const { password, ...safeUser } = user;
  
  return {
    ...safeUser,
    active: Boolean(safeUser.active),
  };
}

/**
 * Process cart item data
 */
export function processCartItemData(cartItem: any) {
  if (!cartItem) return null;

  return {
    ...cartItem,
    price: Number(cartItem.price) || 0,
    quantity: Number(cartItem.quantity) || 1,
  };
}

/**
 * Process wishlist item data
 */
export function processWishlistItemData(wishlistItem: any) {
  if (!wishlistItem) return null;

  return {
    ...wishlistItem,
  };
}

/**
 * Process review data
 */
export function processReviewData(review: any) {
  if (!review) return null;

  return {
    ...review,
    rating: Number(review.rating) || 0,
    verified: Boolean(review.verified),
  };
}

/**
 * Process homepage section data
 */
export function processHomepageSectionData(section: any) {
  if (!section) return null;

  return {
    ...section,
    active: Boolean(section.active),
    order: Number(section.order) || 0,
    content: typeof section.content === 'string' 
      ? JSON.parse(section.content) 
      : section.content,
  };
}

/**
 * Process banner data
 */
export function processBannerData(banner: any) {
  if (!banner) return null;

  return {
    ...banner,
    active: Boolean(banner.active),
    order: Number(banner.order) || 0,
  };
}

/**
 * Process testimonial data
 */
export function processTestimonialData(testimonial: any) {
  if (!testimonial) return null;

  return {
    ...testimonial,
    rating: Number(testimonial.rating) || 5,
    active: Boolean(testimonial.active),
  };
}

/**
 * Process FAQ data
 */
export function processFAQData(faq: any) {
  if (!faq) return null;

  return {
    ...faq,
    active: Boolean(faq.active),
    order: Number(faq.order) || 0,
  };
}

/**
 * Process press data
 */
export function processPressData(press: any) {
  if (!press) return null;

  return {
    ...press,
    active: Boolean(press.active),
  };
}

/**
 * Process address data
 */
export function processAddressData(address: any) {
  if (!address) return null;

  return {
    ...address,
    isDefault: Boolean(address.isDefault),
  };
}

/**
 * Process inventory data
 */
export function processInventoryData(inventory: any) {
  if (!inventory) return null;

  return {
    ...inventory,
    quantity: Number(inventory.quantity) || 0,
  };
}

/**
 * Process return data
 */
export function processReturnData(returnItem: any) {
  if (!returnItem) return null;

  return {
    ...returnItem,
    refundAmount: returnItem.refundAmount ? Number(returnItem.refundAmount) : null,
  };
}

/**
 * Process shipping data
 */
export function processShippingData(shipping: any) {
  if (!shipping) return null;

  return {
    ...shipping,
    price: Number(shipping.price) || 0,
    freeAbove: shipping.freeAbove ? Number(shipping.freeAbove) : null,
    active: Boolean(shipping.active),
  };
}

/**
 * Generic data processor that determines the type and applies appropriate processing
 */
export function processData(data: any, type?: string): any {
  if (!data) return null;

  if (Array.isArray(data)) {
    return data.map((item: any) => processData(item, type));
  }

  switch (type) {
    case 'gemstone':
      return processGemstoneData(data);
    case 'category':
      return processCategoryData(data);
    case 'order':
      return processOrderData(data);
    case 'user':
      return processUserData(data);
    case 'cartItem':
      return processCartItemData(data);
    case 'wishlistItem':
      return processWishlistItemData(data);
    case 'review':
      return processReviewData(data);
    case 'homepageSection':
      return processHomepageSectionData(data);
    case 'banner':
      return processBannerData(data);
    case 'testimonial':
      return processTestimonialData(data);
    case 'faq':
      return processFAQData(data);
    case 'press':
      return processPressData(data);
    case 'address':
      return processAddressData(data);
    case 'inventory':
      return processInventoryData(data);
    case 'return':
      return processReturnData(data);
    case 'shipping':
      return processShippingData(data);
    default:
      return data;
  }
}
