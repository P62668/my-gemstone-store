import React from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';

const Custom500: React.FC = () => {
  return (
    <Layout title="Server Error - Shankarmala">
      
      <div className="min-h-[70vh] flex items-center justify-center py-16">
        <div className="text-center max-w-2xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* 500 Icon */}
            <div className="mb-8">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mb-6">
                <span className="text-6xl">⚡</span>
              </div>
              <h1 className="text-8xl font-bold text-red-600 mb-4">500</h1>
            </div>

            {/* Error Message */}
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Oops! Something went wrong
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              We&apos;re experiencing some technical difficulties. Our team has been notified 
              and is working to fix the issue. Please try again in a few moments.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors duration-300 shadow-lg hover:shadow-xl"
              >
                🔄 Try Again
              </button>
              <Link
                href="/"
                className="bg-white text-red-600 border-2 border-red-600 px-8 py-3 rounded-xl font-semibold hover:bg-red-50 transition-colors duration-300 shadow-lg hover:shadow-xl"
              >
                🏠 Go Home
              </Link>
            </div>

            {/* Status Information */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                What you can do:
              </h3>
              <div className="text-left space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Refresh the page and try again</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Check your internet connection</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Clear your browser cache and cookies</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Try accessing the site from a different browser</span>
                </div>
              </div>
            </div>

            {/* Contact Support */}
            <div className="text-gray-500">
              <p className="mb-2">
                Still having issues?
              </p>
              <Link
                href="/contact"
                className="text-red-600 hover:text-red-700 font-medium transition-colors"
              >
                Contact our support team →
              </Link>
            </div>

            {/* Status Check */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-400">
                Error ID: {Date.now().toString(36)}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Custom500;
