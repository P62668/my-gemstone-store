import React from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';

const Custom404: React.FC = () => {
  return (
    <Layout title="Page Not Found - Shankarmala">
      
      <div className="min-h-[70vh] flex items-center justify-center py-16">
        <div className="text-center max-w-2xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* 404 Icon */}
            <div className="mb-8">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center mb-6">
                <span className="text-6xl">💎</span>
              </div>
              <h1 className="text-8xl font-bold text-amber-600 mb-4">404</h1>
            </div>

            {/* Error Message */}
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Oops! Page Not Found
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              The gemstone you&apos;re looking for seems to have wandered off. 
              Don&apos;t worry, we have plenty of other beautiful pieces waiting for you.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                href="/"
                className="bg-amber-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-amber-700 transition-colors duration-300 shadow-lg hover:shadow-xl"
              >
                🏠 Back to Home
              </Link>
              <Link
                href="/shop"
                className="bg-white text-amber-600 border-2 border-amber-600 px-8 py-3 rounded-xl font-semibold hover:bg-amber-50 transition-colors duration-300 shadow-lg hover:shadow-xl"
              >
                🛍️ Browse Collection
              </Link>
            </div>

            {/* Helpful Links */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Looking for something specific?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <Link
                  href="/shop?category=ruby"
                  className="text-amber-600 hover:text-amber-700 transition-colors"
                >
                  🔴 Ruby Collection
                </Link>
                <Link
                  href="/shop?category=emerald"
                  className="text-amber-600 hover:text-amber-700 transition-colors"
                >
                  💚 Emerald Collection
                </Link>
                <Link
                  href="/shop?category=sapphire"
                  className="text-amber-600 hover:text-amber-700 transition-colors"
                >
                  🔵 Sapphire Collection
                </Link>
                <Link
                  href="/shop?category=diamond"
                  className="text-amber-600 hover:text-amber-700 transition-colors"
                >
                  💎 Diamond Collection
                </Link>
              </div>
            </div>

            {/* Contact Support */}
            <div className="text-gray-500">
              <p className="mb-2">
                Can&apos;t find what you&apos;re looking for?
              </p>
              <Link
                href="/contact"
                className="text-amber-600 hover:text-amber-700 font-medium transition-colors"
              >
                Contact our gemstone experts →
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Custom404;
