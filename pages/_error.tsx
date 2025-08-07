import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { NextPageContext } from 'next';

interface ErrorProps {
  statusCode?: number;
}

interface ErrorPage extends React.FC<ErrorProps> {
  getInitialProps?: (context: NextPageContext) => Promise<ErrorProps>;
}

const Error: ErrorPage = ({ statusCode }) => {
  return (
    <>
      <Head>
        <title>Error {statusCode} - Shankarmala</title>
        <meta name="description" content="An error occurred" />
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {statusCode ? `Error ${statusCode}` : 'Something went wrong'}
            </h1>
            <p className="text-gray-600 mb-6">
              {statusCode === 404
                ? "The page you're looking for doesn't exist."
                : "We're sorry, but something went wrong. Please try again."}
            </p>
          </div>

          <div className="space-y-4">
            <Link
              href="/"
              className="block w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-white font-semibold py-3 px-6 rounded-xl hover:from-amber-600 hover:to-yellow-500 transition-all duration-200 transform hover:scale-105"
            >
              Go Home
            </Link>

            <button
              onClick={() => window.history.back()}
              className="block w-full bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-200 transition-all duration-200"
            >
              Go Back
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              If this problem persists, please contact our support team.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

Error.getInitialProps = async ({ res, err }: NextPageContext): Promise<ErrorProps> => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
