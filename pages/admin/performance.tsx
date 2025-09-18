import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '../../components/AdminLayout';
import PerformanceDashboard from '../../components/admin/PerformanceDashboard';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AdminPerformanceProps {
  user: any;
}

const AdminPerformancePage: React.FC<AdminPerformanceProps> = ({ user: initialUser }) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(initialUser);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Admin performance page mounted with user:', initialUser);
    // Authentication enforced server-side via getServerSideProps.
    // Set authentication state and user data
    if (initialUser) {
      setIsAuthenticated(true);
      setUser(initialUser);
    } else {
      // If no user data, redirect to login
      console.log('No user data, redirecting to admin login');
      router.push('/admin/login');
      return;
    }
    setIsLoading(false);
  }, [initialUser, router]);

  if (isLoading) {
    return (
      <AdminLayout
        title="Performance Monitoring - Shankarmala Admin"
        description="Performance monitoring dashboard for Shankarmala Gemstones"
      >
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-500 mx-auto"></div>
            <p className="mt-4 text-lg text-amber-700">Loading Performance Dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <AdminLayout
        title="Performance Monitoring - Shankarmala Admin"
        description="Performance monitoring dashboard for Shankarmala Gemstones"
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

  return (
    <AdminLayout
      title="Performance Monitoring - Shankarmala Admin"
      description="Performance monitoring dashboard for Shankarmala Gemstones"
    >
      <div className="p-6">
        <PerformanceDashboard />
      </div>
    </AdminLayout>
  );
};

export default AdminPerformancePage;

// Server-side guard: require admin session
import getSessionOrRedirect from '../../utils/withServerAuth';
import type { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  console.log('Admin performance page getServerSideProps called');
  const res = await getSessionOrRedirect(ctx, { requireAdmin: true });
  console.log('getSessionOrRedirect result:', res);
  if ('redirect' in res) {
    console.log('Redirecting from admin performance page:', res.redirect);
    return res;
  }
  
  // Pass user data to the component
  return { 
    props: {
      user: res.session?.user || null
    } 
  };
};