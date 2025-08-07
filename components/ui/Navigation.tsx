import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SearchInput } from './Form';

interface NavigationProps {
  cartCount?: number;
  onSearch?: (query: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ cartCount = 0, onSearch }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mainMenu, setMainMenu] = useState<any[]>([]);
  const [socialLinks, setSocialLinks] = useState<any[]>([]);

  useEffect(() => {
    const fetchNavigation = async () => {
      try {
        const res = await fetch('/api/public/navigation');
        if (!res.ok) throw new Error('Failed to fetch navigation');
        const data = await res.json();
        setMainMenu(data.mainMenu || []);
        setSocialLinks(data.socialLinks || []);
      } catch (err) {
        setMainMenu([]);
        setSocialLinks([]);
      }
    };
    fetchNavigation();
  }, []);

  const handleSearch = (query: string) => {
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="text-2xl font-bold text-blue-800 hover:text-blue-900 transition-colors"
            >
              Gemstone Heritage
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              {mainMenu.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="text-gray-700 hover:text-blue-800 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              placeholder="Search gemstones..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Social Links */}
            {socialLinks.map((item) => (
              <a
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-blue-800 transition-colors p-2"
                aria-label={item.label}
              >
                <span>{item.icon}</span>
              </a>
            ))}
            <Link
              href="/cart"
              className="text-gray-700 hover:text-blue-800 transition-colors p-2 relative"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-gray-700 hover:text-blue-800 transition-colors p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
            placeholder="Search gemstones..."
          />
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {mainMenu.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-800 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

// Breadcrumb Navigation
interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => (
  <nav className={`flex ${className}`} aria-label="Breadcrumb">
    <ol className="flex items-center space-x-2">
      {items.map((item, index) => (
        <li key={index} className="flex items-center">
          {index > 0 && (
            <svg
              className="w-4 h-4 text-gray-400 mx-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
          {item.href ? (
            <Link
              href={item.href}
              className="text-sm text-blue-800 hover:text-blue-900 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-sm text-gray-500">{item.label}</span>
          )}
        </li>
      ))}
    </ol>
  </nav>
);

// Secondary Navigation (for category pages)
interface SecondaryNavProps {
  categories: Array<{ id: string; name: string; href: string }>;
  activeCategory?: string;
}

export const SecondaryNavigation: React.FC<SecondaryNavProps> = ({
  categories,
  activeCategory,
}) => (
  <div className="bg-gray-50 border-b border-gray-200">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex space-x-8 overflow-x-auto">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={category.href}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeCategory === category.id
                ? 'border-blue-800 text-blue-800'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {category.name}
          </Link>
        ))}
      </div>
    </div>
  </div>
);

// Footer Navigation
export const FooterNavigation: React.FC = () => (
  <footer className="bg-gray-900 text-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Company Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Gemstone Heritage</h3>
          <p className="text-gray-400 text-sm">
            Authentic gemstones, traditional craftsmanship, modern convenience.
          </p>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider">Quick Links</h4>
          <ul className="space-y-2">
            <li>
              <Link
                href="/gemstones"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Gemstones
              </Link>
            </li>
            <li>
              <Link
                href="/collections"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Collections
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                About Us
              </Link>
            </li>
          </ul>
        </div>

        {/* Customer Service */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider">Customer Service</h4>
          <ul className="space-y-2">
            <li>
              <Link
                href="/contact"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Contact Us
              </Link>
            </li>
            <li>
              <Link
                href="/shipping"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Shipping Info
              </Link>
            </li>
            <li>
              <Link
                href="/returns"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Returns
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider">Legal</h4>
          <ul className="space-y-2">
            <li>
              <Link
                href="/privacy"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 mt-8 pt-8 text-center">
        <p className="text-gray-400 text-sm">© 2024 Gemstone Heritage. All rights reserved.</p>
      </div>
    </div>
  </footer>
);
