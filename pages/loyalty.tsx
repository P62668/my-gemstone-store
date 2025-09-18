import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import { useUser } from '../components/context/UserContext';
import { useLoyalty } from '../components/context/LoyaltyContext';
import { Trophy, Star, Gift, Zap, Crown, CheckCircle, ShoppingBag, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import LuxuryButton from '../components/ui/LuxuryButton';
import LuxuryCard from '../components/ui/LuxuryCard';

const LoyaltyPage: React.FC = () => {
  const { user, loading: userLoading } = useUser();
  const { loyalty, loading: loyaltyLoading, fetchLoyalty } = useLoyalty();
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchLoyalty();
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      // In a real implementation, this would fetch actual loyalty history
      // For now, we'll simulate with mock data
      setTimeout(() => {
        setHistory([
          { id: 1, type: 'purchase', points: 150, description: 'Order #ORD-12345', date: '2023-06-15' },
          { id: 2, type: 'bonus', points: 50, description: 'Silver Tier Bonus', date: '2023-06-10' },
          { id: 3, type: 'purchase', points: 85, description: 'Order #ORD-12344', date: '2023-06-05' },
          { id: 4, type: 'referral', points: 100, description: 'Friend Referral Bonus', date: '2023-05-28' },
        ]);
        setHistoryLoading(false);
      }, 500);
    } catch (err) {
      console.error('Error fetching history:', err);
      setHistoryLoading(false);
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

  const getTierBenefits = (tierName: string) => {
    const benefits: Record<string, string[]> = {
      Bronze: ['Exclusive access to sales', 'Birthday discount'],
      Silver: ['5% discount on all purchases', 'Early access to new collections', 'Free shipping on orders over $100'],
      Gold: ['10% discount on all purchases', 'Free shipping on all orders', 'Personal shopping assistant', 'Exclusive previews'],
      Platinum: ['15% discount on all purchases', 'Free shipping & returns', 'Personal shopping assistant', 'Exclusive events', 'Early sale access'],
    };
    return benefits[tierName] || benefits.Bronze;
  };

  if (!user && !userLoading) {
    return (
      <Layout title="Loyalty Program - Shankarmala Gemstore">
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <LuxuryCard className="p-8 md:p-12">
              <Trophy className="w-16 h-16 text-amber-600 mx-auto mb-6" />
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 luxury-font-serif">Loyalty Program</h1>
              <p className="text-lg text-gray-600 mb-8 luxury-font-sans">
                Sign in to join our loyalty program and start earning rewards!
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/login">
                  <LuxuryButton variant="primary" size="lg">
                    Sign In
                  </LuxuryButton>
                </Link>
                <Link href="/signup">
                  <LuxuryButton variant="secondary" size="lg">
                    Create Account
                  </LuxuryButton>
                </Link>
              </div>
            </LuxuryCard>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Your Loyalty Points - Shankarmala Gemstore">
      <Head>
        <title>Your Loyalty Points - Shankarmala Gemstore</title>
        <meta name="description" content="Track your loyalty points and rewards at Shankarmala Gemstore" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 luxury-font-serif">Loyalty Program</h1>
              <p className="text-gray-600 mt-1 luxury-font-sans">Earn points and unlock exclusive rewards</p>
            </div>
            <Link href="/shop">
              <LuxuryButton variant="secondary" size="md">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Start Shopping
              </LuxuryButton>
            </Link>
          </div>

          {loyaltyLoading ? (
            <LuxuryCard className="p-8 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="h-6 bg-gray-200 rounded w-2/3 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </LuxuryCard>
          ) : (
            <>
              {/* Current Tier Status */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl p-6 text-white mb-8 shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex items-center">
                    {loyalty && getTierIcon(loyalty.tier)}
                    <div className="ml-4">
                      <h2 className="text-2xl font-bold luxury-font-serif">{loyalty?.tier || 'Bronze'} Tier</h2>
                      <p className="text-amber-100 luxury-font-sans">
                        {loyalty?.points || 0} points
                      </p>
                    </div>
                  </div>
                  
                  <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${loyalty ? getTierColor(loyalty.tier) : 'from-amber-700 to-amber-900'} text-sm font-bold luxury-font-sans`}>
                    {loyalty?.tier || 'Bronze'} Member
                  </div>
                </div>
                
                {loyalty?.nextTier && (
                  <div className="mt-6">
                    <div className="flex justify-between text-sm mb-2 luxury-font-sans">
                      <span>
                        {loyalty.nextTier.minPoints - (loyalty.points || 0)} points to {loyalty.nextTier.name}
                      </span>
                      <span>{Math.round(loyalty.progress || 0)}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-3">
                      <motion.div 
                        className="bg-white h-3 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${loyalty.progress || 0}%` }}
                        transition={{ duration: 1 }}
                      ></motion.div>
                    </div>
                  </div>
                )}
                
                <div className="mt-6 pt-6 border-t border-white/20">
                  <p className="text-sm text-amber-100 luxury-font-sans">
                    Earn 1 point for every $1 spent. Points never expire!
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Benefits Section */}
                <div className="lg:col-span-2">
                  <LuxuryCard className="p-6 mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center luxury-font-serif">
                      <Gift className="w-5 h-5 mr-2 text-amber-600" />
                      Your Benefits
                    </h3>
                    <ul className="space-y-3">
                      {loyalty && getTierBenefits(loyalty.tier).map((benefit, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                          <span className="text-gray-700 luxury-font-sans">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </LuxuryCard>

                  {/* Points History */}
                  <LuxuryCard className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center luxury-font-serif">
                      <TrendingUp className="w-5 h-5 mr-2 text-amber-600" />
                      Points History
                    </h3>
                    
                    {historyLoading ? (
                      <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {history.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
                            <div>
                              <div className="font-medium text-gray-900 luxury-font-sans">{item.description}</div>
                              <div className="text-sm text-gray-500 luxury-font-sans">{item.date}</div>
                            </div>
                            <div className={`font-bold ${item.points > 0 ? 'text-green-600' : 'text-red-600'} luxury-font-sans`}>
                              {item.points > 0 ? '+' : ''}{item.points}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </LuxuryCard>
                </div>

                {/* How It Works */}
                <div>
                  <LuxuryCard className="p-6 sticky top-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 luxury-font-serif">How It Works</h3>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                          <span className="text-amber-700 font-bold text-sm">1</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1 luxury-font-sans">Earn Points</h4>
                          <p className="text-sm text-gray-600 luxury-font-sans">Get 1 point for every $1 spent on eligible purchases.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                          <span className="text-amber-700 font-bold text-sm">2</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1 luxury-font-sans">Level Up</h4>
                          <p className="text-sm text-gray-600 luxury-font-sans">Reach new tiers for better rewards and benefits.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                          <span className="text-amber-700 font-bold text-sm">3</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1 luxury-font-sans">Redeem Rewards</h4>
                          <p className="text-sm text-gray-600 luxury-font-sans">Use your points for discounts, exclusive items, and more.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <Link href="/shop">
                        <LuxuryButton variant="primary" size="md" className="w-full">
                          Start Earning Points
                        </LuxuryButton>
                      </Link>
                    </div>
                  </LuxuryCard>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default LoyaltyPage;