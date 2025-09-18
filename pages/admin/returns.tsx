import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import getSessionOrRedirect from '../../utils/withServerAuth';
import type { GetServerSideProps } from 'next';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface ReturnItem {
  id: number;
  orderId: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  returnDate: string;
  refundAmount?: number;
  refundMethod?: string;
  notes?: string;
  processedAt?: string;
  order: {
    id: number;
    total: number;
    user: {
      name: string;
      email: string;
    };
    items: Array<{
      id: number;
      quantity: number;
      price: number;
      gemstone: {
        id: number;
        name: string;
        type: string;
      };
    }>;
  };
}

const ReturnsAdmin: React.FC = () => {
  const [returns, setReturns] = useState<ReturnItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedReturn, setSelectedReturn] = useState<ReturnItem | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [processingReturn, setProcessingReturn] = useState<number | null>(null);
  const [success, setSuccess] = useState('');
  const [processingForm, setProcessingForm] = useState({
    status: 'pending',
    refundAmount: 0,
    refundMethod: 'original_payment',
    notes: '',
  });

  useEffect(() => {
    fetchReturns();
  }, [filterStatus]);

  const fetchReturns = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') {
        params.append('status', filterStatus);
      }

      const res = await fetch(`/api/admin/returns?${params}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch returns');
      const data = await res.json();
      setReturns(data.returns || []);
    } catch (error) {
      toast.error('Failed to fetch returns');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessReturn = async (returnId: number) => {
    setProcessingReturn(returnId);
    setSuccess('');
    try {
      const res = await fetch('/api/admin/returns', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: returnId,
          ...processingForm,
        }),
      });

      if (!res.ok) throw new Error('Failed to process return');

      setSuccess('Return processed successfully!');
      setProcessingReturn(null);
      setShowDetails(false);
      fetchReturns();
    } catch (error) {
      setSuccess('');
      toast.error('Failed to process return');
    } finally {
      setProcessingReturn(null);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Returns Management">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading returns...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Returns Management">
      {returns.length === 0 && !loading && (
        <div className="max-w-2xl w-full mx-auto mb-6">
          <div className="bg-red-100 border border-red-300 text-red-800 px-6 py-6 rounded-xl text-center font-semibold shadow">
            <div className="text-2xl font-bold text-red-700 mb-2">Error Loading Returns</div>
            <div className="text-red-800 mb-4">Failed to fetch returns. Please try again later.</div>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {success && (
          <div className="rounded-xl p-4 mb-6 font-semibold text-center shadow border bg-green-100 border-green-300 text-green-800">
            {success}
          </div>
        )}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-amber-900 mb-2">Returns Management</h1>
          <p className="text-gray-600">Process customer return requests and manage refunds</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex gap-4 items-center">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-amber-200 rounded-lg focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="all">All Returns</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="processed">Processed</option>
            </select>
            <button
              onClick={fetchReturns}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-amber-200">
              <thead className="bg-amber-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-amber-900 uppercase tracking-wider">
                    Return ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-amber-900 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-amber-900 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-amber-900 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-amber-900 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-amber-900 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-amber-900 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-amber-200">
                {returns.map((returnItem) => (
                  <tr key={returnItem.id} className="hover:bg-amber-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-amber-900">
                      #{returnItem.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-900">
                      #{returnItem.orderId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-900">
                      {returnItem.order.user.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-amber-900 max-w-xs truncate">
                      {returnItem.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          returnItem.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : returnItem.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : returnItem.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {returnItem.status.charAt(0).toUpperCase() + returnItem.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-900">
                      {new Date(returnItem.returnDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedReturn(returnItem);
                          setShowDetails(true);
                        }}
                        className="text-amber-600 hover:text-amber-900 transition"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Return Details Modal */}
        <AnimatePresence>
          {showDetails && selectedReturn && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-amber-900">
                    Return Details #{selectedReturn.id}
                  </h2>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Return Information */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-amber-900 mb-3">Return Information</h3>
                      <div className="bg-amber-50 rounded-xl p-4 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-amber-700">Order ID:</span>
                          <span className="font-medium">#{selectedReturn.orderId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-amber-700">Customer:</span>
                          <span className="font-medium">{selectedReturn.order.user.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-amber-700">Email:</span>
                          <span className="font-medium">{selectedReturn.order.user.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-amber-700">Return Date:</span>
                          <span className="font-medium">
                            {new Date(selectedReturn.returnDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-amber-700">Status:</span>
                          <span
                            className={`font-medium ${
                              selectedReturn.status === 'pending'
                                ? 'text-yellow-600'
                                : selectedReturn.status === 'approved'
                                ? 'text-green-600'
                                : selectedReturn.status === 'rejected'
                                ? 'text-red-600'
                                : 'text-blue-600'
                            }`}
                          >
                            {selectedReturn.status.charAt(0).toUpperCase() +
                              selectedReturn.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-amber-900 mb-3">Return Reason</h3>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-gray-700">{selectedReturn.reason}</p>
                      </div>
                    </div>

                    {/* Processing Form */}
                    {selectedReturn.status === 'pending' && (
                      <div>
                        <h3 className="text-lg font-semibold text-amber-900 mb-3">Process Return</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-amber-700 mb-2">
                              Status
                            </label>
                            <select
                              value={processingForm.status}
                              onChange={(e) =>
                                setProcessingForm({ ...processingForm, status: e.target.value })
                              }
                              className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                            >
                              <option value="pending">Pending</option>
                              <option value="approved">Approved</option>
                              <option value="rejected">Rejected</option>
                              <option value="processed">Processed</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-amber-700 mb-2">
                              Refund Amount (₹)
                            </label>
                            <input
                              type="number"
                              value={processingForm.refundAmount}
                              onChange={(e) =>
                                setProcessingForm({
                                  ...processingForm,
                                  refundAmount: parseFloat(e.target.value),
                                })
                              }
                              className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-amber-700 mb-2">
                              Refund Method
                            </label>
                            <select
                              value={processingForm.refundMethod}
                              onChange={(e) =>
                                setProcessingForm({ ...processingForm, refundMethod: e.target.value })
                              }
                              className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                            >
                              <option value="original_payment">Original Payment Method</option>
                              <option value="bank_transfer">Bank Transfer</option>
                              <option value="store_credit">Store Credit</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-amber-700 mb-2">
                              Notes
                            </label>
                            <textarea
                              value={processingForm.notes}
                              onChange={(e) =>
                                setProcessingForm({ ...processingForm, notes: e.target.value })
                              }
                              rows={3}
                              className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                              placeholder="Add processing notes..."
                            />
                          </div>
                        </div>
                        <div className="mt-4 flex gap-3">
                          <button
                            onClick={() => handleProcessReturn(selectedReturn.id)}
                            disabled={processingReturn === selectedReturn.id}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                          >
                            {processingReturn === selectedReturn.id
                              ? 'Processing...'
                              : 'Process Return'}
                          </button>
                          <button
                            onClick={() => setShowDetails(false)}
                            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Order Summary */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-amber-900">Order Total</span>
                        <span className="text-2xl font-bold text-amber-600">
                          ₹{selectedReturn.order.total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
};

export default ReturnsAdmin;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const res = await getSessionOrRedirect(ctx, { requireAdmin: true });
  if ('redirect' in res) return res;
  return { props: {} };
};
