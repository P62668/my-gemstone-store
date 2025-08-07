import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCart } from '../context/CartContext';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

interface Category {
  id: number;
  name: string;
  description?: string;
  active: boolean;
}

const Navbar: React.FC = () => {
  const router = useRouter();
  const { cart } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    fetchCategories();
    let ticking = false;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 10);
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (currentScrollY < 80 || currentScrollY < lastScrollY) {
            setShowNav(true);
          } else if (currentScrollY > lastScrollY) {
            setShowNav(false);
          }
          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll);
    // NProgress for route changes
    const handleStart = () => NProgress.start();
    const handleDone = () => NProgress.done();
    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleDone);
    router.events.on('routeChangeError', handleDone);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleDone);
      router.events.off('routeChangeError', handleDone);
    };
  }, [lastScrollY]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      } else {
        console.error('Failed to fetch categories:', res.statusText);
        setCategories([]);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setCategories([]);
    }
  };

  const cartItemCount = cart?.reduce((total, item) => total + item.quantity, 0) || 0;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 transform ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-lg shadow-2xl border-b-2 border-amber-200 ring-1 ring-amber-100/60'
          : 'bg-transparent'
      } ${showNav ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'} ${isScrolled ? 'animate-navbarGlow' : ''}`}
      style={{ willChange: 'transform, opacity' }}
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 group focus:outline-none focus:ring-2 focus:ring-amber-400"
            aria-label="Home"
          >
            <div className="w-12 h-12 lg:w-16 lg:h-16 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:animate-logoShimmer">
              <img
                src="/images/shankarmala-logo.svg"
                alt="Shankarmala Logo"
                className="w-full h-full object-contain drop-shadow-lg"
                style={{ minWidth: '48px', minHeight: '48px' }}
              />
            </div>
            <div className="flex items-center space-x-2">
              <div>
                <h1 className="text-lg lg:text-xl font-bold text-gray-900">Shankarmala</h1>
                <p className="text-xs lg:text-sm text-amber-600 font-medium">Luxury Gemstones</p>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link
              href="/"
              className={`nav-link text-lg font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                router.pathname === '/' ? 'text-amber-700' : 'text-gray-700 hover:text-amber-600'
              }`}
              aria-label="Home"
            >
              Home
            </Link>

            {/* Shop Button with Dropdown */}
            <div className="relative group">
              <Link
                href="/shop"
                className={`nav-link text-lg font-semibold transition-colors duration-200 flex items-center space-x-1 focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                  router.pathname === '/shop'
                    ? 'text-amber-700'
                    : 'text-gray-700 hover:text-amber-600'
                }`}
                onMouseEnter={() => setIsCategoryMenuOpen(true)}
                onMouseLeave={() => setIsCategoryMenuOpen(false)}
                style={{ zIndex: 2 }}
                aria-label="Shop"
              >
                <span>Shop</span>
                <svg
                  className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </Link>
              {/* Categories Menu */}
              <div
                className={`absolute top-full left-0 mt-2 w-64 bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-amber-100 py-4 transition-all duration-200 ${
                  isCategoryMenuOpen
                    ? 'opacity-100 visible translate-y-0'
                    : 'opacity-0 invisible -translate-y-2'
                }`}
                onMouseEnter={() => setIsCategoryMenuOpen(true)}
                onMouseLeave={() => setIsCategoryMenuOpen(false)}
                style={{ zIndex: 1 }}
              >
                {categories.length === 0 ? (
                  <div className="text-center text-gray-400 py-4">No categories</div>
                ) : (
                  categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/shop?category=${cat.id}`}
                      className="block px-6 py-3 text-base text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors rounded-xl"
                    >
                      {cat.name}
                    </Link>
                  ))
                )}
              </div>
            </div>

            <Link
              href="/about"
              className={`nav-link text-lg font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                router.pathname === '/about'
                  ? 'text-amber-700'
                  : 'text-gray-700 hover:text-amber-600'
              }`}
              aria-label="About"
            >
              About
            </Link>

            <Link
              href="/contact"
              className={`nav-link text-lg font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                router.pathname === '/contact'
                  ? 'text-amber-700'
                  : 'text-gray-700 hover:text-amber-600'
              }`}
              aria-label="Contact"
            >
              Contact
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link href="/cart" className="relative group">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-amber-500 to-yellow-400 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <svg
                  className="w-5 h-5 lg:w-6 lg:h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                  />
                </svg>
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </div>
            </Link>

            {/* Compare */}
            <Link href="/compare" className="group">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <svg
                  className="w-5 h-5 lg:w-6 lg:h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </Link>

            {/* Account */}
            <Link href="/account" className="group">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <svg
                  className="w-5 h-5 lg:w-6 lg:h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-400 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-lg border-t border-amber-100">
          <div className="px-4 py-6 space-y-4">
            <Link
              href="/"
              className={`block text-lg font-semibold transition-colors duration-200 ${
                router.pathname === '/' ? 'text-amber-700' : 'text-gray-700 hover:text-amber-600'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>

            <div>
              <button
                className="block w-full text-left text-lg font-semibold text-gray-700 hover:text-amber-600 transition-colors duration-200"
                onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
              >
                Shop
              </button>
              {isCategoryMenuOpen && (
                <div className="mt-2 ml-4 space-y-2">
                  <Link
                    href="/shop"
                    className="block text-amber-700 font-semibold"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    All Categories
                  </Link>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/shop?category=${cat.id}`}
                      className="block text-gray-600 hover:text-amber-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/about"
              className={`block text-lg font-semibold transition-colors duration-200 ${
                router.pathname === '/about'
                  ? 'text-amber-700'
                  : 'text-gray-700 hover:text-amber-600'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>

            <Link
              href="/contact"
              className={`block text-lg font-semibold transition-colors duration-200 ${
                router.pathname === '/contact'
                  ? 'text-amber-700'
                  : 'text-gray-700 hover:text-amber-600'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
