import React from 'react';

interface FinalCTASectionProps {
  title?: string;
  subtitle?: string;
}

const FinalCTASection: React.FC<FinalCTASectionProps> = ({
  title = 'Begin Your Heritage Journey',
  subtitle = "Our experts are ready to guide you to your perfect gemstone or bespoke creation. Experience Kolkata's legacy—crafted just for you.",
}) => {
  return (
    <section className="w-full py-16 md:py-24 bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 border-t-2 border-blue-200/40 shadow-lg">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2
          className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-200 to-indigo-100 bg-clip-text text-transparent"
          style={{ fontFamily: 'serif', letterSpacing: '0.01em' }}
        >
          {title}
        </h2>
        <p
          className="text-xl md:text-2xl text-blue-100 mb-10 max-w-2xl mx-auto"
          style={{ fontFamily: 'serif' }}
        >
          {subtitle}
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
          <button
            className="px-10 py-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold text-lg shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300/40"
            aria-label="Book your consultation"
          >
            Book Your Consultation
          </button>
          <button
            className="px-10 py-4 rounded-full border-2 border-blue-200 text-blue-100 font-bold bg-transparent hover:bg-blue-800/20 shadow transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-200 text-lg"
            aria-label="Explore the collection"
          >
            Explore the Collection
          </button>
        </div>
        <div className="text-blue-200 text-sm mt-6">
          <span className="block">
            Or call us:{' '}
            <a href="tel:+919999999999" className="underline hover:text-blue-300 transition">
              +91 99999 99999
            </a>
          </span>
          <span className="block mt-1">Visit us: 123 Heritage Lane, Kolkata</span>
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;
