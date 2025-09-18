import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '../../components/AdminLayout';
import AdminDashboard from '../../components/admin/AdminDashboard';
import { toast } from 'react-hot-toast';
import { 
  BarChart3, 
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
  Eye
} from 'lucide-react';

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
  monthlyRevenue: any[];
  topCategories: any[];
  performance: {
    orderCompletionRate: string;
    averageOrderValue: string;
    totalRevenue: number;
    inventoryValue: number;
  };
  conversionRate: string;
}

interface AdminDashboardProps {
  user: any;
}

const AdminDashboardPage: React.FC<AdminDashboardProps> = ({ user: initialUser }) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(initialUser);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Set isClient to true on mount (client-side only)
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    console.log('Admin dashboard mounted with user:', initialUser);
    // Authentication enforced server-side via getServerSideProps.
    // Set authentication state and user data
    if (initialUser) {
      setIsAuthenticated(true);
      setUser(initialUser);
    } else if (isClient) {
      // If no user data and we're on the client side, redirect to login
      console.log('No user data, redirecting to admin login');
      router.push('/admin/login');
      return;
    }
    setIsLoading(false);
    
    // Fetch analytics data on mount
    fetchAnalytics();
    
    // Set up automatic refresh every 30 seconds
    refreshIntervalRef.current = setInterval(() => {
      fetchAnalytics();
    }, 30000); // 30 seconds
    
    // Clean up interval on component unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [initialUser, router, isClient]);

  const fetchAnalytics = async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      
      const response = await fetch('/api/admin/dashboard', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.data);
        setLastUpdated(new Date());
        // Show success toast only when manually refreshing
        if (isRefreshing && !isLoading) {
          toast.success('Dashboard updated');
        }
      } else {
        throw new Error(data.error || 'Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
      // Only show error toast when manually refreshing
      if (isRefreshing && !isLoading) {
        toast.error('Failed to update dashboard');
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchAnalytics();
  };

  if (isLoading || !isClient) {
    return (
      <AdminLayout
        title="Admin Dashboard - Shankarmala"
        description="Admin dashboard for Shankarmala Gemstones"
      >
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-500 mx-auto"></div>
            <p className="mt-4 text-lg text-amber-700">Loading Admin Dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <AdminLayout
        title="Admin Dashboard - Shankarmala"
        description="Admin dashboard for Shankarmala Gemstones"
      >
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
          <div className="max-w-2xl w-full mx-auto">
            <div className="bg-red-100 border border-red-300 text-red-800 px-6 py-6 rounded-xl text-center font-semibold shadow mb-6">
              <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-2" />
              <h2 className="text-2xl font-bold text-red-700 mb-2">Access Denied</h2>
              <p className="text-red-800 mb-4">You must be logged in as an administrator to access this page.</p>
              <button
                onClick={() => router.push('/admin/login')}
                className="bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout
        title="Admin Dashboard - Shankarmala"
        description="Admin dashboard for Shankarmala Gemstones"
      >
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
          <div className="max-w-2xl w-full mx-auto">
            <div className="bg-red-100 border border-red-300 text-red-800 px-6 py-6 rounded-xl text-center font-semibold shadow mb-6">
              <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-2" />
              <h2 className="text-2xl font-bold text-red-700 mb-2">Dashboard Error</h2>
              <p className="text-red-800 mb-4">{error}</p>
              <button
                onClick={handleRefresh}
                className="bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Admin Dashboard - Shankarmala"
      description="Admin dashboard for Shankarmala Gemstones"
    >
      <div className="p-6">
        {analytics && (
          <AdminDashboard
            initialData={analytics}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
            lastUpdated={lastUpdated}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;

// Server-side guard: require admin session
import getSessionOrRedirect from '../../utils/withServerAuth';
import type { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  console.log('Admin dashboard getServerSideProps called');
  const res = await getSessionOrRedirect(ctx, { requireAdmin: true });
  console.log('getSessionOrRedirect result:', res);
  if ('redirect' in res) {
    console.log('Redirecting from admin dashboard:', res.redirect);
    return res;
  }
  
  // Pass user data to the component
  return { 
    props: {
      user: res.session?.user || null
    } 
  };
};