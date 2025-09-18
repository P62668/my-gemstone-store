import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { useUser } from '../../components/context/UserContext';
import { apiClient } from '../../utils/apiClient';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  Percent, 
  Tag, 
  DollarSign, 
  Users, 
  CheckCircle, 
  XCircle,
  Eye
} from 'lucide-react';

interface Coupon {
  id: number;
  code: string;
  name: string;
  description: string | null;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumAmount: number | null;
  maximumDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  validFrom: string;
  validTo: string;
  active: boolean;
  onePerUser: boolean;
  createdAt: string;
  updatedAt: string;
}

const AdminCouponsPage: React.FC = () => {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true on mount (client-side only)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Redirect to login if not authenticated or not admin (client-side only)
  useEffect(() => {
    if (isClient && !userLoading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, userLoading, router, isClient]);

  // Fetch coupons
  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchCoupons();
    }
  }, [user]);

  const fetchCoupons = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/api/coupons');
      if (res.ok) {
        setCoupons(res.data as Coupon[]);
      } else {
        setError('Failed to fetch coupons');
        toast.error('Failed to fetch coupons');
      }
    } catch (err) {
      setError('Error fetching coupons');
      toast.error('Error fetching coupons');
      console.error('Error fetching coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteCoupon = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) {
      return;
    }

    try {
      const res = await apiClient.delete(`/api/coupons/${id}`);
      if (res.ok) {
        toast.success('Coupon deleted successfully');
        setCoupons(coupons.filter(coupon => coupon.id !== id));
      } else {
        toast.error('Failed to delete coupon');
      }
    } catch (err) {
      toast.error('Error deleting coupon');
      console.error('Error deleting coupon:', err);
    }
  };

  const toggleCouponStatus = async (id: number, currentStatus: boolean) => {
    try {
      const res = await apiClient.put(`/api/coupons/${id}`, { active: !currentStatus });
      if (res.ok) {
        toast.success(`Coupon ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        setCoupons(coupons.map(coupon => 
          coupon.id === id ? { ...coupon, active: !currentStatus } : coupon
        ));
      } else {
        toast.error(`Failed to ${!currentStatus ? 'activate' : 'deactivate'} coupon`);
      }
    } catch (err) {
      toast.error(`Error ${!currentStatus ? 'activating' : 'deactivating'} coupon`);
      console.error(`Error ${!currentStatus ? 'activating' : 'deactivating'} coupon:`, err);
    }
  };

  if (userLoading || loading || !isClient) {
    return (
      <Layout title="Admin Coupons - Shankarmala Gemstore">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Admin Coupons - Shankarmala Gemstore">
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      </Layout>
    );
  }

  // Show nothing while redirecting
  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <Layout title="Admin Coupons - Shankarmala Gemstore">
      <Head>
        <title>Admin Coupons - Shankarmala Gemstore</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-amber-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Coupon Management</h1>
              <p className="mt-2 text-gray-600">Manage discount coupons and promotions</p>
            </div>
            <Link 
              href="/admin/coupons/create"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-300 font-bold shadow-lg transform hover:-translate-y-1"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Coupon
            </Link>
          </div>

          {coupons.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No coupons found</h3>
              <p className="text-gray-600 mb-6">Get started by creating a new coupon.</p>
              <Link 
                href="/admin/coupons/create"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-300 font-bold"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Coupon
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Coupon
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Discount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Validity
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usage
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {coupons.map((coupon) => (
                      <tr key={coupon.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg flex items-center justify-center">
                              <Tag className="h-5 w-5 text-amber-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-bold text-gray-900">{coupon.name}</div>
                              <div className="text-sm text-gray-500">
                                {coupon.code} {coupon.description && ` - ${coupon.description}`}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            {coupon.discountType === 'percentage' ? (
                              <Percent className="h-4 w-4 text-amber-600 mr-1" />
                            ) : (
                              <DollarSign className="h-4 w-4 text-amber-600 mr-1" />
                            )}
                            {coupon.discountType === 'percentage' 
                              ? `${coupon.discountValue}%` 
                              : `₹${coupon.discountValue.toFixed(2)}`}
                          </div>
                          {coupon.minimumAmount && (
                            <div className="text-xs text-gray-500">
                              Min: ₹{coupon.minimumAmount.toFixed(2)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Calendar className="h-4 w-4 text-amber-600 mr-1" />
                            {new Date(coupon.validFrom).toLocaleDateString()} - {new Date(coupon.validTo).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Users className="h-4 w-4 text-amber-600 mr-1" />
                            {coupon.usedCount} / {coupon.usageLimit || '∞'}
                          </div>
                          {coupon.onePerUser && (
                            <div className="text-xs text-gray-500">One per user</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {coupon.active ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <XCircle className="h-3 w-3 mr-1" />
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => toggleCouponStatus(coupon.id, coupon.active)}
                              className={`p-2 rounded-lg ${
                                coupon.active 
                                  ? 'text-red-600 hover:bg-red-100' 
                                  : 'text-green-600 hover:bg-green-100'
                              }`}
                              title={coupon.active ? 'Deactivate' : 'Activate'}
                            >
                              {coupon.active ? (
                                <XCircle className="h-5 w-5" />
                              ) : (
                                <CheckCircle className="h-5 w-5" />
                              )}
                            </button>
                            <Link 
                              href={`/admin/coupons/${coupon.id}/edit`}
                              className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg"
                              title="Edit"
                            >
                              <Edit className="h-5 w-5" />
                            </Link>
                            <button
                              onClick={() => deleteCoupon(coupon.id)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                              title="Delete"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminCouponsPage;