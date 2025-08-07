import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

const Custom404: React.FC = () => {
  return (
    <>
      <Head>
        <title>Page Not Found - Shankarmala</title>
        <meta name="description" content="The page you're looking for doesn't exist." />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-500 to-yellow-400 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h1>
            <p className="text-gray-600 mb-6">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          <div className="space-y-4">
            <Link
              href="/"
              className="block w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-white font-semibold py-3 px-6 rounded-xl hover:from-amber-600 hover:to-yellow-500 transition-all duration-200 transform hover:scale-105"
            >
              Go Home
            </Link>

            <Link
              href="/shop"
              className="block w-full bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-200 transition-all duration-200"
            >
              Browse Gemstones
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Looking for something specific? Try our search or browse our collection.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Custom404;
