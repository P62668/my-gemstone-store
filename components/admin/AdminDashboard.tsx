import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  Users, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Package, 
  AlertTriangle,
  RefreshCw,
  Activity,
  Shield,
  Clock,
  Eye,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import LuxuryCard from '../ui/LuxuryCard';
import PerformanceMetrics from './PerformanceMetrics';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalOrders: number;
    totalRevenue: number;
    totalGemstones: number;
    totalCategories: number;
    userGrowth: number;
    pendingOrders: number;
    processingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    averageOrderValue: string;
  };
  recentOrders: any[];
  lowStockItems: any[];
  monthlyRevenue: { month: string; revenue: number }[];
  topCategories: { name: string; orderCount: number; totalRevenue: number }[];
  performance: {
    orderCompletionRate: string;
    averageOrderValue: string;
    totalRevenue: number;
    inventoryValue: number;
  };
  conversionRate: string;
}

interface AdminDashboardProps {
  initialData: AnalyticsData;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated: Date | null;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  initialData, 
  onRefresh, 
  isRefreshing,
  lastUpdated
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsData>(initialData);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'performance'>('overview');

  useEffect(() => {
    setAnalytics(initialData);
  }, [initialData]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Colors for charts
  const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444'];
  const REVENUE_COLOR = '#f59e0b';
  const ORDER_COLOR = '#10b981';

  // Process data for charts
  const revenueChartData = analytics.monthlyRevenue.map(item => ({
    name: item.month,
    revenue: item.revenue
  }));

  const categoryPieData = analytics.topCategories.map(category => ({
    name: category.name,
    value: category.totalRevenue
  }));

  // Calculate trend indicators
  const revenueTrend = analytics.monthlyRevenue.length > 1 
    ? analytics.monthlyRevenue[analytics.monthlyRevenue.length - 1].revenue - 
      analytics.monthlyRevenue[analytics.monthlyRevenue.length - 2].revenue
    : 0;

  const orderTrend = analytics.overview.totalOrders > analytics.overview.userGrowth 
    ? analytics.overview.totalOrders - analytics.overview.userGrowth
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-amber-900 luxury-font-serif">Analytics Dashboard</h1>
          <p className="text-amber-600">Comprehensive overview of your business performance</p>
        </div>
        <div className="flex items-center space-x-4">
          {lastUpdated && (
            <p className="text-sm text-gray-500 hidden md:block">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="luxury-button-primary flex items-center space-x-2 luxury-ripple"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm luxury-font-sans ${
              activeTab === 'overview'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Business Overview
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`py-4 px-1 border-b-2 font-medium text-sm luxury-font-sans ${
              activeTab === 'performance'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Performance Metrics
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' ? (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <LuxuryCard padding="lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1 luxury-font-serif">
                    {formatCurrency(analytics.performance.totalRevenue)}
                  </p>
                  <div className="flex items-center mt-2">
                    {revenueTrend >= 0 ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm ${revenueTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {revenueTrend >= 0 ? '+' : ''}{formatCurrency(Math.abs(revenueTrend))} from last month
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-amber-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </LuxuryCard>

            <LuxuryCard padding="lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1 luxury-font-serif">
                    {analytics.overview.totalOrders.toLocaleString()}
                  </p>
                  <div className="flex items-center mt-2">
                    {orderTrend >= 0 ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm ${orderTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {orderTrend >= 0 ? '+' : ''}{Math.abs(orderTrend)} from last period
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </LuxuryCard>

            <LuxuryCard padding="lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1 luxury-font-serif">
                    {analytics.overview.totalUsers.toLocaleString()}
                  </p>
                  <div className="flex items-center mt-2">
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">
                      +{analytics.overview.userGrowth} this month
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </LuxuryCard>

            <LuxuryCard padding="lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1 luxury-font-serif">
                    {analytics.conversionRate}%
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">
                      +2.3% from last month
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Activity className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </LuxuryCard>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <LuxuryCard padding="lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 luxury-font-serif">Revenue Overview</h3>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setTimeRange('7d')}
                    className={`px-3 py-1 text-sm rounded luxury-nav-link luxury-ripple ${
                      timeRange === '7d' ? 'bg-amber-100 text-amber-800' : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    7D
                  </button>
                  <button 
                    onClick={() => setTimeRange('30d')}
                    className={`px-3 py-1 text-sm rounded luxury-nav-link luxury-ripple ${
                      timeRange === '30d' ? 'bg-amber-100 text-amber-800' : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    30D
                  </button>
                  <button 
                    onClick={() => setTimeRange('90d')}
                    className={`px-3 py-1 text-sm rounded luxury-nav-link luxury-ripple ${
                      timeRange === '90d' ? 'bg-amber-100 text-amber-800' : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    90D
                  </button>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={revenueChartData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#6b7280" 
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#6b7280" 
                      fontSize={12}
                      tickFormatter={(value) => `₹${value.toLocaleString()}`}
                    />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
                      labelFormatter={(label) => `Month: ${label}`}
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke={REVENUE_COLOR} 
                      fill={REVENUE_COLOR} 
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </LuxuryCard>

            {/* Category Distribution */}
            <LuxuryCard padding="lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 luxury-font-serif">Top Categories by Revenue</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : '0'}%`}
                    >
                      {categoryPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </LuxuryCard>
          </div>

          {/* Order Status Distribution */}
          <LuxuryCard padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 luxury-font-serif">Order Status Distribution</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <LuxuryCard padding="md" className="border border-yellow-200 bg-yellow-50">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <span className="ml-2 font-medium text-yellow-800 luxury-font-serif">Pending</span>
                </div>
                <p className="text-2xl font-bold text-yellow-900 mt-2 luxury-font-serif">
                  {analytics.overview.pendingOrders}
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  {analytics.overview.totalOrders > 0 
                    ? ((analytics.overview.pendingOrders / analytics.overview.totalOrders) * 100).toFixed(1) 
                    : '0'}% of total
                </p>
              </LuxuryCard>

              <LuxuryCard padding="md" className="border border-blue-200 bg-blue-50">
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <span className="ml-2 font-medium text-blue-800 luxury-font-serif">Processing</span>
                </div>
                <p className="text-2xl font-bold text-blue-900 mt-2 luxury-font-serif">
                  {analytics.overview.processingOrders}
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  {analytics.overview.totalOrders > 0 
                    ? ((analytics.overview.processingOrders / analytics.overview.totalOrders) * 100).toFixed(1) 
                    : '0'}% of total
                </p>
              </LuxuryCard>

              <LuxuryCard padding="md" className="border border-green-200 bg-green-50">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-green-500" />
                  <span className="ml-2 font-medium text-green-800 luxury-font-serif">Completed</span>
                </div>
                <p className="text-2xl font-bold text-green-900 mt-2 luxury-font-serif">
                  {analytics.overview.completedOrders}
                </p>
                <p className="text-sm text-green-700 mt-1">
                  {analytics.overview.totalOrders > 0 
                    ? ((analytics.overview.completedOrders / analytics.overview.totalOrders) * 100).toFixed(1) 
                    : '0'}% of total
                </p>
              </LuxuryCard>

              <LuxuryCard padding="md" className="border border-red-200 bg-red-50">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <span className="ml-2 font-medium text-red-800 luxury-font-serif">Cancelled</span>
                </div>
                <p className="text-2xl font-bold text-red-900 mt-2 luxury-font-serif">
                  {analytics.overview.cancelledOrders}
                </p>
                <p className="text-sm text-red-700 mt-1">
                  {analytics.overview.totalOrders > 0 
                    ? ((analytics.overview.cancelledOrders / analytics.overview.totalOrders) * 100).toFixed(1) 
                    : '0'}% of total
                </p>
              </LuxuryCard>
            </div>
          </LuxuryCard>

          {/* Recent Orders and Low Stock Items */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <LuxuryCard padding="lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 luxury-font-serif">Recent Orders</h3>
              <div className="overflow-x-auto">
                <table className="luxury-table min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analytics.recentOrders.length > 0 ? (
                      analytics.recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50 luxury-ripple">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {order.orderNumber}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {order.customerName}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 luxury-font-serif">
                            {formatCurrency(order.total)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full luxury-badge ${
                              order.status === 'completed' ? 'bg-green-100 text-green-800' :
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(order.createdAt)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-3 text-center text-sm text-gray-500">
                          No recent orders
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </LuxuryCard>

            {/* Low Stock Items */}
            <LuxuryCard padding="lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 luxury-font-serif">Low Stock Items</h3>
              <div className="overflow-x-auto">
                <table className="luxury-table min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gemstone</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analytics.lowStockItems.length > 0 ? (
                      analytics.lowStockItems.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 luxury-ripple">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.name}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {item.category}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full luxury-badge ${
                              item.stockCount === 0 ? 'bg-red-100 text-red-800' :
                              item.stockCount <= 2 ? 'bg-orange-100 text-orange-800' :
                              item.stockCount <= 5 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {item.stockCount}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 luxury-font-serif">
                            {formatCurrency(item.price)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-3 text-center text-sm text-gray-500">
                          No low stock items
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </LuxuryCard>
          </div>
        </div>
      ) : (
        <PerformanceMetrics />
      )}
    </div>
  );
};

export default AdminDashboard;