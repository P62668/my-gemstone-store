import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import framer-motion components
const MotionDiv = dynamic(() => import('framer-motion').then(mod => mod.motion.div), { ssr: false });
const AnimatePresence = dynamic(() => import('framer-motion').then(mod => mod.AnimatePresence), { ssr: false });

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQItem[];
}

const FAQSection: React.FC<FAQSectionProps> = ({ faqs }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-amber-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-amber-100 rounded-full">
              <HelpCircle className="w-8 h-8 text-amber-600" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 luxury-font-serif">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600 luxury-font-sans">
            Everything you need to know about our gemstones and services
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <button
                className="w-full flex justify-between items-center p-6 text-left focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-2xl"
                onClick={() => toggleFAQ(index)}
                aria-expanded={openIndex === index}
              >
                <h3 className="text-lg font-semibold text-gray-900 luxury-font-serif">{faq.question}</h3>
                <ChevronDown
                  className={`w-5 h-5 text-amber-600 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              
              {typeof window !== 'undefined' ? (
                <AnimatePresence>
                  {openIndex === index && (
                    <MotionDiv
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 text-gray-600 border-t border-gray-100 pt-4 luxury-font-sans">
                        {faq.answer}
                      </div>
                    </MotionDiv>
                  )}
                </AnimatePresence>
              ) : (
                openIndex === index && (
                  <div className="px-6 pb-6 text-gray-600 border-t border-gray-100 pt-4 luxury-font-sans">
                    {faq.answer}
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;