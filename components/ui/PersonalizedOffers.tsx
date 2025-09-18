import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useUser } from '../context/UserContext';
import { Gift, Zap, Clock, TrendingDown, Star } from 'lucide-react';
import LuxuryButton from './LuxuryButton';

// Dynamically import framer-motion components
const MotionDiv = dynamic(() => import('framer-motion').then(mod => mod.motion.div), { ssr: false });

interface PersonalizedOffer {
  id: number;
  title: string;
  description: string;
  discountPercentage: number;
  originalPrice: number;
  discountedPrice: number;
  endTime?: string;
  productId?: number;
  productName?: string;
  productImage?: string;
  category?: string;
  type: 'flash_sale' | 'loyalty_bonus' | 'birthday' | 'anniversary' | 'welcome';
}

const PersonalizedOffers: React.FC = () => {
  const { user } = useUser();
  const [offers, setOffers] = useState<PersonalizedOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPersonalizedOffers();
  }, [user]);

  const fetchPersonalizedOffers = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would call an API endpoint
      // For now, we'll simulate with mock data based on user status
      const mockOffers: PersonalizedOffer[] = generateMockOffers();
      setOffers(mockOffers);
    } catch (err) {
      setError('Failed to load personalized offers');
    } finally {
      setLoading(false);
    }
  };

  const generateMockOffers = (): PersonalizedOffer[] => {
    const baseOffers: PersonalizedOffer[] = [
      {
        id: 1,
        title: "Flash Sale",
        description: "Limited time offer on premium gemstones",
        discountPercentage: 20,
        originalPrice: 5000,
        discountedPrice: 4000,
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        type: 'flash_sale',
        productName: "Premium Ruby Necklace",
        productImage: "/images/ruby1.jpg",
        category: "Necklaces"
      },
      {
        id: 2,
        title: "Loyalty Bonus",
        description: "Exclusive discount for our valued customers",
        discountPercentage: 15,
        originalPrice: 3500,
        discountedPrice: 2975,
        type: 'loyalty_bonus',
        productName: "Sapphire Earrings",
        productImage: "/images/sapphire1.jpg",
        category: "Earrings"
      }
    ];

    if (user) {
      // Add user-specific offers
      baseOffers.push({
        id: 3,
        title: "Welcome Back!",
        description: "Special offer for your return",
        discountPercentage: 10,
        originalPrice: 2500,
        discountedPrice: 2250,
        type: 'welcome',
        productName: "Emerald Ring",
        productImage: "/images/emerald1.jpg",
        category: "Rings"
      });

      // Add birthday offer if applicable
      const userBirthday = new Date();
      userBirthday.setMonth(userBirthday.getMonth() + 1); // Next month
      baseOffers.push({
        id: 4,
        title: "Birthday Special",
        description: "Celebrate with 25% off",
        discountPercentage: 25,
        originalPrice: 6000,
        discountedPrice: 4500,
        endTime: userBirthday.toISOString(),
        type: 'birthday',
        productName: "Diamond Pendant",
        productImage: "/images/diamond1.jpg",
        category: "Pendants"
      });
    }

    return baseOffers;
  };

  const getOfferIcon = (type: string) => {
    switch (type) {
      case 'flash_sale':
        return <Zap className="w-5 h-5" />;
      case 'loyalty_bonus':
        return <Gift className="w-5 h-5" />;
      case 'birthday':
        return <Gift className="w-5 h-5" />;
      case 'anniversary':
        return <Star className="w-5 h-5" />;
      case 'welcome':
        return <Gift className="w-5 h-5" />;
      default:
        return <Gift className="w-5 h-5" />;
    }
  };

  const getOfferColor = (type: string) => {
    switch (type) {
      case 'flash_sale':
        return 'from-red-500 to-orange-500';
      case 'loyalty_bonus':
        return 'from-amber-500 to-yellow-500';
      case 'birthday':
        return 'from-pink-500 to-rose-500';
      case 'anniversary':
        return 'from-purple-500 to-indigo-500';
      case 'welcome':
        return 'from-blue-500 to-cyan-500';
      default:
        return 'from-gray-500 to-gray-700';
    }
  };

  const getTimeRemaining = (endTime: string) => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Expired";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    }
    return `${minutes}m left`;
  };

  if (loading) {
    return (
      <section className="py-12 bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-6">
            <Gift className="w-6 h-6 text-amber-500 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">Special Offers</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || offers.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-gradient-to-r from-amber-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {typeof window !== 'undefined' ? (
          <MotionDiv 
            className="flex items-center justify-center mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Gift className="w-6 h-6 text-amber-500 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">Personalized Offers</h2>
          </MotionDiv>
        ) : (
          <div className="flex items-center justify-center mb-6">
            <Gift className="w-6 h-6 text-amber-500 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">Personalized Offers</h2>
          </div>
        )}
        
        {typeof window !== 'undefined' ? (
          <MotionDiv 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            {offers.map((offer) => (
              <div key={offer.id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className={`flex items-center justify-between mb-4 p-3 rounded-lg bg-gradient-to-r ${getOfferColor(offer.type)}`}>
                  <div className="flex items-center text-white">
                    {getOfferIcon(offer.type)}
                    <span className="ml-2 font-bold">{offer.title}</span>
                  </div>
                  <span className="text-2xl font-bold text-white">{offer.discountPercentage}% OFF</span>
                </div>
                
                <h3 className="font-bold text-gray-900 mb-2">{offer.productName}</h3>
                <p className="text-gray-600 text-sm mb-4">{offer.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-lg font-bold text-gray-900">₹{offer.discountedPrice.toLocaleString()}</span>
                    <span className="ml-2 text-sm text-gray-500 line-through">₹{offer.originalPrice.toLocaleString()}</span>
                  </div>
                  {offer.endTime && (
                    <div className="flex items-center text-sm text-red-500">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{getTimeRemaining(offer.endTime)}</span>
                    </div>
                  )}
                </div>
                
                <LuxuryButton variant="primary" size="md" className="w-full">
                  Claim Offer
                </LuxuryButton>
              </div>
            ))}
          </MotionDiv>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <div key={offer.id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className={`flex items-center justify-between mb-4 p-3 rounded-lg bg-gradient-to-r ${getOfferColor(offer.type)}`}>
                  <div className="flex items-center text-white">
                    {getOfferIcon(offer.type)}
                    <span className="ml-2 font-bold">{offer.title}</span>
                  </div>
                  <span className="text-2xl font-bold text-white">{offer.discountPercentage}% OFF</span>
                </div>
                
                <h3 className="font-bold text-gray-900 mb-2">{offer.productName}</h3>
                <p className="text-gray-600 text-sm mb-4">{offer.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-lg font-bold text-gray-900">₹{offer.discountedPrice.toLocaleString()}</span>
                    <span className="ml-2 text-sm text-gray-500 line-through">₹{offer.originalPrice.toLocaleString()}</span>
                  </div>
                  {offer.endTime && (
                    <div className="flex items-center text-sm text-red-500">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{getTimeRemaining(offer.endTime)}</span>
                    </div>
                  )}
                </div>
                
                <LuxuryButton variant="primary" size="md" className="w-full">
                  Claim Offer
                </LuxuryButton>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PersonalizedOffers;