import React, { useState } from 'react';
import { InfoCard } from './Card';
import { H3, BodyText } from './Typography';
import { motion, AnimatePresence } from 'framer-motion';

interface GemstoneStorySectionProps {
  origin: string;
  certification: string;
  journey?: string[];
  careInstructions?: { title: string; details: string; icon: React.ReactNode }[];
}

const defaultJourney = [
  'Mined from legendary origins',
  'Expertly cut and polished by master artisans',
  'Certified by world-renowned gemological institutes',
  'Hand-selected for the Shankarmala collection',
  'Presented to you with luxury and care',
];

const defaultCareInstructions = [
  {
    title: 'Gentle Cleaning',
    details:
      'Clean your gemstone with lukewarm water, mild soap, and a soft brush. Avoid harsh chemicals.',
    icon: (
      <span role="img" aria-label="clean">
        🧼
      </span>
    ),
  },
  {
    title: 'Safe Storage',
    details:
      'Store separately in a soft pouch or lined box to prevent scratches and preserve brilliance.',
    icon: (
      <span role="img" aria-label="box">
        💎
      </span>
    ),
  },
  {
    title: 'Avoid Impact',
    details: 'Protect your gemstone from hard knocks and extreme temperature changes.',
    icon: (
      <span role="img" aria-label="impact">
        ⚡
      </span>
    ),
  },
  {
    title: 'Professional Care',
    details: 'Have your gemstone professionally inspected and cleaned annually.',
    icon: (
      <span role="img" aria-label="pro">
        🧑‍🔬
      </span>
    ),
  },
];

export const GemstoneStorySection: React.FC<GemstoneStorySectionProps> = ({
  origin,
  certification,
  journey = defaultJourney,
  careInstructions = defaultCareInstructions,
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="my-10">
      <InfoCard title="Heritage Story" variant="gradient">
        <div className="mb-6">
          <H3 className="text-amber-900 flex items-center gap-2 mb-2">
            <svg
              className="w-6 h-6 text-amber-600 animate-sparkle"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 2l2 7 7 2-7 2-2 7-2-7-7-2 7-2z"
              />
            </svg>
            Heritage & Journey
          </H3>
          <div className="relative pl-6 border-l-4 border-amber-200">
            {journey.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.2 }}
                className="mb-4 flex items-start gap-3"
              >
                <span className="w-4 h-4 mt-1 bg-amber-400 rounded-full shadow animate-sparkle" />
                <BodyText className="text-amber-900 font-medium">{step}</BodyText>
              </motion.div>
            ))}
            <div className="ml-2 mt-2 text-sm text-amber-700 opacity-80">
              <span className="font-semibold">Origin:</span> {origin} <br />
              <span className="font-semibold">Certification:</span> {certification}
            </div>
          </div>
        </div>
        <div>
          <H3 className="text-amber-900 flex items-center gap-2 mb-2">
            <svg
              className="w-6 h-6 text-amber-600 animate-sparkle"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 2l2 7 7 2-7 2-2 7-2-7-7-2 7-2z"
              />
            </svg>
            Gemstone Care Instructions
          </H3>
          <div className="space-y-3">
            {careInstructions.map((item, i) => (
              <div
                key={i}
                className="bg-white/80 rounded-xl border border-amber-100 p-4 shadow flex items-start gap-4"
              >
                <button
                  className="text-2xl focus:outline-none mt-1"
                  aria-label={
                    openIndex === i
                      ? `Hide details for ${item.title}`
                      : `Show details for ${item.title}`
                  }
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                >
                  {item.icon}
                </button>
                <div className="flex-1">
                  <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  >
                    <span className="font-semibold text-amber-900">{item.title}</span>
                    <motion.span
                      initial={false}
                      animate={{ rotate: openIndex === i ? 90 : 0 }}
                      className="ml-1 text-amber-500"
                    >
                      ▶
                    </motion.span>
                  </div>
                  <AnimatePresence>
                    {openIndex === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden mt-2"
                      >
                        <BodyText className="text-amber-800">{item.details}</BodyText>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        </div>
      </InfoCard>
      <style>{`
        .animate-sparkle { animation: sparkle-pulse 2s infinite; }
        @keyframes sparkle-pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default GemstoneStorySection;
