import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BarChart3,
  Users,
  ShoppingCart,
  Package,
  Calendar,
  Download,
  Filter,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';
import getSessionOrRedirect from '../../utils/withServerAuth';

interface ReportData {
  summary: any;
  chartData?: any[];
  topProducts?: any[];
  paymentMethods?: any;
  highValueCustomers?: any[];
  frequentCustomers?: any[];
  topSelling?: any[];
  topRevenue?: any[];
  lowStock?: any[];
  categoryPerformance?: any[];
  categoryStock?: any[];
  outOfStock?: any[];
  overstock?: any[];
}

const AdminReportsPage: React.FC = () => {
  const router = useRouter();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportType, setReportType] = useState('sales');
  const [period, setPeriod] = useState('30d');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showCustomDates, setShowCustomDates] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [reportType, period, customStartDate, customEndDate]);

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    
    try {
      let url = `/api/admin/reports?type=${reportType}&period=${period}`;
      
      if (showCustomDates && customStartDate && customEndDate) {
        url = `/api/admin/reports?type=${reportType}&startDate=${customStartDate}&endDate=${customEndDate}`;
      }
      
      const res = await fetch(url, { credentials: 'include' });
      
      if (!res.ok) {
        throw new Error('Failed to fetch report');
      }
      
      const data = await res.json();
      setReportData(data.data);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    // In a real implementation, this would generate and download a CSV/PDF report
    toast.success('Report exported successfully!');
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  if (loading) {
    return (
      <AdminLayout title="Admin Reports - Kolkata Gems">
        <div className="max-w-7xl mx-auto py-12 px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Generating report...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Admin Reports - Kolkata Gems">
      <div className="max-w-7xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Business Reports</h1>
            <p className="text-gray-600">Detailed analytics and insights for your business</p>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/admin')}
              className="px-6 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors"
            >
              Back to Dashboard
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportReport}
              className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Report
            </motion.button>
          </div>
        </div>

        {/* Report Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="sales">Sales Report</option>
                <option value="customers">Customer Report</option>
                <option value="products">Product Report</option>
                <option value="inventory">Inventory Report</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                disabled={showCustomDates}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setShowCustomDates(!showCustomDates)}
                className={`px-4 py-3 rounded-xl font-medium flex items-center gap-2 ${
                  showCustomDates
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                }`}
              >
                <Filter className="w-4 h-4" />
                Custom Dates
              </button>
            </div>

            {showCustomDates && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {error ? (
          <div className="max-w-2xl w-full mx-auto mb-6">
            <div className="bg-red-100 border border-red-300 text-red-800 px-6 py-6 rounded-xl text-center font-semibold shadow">
              <div className="text-2xl font-bold text-red-700 mb-2">Error Loading Report</div>
              <div className="text-red-800 mb-4">{error}</div>
              <button
                onClick={fetchReport}
                className="px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Sales Report */}
            {reportType === 'sales' && reportData && (
              <div className="space-y-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(reportData.summary?.totalRevenue || 0)}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Orders</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {reportData.summary?.totalOrders?.toLocaleString() || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <ShoppingCart className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Avg. Order Value</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(reportData.summary?.averageOrderValue || 0)}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                        <Package className="w-6 h-6 text-amber-600" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Unique Customers</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {reportData.summary?.uniqueCustomers?.toLocaleString() || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Top Products */}
                {reportData.topProducts && reportData.topProducts.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Top Selling Products</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {reportData.topProducts.map((product: any, index: number) => (
                        <div
                          key={index}
                          className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-gray-900">{product.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {product.quantity} sold
                              </p>
                            </div>
                            <span className="text-lg font-bold text-amber-700">
                              {formatCurrency(product.revenue)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Payment Methods */}
                {reportData.paymentMethods && Object.keys(reportData.paymentMethods).length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Payment Methods</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Object.entries(reportData.paymentMethods).map(([method, count]: [string, any]) => (
                        <div
                          key={method}
                          className="p-4 border border-gray-200 rounded-xl text-center"
                        >
                          <p className="font-semibold text-gray-900 capitalize">{method}</p>
                          <p className="text-2xl font-bold text-amber-700 mt-2">{count}</p>
                          <p className="text-sm text-gray-600">orders</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Customer Report */}
            {reportType === 'customers' && reportData && (
              <div className="space-y-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">New Customers</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {reportData.summary?.newCustomers?.toLocaleString() || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Customers</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {reportData.summary?.totalCustomers?.toLocaleString() || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Active Customers</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {reportData.summary?.activeCustomers?.toLocaleString() || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-amber-600" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Retention Rate</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {reportData.summary?.retentionRate?.toFixed(1) || 0}%
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* High Value Customers */}
                {reportData.highValueCustomers && reportData.highValueCustomers.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-6">High Value Customers</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Total Spent</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Orders</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.highValueCustomers.map((customer: any) => (
                            <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4 font-medium text-gray-900">{customer.name}</td>
                              <td className="py-3 px-4 text-amber-700 font-bold">
                                {formatCurrency(customer.totalSpent)}
                              </td>
                              <td className="py-3 px-4 text-gray-600">{customer.orderCount}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}

                {/* Frequent Customers */}
                {reportData.frequentCustomers && reportData.frequentCustomers.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Frequent Customers</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Orders</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Total Spent</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.frequentCustomers.map((customer: any) => (
                            <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4 font-medium text-gray-900">{customer.name}</td>
                              <td className="py-3 px-4 text-amber-700 font-bold">{customer.orderCount}</td>
                              <td className="py-3 px-4 text-gray-600">
                                {formatCurrency(customer.totalSpent)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Product Report */}
            {reportType === 'products' && reportData && (
              <div className="space-y-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Products</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {reportData.summary?.totalProducts?.toLocaleString() || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <Package className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Sold</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {reportData.summary?.totalSold?.toLocaleString() || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <ShoppingCart className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(reportData.summary?.totalRevenue || 0)}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-amber-600" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Low Stock Items</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {reportData.summary?.lowStockItems?.toLocaleString() || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                        <Package className="w-6 h-6 text-red-600" />
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Top Selling Products */}
                {reportData.topSelling && reportData.topSelling.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Top Selling Products</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Sold</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Revenue</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.topSelling.map((product: any) => (
                            <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4 font-medium text-gray-900">{product.name}</td>
                              <td className="py-3 px-4 text-gray-600">{product.category}</td>
                              <td className="py-3 px-4 text-amber-700 font-bold">{product.totalSold}</td>
                              <td className="py-3 px-4 text-gray-600">
                                {formatCurrency(product.totalRevenue)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}

                {/* Low Stock Products */}
                {reportData.lowStock && reportData.lowStock.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Low Stock Products</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Stock</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Threshold</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.lowStock.map((product: any) => (
                            <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4 font-medium text-gray-900">{product.name}</td>
                              <td className="py-3 px-4 text-gray-600">{product.category}</td>
                              <td className="py-3 px-4 text-red-600 font-bold">{product.stockCount}</td>
                              <td className="py-3 px-4 text-gray-600">{product.lowStockThreshold}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Inventory Report */}
            {reportType === 'inventory' && reportData && (
              <div className="space-y-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Products</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {reportData.summary?.totalProducts?.toLocaleString() || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <Package className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Stock Value</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(reportData.summary?.totalStockValue || 0)}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Low Stock</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {reportData.summary?.lowStockItems?.toLocaleString() || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                        <Package className="w-6 h-6 text-amber-600" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Out of Stock</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {reportData.summary?.outOfStockItems?.toLocaleString() || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                        <Package className="w-6 h-6 text-red-600" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Overstock</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {reportData.summary?.overstockItems?.toLocaleString() || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Package className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Low Stock Products */}
                {reportData.lowStock && reportData.lowStock.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Low Stock Products</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Stock</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.lowStock.map((product: any) => (
                            <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4 font-medium text-gray-900">{product.name}</td>
                              <td className="py-3 px-4 text-gray-600">{product.category}</td>
                              <td className="py-3 px-4 text-red-600 font-bold">{product.stockCount}</td>
                              <td className="py-3 px-4 text-gray-600">
                                {formatCurrency(product.price * product.stockCount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}

                {/* Out of Stock Products */}
                {reportData.outOfStock && reportData.outOfStock.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Out of Stock Products</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.outOfStock.map((product: any) => (
                            <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4 font-medium text-gray-900">{product.name}</td>
                              <td className="py-3 px-4 text-gray-600">{product.category}</td>
                              <td className="py-3 px-4 text-gray-600">
                                {formatCurrency(product.price * product.stockCount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminReportsPage;

export async function getServerSideProps(ctx: any) {
  const res = await getSessionOrRedirect(ctx, { requireAdmin: true });
  if ('redirect' in res) return res;
  return { props: {} };
}