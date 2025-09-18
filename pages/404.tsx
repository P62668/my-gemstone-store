import React from 'react';
import Link from 'next/link';
import { SearchX, Home } from 'lucide-react';
import Layout from '../components/Layout';

const Custom404: React.FC = () => {
  return (
    <Layout 
      title="Page Not Found | Shankarmala" 
      description="The page you're looking for doesn't exist or has been moved."
    >
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="flex justify-center">
            <div className="bg-amber-100 rounded-full p-4 inline-flex">
              <SearchX className="w-12 h-12 text-amber-600" />
            </div>
          </div>
          
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Page Not Found
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Sorry, we couldn't find the page you're looking for. It might have been removed, renamed, or didn't exist in the first place.
            </p>
          </div>
          
          <div className="mt-8">
            <Link 
              href="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
            >
              <Home className="w-5 h-5 mr-2" />
              Go to Homepage
            </Link>
          </div>
          
          <div className="mt-6">
            <p className="text-sm text-gray-500">
              If you believe this is an error, please{' '}
              <Link href="/contact" className="text-amber-600 hover:text-amber-700 font-medium">
                contact our support team
              </Link>.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Custom404;
