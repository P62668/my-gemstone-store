// Shared interfaces for app models

export interface User {
  id: number;
  name: string;
  email?: string;
  createdAt?: string;
  role?: string;
  profileImage?: string;
}

export interface Gemstone {
  id: number;
  name: string;
  type: string;
  description: string;
  price: number;
  images: string[];
  certification: string;
  active?: boolean;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
  categoryId?: number;
  category?: Category;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  profileImage?: string;
  order?: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Order {
  id: number;
  userId: number;
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  user?: User;
}

export interface OrderItem {
  id: number;
  orderId: number;
  gemstoneId: number;
  quantity: number;
  price: number;
  gemstone?: Gemstone;
}

export interface CartItem {
  id: number;
  gemstoneId: number;
  quantity: number;
  gemstone?: Gemstone;
}

export interface WishlistItem {
  id: number;
  userId: number;
  gemstoneId: number;
  createdAt: string;
  gemstone?: Gemstone;
  // Legacy properties for backward compatibility
  name?: string;
  image?: string;
}

export interface Review {
  id: number;
  gemstoneId: number;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  active: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Testimonial {
  id: number;
  name: string;
  content: string;
  active: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Press {
  id: number;
  title: string;
  content: string;
  active: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface HomepageSection {
  id: number;
  key: string;
  content: Record<string, unknown>;
  order: number;
  active: boolean;
  updatedAt: string;
}

export interface Address {
  id: number;
  userId: number;
  type: string;
  name: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  // Legacy properties for backward compatibility
  address?: string;
  zipCode?: string;
  phone?: string;
}

export interface RecentlyViewedItem {
  id: number;
  userId: number;
  gemstoneId: number;
  viewedAt: string;
  gemstone?: Gemstone;
  // Legacy properties for backward compatibility
  name?: string;
  image?: string;
}

export interface Notification {
  id: number;
  userId: number;
  message: string;
  read: boolean;
  createdAt: string;
  // Legacy property for backward compatibility
  date?: string;
}

export interface Analytics {
  totalSales: number;
  totalOrders: number;
  totalUsers: number;
  totalGemstones: number;
  topGemstones: { name: string; sales: number }[];
  salesByCategory: { category: string; sales: number }[];
  topUsers: { name: string; totalSpent: number; orders: number }[];
  recentOrders: { id: number; user: string; total: number; status: string; createdAt: string }[];
  monthlySales: { month: string; sales: number }[];
}

export interface HeroData {
  title?: string;
  subtitle?: string;
  primaryCTA?: string;
  secondaryCTA?: string;
  primaryCTALink?: string;
  secondaryCTALink?: string;
  backgroundImage?: string;
}

export interface SectionData {
  key: string;
  title?: string;
  subtitle?: string;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface CheckoutRequest {
  items: CartItem[];
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: string;
}

export interface StripeSession {
  id: string;
  url: string;
}

export interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
}

export interface SEOSettings {
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
  canonicalUrl: string;
}

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  theme: ThemeSettings;
  seo: SEOSettings;
}
