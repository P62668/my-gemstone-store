import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Heart, MessageCircle, Phone, ArrowUp, X, Search, User } from 'lucide-react';
import Link from 'next/link';

interface FloatingActionButtonProps {
  cartCount?: number;
  wishlistCount?: number;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  cartCount = 0,
  wishlistCount = 0,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Show/hide on scroll
  React.useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY < lastScrollY || currentScrollY < 100);
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const actions = [
    {
      icon: <ShoppingCart className="w-5 h-5" />,
      label: 'Cart',
      href: '/cart',
      count: cartCount,
      color: 'bg-amber-500 hover:bg-amber-600',
    },
    {
      icon: <Heart className="w-5 h-5" />,
      label: 'Wishlist',
      href: '/wishlist',
      count: wishlistCount,
      color: 'bg-red-500 hover:bg-red-600',
    },
    {
      icon: <Search className="w-5 h-5" />,
      label: 'Search',
      href: '/shop',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      icon: <User className="w-5 h-5" />,
      label: 'Account',
      href: '/account',
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      icon: <MessageCircle className="w-5 h-5" />,
      label: 'Chat',
      href: '/contact',
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      icon: <Phone className="w-5 h-5" />,
      label: 'Call',
      href: 'tel:+919876543210',
      color: 'bg-indigo-500 hover:bg-indigo-600',
    },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="relative"
          >
            {/* Action Buttons */}
            <AnimatePresence>
              {isOpen && (
                <div className="absolute bottom-16 right-0 space-y-3">
                  {actions.map((action, index) => (
                    <motion.div
                      key={action.label}
                      initial={{ opacity: 0, x: 20, scale: 0.8 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 20, scale: 0.8 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link href={action.href}>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className={`relative w-14 h-14 ${action.color} text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group`}
                        >
                          {action.icon}

                          {/* Badge */}
                          {action.count && action.count > 0 && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
                            >
                              {action.count > 99 ? '99+' : action.count}
                            </motion.div>
                          )}

                          {/* Tooltip */}
                          <div className="absolute right-16 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                            {action.label}
                            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1 w-0 h-0 border-l-4 border-l-gray-900 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                          </div>
                        </motion.button>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>

            {/* Main FAB */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(!isOpen)}
              className="relative w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="w-6 h-6 flex flex-col justify-center items-center space-y-1">
                      <div className="w-4 h-0.5 bg-white rounded-full"></div>
                      <div className="w-4 h-0.5 bg-white rounded-full"></div>
                      <div className="w-4 h-0.5 bg-white rounded-full"></div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Scroll to Top Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={scrollToTop}
              className="absolute -top-20 right-0 w-12 h-12 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center opacity-0 hover:opacity-100"
            >
              <ArrowUp className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingActionButton;
