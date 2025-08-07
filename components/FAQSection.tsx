import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title?: string;
}

const FAQSection: React.FC<FAQSectionProps> = ({ title = 'Frequently Asked Questions' }) => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/faq');
        if (!res.ok) throw new Error('Failed to fetch FAQs');
        const data = await res.json();
        setFaqs(data);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  if (loading) {
    return <section className="py-16 text-center text-gray-500">Loading FAQs...</section>;
  }
  if (error) {
    return <section className="py-16 text-center text-red-500">{error}</section>;
  }
  if (!faqs.length) {
    return <section className="py-16 text-center text-gray-500">No FAQs found.</section>;
  }

  return (
    <section className="w-full py-16 md:py-24 bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 border-t-2 border-rose-100/40">
      <div className="max-w-3xl mx-auto px-4">
        <h2
          className="text-3xl md:text-4xl font-bold text-center mb-10 bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent"
          style={{ fontFamily: 'serif' }}
        >
          {title}
        </h2>
        <div className="space-y-6">
          {faqs.map((faq, idx) => (
            <div key={faq.id} className="rounded-2xl bg-white/90 shadow p-6 border border-rose-100">
              <button
                className="w-full flex justify-between items-center text-left focus:outline-none"
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                aria-expanded={openIdx === idx}
                aria-controls={`faq-answer-${idx}`}
              >
                <span
                  className="text-lg md:text-xl font-semibold bg-gradient-to-r from-rose-700 to-pink-600 bg-clip-text text-transparent"
                  style={{ fontFamily: 'serif' }}
                >
                  {faq.question}
                </span>
                <span
                  className={`ml-4 transition-transform duration-300 text-rose-600 ${openIdx === idx ? 'rotate-45' : ''}`}
                >
                  +
                </span>
              </button>
              <AnimatePresence initial={false}>
                {openIdx === idx && (
                  <motion.div
                    id={`faq-answer-${idx}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden mt-4 text-gray-700 text-base md:text-lg"
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
