import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';

interface Analytics {
  totalSales: number;
  totalOrders: number;
  totalUsers: number;
  totalGemstones: number;
  topGemstones: { name: string; sales: number }[];
  salesByCategory: { category: string; sales: number }[];
  topUsers: { id: number; name: string; totalSpent: number; orders: number }[];
  recentOrders: { id: number; user: string; total: number; status: string; createdAt: string }[];
  monthlySales: { month: string; sales: number }[];
}

const AdminAnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/analytics', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch analytics');
      const data = await res.json();
      // Ensure all required properties exist with default values
      const safeData = {
        totalSales: data.totalSales || 0,
        totalOrders: data.totalOrders || 0,
        totalUsers: data.totalUsers || 0,
        totalGemstones: data.totalGemstones || 0,
        topGemstones: data.topGemstones || [],
        salesByCategory: data.salesByCategory || [],
        topUsers: data.topUsers || [],
        recentOrders: data.recentOrders || [],
        monthlySales: data.monthlySales || [],
      };
      setAnalytics(safeData);
    } catch (err: any) {
      setError(err.message);
      setAnalytics({
        totalSales: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalGemstones: 0,
        topGemstones: [],
        salesByCategory: [],
        topUsers: [],
        recentOrders: [],
        monthlySales: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = async (type: 'orders' | 'users' | 'gemstones') => {
    setExportLoading(true);
    try {
      const res = await fetch(`/api/admin/export/${type}`);
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert('Export failed: ' + err.message);
    } finally {
      setExportLoading(false);
    }
  };

  if (loading)
    return (
      <Layout title="Admin Analytics - Kolkata Gems">
        <div className="max-w-7xl mx-auto py-12 px-4">
          <div className="text-center text-gray-500">Loading analytics...</div>
        </div>
      </Layout>
    );

  if (error)
    return (
      <Layout title="Admin Analytics - Kolkata Gems">
        <div className="max-w-7xl mx-auto py-12 px-4">
          <div className="text-center text-red-600">{error}</div>
        </div>
      </Layout>
    );

  return (
    <Layout title="Admin Analytics - Kolkata Gems">
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-amber-900">Admin Analytics</h1>
          <div className="flex gap-2">
            <button
              onClick={() => exportToCSV('orders')}
              disabled={exportLoading}
              className="bg-amber-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-amber-700 transition disabled:opacity-50"
            >
              {exportLoading ? 'Exporting...' : 'Export Orders'}
            </button>
            <button
              onClick={() => exportToCSV('users')}
              disabled={exportLoading}
              className="bg-amber-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-amber-700 transition disabled:opacity-50"
            >
              {exportLoading ? 'Exporting...' : 'Export Users'}
            </button>
            <button
              onClick={() => exportToCSV('gemstones')}
              disabled={exportLoading}
              className="bg-amber-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-amber-700 transition disabled:opacity-50"
            >
              {exportLoading ? 'Exporting...' : 'Export Gemstones'}
            </button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="bg-white/80 rounded-3xl shadow-xl border border-amber-100 p-8 flex flex-col items-center luxury-card">
            <span className="text-2xl font-bold text-amber-900 mb-2">
              ${analytics?.totalSales?.toLocaleString() ?? '--'}
            </span>
            <span className="text-lg text-gray-500">Total Sales</span>
          </div>
          <div className="bg-white/80 rounded-3xl shadow-xl border border-amber-100 p-8 flex flex-col items-center luxury-card">
            <span className="text-2xl font-bold text-amber-900 mb-2">
              {analytics?.totalOrders ?? '--'}
            </span>
            <span className="text-lg text-gray-500">Orders</span>
          </div>
          <div className="bg-white/80 rounded-3xl shadow-xl border border-amber-100 p-8 flex flex-col items-center luxury-card">
            <span className="text-2xl font-bold text-amber-900 mb-2">
              {analytics?.totalUsers ?? '--'}
            </span>
            <span className="text-lg text-gray-500">Users</span>
          </div>
          <div className="bg-white/80 rounded-3xl shadow-xl border border-amber-100 p-8 flex flex-col items-center luxury-card">
            <span className="text-2xl font-bold text-amber-900 mb-2">
              {analytics?.totalGemstones ?? '--'}
            </span>
            <span className="text-lg text-gray-500">Gemstones</span>
          </div>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Top Gemstones */}
          <div className="bg-white/80 rounded-3xl shadow-xl border border-amber-100 p-8">
            <h2 className="text-2xl font-semibold text-amber-900 mb-6">Top Gemstones</h2>
            <div className="space-y-4">
              {(analytics?.topGemstones || []).map((gem, idx) => (
                <div
                  key={gem.name}
                  className="flex items-center justify-between p-4 bg-amber-50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-amber-700 font-bold text-lg">{idx + 1}</span>
                    <span className="font-semibold text-amber-900">{gem.name}</span>
                  </div>
                  <span className="text-amber-700 font-bold">{gem.sales} sales</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sales by Category */}
          <div className="bg-white/80 rounded-3xl shadow-xl border border-amber-100 p-8">
            <h2 className="text-2xl font-semibold text-amber-900 mb-6">Sales by Category</h2>
            <div className="space-y-4">
              {(analytics?.salesByCategory || []).map((cat, idx) => (
                <div
                  key={cat.category}
                  className="flex items-center justify-between p-4 bg-amber-50 rounded-xl"
                >
                  <span className="font-semibold text-amber-900">{cat.category}</span>
                  <span className="text-amber-700 font-bold">
                    ${(cat.sales || 0).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Users */}
        <div className="bg-white/80 rounded-3xl shadow-xl border border-amber-100 p-8 mb-12">
          <h2 className="text-2xl font-semibold text-amber-900 mb-6">Top Users</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-amber-200">
                  <th className="text-left py-3 px-4 font-semibold text-amber-900">User</th>
                  <th className="text-left py-3 px-4 font-semibold text-amber-900">Total Spent</th>
                  <th className="text-left py-3 px-4 font-semibold text-amber-900">Orders</th>
                </tr>
              </thead>
              <tbody>
                {(analytics?.topUsers || []).map((user) => (
                  <tr key={user.id || user.name} className="border-b border-amber-100">
                    <td className="py-3 px-4 font-semibold text-amber-900">{user.name}</td>
                    <td className="py-3 px-4 text-amber-700 font-bold">
                      ${(user.totalSpent || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{user.orders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white/80 rounded-3xl shadow-xl border border-amber-100 p-8">
          <h2 className="text-2xl font-semibold text-amber-900 mb-6">Recent Orders</h2>
          <div className="space-y-4">
            {(analytics?.recentOrders || []).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 bg-amber-50 rounded-xl"
              >
                <div>
                  <span className="font-bold text-amber-900">Order #{order.id}</span>
                  <span className="ml-2 text-sm text-gray-500">{order.user}</span>
                  <span className="ml-2 text-xs text-gray-400">{order.status}</span>
                </div>
                <div className="text-right">
                  <div className="text-amber-700 font-bold">
                    ${(order.total || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminAnalyticsPage;
