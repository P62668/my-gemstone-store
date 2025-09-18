import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Trophy, Star, Gift, Zap, Crown, CheckCircle } from 'lucide-react';
import { useUser } from '../context/UserContext';

// Dynamically import framer-motion components
const MotionDiv = dynamic(() => import('framer-motion').then(mod => mod.motion.div), { ssr: false });

interface LoyaltyTier {
  id: number;
  name: string;
  minPoints: number;
  discountPercent: number;
  benefits: string[];
}

interface LoyaltyData {
  points: number;
  tier: string;
  nextTier: LoyaltyTier | null;
  progress: number;
  benefits: string[];
}

const LoyaltyProgram: React.FC = () => {
  const { user } = useUser();
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchLoyaltyData();
    }
  }, [user]);

  const fetchLoyaltyData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/loyalty');
      if (res.ok) {
        const data = await res.json();
        setLoyaltyData(data);
      } else {
        throw new Error('Failed to fetch loyalty data');
      }
    } catch (err) {
      setError('Failed to load loyalty information');
    } finally {
      setLoading(false);
    }
  };

  const getTierIcon = (tierName: string) => {
    switch (tierName) {
      case 'Bronze':
        return <Zap className="w-6 h-6 text-amber-700" />;
      case 'Silver':
        return <Star className="w-6 h-6 text-gray-400" />;
      case 'Gold':
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 'Platinum':
        return <Crown className="w-6 h-6 text-blue-400" />;
      default:
        return <Zap className="w-6 h-6 text-amber-700" />;
    }
  };

  const getTierColor = (tierName: string) => {
    switch (tierName) {
      case 'Bronze':
        return 'from-amber-700 to-amber-900';
      case 'Silver':
        return 'from-gray-300 to-gray-500';
      case 'Gold':
        return 'from-yellow-400 to-yellow-600';
      case 'Platinum':
        return 'from-blue-300 to-blue-500';
      default:
        return 'from-amber-700 to-amber-900';
    }
  };

  if (!user) {
    return (
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white">
        <div className="flex items-center">
          <Trophy className="w-8 h-8 mr-3" />
          <h3 className="text-xl font-bold">Loyalty Program</h3>
        </div>
        <p className="mt-2 opacity-90">
          Sign in to join our loyalty program and start earning rewards!
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white animate-pulse">
        <div className="h-6 bg-white/20 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-white/20 rounded w-2/3 mb-2"></div>
        <div className="h-4 bg-white/20 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-200 rounded-2xl p-6 text-red-800">
        <p>{error}</p>
      </div>
    );
  }

  if (!loyaltyData) {
    return null;
  }

  return (
    <>
      {typeof window !== 'undefined' ? (
        <MotionDiv 
          className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {getTierIcon(loyaltyData.tier)}
              <div className="ml-3">
                <h3 className="text-xl font-bold">{loyaltyData.tier} Tier</h3>
                <p className="text-amber-100 text-sm">
                  {loyaltyData.points} points
                </p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getTierColor(loyaltyData.tier)} text-xs font-bold`}>
              {loyaltyData.tier}
            </div>
          </div>
          
          {loyaltyData.nextTier && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>
                  {loyaltyData.nextTier.minPoints - loyaltyData.points} points to {loyaltyData.nextTier.name}
                </span>
                <span>{Math.round(loyaltyData.progress)}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <MotionDiv 
                  className="bg-white h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${loyaltyData.progress}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                ></MotionDiv>
              </div>
            </div>
          )}
          
          <div className="mt-4">
            <h4 className="font-bold text-sm mb-2 flex items-center">
              <Gift className="w-4 h-4 mr-1" />
              Your Benefits
            </h4>
            <ul className="space-y-1">
              {loyaltyData.benefits.map((benefit, index) => (
                <li key={index} className="text-sm flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mt-4 pt-4 border-t border-white/20">
            <p className="text-xs text-amber-100">
              Earn 1 point for every $1 spent. Points never expire!
            </p>
          </div>
        </MotionDiv>
      ) : (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {getTierIcon(loyaltyData.tier)}
              <div className="ml-3">
                <h3 className="text-xl font-bold">{loyaltyData.tier} Tier</h3>
                <p className="text-amber-100 text-sm">
                  {loyaltyData.points} points
                </p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getTierColor(loyaltyData.tier)} text-xs font-bold`}>
              {loyaltyData.tier}
            </div>
          </div>
          
          {loyaltyData.nextTier && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>
                  {loyaltyData.nextTier.minPoints - loyaltyData.points} points to {loyaltyData.nextTier.name}
                </span>
                <span>{Math.round(loyaltyData.progress)}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-white h-2 rounded-full"
                  style={{ width: `${loyaltyData.progress}%` }}
                ></div>
              </div>
            </div>
          )}
          
          <div className="mt-4">
            <h4 className="font-bold text-sm mb-2 flex items-center">
              <Gift className="w-4 h-4 mr-1" />
              Your Benefits
            </h4>
            <ul className="space-y-1">
              {loyaltyData.benefits.map((benefit, index) => (
                <li key={index} className="text-sm flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mt-4 pt-4 border-t border-white/20">
            <p className="text-xs text-amber-100">
              Earn 1 point for every $1 spent. Points never expire!
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default LoyaltyProgram;