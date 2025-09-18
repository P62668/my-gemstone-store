import React from 'react';
import Link from 'next/link';
import { Trophy, Star, Zap, Crown } from 'lucide-react';
import { useLoyalty } from '../../components/context/LoyaltyContext';

const LoyaltyProgramWidget: React.FC = () => {
  const { loyalty, loading } = useLoyalty();

  const getTierIcon = (tierName: string) => {
    switch (tierName) {
      case 'Bronze':
        return <Zap className="w-5 h-5 text-amber-700" />;
      case 'Silver':
        return <Star className="w-5 h-5 text-gray-400" />;
      case 'Gold':
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'Platinum':
        return <Crown className="w-5 h-5 text-blue-400" />;
      default:
        return <Zap className="w-5 h-5 text-amber-700" />;
    }
  };

  const getTierColor = (tierName: string) => {
    switch (tierName) {
      case 'Bronze':
        return 'from-amber-100 to-amber-200 border-amber-300 text-amber-800';
      case 'Silver':
        return 'from-gray-100 to-gray-200 border-gray-300 text-gray-700';
      case 'Gold':
        return 'from-yellow-100 to-yellow-200 border-yellow-300 text-yellow-800';
      case 'Platinum':
        return 'from-blue-100 to-blue-200 border-blue-300 text-blue-800';
      default:
        return 'from-amber-100 to-amber-200 border-amber-300 text-amber-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!loyalty) {
    return (
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Trophy className="w-8 h-8 mr-3" />
            <div>
              <h3 className="text-xl font-bold">Loyalty Program</h3>
              <p className="text-amber-100 text-sm mt-1">
                Join now and start earning rewards!
              </p>
            </div>
          </div>
          <Link 
            href="/loyalty" 
            className="px-4 py-2 bg-white text-amber-600 rounded-lg text-sm font-bold hover:bg-amber-50 transition-colors"
          >
            Join Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {getTierIcon(loyalty.tier)}
          <div className="ml-3">
            <h3 className="text-xl font-bold">{loyalty.tier} Tier</h3>
            <p className="text-amber-100 text-sm mt-1">
              {loyalty.points} points
            </p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getTierColor(loyalty.tier)} text-xs font-bold border`}>
          {loyalty.tier}
        </div>
      </div>
      
      {loyalty.nextTier && (
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>
              {loyalty.nextTier.minPoints - loyalty.points} points to {loyalty.nextTier.name}
            </span>
            <span>{Math.round(loyalty.progress)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full"
              style={{ width: `${loyalty.progress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      <div className="mt-4">
        <Link 
          href="/loyalty" 
          className="w-full text-center block px-4 py-2 bg-white text-amber-600 rounded-lg text-sm font-bold hover:bg-amber-50 transition-colors"
        >
          View Benefits
        </Link>
      </div>
    </div>
  );
};

export default LoyaltyProgramWidget;