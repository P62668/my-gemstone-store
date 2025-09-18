import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ShoppingCart, Heart, User, Menu, X, Search, ChevronDown } from 'lucide-react';
import { performanceCache, CACHE_KEYS } from '../../utils/clientCache';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useLoyalty } from '../../components/context/LoyaltyContext';
import NotificationCenter from './NotificationCenter';

// Dynamically import framer-motion components
const MotionNav = dynamic(() => import('framer-motion').then(mod => mod.motion.nav), { ssr: false });
const MotionDiv = dynamic(() => import('framer-motion').then(mod => mod.motion.div), { ssr: false });
const AnimatePresence = dynamic(() => import('framer-motion').then(mod => mod.AnimatePresence), { ssr: false });

const Navbar: React.FC = () => {
  const router = useRouter();
  const { loyalty } = useLoyalty();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [activeMobileMenu, setActiveMobileMenu] = useState('main'); // For mobile menu sections

  // Set mounted state to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check scroll position
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const mobileMenu = document.getElementById('mobile-menu');
      const menuButton = document.getElementById('mobile-menu-button');
      
      if (isMobileMenuOpen && mobileMenu && menuButton && 
          !mobileMenu.contains(event.target as Node) && 
          !menuButton.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen]);

  // Instant fetch cart and wishlist counts with aggressive caching
  useEffect(() => {
    const fetchCounts = async () => {
      // Check performance cache first for instant response
      const cachedCounts = performanceCache.get('navbar_counts') as { cart: number; wishlist: number } | null;
      if (cachedCounts) {
        setCartCount(cachedCounts.cart);
        setWishlistCount(cachedCounts.wishlist);
        return;
      }

      try {
        // Parallel fetch for maximum speed
        const [cartRes, wishlistRes] = await Promise.all([
          fetch('/api/cart/count', { credentials: 'include' }),
          fetch('/api/users/wishlist/count', { credentials: 'include' })
        ]);

        let cartCountValue = 0;
        let wishlistCountValue = 0;

        if (cartRes.ok) {
          const cartData = await cartRes.json();
          cartCountValue = cartData.count || 0;
        } else if (cartRes.status === 401) {
          // Fallback to session cart for guests
          const sc = await fetch('/api/session-cart', { credentials: 'include' });
          if (sc.ok) {
            const sdata = await sc.json();
            cartCountValue = Array.isArray(sdata) ? sdata.reduce((acc:any,it:any)=>acc+(it.quantity||0),0) : 0;
          }
        }

        if (wishlistRes.ok) {
          const wishlistData = await wishlistRes.json();
          wishlistCountValue = wishlistData.count || 0;
        } else if (wishlistRes.status === 401) {
          // Fallback to session wishlist for guests
          const sw = await fetch('/api/session-wishlist', { credentials: 'include' });
          if (sw.ok) {
            const wdata = await sw.json();
            wishlistCountValue = Array.isArray(wdata) ? wdata.length : 0;
          }
        }

        // Update state
        setCartCount(cartCountValue);
        setWishlistCount(wishlistCountValue);

        // Cache for instant future access (5 seconds for dynamic data)
        performanceCache.set('navbar_counts', {
          cart: cartCountValue,
          wishlist: wishlistCountValue
        }, 5000);
      } catch (error) {
        console.error('Error fetching counts:', error);
      }
    };

    fetchCounts();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && mounted && router) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'Collections', href: '/collections' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  // Additional mobile menu items for better organization
  const mobileAccountItems = [
    { name: 'My Account', href: '/account', icon: '👤' },
    { name: 'My Orders', href: '/orders', icon: '📦' },
    { name: 'Wishlist', href: '/wishlist', icon: '❤️' },
    { name: 'Loyalty Program', href: '/loyalty', icon: '⭐' },
    { name: 'Profile Settings', href: '/profile', icon: '⚙️' },
  ];

  const mobileHelpItems = [
    { name: 'Shipping Info', href: '/shipping', icon: '🚚' },
    { name: 'Returns Policy', href: '/returns', icon: '↩️' },
    { name: 'FAQs', href: '/faqs', icon: '❓' },
    { name: 'Contact Support', href: '/contact', icon: '💬' },
  ];

  return (
    <>
      {/* Skip to content link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:text-amber-600 focus:px-4 focus:py-2 focus:rounded focus:ring-2 focus:ring-amber-500"
      >
        Skip to main content
      </a>

      {/* Main Navigation with Luxury Design */}
      {typeof window !== 'undefined' ? (
        <MotionNav
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
            isScrolled
              ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200/20'
              : 'bg-transparent'
          }`}
          role="navigation"
          aria-label="Main navigation"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 lg:h-20">
              {/* Logo with Luxury Design */}
              <Link 
                href="/" 
                className="flex items-center space-x-3 group focus:outline-none focus:ring-2 focus:ring-amber-500 rounded luxury-ripple"
                aria-label="Shankarmala Home"
              >
                <MotionDiv
                  whileHover={{ scale: 1.05 }}
                  className="w-12 h-12 lg:w-16 lg:h-16 flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                >
                  <Image
                    src="/images/shankarmala-logo.png"
                    alt="Shankarmala"
                    width={64}
                    height={64}
                    priority
                    className="w-full h-full object-contain drop-shadow-lg"
                  />
                </MotionDiv>
                <div className="hidden sm:block">
                  <h1
                    className={`text-lg lg:text-xl font-bold transition-colors duration-300 luxury-font-serif ${
                      isScrolled ? 'text-luxury-text-primary' : 'text-white'
                    }`}
                  >
                    Shankarmala
                  </h1>
                </div>
              </Link>

              {/* Desktop Navigation with Luxury Design */}
              <nav className="hidden lg:flex space-x-1 xl:space-x-2">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 luxury-nav-link luxury-ripple ${
                      router.pathname === item.href
                        ? 'bg-gradient-to-r from-luxury-gold to-luxury-amber text-white shadow-lg'
                        : isScrolled
                        ? 'text-luxury-text-primary hover:bg-luxury-gold hover:bg-opacity-10 hover:text-luxury-gold'
                        : 'text-white hover:bg-white/20'
                    }`}
                    aria-current={router.pathname === item.href ? 'page' : undefined}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              {/* Right Side Icons with Luxury Design */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                {/* Search Icon */}
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className={`p-3 rounded-full transition-all duration-300 luxury-icon-gold luxury-ripple ${
                    isScrolled
                      ? 'text-luxury-text-primary hover:bg-luxury-gold hover:bg-opacity-10 hover:text-luxury-gold'
                      : 'text-white hover:bg-white/20'
                  }`}
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>

                {/* Wishlist */}
                <Link
                  href="/wishlist"
                  className={`p-3 rounded-full transition-all duration-300 luxury-icon-gold luxury-ripple relative ${
                    isScrolled
                      ? 'text-luxury-text-primary hover:bg-luxury-gold hover:bg-opacity-10 hover:text-luxury-gold'
                      : 'text-white hover:bg-white/20'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className="w-5 h-5" />
                  {wishlistCount > 0 && (
                    <span className="luxury-notification-badge">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                {/* Cart */}
                <Link
                  href="/cart"
                  className={`p-3 rounded-full transition-all duration-300 luxury-icon-gold luxury-ripple relative ${
                    isScrolled
                      ? 'text-luxury-text-primary hover:bg-luxury-gold hover:bg-opacity-10 hover:text-luxury-gold'
                      : 'text-white hover:bg-white/20'
                  }`}
                  aria-label="Shopping Cart"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="luxury-notification-badge">
                      {cartCount}
                    </span>
                  )}
                </Link>

                {/* Notifications */}
                <NotificationCenter />

                {/* User Account */}
                <Link
                  href="/account"
                  className={`p-3 rounded-full transition-all duration-300 luxury-icon-gold luxury-ripple ${
                    isScrolled
                      ? 'text-luxury-text-primary hover:bg-luxury-gold hover:bg-opacity-10 hover:text-luxury-gold'
                      : 'text-white hover:bg-white/20'
                  }`}
                  aria-label="Account"
                >
                  <User className="w-5 h-5" />
                </Link>

                {/* Mobile Menu Button */}
                <button
                  id="mobile-menu-button"
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="lg:hidden p-3 rounded-xl text-gray-700 hover:bg-amber-100 hover:text-amber-700 luxury-ripple"
                  aria-label="Open mobile menu"
                >
                  <Menu className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </MotionNav>
      ) : (
        <nav
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
            isScrolled
              ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200/20'
              : 'bg-transparent'
          }`}
          role="navigation"
          aria-label="Main navigation"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 lg:h-20">
              {/* Logo */}
              <Link 
                href="/" 
                className="flex items-center space-x-3 group focus:outline-none focus:ring-2 focus:ring-amber-500 rounded luxury-ripple"
                aria-label="Shankarmala Home"
              >
                <div className="w-12 h-12 lg:w-16 lg:h-16 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  <Image
                    src="/images/shankarmala-logo.png"
                    alt="Shankarmala"
                    width={64}
                    height={64}
                    priority
                    className="w-full h-full object-contain drop-shadow-lg"
                  />
                </div>
                <div className="hidden sm:block">
                  <h1
                    className={`text-lg lg:text-xl font-bold transition-colors duration-300 luxury-font-serif ${
                      isScrolled ? 'text-gray-900' : 'text-white'
                    }`}
                  >
                    Shankarmala
                  </h1>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex space-x-1 xl:space-x-2">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 luxury-nav-link luxury-ripple ${
                      router.pathname === item.href
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                        : isScrolled
                        ? 'text-gray-700 hover:bg-amber-100 hover:text-amber-700'
                        : 'text-white hover:bg-white/20'
                    }`}
                    aria-current={router.pathname === item.href ? 'page' : undefined}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              {/* Right Side Icons */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                {/* Search Icon */}
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className={`p-3 rounded-full transition-all duration-300 luxury-icon-gold luxury-ripple ${
                    isScrolled
                      ? 'text-gray-700 hover:bg-amber-100 hover:text-amber-700'
                      : 'text-white hover:bg-white/20'
                  }`}
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>

                {/* Wishlist */}
                <Link
                  href="/wishlist"
                  className={`p-3 rounded-full transition-all duration-300 luxury-icon-gold luxury-ripple relative ${
                    isScrolled
                      ? 'text-gray-700 hover:bg-amber-100 hover:text-amber-700'
                      : 'text-white hover:bg-white/20'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className="w-5 h-5" />
                  {wishlistCount > 0 && (
                    <span className="luxury-notification-badge">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                {/* Cart */}
                <Link
                  href="/cart"
                  className={`p-3 rounded-full transition-all duration-300 luxury-icon-gold luxury-ripple relative ${
                    isScrolled
                      ? 'text-gray-700 hover:bg-amber-100 hover:text-amber-700'
                      : 'text-white hover:bg-white/20'
                  }`}
                  aria-label="Shopping Cart"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="luxury-notification-badge">
                      {cartCount}
                    </span>
                  )}
                </Link>

                {/* Notifications */}
                <NotificationCenter />

                {/* User Account */}
                <Link
                  href="/account"
                  className={`p-3 rounded-full transition-all duration-300 luxury-icon-gold luxury-ripple ${
                    isScrolled
                      ? 'text-gray-700 hover:bg-amber-100 hover:text-amber-700'
                      : 'text-white hover:bg-white/20'
                  }`}
                  aria-label="Account"
                >
                  <User className="w-5 h-5" />
                </Link>

                {/* Mobile Menu Button */}
                <button
                  id="mobile-menu-button"
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="lg:hidden p-3 rounded-xl text-gray-700 hover:bg-amber-100 hover:text-amber-700 luxury-ripple"
                  aria-label="Open mobile menu"
                >
                  <Menu className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Search Modal with Luxury Design */}
      {typeof window !== 'undefined' ? (
        <AnimatePresence>
          {isSearchOpen && (
            <MotionDiv
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-20"
              onClick={() => setIsSearchOpen(false)}
            >
              <MotionDiv
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-4 luxury-modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900 luxury-font-serif">Search Products</h2>
                    <button
                      onClick={() => setIsSearchOpen(false)}
                      className="p-2 rounded-full hover:bg-gray-100 luxury-ripple"
                      aria-label="Close search"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={handleSearch}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search gemstones, jewelry, or categories..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-base luxury-input"
                        autoFocus
                      />
                    </div>
                    <button
                      type="submit"
                      className="mt-4 w-full luxury-button-primary luxury-ripple"
                    >
                      Search
                    </button>
                  </form>
                </div>
              </MotionDiv>
            </MotionDiv>
          )}
        </AnimatePresence>
      ) : (
        isSearchOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-20">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-4 luxury-modal-content">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900 luxury-font-serif">Search Products</h2>
                  <button
                    onClick={() => setIsSearchOpen(false)}
                    className="p-2 rounded-full hover:bg-gray-100 luxury-ripple"
                    aria-label="Close search"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search gemstones, jewelry, or categories..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-base luxury-input"
                      autoFocus
                    />
                  </div>
                  <button
                    type="submit"
                    className="mt-4 w-full luxury-button-primary luxury-ripple"
                  >
                    Search
                  </button>
                </form>
              </div>
            </div>
          </div>
        )
      )}

      {/* Mobile Menu with Luxury Design */}
      {typeof window !== 'undefined' ? (
        <AnimatePresence>
          {isMobileMenuOpen && (
            <MotionDiv
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden luxury-modal-overlay"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <MotionDiv
                id="mobile-menu"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="absolute right-0 top-0 bottom-0 w-4/5 max-w-sm bg-white shadow-2xl rounded-l-3xl luxury-modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col h-full">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-bold text-gray-900 luxury-font-serif">Menu</h2>
                      <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-2 rounded-full hover:bg-gray-100 luxury-ripple"
                        aria-label="Close menu"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                  </div>

                  <nav className="flex-1 overflow-y-auto py-4">
                    {/* Main Menu Section */}
                    {activeMobileMenu === 'main' && (
                      <div className="px-6 py-2">
                        {navItems.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={`block py-4 px-5 rounded-xl text-base font-semibold ${
                              router.pathname === item.href
                                ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border border-amber-200'
                                : 'text-gray-700 hover:bg-gray-100'
                            } luxury-nav-link luxury-ripple`}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {item.name}
                          </Link>
                        ))}
                        
                        {/* Additional Mobile Sections */}
                        <div className="mt-6 space-y-2">
                          <button
                            onClick={() => setActiveMobileMenu('account')}
                            className="w-full text-left py-3 px-5 rounded-xl text-base font-semibold text-gray-700 hover:bg-gray-100 luxury-nav-link luxury-ripple flex justify-between items-center"
                          >
                            <span>My Account</span>
                            <span className="text-amber-600">›</span>
                          </button>
                          
                          <button
                            onClick={() => setActiveMobileMenu('help')}
                            className="w-full text-left py-3 px-5 rounded-xl text-base font-semibold text-gray-700 hover:bg-gray-100 luxury-nav-link luxury-ripple flex justify-between items-center"
                          >
                            <span>Help & Support</span>
                            <span className="text-amber-600">›</span>
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Account Menu Section */}
                    {activeMobileMenu === 'account' && (
                      <div className="px-6 py-2">
                        <button
                          onClick={() => setActiveMobileMenu('main')}
                          className="flex items-center py-3 text-amber-600 font-semibold luxury-nav-link luxury-ripple"
                        >
                          <span className="mr-2">‹</span> Back to Menu
                        </button>
                        
                        <div className="mt-2 space-y-2">
                          {mobileAccountItems.map((item) => (
                            <Link
                              key={item.name}
                              href={item.href}
                              className={`flex items-center py-3 px-5 rounded-xl text-base font-semibold ${
                                router.pathname === item.href
                                  ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border border-amber-200'
                                  : 'text-gray-700 hover:bg-gray-100'
                              } luxury-nav-link luxury-ripple`}
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <span className="mr-3">{item.icon}</span>
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Help Menu Section */}
                    {activeMobileMenu === 'help' && (
                      <div className="px-6 py-2">
                        <button
                          onClick={() => setActiveMobileMenu('main')}
                          className="flex items-center py-3 text-amber-600 font-semibold luxury-nav-link luxury-ripple"
                        >
                          <span className="mr-2">‹</span> Back to Menu
                        </button>
                        
                        <div className="mt-2 space-y-2">
                          {mobileHelpItems.map((item) => (
                            <Link
                              key={item.name}
                              href={item.href}
                              className={`flex items-center py-3 px-5 rounded-xl text-base font-semibold ${
                                router.pathname === item.href
                                  ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border border-amber-200'
                                  : 'text-gray-700 hover:bg-gray-100'
                              } luxury-nav-link luxury-ripple`}
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <span className="mr-3">{item.icon}</span>
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </nav>

                  <div className="p-6 border-t border-gray-200">
                    <div className="space-y-3">
                      <Link
                        href="/account"
                        className="flex items-center space-x-3 py-4 px-5 rounded-xl text-base font-semibold text-gray-700 hover:bg-gray-100 luxury-nav-link luxury-ripple"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <User className="w-5 h-5" />
                        <span>Account</span>
                      </Link>
                      {loyalty && (
                        <Link
                          href="/loyalty"
                          className="flex items-center space-x-3 py-4 px-5 rounded-xl text-base font-semibold text-gray-700 hover:bg-gray-100 luxury-nav-link luxury-ripple"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span>Loyalty: {loyalty.points} pts</span>
                          <span className="ml-auto luxury-badge luxury-badge-gold">
                            {loyalty.tier}
                          </span>
                        </Link>
                      )}
                      <Link
                        href="/wishlist"
                        className="flex items-center space-x-3 py-4 px-5 rounded-xl text-base font-semibold text-gray-700 hover:bg-gray-100 luxury-nav-link luxury-ripple"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Heart className="w-5 h-5" />
                        <span>Wishlist</span>
                        {wishlistCount > 0 && (
                          <span className="ml-auto luxury-badge luxury-badge-amber">
                            {wishlistCount}
                          </span>
                        )}
                      </Link>
                      <Link
                        href="/cart"
                        className="flex items-center space-x-3 py-4 px-5 rounded-xl text-base font-semibold text-gray-700 hover:bg-gray-100 luxury-nav-link luxury-ripple"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <ShoppingCart className="w-5 h-5" />
                        <span>Cart</span>
                        {cartCount > 0 && (
                          <span className="ml-auto luxury-badge luxury-badge-amber">
                            {cartCount}
                          </span>
                        )}
                      </Link>
                    </div>
                  </div>
                </div>
              </MotionDiv>
            </MotionDiv>
          )}
        </AnimatePresence>
      ) : (
        isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden luxury-modal-overlay">
            <div
              id="mobile-menu"
              className="absolute right-0 top-0 bottom-0 w-4/5 max-w-sm bg-white shadow-2xl rounded-l-3xl luxury-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900 luxury-font-serif">Menu</h2>
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-2 rounded-full hover:bg-gray-100 luxury-ripple"
                      aria-label="Close menu"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <nav className="flex-1 overflow-y-auto py-4">
                  <div className="px-6 py-2">
                    {navItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`block py-4 px-5 rounded-xl text-base font-semibold ${
                          router.pathname === item.href
                            ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border border-amber-200'
                            : 'text-gray-700 hover:bg-gray-100'
                        } luxury-nav-link luxury-ripple`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </nav>

                <div className="p-6 border-t border-gray-200">
                  <div className="space-y-3">
                    <Link
                      href="/account"
                      className="flex items-center space-x-3 py-4 px-5 rounded-xl text-base font-semibold text-gray-700 hover:bg-gray-100 luxury-nav-link luxury-ripple"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="w-5 h-5" />
                      <span>Account</span>
                    </Link>
                    {loyalty && (
                      <Link
                        href="/loyalty"
                        className="flex items-center space-x-3 py-4 px-5 rounded-xl text-base font-semibold text-gray-700 hover:bg-gray-100 luxury-nav-link luxury-ripple"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span>Loyalty: {loyalty.points} pts</span>
                        <span className="ml-auto luxury-badge luxury-badge-gold">
                          {loyalty.tier}
                        </span>
                      </Link>
                    )}
                    <Link
                      href="/wishlist"
                      className="flex items-center space-x-3 py-4 px-5 rounded-xl text-base font-semibold text-gray-700 hover:bg-gray-100 luxury-nav-link luxury-ripple"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Heart className="w-5 h-5" />
                      <span>Wishlist</span>
                      {wishlistCount > 0 && (
                        <span className="ml-auto luxury-badge luxury-badge-amber">
                          {wishlistCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      href="/cart"
                      className="flex items-center space-x-3 py-4 px-5 rounded-xl text-base font-semibold text-gray-700 hover:bg-gray-100 luxury-nav-link luxury-ripple"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <ShoppingCart className="w-5 h-5" />
                      <span>Cart</span>
                      {cartCount > 0 && (
                        <span className="ml-auto luxury-badge luxury-badge-amber">
                          {cartCount}
                        </span>
                      )}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </>
  );
};

export default Navbar;