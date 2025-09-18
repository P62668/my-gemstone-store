import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import { RefreshCw, TrendingUp, Clock, Zap, Eye } from 'lucide-react';

interface PerformanceMetrics {
  timestamp: string;
  pageLoadTime?: number;
  domContentLoadedTime?: number;
  firstPaint?: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  firstInputDelay?: number;
  cumulativeLayoutShift?: number;
}

interface BundleSizeData {
  name: string;
  size: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [bundleSizes, setBundleSizes] = useState<BundleSizeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics/performance');
      const data = await response.json();
      
      if (data.success) {
        setMetrics(data.data);
      } else {
        setError(data.error || 'Failed to fetch performance data');
      }
      
      // Mock bundle size data (in a real implementation, this would come from actual bundle analysis)
      setBundleSizes([
        { name: 'Main Bundle', size: 120 },
        { name: 'Vendor Bundle', size: 350 },
        { name: 'CSS Bundle', size: 45 },
        { name: 'Images', size: 280 },
        { name: 'Other Assets', size: 65 },
      ]);
    } catch (err) {
      setError('Failed to fetch performance data');
      console.error('Error fetching performance data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for charts
  const pageLoadData = metrics.map(metric => ({
    timestamp: new Date(metric.timestamp).toLocaleTimeString(),
    pageLoadTime: Math.round((metric.pageLoadTime || 0) / 100) / 10, // Convert to seconds
    firstContentfulPaint: Math.round((metric.firstContentfulPaint || 0) / 100) / 10,
    largestContentfulPaint: Math.round((metric.largestContentfulPaint || 0) / 100) / 10,
  }));

  const interactionData = metrics.map(metric => ({
    timestamp: new Date(metric.timestamp).toLocaleTimeString(),
    firstInputDelay: metric.firstInputDelay || 0,
    cumulativeLayoutShift: Math.round((metric.cumulativeLayoutShift || 0) * 1000) / 1000,
  }));

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
          onClick={fetchPerformanceData} 
          className="mt-4"
          variant="outline"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Performance Dashboard</h2>
        <Button onClick={fetchPerformanceData} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Page Load</CardTitle>
            <Zap className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.length > 0 
                ? `${Math.round((metrics.reduce((sum, m) => sum + (m.pageLoadTime || 0), 0) / metrics.length) / 100) / 10}s` 
                : '0s'}
            </div>
            <p className="text-xs text-gray-500">Target: &lt;1s</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg FCP</CardTitle>
            <Eye className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.length > 0 
                ? `${Math.round((metrics.reduce((sum, m) => sum + (m.firstContentfulPaint || 0), 0) / metrics.length) / 100) / 10}s` 
                : '0s'}
            </div>
            <p className="text-xs text-gray-500">First Contentful Paint</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg LCP</CardTitle>
            <TrendingUp className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.length > 0 
                ? `${Math.round((metrics.reduce((sum, m) => sum + (m.largestContentfulPaint || 0), 0) / metrics.length) / 100) / 10}s` 
                : '0s'}
            </div>
            <p className="text-xs text-gray-500">Largest Contentful Paint</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg FID</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.length > 0 
                ? `${Math.round((metrics.reduce((sum, m) => sum + (m.firstInputDelay || 0), 0) / metrics.length) * 100) / 100}ms` 
                : '0ms'}
            </div>
            <p className="text-xs text-gray-500">First Input Delay</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Page Load Times */}
        <Card>
          <CardHeader>
            <CardTitle>Page Load Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pageLoadData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis unit="s" />
                  <Tooltip formatter={(value) => [`${value}s`, 'Time']} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="pageLoadTime" 
                    name="Page Load Time" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="firstContentfulPaint" 
                    name="First Contentful Paint" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="largestContentfulPaint" 
                    name="Largest Contentful Paint" 
                    stroke="#ffc658" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* User Interactions */}
        <Card>
          <CardHeader>
            <CardTitle>User Interaction Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={interactionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    yAxisId="left"
                    dataKey="firstInputDelay" 
                    name="First Input Delay (ms)" 
                    fill="#8884d8" 
                  />
                  <Bar 
                    yAxisId="right"
                    dataKey="cumulativeLayoutShift" 
                    name="Cumulative Layout Shift" 
                    fill="#82ca9d" 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bundle Sizes */}
        <Card>
          <CardHeader>
            <CardTitle>Bundle Sizes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bundleSizes}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="size"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : '0'}%`}
                  >
                    {bundleSizes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} KB`, 'Size']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Performance Goals */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <h4 className="font-medium">Page Load Time</h4>
                  <p className="text-sm text-gray-500">Under 1 second</p>
                </div>
                <div className="text-green-600 font-bold">
                  {metrics.length > 0 && 
                  (metrics.reduce((sum, m) => sum + (m.pageLoadTime || 0), 0) / metrics.length) < 1000 
                    ? '✓ Achieved' 
                    : '✗ Not Met'}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <h4 className="font-medium">First Contentful Paint</h4>
                  <p className="text-sm text-gray-500">Under 1.8 seconds</p>
                </div>
                <div className="text-green-600 font-bold">
                  {metrics.length > 0 && 
                  (metrics.reduce((sum, m) => sum + (m.firstContentfulPaint || 0), 0) / metrics.length) < 1800 
                    ? '✓ Achieved' 
                    : '✗ Not Met'}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div>
                  <h4 className="font-medium">Largest Contentful Paint</h4>
                  <p className="text-sm text-gray-500">Under 2.5 seconds</p>
                </div>
                <div className="text-yellow-600 font-bold">
                  {metrics.length > 0 && 
                  (metrics.reduce((sum, m) => sum + (m.largestContentfulPaint || 0), 0) / metrics.length) < 2500 
                    ? '✓ Achieved' 
                    : '⚠ In Progress'}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <h4 className="font-medium">Cumulative Layout Shift</h4>
                  <p className="text-sm text-gray-500">Under 0.1</p>
                </div>
                <div className="text-green-600 font-bold">
                  {metrics.length > 0 && 
                  (metrics.reduce((sum, m) => sum + (m.cumulativeLayoutShift || 0), 0) / metrics.length) < 0.1 
                    ? '✓ Achieved' 
                    : '✗ Not Met'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PerformanceDashboard;