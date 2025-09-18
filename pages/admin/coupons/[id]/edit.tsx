import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../../../../components/Layout';
import { useUser } from '../../../../components/context/UserContext';
import { apiClient } from '../../../../utils/apiClient';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Tag, Percent, DollarSign, Calendar, Users, Info } from 'lucide-react';

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

const EditCouponPage: React.FC = () => {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [fetching, setFetching] = useState(true);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minimumAmount: '',
    maximumDiscount: '',
    usageLimit: '',
    validFrom: '',
    validTo: '',
    active: true,
    onePerUser: false
  });

  // Redirect to login if not authenticated or not admin
  useEffect(() => {
    if (!userLoading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  // Fetch coupon data
  useEffect(() => {
    if (user && user.role === 'admin' && id) {
      fetchCoupon();
    }
  }, [user, id]);

  const fetchCoupon = async () => {
    if (typeof id !== 'string') return;
    
    try {
      const res = await apiClient.get(`/api/coupons/${id}`);
      if (res.ok) {
        const couponData = res.data as Coupon;
        setCoupon(couponData);
        setFormData({
          code: couponData.code,
          name: couponData.name,
          description: couponData.description || '',
          discountType: couponData.discountType,
          discountValue: couponData.discountValue.toString(),
          minimumAmount: couponData.minimumAmount?.toString() || '',
          maximumDiscount: couponData.maximumDiscount?.toString() || '',
          usageLimit: couponData.usageLimit?.toString() || '',
          validFrom: couponData.validFrom.split('T')[0], // Format date for input
          validTo: couponData.validTo.split('T')[0], // Format date for input
          active: couponData.active,
          onePerUser: couponData.onePerUser
        });
      } else {
        setError('Failed to fetch coupon');
        toast.error('Failed to fetch coupon');
      }
    } catch (err) {
      setError('Error fetching coupon');
      toast.error('Error fetching coupon');
      console.error('Error fetching coupon:', err);
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || typeof id !== 'string') return;
    
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.code || !formData.name || !formData.discountValue || !formData.validFrom || !formData.validTo) {
        throw new Error('Please fill in all required fields');
      }

      // Validate discount value
      const discountValue = parseFloat(formData.discountValue);
      if (isNaN(discountValue) || discountValue <= 0) {
        throw new Error('Discount value must be a positive number');
      }

      // Validate dates
      const validFrom = new Date(formData.validFrom);
      const validTo = new Date(formData.validTo);
      if (validFrom >= validTo) {
        throw new Error('Valid from date must be before valid to date');
      }

      // Validate numeric fields
      const minimumAmount = formData.minimumAmount ? parseFloat(formData.minimumAmount) : null;
      const maximumDiscount = formData.maximumDiscount ? parseFloat(formData.maximumDiscount) : null;
      const usageLimit = formData.usageLimit ? parseInt(formData.usageLimit, 10) : null;

      if (minimumAmount !== null && (isNaN(minimumAmount) || minimumAmount < 0)) {
        throw new Error('Minimum amount must be a positive number or empty');
      }

      if (maximumDiscount !== null && (isNaN(maximumDiscount) || maximumDiscount <= 0)) {
        throw new Error('Maximum discount must be a positive number or empty');
      }

      if (usageLimit !== null && (isNaN(usageLimit) || usageLimit <= 0)) {
        throw new Error('Usage limit must be a positive number or empty');
      }

      const res = await apiClient.put(`/api/coupons/${id}`, {
        code: formData.code.toUpperCase(),
        name: formData.name,
        description: formData.description,
        discountType: formData.discountType,
        discountValue,
        minimumAmount,
        maximumDiscount,
        usageLimit,
        validFrom: formData.validFrom,
        validTo: formData.validTo,
        active: formData.active,
        onePerUser: formData.onePerUser
      });

      if (res.ok) {
        toast.success('Coupon updated successfully');
        router.push('/admin/coupons');
      } else {
        const errorMsg = (res.data as any)?.error || 'Failed to update coupon';
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Error updating coupon';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error('Error updating coupon:', err);
    } finally {
      setLoading(false);
    }
  };

  if (userLoading || fetching) {
    return (
      <Layout title="Edit Coupon - Shankarmala Gemstore">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Edit Coupon - Shankarmala Gemstore">
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (!coupon) {
    return (
      <Layout title="Edit Coupon - Shankarmala Gemstore">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Info className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Coupon not found</h3>
            <p className="text-gray-600 mb-6">The coupon you're looking for doesn't exist or has been deleted.</p>
            <Link 
              href="/admin/coupons"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-300 font-bold"
            >
              Back to Coupons
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Edit Coupon - Shankarmala Gemstore">
      <Head>
        <title>Edit Coupon - Shankarmala Gemstore</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-amber-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link 
              href="/admin/coupons"
              className="inline-flex items-center text-amber-600 hover:text-amber-800 font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Coupons
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-8 sm:p-8">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Edit Coupon</h1>
                <p className="mt-2 text-gray-600">Edit the details of coupon "{coupon.name}"</p>
              </div>

              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                      Coupon Code *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Tag className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="code"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-amber-500 focus:border-amber-500"
                        placeholder="e.g., SAVE10"
                        required
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Unique code customers will use to apply this coupon</p>
                  </div>

                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Coupon Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="block w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-amber-500 focus:border-amber-500"
                      placeholder="e.g., Summer Sale"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">Display name for this coupon</p>
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Describe this coupon..."
                  />
                  <p className="mt-1 text-xs text-gray-500">Optional description for this coupon</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="discountType" className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Type *
                    </label>
                    <select
                      id="discountType"
                      name="discountType"
                      value={formData.discountType}
                      onChange={handleChange}
                      className="block w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-amber-500 focus:border-amber-500"
                      required
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="discountValue" className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Value *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {formData.discountType === 'percentage' ? (
                          <Percent className="h-5 w-5 text-gray-400" />
                        ) : (
                          <DollarSign className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <input
                        type="number"
                        id="discountValue"
                        name="discountValue"
                        value={formData.discountValue}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-amber-500 focus:border-amber-500"
                        placeholder={formData.discountType === 'percentage' ? '10' : '100'}
                        required
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.discountType === 'percentage' 
                        ? 'Percentage discount (e.g., 10 for 10%)' 
                        : 'Fixed discount amount (e.g., 100 for ₹100 off)'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="minimumAmount" className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Cart Amount
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        id="minimumAmount"
                        name="minimumAmount"
                        value={formData.minimumAmount}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-amber-500 focus:border-amber-500"
                        placeholder="0"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Minimum cart total required to use this coupon</p>
                  </div>

                  <div>
                    <label htmlFor="maximumDiscount" className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Discount
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        id="maximumDiscount"
                        name="maximumDiscount"
                        value={formData.maximumDiscount}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-amber-500 focus:border-amber-500"
                        placeholder="0"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Maximum discount amount (for percentage coupons)</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="validFrom" className="block text-sm font-medium text-gray-700 mb-1">
                      Valid From *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        id="validFrom"
                        name="validFrom"
                        value={formData.validFrom}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-amber-500 focus:border-amber-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="validTo" className="block text-sm font-medium text-gray-700 mb-1">
                      Valid To *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        id="validTo"
                        name="validTo"
                        value={formData.validTo}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-amber-500 focus:border-amber-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="usageLimit" className="block text-sm font-medium text-gray-700 mb-1">
                      Usage Limit
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Users className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        id="usageLimit"
                        name="usageLimit"
                        value={formData.usageLimit}
                        onChange={handleChange}
                        min="1"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-amber-500 focus:border-amber-500"
                        placeholder="Unlimited"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Maximum number of times this coupon can be used</p>
                    <p className="mt-1 text-xs text-gray-500">Currently used: {coupon.usedCount} times</p>
                  </div>

                  <div className="flex items-center space-x-6 pt-6">
                    <div className="flex items-center">
                      <input
                        id="active"
                        name="active"
                        type="checkbox"
                        checked={formData.active}
                        onChange={handleChange}
                        className="h-5 w-5 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                      />
                      <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                        Active
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="onePerUser"
                        name="onePerUser"
                        type="checkbox"
                        checked={formData.onePerUser}
                        onChange={handleChange}
                        className="h-5 w-5 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                      />
                      <label htmlFor="onePerUser" className="ml-2 block text-sm text-gray-900">
                        One Per User
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-4 pt-6">
                  <Link
                    href="/admin/coupons"
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-bold hover:from-amber-700 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Update Coupon'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EditCouponPage;