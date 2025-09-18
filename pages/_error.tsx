import React from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';
import { NextPage } from 'next';
import { NextRouter } from 'next/router';

interface ErrorProps {
  statusCode?: number;
  title?: string;
}

const ErrorPage: NextPage<ErrorProps> = ({ statusCode, title }) => {
  const is404 = statusCode === 404;
  const is500 = statusCode === 500;

  const getErrorMessage = () => {
    if (is404) {
      return {
        title: 'Page Not Found',
        description: 'Sorry, we couldn\'t find the page you\'re looking for.',
        icon: <AlertTriangle className="w-12 h-12 text-amber-500" />
      };
    } else if (is500) {
      return {
        title: 'Something Went Wrong',
        description: 'We encountered an error while processing your request. Please try again later.',
        icon: <AlertTriangle className="w-12 h-12 text-red-500" />
      };
    } else {
      return {
        title: 'Something Went Wrong',
        description: 'An unexpected error occurred. Please try again later.',
        icon: <AlertTriangle className="w-12 h-12 text-amber-500" />
      };
    }
  };

  const { title: errorTitle, description, icon } = getErrorMessage();

  const handleRetry = () => {
    // Reload the current page
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex justify-center">
          {icon}
        </div>
        
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            {errorTitle}
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            {description}
          </p>
        </div>
        
        <div className="mt-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              href="/"
              className="flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
            >
              <Home className="w-5 h-5 mr-2" />
              Go to Homepage
            </Link>
            
            <button
              onClick={handleRetry}
              className="flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Try Again
            </button>
          </div>
          
          {statusCode && (
            <p className="text-sm text-gray-500">
              Error code: {statusCode}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

ErrorPage.getInitialProps = async ({ res, err }: any) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default ErrorPage;