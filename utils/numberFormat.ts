// Utility function for consistent number formatting
// This ensures the same formatting on both server and client to prevent hydration errors

export const formatPrice = (amount: number): string => {
  // Use a consistent format that works on both server and client
  // Format: 250,000 (US format for consistency)
  return amount.toLocaleString('en-US');
};

export const formatPriceINR = (amount: number): string => {
  // Format: ₹2,50,000 (Indian format)
  return `₹${amount.toLocaleString('en-IN')}`;
};

export const formatPriceUSD = (amount: number): string => {
  // Format: $250,000 (US format)
  return `$${amount.toLocaleString('en-US')}`;
};
