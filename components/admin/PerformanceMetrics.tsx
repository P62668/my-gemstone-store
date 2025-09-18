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
  Zap, 
  Eye, 
  Clock, 
  Activity,
  TrendingUp,
  Download,
  RefreshCw
} from 'lucide-react';
import LuxuryCard from '../ui/LuxuryCard';
import Button from '../ui/Button';

interface PerformanceMetricsData {
  pageLoadTimes: { timestamp: string; loadTime: number; fcp: number; lcp: number }[];
  userInteractions: { timestamp: string; fid: number; cls: number }[];
  bundleSizes: { name: string; size: number }[];
  performanceGoals: {
    pageLoadTime: { current: number; target: number; achieved: boolean };
    firstContentfulPaint: { current: number; target: number; achieved: boolean };
    largestContentfulPaint: { current: number; target: number; achieved: boolean };
    cumulativeLayoutShift: { current: number; target: number; achieved: boolean };
  };
}

const PerformanceMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchPerformanceMetrics();
  }, []);

  const fetchPerformanceMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real implementation, this would fetch from your API
      // For now, we'll use mock data
      const mockData: PerformanceMetricsData = {
        pageLoadTimes: [
          { timestamp: '2023-01-01', loadTime: 850, fcp: 1200, lcp: 2100 },
          { timestamp: '2023-01-02', loadTime: 920, fcp: 1350, lcp: 2400 },
          { timestamp: '2023-01-03', loadTime: 780, fcp: 1100, lcp: 1900 },
          { timestamp: '2023-01-04', loadTime: 810, fcp: 1150, lcp: 2000 },
          { timestamp: '2023-01-05', loadTime: 790, fcp: 1120, lcp: 1950 },
          { timestamp: '2023-01-06', loadTime: 830, fcp: 1180, lcp: 2050 },
          { timestamp: '2023-01-07', loadTime: 760, fcp: 1050, lcp: 1800 },
        ],
        userInteractions: [
          { timestamp: '2023-01-01', fid: 120, cls: 0.05 },
          { timestamp: '2023-01-02', fid: 150, cls: 0.08 },
          { timestamp: '2023-01-03', fid: 90, cls: 0.03 },
          { timestamp: '2023-01-04', fid: 110, cls: 0.04 },
          { timestamp: '2023-01-05', fid: 100, cls: 0.03 },
          { timestamp: '2023-01-06', fid: 130, cls: 0.06 },
          { timestamp: '2023-01-07', fid: 85, cls: 0.02 },
        ],
        bundleSizes: [
          { name: 'Main Bundle', size: 120 },
          { name: 'Vendor Bundle', size: 350 },
          { name: 'CSS Bundle', size: 45 },
          { name: 'Images', size: 280 },
          { name: 'Other Assets', size: 65 },
        ],
        performanceGoals: {
          pageLoadTime: { current: 0.85, target: 1.0, achieved: true },
          firstContentfulPaint: { current: 1.15, target: 1.8, achieved: true },
          largestContentfulPaint: { current: 1.95, target: 2.5, achieved: true },
          cumulativeLayoutShift: { current: 0.04, target: 0.1, achieved: true },
        }
      };
      
      setMetrics(mockData);
    } catch (err) {
      setError('Failed to fetch performance metrics');
      console.error('Error fetching performance metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444'];
  const PERFORMANCE_COLOR = '#f59e0b';
  const INTERACTION_COLOR = '#10b981';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-medium">Error</h3>
        <p className="text-red-600 mt-2">{error}</p>
        <Button 
          onClick={fetchPerformanceMetrics} 
          className="mt-4"
          variant="outline"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Performance Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <LuxuryCard padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Page Load Time</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {metrics.performanceGoals.pageLoadTime.current.toFixed(2)}s
              </p>
              <p className="text-xs text-gray-500">
                Target: &lt;{metrics.performanceGoals.pageLoadTime.target}s
              </p>
            </div>
            <div className={`p-3 rounded-lg ${metrics.performanceGoals.pageLoadTime.achieved ? 'bg-green-100' : 'bg-red-100'}`}>
              <Zap className={`h-6 w-6 ${metrics.performanceGoals.pageLoadTime.achieved ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </div>
          <div className={`mt-2 text-xs font-medium ${metrics.performanceGoals.pageLoadTime.achieved ? 'text-green-600' : 'text-red-600'}`}>
            {metrics.performanceGoals.pageLoadTime.achieved ? '✓ Goal Achieved' : '✗ Goal Not Met'}
          </div>
        </LuxuryCard>

        <LuxuryCard padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">First Contentful Paint</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {metrics.performanceGoals.firstContentfulPaint.current.toFixed(2)}s
              </p>
              <p className="text-xs text-gray-500">
                Target: &lt;{metrics.performanceGoals.firstContentfulPaint.target}s
              </p>
            </div>
            <div className={`p-3 rounded-lg ${metrics.performanceGoals.firstContentfulPaint.achieved ? 'bg-green-100' : 'bg-red-100'}`}>
              <Eye className={`h-6 w-6 ${metrics.performanceGoals.firstContentfulPaint.achieved ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </div>
          <div className={`mt-2 text-xs font-medium ${metrics.performanceGoals.firstContentfulPaint.achieved ? 'text-green-600' : 'text-red-600'}`}>
            {metrics.performanceGoals.firstContentfulPaint.achieved ? '✓ Goal Achieved' : '✗ Goal Not Met'}
          </div>
        </LuxuryCard>

        <LuxuryCard padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Largest Contentful Paint</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {metrics.performanceGoals.largestContentfulPaint.current.toFixed(2)}s
              </p>
              <p className="text-xs text-gray-500">
                Target: &lt;{metrics.performanceGoals.largestContentfulPaint.target}s
              </p>
            </div>
            <div className={`p-3 rounded-lg ${metrics.performanceGoals.largestContentfulPaint.achieved ? 'bg-green-100' : 'bg-red-100'}`}>
              <TrendingUp className={`h-6 w-6 ${metrics.performanceGoals.largestContentfulPaint.achieved ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </div>
          <div className={`mt-2 text-xs font-medium ${metrics.performanceGoals.largestContentfulPaint.achieved ? 'text-green-600' : 'text-red-600'}`}>
            {metrics.performanceGoals.largestContentfulPaint.achieved ? '✓ Goal Achieved' : '✗ Goal Not Met'}
          </div>
        </LuxuryCard>

        <LuxuryCard padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cumulative Layout Shift</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {metrics.performanceGoals.cumulativeLayoutShift.current.toFixed(3)}
              </p>
              <p className="text-xs text-gray-500">
                Target: &lt;{metrics.performanceGoals.cumulativeLayoutShift.target}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${metrics.performanceGoals.cumulativeLayoutShift.achieved ? 'bg-green-100' : 'bg-red-100'}`}>
              <Activity className={`h-6 w-6 ${metrics.performanceGoals.cumulativeLayoutShift.achieved ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </div>
          <div className={`mt-2 text-xs font-medium ${metrics.performanceGoals.cumulativeLayoutShift.achieved ? 'text-green-600' : 'text-red-600'}`}>
            {metrics.performanceGoals.cumulativeLayoutShift.achieved ? '✓ Goal Achieved' : '✗ Goal Not Met'}
          </div>
        </LuxuryCard>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Page Load Performance */}
        <LuxuryCard padding="lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 luxury-font-serif">Page Load Performance</h3>
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
              <LineChart
                data={metrics.pageLoadTimes}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="timestamp" 
                  stroke="#6b7280" 
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280" 
                  fontSize={12}
                  unit="ms"
                />
                <Tooltip 
                  formatter={(value) => [`${value}ms`, 'Time']}
                  labelFormatter={(label) => `Date: ${label}`}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="loadTime" 
                  name="Page Load Time" 
                  stroke={PERFORMANCE_COLOR} 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="fcp" 
                  name="First Contentful Paint" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="lcp" 
                  name="Largest Contentful Paint" 
                  stroke="#ffc658" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </LuxuryCard>

        {/* User Interactions */}
        <LuxuryCard padding="lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 luxury-font-serif">User Interaction Metrics</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metrics.userInteractions}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="timestamp" 
                  stroke="#6b7280" 
                  fontSize={12}
                />
                <YAxis 
                  yAxisId="left" 
                  stroke="#6b7280" 
                  fontSize={12}
                  unit="ms"
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke="#6b7280" 
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                />
                <Legend />
                <Bar 
                  yAxisId="left"
                  dataKey="fid" 
                  name="First Input Delay (ms)" 
                  fill={INTERACTION_COLOR} 
                />
                <Bar 
                  yAxisId="right"
                  dataKey="cls" 
                  name="Cumulative Layout Shift" 
                  fill="#82ca9d" 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </LuxuryCard>
      </div>

      {/* Bundle Sizes */}
      <LuxuryCard padding="lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 luxury-font-serif">Bundle Sizes</h3>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.bundleSizes}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="size"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : '0'}%`}
                >
                  {metrics.bundleSizes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} KB`, 'Size']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            {metrics.bundleSizes.map((bundle, index) => (
              <div key={bundle.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded mr-3" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="font-medium">{bundle.name}</span>
                </div>
                <span className="font-bold">{bundle.size} KB</span>
              </div>
            ))}
            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
              <span className="font-medium">Total Bundle Size</span>
              <span className="font-bold text-amber-700">
                {metrics.bundleSizes.reduce((sum, bundle) => sum + bundle.size, 0)} KB
              </span>
            </div>
          </div>
        </div>
      </LuxuryCard>
    </div>
  );
};

export default PerformanceMetrics;