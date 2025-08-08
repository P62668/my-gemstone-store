import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface AddictiveFeaturesProps {
  productId?: string;
  productName?: string;
  price?: number;
  stockCount?: number;
  discount?: number;
}

const AddictiveFeatures: React.FC<AddictiveFeaturesProps> = ({
  productId,
  productName,
  price,
  stockCount = 10,
  discount = 0,
}) => {
  const [viewersCount, setViewersCount] = useState(0);
  const [socialProof, setSocialProof] = useState<{ name: string; action: string; time: string }[]>(
    [],
  );
  const [lastPurchased, setLastPurchased] = useState<{ name: string; time: string } | null>(null);
  const [showStockAlert, setShowStockAlert] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 2,
    minutes: 30,
    seconds: 0,
  });

  // Simulate live viewers
  useEffect(() => {
    const interval = setInterval(() => {
      setViewersCount((prev) => {
        const change = Math.floor(Math.random() * 3) - 1;
        return Math.max(12, Math.min(25, prev + change));
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Social proof simulation
  useEffect(() => {
    const names = ['Sarah', 'Mike', 'Emma', 'David', 'Lisa', 'John', 'Anna', 'Tom'];
    const actions = ['purchased', 'added to cart', 'viewed', 'wishlisted'];

    const interval = setInterval(() => {
      const newActivity = {
        name: names[Math.floor(Math.random() * names.length)],
        action: actions[Math.floor(Math.random() * actions.length)],
        time: 'just now',
      };

      setSocialProof((prev) => [newActivity, ...prev.slice(0, 4)]);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Stock alert
  useEffect(() => {
    if (stockCount < 5) {
      const timer = setTimeout(() => {
        setShowStockAlert(true);
        toast.error(`Only ${stockCount} left in stock!`);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [stockCount]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Last purchase simulation
  useEffect(() => {
    if (Math.random() > 0.7) {
      setLastPurchased({
        name: ['Sarah', 'Mike', 'Emma', 'David'][Math.floor(Math.random() * 4)],
        time: '2 minutes ago',
      });
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Live viewers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center space-x-2 text-sm text-gray-600"
      >
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        <span>{viewersCount} people are viewing this item</span>
      </motion.div>

      {/* Social proof */}
      <AnimatePresence>
        {socialProof.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-green-50 border border-green-200 rounded-lg p-4"
          >
            <div className="flex items-center space-x-2 text-sm text-green-700">
              <div className="flex -space-x-1">
                {socialProof.slice(0, 3).map((_, index) => (
                  <div
                    key={index}
                    className="w-6 h-6 bg-green-500 rounded-full border-2 border-white"
                  />
                ))}
              </div>
              <span>
                {socialProof[0]?.name} {socialProof[0]?.action} this item {socialProof[0]?.time}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flash sale countdown */}
      {discount > 15 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-500 text-white rounded-lg p-4 text-center"
        >
          <div className="text-sm font-medium mb-2">Flash Sale Ends In:</div>
          <div className="flex justify-center space-x-4 text-2xl font-bold">
            <div className="bg-red-600 px-3 py-1 rounded">
              {timeLeft.hours.toString().padStart(2, '0')}
            </div>
            <div className="bg-red-600 px-3 py-1 rounded">
              {timeLeft.minutes.toString().padStart(2, '0')}
            </div>
            <div className="bg-red-600 px-3 py-1 rounded">
              {timeLeft.seconds.toString().padStart(2, '0')}
            </div>
          </div>
        </motion.div>
      )}

      {/* Last purchase notification */}
      <AnimatePresence>
        {lastPurchased && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-3"
          >
            <div className="flex items-center space-x-2 text-sm text-blue-700">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                {lastPurchased.name} purchased this {lastPurchased.time}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stock alert */}
      <AnimatePresence>
        {showStockAlert && stockCount < 5 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-orange-50 border border-orange-200 rounded-lg p-4"
          >
            <div className="flex items-center space-x-2 text-sm text-orange-700">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Only {stockCount} left in stock! Order now to avoid disappointment.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddictiveFeatures;
