import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface PressLogo {
  id: number;
  title: string;
  logo?: string | null;
  link?: string | null;
  alt?: string;
}

interface PressAwardsSectionProps {
  title?: string;
}

const PressAwardsSection: React.FC<PressAwardsSectionProps> = ({
  title = 'As Seen In & Trusted By',
}) => {
  const [press, setPress] = useState<PressLogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPress = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/press');
        if (!res.ok) throw new Error('Failed to fetch press');
        const data = await res.json();
        setPress(data);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchPress();
  }, []);

  if (loading) {
    return <section className="py-12 text-center text-gray-500">Loading press...</section>;
  }
  if (error) {
    return <section className="py-12 text-center text-red-500">{error}</section>;
  }
  if (!press.length) {
    return <section className="py-12 text-center text-gray-500">No press found.</section>;
  }

  return (
    <section className="w-full py-12 bg-gradient-to-r from-slate-50 to-gray-50 border-t-2 border-slate-200/40 shadow-sm">
      <div className="max-w-5xl mx-auto px-4">
        <h2
          className="text-center text-lg font-semibold text-slate-700 mb-8 tracking-wide uppercase"
          style={{ letterSpacing: '0.08em' }}
        >
          {title}
        </h2>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          {press.map((logo, idx) => (
            <motion.div
              key={logo.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="flex items-center"
              aria-label={logo.title}
            >
              {logo.logo ? (
                <img
                  src={logo.logo}
                  alt={logo.title}
                  className="h-10 w-auto grayscale hover:grayscale-0 hover:drop-shadow-lg transition-all duration-300 cursor-pointer"
                  style={{ filter: 'grayscale(1)', transition: 'filter 0.3s' }}
                />
              ) : (
                <div className="h-10 px-4 bg-white rounded-lg border border-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600 hover:text-gray-800 hover:shadow-md transition-all duration-300 cursor-pointer">
                  {logo.title}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PressAwardsSection;
