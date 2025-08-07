import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';
import { toast } from 'react-hot-toast';

const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/users/me', {
          credentials: 'include',
        });
        if (response.ok) {
          const user = await response.json();
          if (user.role === 'admin') {
            setIsAuthenticated(true);
            fetchAnalytics();
          } else {
            router.push('/admin/login');
          }
        } else {
          router.push('/admin/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/admin/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleSectionClick = (sectionName: string) => {
    setSelectedSection(sectionName);
    toast.success(`Opening ${sectionName} details...`);
  };

  const handleCloseSection = () => {
    setSelectedSection(null);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{getGreeting()}, Admin! 👋</h1>
                <p className="text-gray-600 mt-1">Welcome to your dashboard</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={fetchAnalytics}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  🔄 Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid - Clean First View */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Revenue Overview Section */}
            <div
              className="bg-white rounded-2xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              onClick={() => handleSectionClick('Revenue Overview')}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="text-4xl">💰</div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{analytics?.totalSales?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Revenue Overview</h3>
              <p className="text-gray-600">Track your sales performance and revenue trends</p>
              <div className="mt-4 flex items-center text-sm text-blue-600">
                <span>Click to view details →</span>
              </div>
            </div>

            {/* Orders Management Section */}
            <div
              className="bg-white rounded-2xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              onClick={() => handleSectionClick('Orders Management')}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="text-4xl">📦</div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Orders</p>
                  <p className="text-2xl font-bold text-blue-600">{analytics?.totalOrders || 0}</p>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Orders Management</h3>
              <p className="text-gray-600">Manage customer orders and track fulfillment</p>
              <div className="mt-4 flex items-center text-sm text-blue-600">
                <span>Click to view details →</span>
              </div>
            </div>

            {/* Product Management Section */}
            <div
              className="bg-white rounded-2xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              onClick={() => handleSectionClick('Product Management')}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="text-4xl">💎</div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Products</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {analytics?.totalGemstones || 0}
                  </p>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Product Management</h3>
              <p className="text-gray-600">Manage your gemstone inventory and catalog</p>
              <div className="mt-4 flex items-center text-sm text-blue-600">
                <span>Click to view details →</span>
              </div>
            </div>

            {/* User Analytics Section */}
            <div
              className="bg-white rounded-2xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              onClick={() => handleSectionClick('User Analytics')}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="text-4xl">👥</div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Users</p>
                  <p className="text-2xl font-bold text-orange-600">{analytics?.totalUsers || 0}</p>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">User Analytics</h3>
              <p className="text-gray-600">Track user growth and engagement metrics</p>
              <div className="mt-4 flex items-center text-sm text-blue-600">
                <span>Click to view details →</span>
              </div>
            </div>

            {/* Category Performance Section */}
            <div
              className="bg-white rounded-2xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              onClick={() => handleSectionClick('Category Performance')}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="text-4xl">📊</div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Categories</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {analytics?.totalCategories || 0}
                  </p>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Category Performance</h3>
              <p className="text-gray-600">Analyze sales performance by category</p>
              <div className="mt-4 flex items-center text-sm text-blue-600">
                <span>Click to view details →</span>
              </div>
            </div>

            {/* System Health Section */}
            <div
              className="bg-white rounded-2xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              onClick={() => handleSectionClick('System Health')}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="text-4xl">🖥️</div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="text-2xl font-bold text-green-600">Healthy</p>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">System Health</h3>
              <p className="text-gray-600">Monitor system performance and status</p>
              <div className="mt-4 flex items-center text-sm text-blue-600">
                <span>Click to view details →</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section Details Modal */}
        {selectedSection && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedSection}</h2>
                    <p className="text-gray-600">Detailed view and analytics</p>
                  </div>
                  <button
                    onClick={handleCloseSection}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Section-specific content */}
                <div className="space-y-8">
                  {selectedSection === 'Revenue Overview' && (
                    <div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                          <div className="text-sm text-green-600 font-medium mb-2">
                            Total Revenue
                          </div>
                          <div className="text-2xl font-bold text-green-900">
                            ₹{analytics?.totalSales?.toLocaleString() || 0}
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                          <div className="text-sm text-blue-600 font-medium mb-2">
                            Today's Revenue
                          </div>
                          <div className="text-2xl font-bold text-blue-900">
                            ₹{analytics?.todayRevenue?.toLocaleString() || 0}
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                          <div className="text-sm text-purple-600 font-medium mb-2">This Month</div>
                          <div className="text-2xl font-bold text-purple-900">
                            ₹{analytics?.thisMonthRevenue?.toLocaleString() || 0}
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">
                          Revenue Details
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <span className="font-medium">Average Order Value</span>
                            <span className="text-green-600 font-bold">
                              ₹{analytics?.avgOrderValue?.toLocaleString() || 0}
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <span className="font-medium">Conversion Rate</span>
                            <span className="text-blue-600 font-bold">
                              {analytics?.conversionRate || 0}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <span className="font-medium">Customer Satisfaction</span>
                            <span className="text-purple-600 font-bold">
                              {analytics?.customerSatisfaction?.toFixed(1) || 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedSection === 'Orders Management' && (
                    <div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                          <div className="text-sm text-blue-600 font-medium mb-2">Total Orders</div>
                          <div className="text-2xl font-bold text-blue-900">
                            {analytics?.totalOrders || 0}
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6 border border-yellow-200">
                          <div className="text-sm text-yellow-600 font-medium mb-2">
                            Pending Orders
                          </div>
                          <div className="text-2xl font-bold text-yellow-900">
                            {analytics?.realTimeStats?.pendingOrders || 0}
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                          <div className="text-sm text-green-600 font-medium mb-2">
                            Avg Order Value
                          </div>
                          <div className="text-2xl font-bold text-green-900">
                            ₹{analytics?.avgOrderValue?.toLocaleString() || 0}
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Orders</h3>
                        <div className="space-y-4">
                          {(analytics?.recentOrders || [])
                            .slice(0, 5)
                            .map((order: any, index: number) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                              >
                                <div>
                                  <p className="font-medium text-gray-900">Order #{order.id}</p>
                                  <p className="text-sm text-gray-600">{order.user}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-green-600">
                                    ₹{order.total?.toLocaleString()}
                                  </p>
                                  <p className="text-sm text-gray-500">{order.status}</p>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedSection === 'Product Management' && (
                    <div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                          <div className="text-sm text-purple-600 font-medium mb-2">
                            Total Products
                          </div>
                          <div className="text-2xl font-bold text-purple-900">
                            {analytics?.totalGemstones || 0}
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6 border border-yellow-200">
                          <div className="text-sm text-yellow-600 font-medium mb-2">
                            Featured Products
                          </div>
                          <div className="text-2xl font-bold text-yellow-900">
                            {analytics?.totalFeatured || 0}
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border border-red-200">
                          <div className="text-sm text-red-600 font-medium mb-2">
                            Low Stock Items
                          </div>
                          <div className="text-2xl font-bold text-red-900">
                            {analytics?.realTimeStats?.lowStockItems || 0}
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">
                          Top Selling Products
                        </h3>
                        <div className="space-y-4">
                          {(analytics?.topProducts || [])
                            .slice(0, 5)
                            .map((product: any, index: number) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                              >
                                <div>
                                  <p className="font-medium text-gray-900">{product.name}</p>
                                  <p className="text-sm text-gray-600">Sales: {product.sales}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-purple-600">#{index + 1}</p>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedSection === 'User Analytics' && (
                    <div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
                          <div className="text-sm text-orange-600 font-medium mb-2">
                            Total Users
                          </div>
                          <div className="text-2xl font-bold text-orange-900">
                            {analytics?.totalUsers || 0}
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                          <div className="text-sm text-green-600 font-medium mb-2">
                            New Users Today
                          </div>
                          <div className="text-2xl font-bold text-green-900">
                            {analytics?.realTimeStats?.recentActivity || 0}
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                          <div className="text-sm text-blue-600 font-medium mb-2">Active Users</div>
                          <div className="text-2xl font-bold text-blue-900">
                            {analytics?.realTimeStats?.onlineUsers || 0}
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">User Details</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <span className="font-medium">Customer Satisfaction</span>
                            <span className="text-green-600 font-bold">
                              {analytics?.customerSatisfaction?.toFixed(1) || 0}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <span className="font-medium">Average User Spending</span>
                            <span className="text-blue-600 font-bold">
                              ₹{analytics?.avgOrderValue?.toLocaleString() || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedSection === 'Category Performance' && (
                    <div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-6 border border-indigo-200">
                          <div className="text-sm text-indigo-600 font-medium mb-2">
                            Total Categories
                          </div>
                          <div className="text-2xl font-bold text-indigo-900">
                            {analytics?.totalCategories || 0}
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                          <div className="text-sm text-green-600 font-medium mb-2">
                            Active Categories
                          </div>
                          <div className="text-2xl font-bold text-green-900">
                            {analytics?.activeCategories || 0}
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                          <div className="text-sm text-purple-600 font-medium mb-2">
                            Top Category
                          </div>
                          <div className="text-2xl font-bold text-purple-900">
                            {analytics?.categoryDistribution?.[0]?.name || 'N/A'}
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Category Sales</h3>
                        <div className="space-y-4">
                          {(analytics?.categoryDistribution || [])
                            .slice(0, 5)
                            .map((category: any, index: number) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                              >
                                <div>
                                  <p className="font-medium text-gray-900">{category.name}</p>
                                  <p className="text-sm text-gray-600">
                                    Sales: ₹{category.sales?.toLocaleString()}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-indigo-600">#{index + 1}</p>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedSection === 'System Health' && (
                    <div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                          <div className="text-sm text-green-600 font-medium mb-2">Database</div>
                          <div className="text-2xl font-bold text-green-900">Connected</div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                          <div className="text-sm text-blue-600 font-medium mb-2">API Status</div>
                          <div className="text-2xl font-bold text-blue-900">Healthy</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                          <div className="text-sm text-purple-600 font-medium mb-2">Uptime</div>
                          <div className="text-2xl font-bold text-purple-900">
                            {analytics?.systemStatus?.uptime || 0} days
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">
                          Performance Metrics
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <span className="font-medium">Response Time</span>
                            <span className="text-green-600 font-bold">
                              {analytics?.performanceMetrics?.avgResponseTime || 0}ms
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <span className="font-medium">CPU Usage</span>
                            <span className="text-blue-600 font-bold">
                              {analytics?.performanceMetrics?.cpuUsage || 0}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <span className="font-medium">Memory Usage</span>
                            <span className="text-purple-600 font-bold">
                              {analytics?.performanceMetrics?.memoryUsage || 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex justify-end space-x-4">
                  <button
                    onClick={handleCloseSection}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                  <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
                    Export Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
