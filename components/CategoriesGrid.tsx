import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Category {
  id: number;
  name: string;
  description?: string;
  image?: string;
  active: boolean;
}

interface CategoriesGridProps {
  title?: string;
  subtitle?: string;
}

const gemSvgs = [
  <svg
    key="ruby"
    className="w-8 h-8 text-red-400 drop-shadow-lg animate-gem-float"
    viewBox="0 0 32 32"
    fill="currentColor"
  >
    <polygon points="16,2 30,12 24,30 8,30 2,12" />
  </svg>,
  <svg
    key="emerald"
    className="w-7 h-7 text-green-400 drop-shadow-lg animate-gem-float2"
    viewBox="0 0 32 32"
    fill="currentColor"
  >
    <rect x="8" y="8" width="16" height="16" rx="4" />
  </svg>,
  <svg
    key="diamond"
    className="w-10 h-10 text-blue-200 drop-shadow-lg animate-gem-float3"
    viewBox="0 0 32 32"
    fill="currentColor"
  >
    <polygon points="16,2 30,12 16,30 2,12" />
  </svg>,
];

const CategoriesGrid: React.FC<CategoriesGridProps> = ({
  title = 'Explore by Category & Experience',
  subtitle = '',
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data.slice(0, 4)); // Show first 4 categories
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="w-full py-16 md:py-24 bg-gradient-to-br from-teal-50 via-cyan-50 to-teal-100 border-b-2 border-teal-200/40 shadow-sm relative">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center text-gray-500">Loading categories...</div>
        </div>
      </section>
    );
  }

  return (
    <motion.section
      ref={sectionRef}
      className="w-full py-16 md:py-24 bg-gradient-to-br from-teal-50 via-cyan-50 to-teal-100 border-b-2 border-teal-200/40 shadow-sm relative overflow-hidden"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      viewport={{ once: true }}
    >
      {/* Animated gradient/shimmer background */}
      <div
        className="absolute inset-0 -z-10 animate-gradient-move bg-gradient-to-br from-teal-100 via-cyan-100 to-teal-200 opacity-90"
        style={{ backgroundSize: '200% 200%' }}
      />
      {/* Floating gems/sparkles */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-16 left-10">{gemSvgs[0]}</div>
        <div className="absolute bottom-24 right-24">{gemSvgs[1]}</div>
        <div className="absolute top-1/2 right-1/4">{gemSvgs[2]}</div>
      </div>
      {/* Glassy gem illustration behind header */}
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/3 z-0 opacity-20 blur-2xl pointer-events-none"
        style={{ width: '40vw', height: '20vw' }}
      >
        <svg
          viewBox="0 0 200 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <polygon points="100,10 190,60 160,90 40,90 10,60" fill="#fffbe6" opacity="0.18" />
          <polygon points="100,30 170,70 150,85 50,85 30,70" fill="#fbc531" opacity="0.13" />
        </svg>
      </div>
      <div className="max-w-6xl mx-auto px-4">
        <h2
          className="text-3xl md:text-4xl font-bold text-center mb-2 bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent relative"
          style={{ fontFamily: 'serif' }}
        >
          {title}
          {/* Shine sweep */}
          <span className="absolute left-0 top-0 w-full h-full pointer-events-none">
            <span
              className="block w-full h-full animate-shine-sweep bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ mixBlendMode: 'screen' }}
            />
          </span>
        </h2>
        {subtitle && (
          <p className="text-center text-lg text-gray-600 mb-8" style={{ fontFamily: 'serif' }}>
            {subtitle}
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {categories.map((cat, idx) => (
            <Link key={cat.id} href={`/shop?category=${cat.id}`} className="block">
              <motion.div
                className="group bg-white/90 rounded-3xl shadow-xl border border-teal-100 p-8 flex flex-col items-center text-center transition-transform duration-300 cursor-pointer relative overflow-hidden"
                style={{ minHeight: 260, perspective: '800px' }}
                aria-label={`Category: ${cat.name}`}
                whileHover={{ scale: 1.06, boxShadow: '0 12px 40px #0d948822' }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                viewport={{ once: true }}
                onMouseMove={(e) => {
                  const card = e.currentTarget;
                  const rect = card.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  const rotateY = (x / rect.width - 0.5) * 10;
                  const rotateX = (y / rect.height - 0.5) * -10;
                  card.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(1.06)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = '';
                }}
              >
                {/* Shine sweep */}
                <span className="absolute inset-0 pointer-events-none">
                  <span
                    className="block w-full h-full animate-shine-sweep bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ mixBlendMode: 'screen' }}
                  />
                </span>
                <div className="w-16 h-16 mb-4 rounded-full overflow-hidden bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center border border-teal-200 shadow relative">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center">
                      {gemSvgs[idx % gemSvgs.length]}
                    </span>
                  )}
                </div>
                <h3
                  className="text-xl font-bold mb-2 bg-gradient-to-r from-teal-700 to-cyan-600 bg-clip-text text-transparent group-hover:underline group-hover:decoration-teal-400 group-hover:decoration-2 transition-all duration-200 relative"
                  style={{ fontFamily: 'serif' }}
                >
                  {cat.name}
                  {/* Sparkle icon */}
                  <svg
                    className="w-5 h-5 text-cyan-400 sparkle inline ml-1"
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
                </h3>
                <p
                  className="text-gray-700 text-base font-medium opacity-80"
                  style={{ fontFamily: 'serif' }}
                >
                  {cat.description || 'Explore our collection'}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="inline-block px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold tracking-wide">
                    Premium
                  </span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
        <div className="flex flex-col md:flex-row justify-center gap-4 mt-12">
          <motion.button
            className="px-8 py-4 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-teal-300/40 text-lg relative overflow-hidden"
            aria-label="Book your free consultation"
            whileHover={{ scale: 1.04, boxShadow: '0 4px 24px #0d948844' }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="relative z-10">Book Your Free Consultation</span>
            {/* Shine sweep */}
            <span className="absolute inset-0 pointer-events-none">
              <span
                className="block w-full h-full animate-shine-sweep bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ mixBlendMode: 'screen' }}
              />
            </span>
          </motion.button>
          <Link href="/shop">
            <motion.button
              className="px-8 py-4 rounded-full border-2 border-teal-400 text-teal-700 font-bold bg-white/90 hover:bg-teal-50 shadow transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-teal-200 text-lg relative overflow-hidden"
              aria-label="View all categories"
              whileHover={{ scale: 1.04, boxShadow: '0 4px 24px #0d948822' }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="relative z-10">View All Categories</span>
              {/* Shine sweep */}
              <span className="absolute inset-0 pointer-events-none">
                <span
                  className="block w-full h-full animate-shine-sweep bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ mixBlendMode: 'screen' }}
                />
              </span>
            </motion.button>
          </Link>
        </div>
      </div>
      {/* Soft gradient fade for section transition */}
      <div className="pointer-events-none absolute left-0 right-0 bottom-0 h-10 md:h-16 bg-gradient-to-b from-transparent to-teal-100/80" />
      {/* CSS for shine, sparkle, gem float, and gradient animation */}
      <style>{`
        .animate-shine-sweep {
          background-size: 200% 200%;
          animation: shine-sweep 2.5s cubic-bezier(.4,0,.2,1) infinite;
        }
        @keyframes shine-sweep {
          0% { opacity: 0; transform: translateX(-100%); }
          60% { opacity: 1; transform: translateX(120%); }
          100% { opacity: 0; transform: translateX(120%); }
        }
        .sparkle {
          animation: sparkle 1.5s infinite alternate;
        }
        @keyframes sparkle {
          0% { filter: drop-shadow(0 0 0px #fffbe6); opacity: 1; }
          100% { filter: drop-shadow(0 0 12px #fffbe6); opacity: 0.7; }
        }
        .animate-gem-float { animation: gem-float 7s ease-in-out infinite alternate; }
        .animate-gem-float2 { animation: gem-float2 9s ease-in-out infinite alternate; }
        .animate-gem-float3 { animation: gem-float3 11s ease-in-out infinite alternate; }
        @keyframes gem-float { 0% { transform: translateY(0) scale(1); } 100% { transform: translateY(-30px) scale(1.08); } }
        @keyframes gem-float2 { 0% { transform: translateY(0) scale(1); } 100% { transform: translateY(20px) scale(0.95); } }
        @keyframes gem-float3 { 0% { transform: translateY(0) scale(1); } 100% { transform: translateY(-15px) scale(1.12); } }
        .animate-gradient-move { background-size: 200% 200%; animation: gradient-x 8s ease-in-out infinite alternate; }
        @keyframes gradient-x { 0% { background-position: 0% 50%; } 100% { background-position: 100% 50%; } }
      `}</style>
    </motion.section>
  );
};

export default CategoriesGrid;
