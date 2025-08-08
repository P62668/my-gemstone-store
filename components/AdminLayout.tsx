import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  showBackButton?: boolean;
  backUrl?: string;
  pageIcon?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  title = 'Admin Dashboard - Shankarmala',
  description = 'Admin panel for Shankarmala Gemstones',
  showBackButton = false,
  backUrl = '/admin',
  pageIcon = '🏛️',
}) => {
  const [currentYear, setCurrentYear] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setCurrentYear(new Date().getFullYear().toString());
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {}
    router.push('/admin/login');
  };

  const toggleDropdown = (menu: string) => {
    setDropdownOpen(dropdownOpen === menu ? null : menu);
  };

  const adminSections = {
    'Content Management': [
      {
        href: '/admin/gemstones',
        label: 'Gemstones',
        icon: '💎',
        description: 'Manage gemstone inventory',
      },
      {
        href: '/admin/categories',
        label: 'Categories',
        icon: '📂',
        description: 'Organize gemstone categories',
      },
      {
        href: '/admin/homepage',
        label: 'Homepage',
        icon: '🏠',
        description: 'Customize homepage content',
      },
      {
        href: '/admin/banners',
        label: 'Banners',
        icon: '🖼️',
        description: 'Manage promotional banners',
      },
      {
        href: '/admin/testimonials',
        label: 'Testimonials',
        icon: '💬',
        description: 'Customer testimonials',
      },
      { href: '/admin/faqs', label: 'FAQs', icon: '❓', description: 'Frequently asked questions' },
      { href: '/admin/press', label: 'Press', icon: '📰', description: 'Press releases & media' },
    ],
    'E-commerce': [
      { href: '/admin/orders', label: 'Orders', icon: '📦', description: 'Manage customer orders' },
      { href: '/admin/users', label: 'Users', icon: '👥', description: 'Customer management' },
      { href: '/admin/inventory', label: 'Inventory', icon: '📊', description: 'Stock management' },
    ],
    'Site Management': [
      {
        href: '/admin/seo',
        label: 'SEO Settings',
        icon: '🔍',
        description: 'Search engine optimization',
      },
      {
        href: '/admin/sitesettings',
        label: 'Site Settings',
        icon: '⚙️',
        description: 'General site configuration',
      },
      {
        href: '/admin/theme',
        label: 'Theme Customization',
        icon: '🎨',
        description: 'Customize site appearance',
      },
      {
        href: '/admin/navigation',
        label: 'Navigation',
        icon: '🧭',
        description: 'Menu structure management',
      },
      {
        href: '/admin/analytics',
        label: 'Analytics',
        icon: '📊',
        description: 'Site performance metrics',
      },
    ],
  };

  const isActivePage = (href: string) => {
    if (href === '/admin') {
      return router.pathname === '/admin' && !router.query.id;
    }
    return router.pathname === href;
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div
        className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50"
        role="main"
        aria-label="Admin dashboard"
      >
        {/* Admin Header */}
        <motion.header
          className={`sticky top-0 z-50 transition-all duration-300 ${
            isScrolled
              ? 'bg-white/95 backdrop-blur-xl shadow-2xl border-b border-amber-200'
              : 'bg-white/90 backdrop-blur-lg shadow-lg border-b border-amber-200'
          }`}
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              {/* Logo and Desktop Navigation */}
              <div className="flex items-center space-x-6">
                <Link
                  href="/admin"
                  className="text-2xl font-bold text-amber-900 hover:text-amber-700 transition flex items-center gap-2 group"
                >
                  <motion.span
                    className="text-3xl"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    {pageIcon}
                  </motion.span>
                  <span className="hidden sm:inline font-serif">Shankarmala Admin</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex space-x-1">
                  {/* Dashboard */}
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/admin"
                      className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                        isActivePage('/admin')
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                          : 'text-amber-700 hover:text-amber-900 hover:bg-amber-50 hover:shadow-md'
                      }`}
                    >
                      <span>📊</span>
                      <span>Dashboard</span>
                    </Link>
                  </motion.div>

                  {/* Dropdown Menus */}
                  {Object.entries(adminSections).map(([sectionName, items]) => (
                    <div key={sectionName} className="relative">
                      <motion.button
                        onClick={() => toggleDropdown(sectionName)}
                        className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                          dropdownOpen === sectionName
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                            : 'text-amber-700 hover:text-amber-900 hover:bg-amber-50 hover:shadow-md'
                        }`}
                        aria-expanded={dropdownOpen === sectionName}
                        aria-haspopup="true"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span>{sectionName}</span>
                        <motion.span
                          className={`transition-transform ${dropdownOpen === sectionName ? 'rotate-180' : ''}`}
                          animate={{ rotate: dropdownOpen === sectionName ? 180 : 0 }}
                        >
                          ▼
                        </motion.span>
                      </motion.button>

                      <AnimatePresence>
                        {dropdownOpen === sectionName && (
                          <motion.div
                            className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-amber-200 py-3 z-50"
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                          >
                            {items.map((item) => (
                              <motion.div
                                key={item.href}
                                whileHover={{ x: 5 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Link
                                  href={item.href}
                                  className={`flex items-start gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 transition-all duration-200 ${
                                    isActivePage(item.href)
                                      ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-900 border-r-4 border-amber-500'
                                      : 'text-amber-700'
                                  }`}
                                  onClick={() => setDropdownOpen(null)}
                                >
                                  <span className="text-xl mt-0.5">{item.icon}</span>
                                  <div className="flex-1">
                                    <div className="font-semibold">{item.label}</div>
                                    <div className="text-xs text-amber-600 mt-1">
                                      {item.description}
                                    </div>
                                  </div>
                                </Link>
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </nav>
              </div>

              {/* Right Side Actions */}
              <div className="flex items-center space-x-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/"
                    className="hidden sm:flex items-center gap-2 text-amber-700 hover:text-amber-900 transition text-sm font-medium px-4 py-2 rounded-xl hover:bg-amber-50 hover:shadow-md"
                  >
                    <span>👁️</span>
                    <span>View Site</span>
                  </Link>
                </motion.div>

                <motion.button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 text-sm flex items-center gap-2 shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>🚪</span>
                  <span className="hidden sm:inline">Logout</span>
                </motion.button>

                {/* Mobile Menu Button */}
                <motion.button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 rounded-xl text-amber-700 hover:bg-amber-50 hover:shadow-md"
                  aria-label="Toggle mobile menu"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </motion.button>
              </div>
            </div>

            {/* Mobile Navigation */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  className="lg:hidden mt-4 pb-4 border-t border-amber-200"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <nav className="space-y-2 pt-4">
                    {/* Dashboard */}
                    <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        href="/admin"
                        className={`block px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                          isActivePage('/admin')
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                            : 'text-amber-700 hover:text-amber-900 hover:bg-amber-50 hover:shadow-md'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        📊 Dashboard
                      </Link>
                    </motion.div>

                    {/* Mobile Dropdowns */}
                    {Object.entries(adminSections).map(([sectionName, items]) => (
                      <div key={sectionName}>
                        <motion.button
                          onClick={() => toggleDropdown(sectionName)}
                          className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-between ${
                            dropdownOpen === sectionName
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                              : 'text-amber-700 hover:text-amber-900 hover:bg-amber-50 hover:shadow-md'
                          }`}
                          aria-expanded={dropdownOpen === sectionName}
                          whileHover={{ x: 5 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <span>{sectionName}</span>
                          <motion.span
                            className={`transition-transform ${dropdownOpen === sectionName ? 'rotate-180' : ''}`}
                            animate={{ rotate: dropdownOpen === sectionName ? 180 : 0 }}
                          >
                            ▼
                          </motion.span>
                        </motion.button>

                        <AnimatePresence>
                          {dropdownOpen === sectionName && (
                            <motion.div
                              className="ml-4 mt-2 space-y-1"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              {items.map((item) => (
                                <motion.div
                                  key={item.href}
                                  whileHover={{ x: 5 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Link
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                                      isActivePage(item.href)
                                        ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-900 border-l-4 border-amber-500'
                                        : 'text-amber-600 hover:text-amber-900 hover:bg-amber-50'
                                    }`}
                                    onClick={() => {
                                      setMobileMenuOpen(false);
                                      setDropdownOpen(null);
                                    }}
                                  >
                                    <span className="text-lg">{item.icon}</span>
                                    <div>
                                      <div className="font-medium">{item.label}</div>
                                      <div className="text-xs text-amber-600">
                                        {item.description}
                                      </div>
                                    </div>
                                  </Link>
                                </motion.div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}

                    {/* Mobile View Site Link */}
                    <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        href="/"
                        className="block px-4 py-3 text-amber-700 hover:text-amber-900 transition-all duration-200 text-sm font-medium hover:bg-amber-50 hover:shadow-md rounded-xl"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        👁️ View Site
                      </Link>
                    </motion.div>
                  </nav>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.header>

        <main className="pt-4">
          {/* Page Header with Back Button */}
          {showBackButton && (
            <motion.div
              className="max-w-7xl mx-auto px-4 mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.button
                onClick={() => router.push(backUrl)}
                className="flex items-center gap-2 text-amber-700 hover:text-amber-900 transition-all duration-200 font-medium px-4 py-2 rounded-xl hover:bg-amber-50 hover:shadow-md"
                whileHover={{ x: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>←</span>
                <span>Back to Dashboard</span>
              </motion.button>
            </motion.div>
          )}

          {children}
        </main>

        {/* Admin Footer */}
        <motion.footer
          className="bg-white/90 backdrop-blur-lg border-t border-amber-200 py-6 mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center">
              <p className="text-amber-700 text-sm">
                © {currentYear} Shankarmala Gemstones Admin Panel. All rights reserved.
              </p>
            </div>
          </div>
        </motion.footer>
      </div>

      {/* Click outside to close dropdowns */}
      {dropdownOpen && (
        <motion.div
          className="fixed inset-0 z-40"
          onClick={() => setDropdownOpen(null)}
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </>
  );
};

export default AdminLayout;
