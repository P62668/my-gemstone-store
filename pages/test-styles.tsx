import React from 'react';

const TestStyles: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-900 mb-8 text-center">
          Tailwind CSS Test Page
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Test Card 1 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Card 1</h2>
            <p className="text-gray-600 mb-4">
              This card should have a beautiful shadow and scale effect on hover.
            </p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Test Button
            </button>
          </div>

          {/* Test Card 2 */}
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg p-6 text-white hover:shadow-xl transition-all duration-300 hover:scale-105">
            <h2 className="text-2xl font-semibold mb-4">Card 2</h2>
            <p className="mb-4 opacity-90">
              This card has a gradient background and should also animate on hover.
            </p>
            <button className="bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-semibold">
              Gradient Button
            </button>
          </div>
        </div>

        {/* Animation Test */}
        <div className="mt-12 text-center">
          <div className="inline-block bg-green-500 text-white px-6 py-3 rounded-lg animate-pulse">
            This should pulse if animations are working
          </div>
        </div>

        {/* Custom Animation Test */}
        <div className="mt-8 text-center">
          <div className="inline-block bg-red-500 text-white px-6 py-3 rounded-lg animate-fade-in-scale">
            This should fade in and scale up
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestStyles;
