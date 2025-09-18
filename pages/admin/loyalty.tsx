import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';
import getSessionOrRedirect from '../../utils/withServerAuth';
import { prisma } from '../../lib/prisma';
import { Session } from 'next-auth';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Search, Users, Award, TrendingUp, Edit3, Plus, Trash2, Eye } from 'lucide-react';

interface LoyaltyTier {
  id: number;
  name: string;
  minPoints: number;
  discountPercent: number;
  benefits: string[];
  createdAt: string;
  updatedAt: string;
}

interface LoyaltyUser {
  id: number;
  userId: number;
  points: number;
  tier: string;
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Props {
  user: { id: number; role: string } | null;
  tiers: LoyaltyTier[];
  users: LoyaltyUser[];
  totalUsers: number;
  totalPoints: number;
  averagePoints: number;
}

const LoyaltyAdminPage: React.FC<Props> = ({ user, tiers, users, totalUsers, totalPoints, averagePoints }) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<LoyaltyUser[]>(users);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      setFilteredUsers(
        users.filter(u => 
          u.user.firstName?.toLowerCase().includes(term) ||
          u.user.lastName?.toLowerCase().includes(term) ||
          u.user.email.toLowerCase().includes(term) ||
          u.tier.toLowerCase().includes(term)
        )
      );
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const handleDeleteTier = async (id: number) => {
    if (!confirm('Are you sure you want to delete this tier? This action cannot be undone.')) return;
    
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/loyalty/tiers/${id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        toast.success('Tier deleted successfully');
        router.replace(router.asPath); // Refresh the page
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to delete tier');
      }
    } catch (error) {
      toast.error('Error deleting tier');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <AdminLayout title="Loyalty Program - Admin">
        <div className="max-w-4xl mx-auto py-12">
          <div className="bg-red-100 border border-red-300 text-red-800 px-6 py-4 rounded-xl text-center font-semibold shadow">
            You must be logged in as an administrator to view this page.
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (user.role !== 'admin') {
    return (
      <AdminLayout title="Loyalty Program - Admin">
        <div className="max-w-4xl mx-auto py-12">
          <div className="bg-red-100 border border-red-300 text-red-800 px-6 py-4 rounded-xl text-center font-semibold shadow">
            You must be an administrator to view this page.
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Loyalty Program - Admin">
      <Head>
        <title>Loyalty Program - Admin Panel</title>
      </Head>
      
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-amber-900 flex items-center gap-3">
              <Award className="text-amber-600" />
              Loyalty Program
            </h1>
            <p className="text-gray-600 mt-2">Manage loyalty tiers and track user engagement</p>
          </div>
          <div className="flex gap-3">
            <Link 
              href="/admin/loyalty/tiers/new"
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>New Tier</span>
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div 
            className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-amber-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center">
              <Users className="h-8 w-8 text-amber-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Points</p>
                <p className="text-2xl font-bold text-gray-900">{totalPoints.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="flex items-center">
              <Award className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Points</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(averagePoints)}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tiers Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Loyalty Tiers</h2>
            <Link 
              href="/admin/loyalty/tiers/new"
              className="flex items-center gap-2 text-amber-600 hover:text-amber-800 font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Add Tier</span>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiers.map((tier) => (
              <motion.div
                key={tier.id}
                className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
                whileHover={{ y: -5 }}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-gray-900">{tier.name}</h3>
                  <div className="flex gap-2">
                    <Link 
                      href={`/admin/loyalty/tiers/${tier.id}/edit`}
                      className="p-1.5 text-gray-500 hover:text-amber-600 rounded-lg hover:bg-amber-50"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Link>
                    {tier.name !== 'Bronze' && (
                      <button
                        onClick={() => handleDeleteTier(tier.id)}
                        disabled={loading}
                        className="p-1.5 text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Min Points</span>
                    <span className="font-medium">{tier.minPoints}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Discount</span>
                    <span className="font-medium">{tier.discountPercent}%</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">Benefits</span>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {tier.benefits.slice(0, 2).map((benefit, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="mr-1">•</span>
                          <span>{benefit}</span>
                        </li>
                      ))}
                      {tier.benefits.length > 2 && (
                        <li className="text-amber-600">+{tier.benefits.length - 2} more</li>
                      )}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Users Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900">Loyalty Members</h2>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tier
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Points
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((loyaltyUser) => (
                  <tr key={loyaltyUser.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {loyaltyUser.user.firstName} {loyaltyUser.user.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{loyaltyUser.user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                        {loyaltyUser.tier}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {loyaltyUser.points}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link 
                        href={`/admin/users/${loyaltyUser.userId}`}
                        className="text-amber-600 hover:text-amber-900 flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No members found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'No members match your search.' : 'No loyalty members yet.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default LoyaltyAdminPage;

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const res = await getSessionOrRedirect(context);
  if ('redirect' in res) return res;

  const session = res.session as Session;
  
  try {
    const userId = typeof session.user.id === 'string' ? parseInt(session.user.id, 10) : (session.user.id as number);
    if (!userId || Number.isNaN(Number(userId))) {
      return { redirect: { destination: '/login?redirect=/admin/loyalty', permanent: false } };
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: { id: true, role: true },
    });

    if (!dbUser || dbUser.role !== 'admin') {
      return {
        props: {
          user: dbUser ? JSON.parse(JSON.stringify(dbUser)) : null,
          tiers: [],
          users: [],
          totalUsers: 0,
          totalPoints: 0,
          averagePoints: 0,
        },
      };
    }

    // Get loyalty tiers
    const loyaltyTiers = await prisma.loyaltyTier.findMany({
      orderBy: { minPoints: 'asc' },
    });

    // Get loyalty users with user info
    const loyaltyUsers = await prisma.loyalty.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { points: 'desc' },
      take: 50,
    });

    // Calculate stats
    const totalUsers = await prisma.loyalty.count();
    const totalPointsResult = await prisma.loyalty.aggregate({
      _sum: {
        points: true,
      },
    });
    const totalPoints = totalPointsResult._sum.points || 0;
    const averagePoints = totalUsers > 0 ? totalPoints / totalUsers : 0;

    return {
      props: {
        user: JSON.parse(JSON.stringify(dbUser)),
        tiers: JSON.parse(JSON.stringify(loyaltyTiers || [])),
        users: JSON.parse(JSON.stringify(loyaltyUsers || [])),
        totalUsers,
        totalPoints,
        averagePoints,
      },
    };
  } catch (error) {
    console.error('[admin/loyalty] getServerSideProps error:', (error as Error).message || error);
    return {
      props: {
        user: null,
        tiers: [],
        users: [],
        totalUsers: 0,
        totalPoints: 0,
        averagePoints: 0,
      },
    };
  }
};