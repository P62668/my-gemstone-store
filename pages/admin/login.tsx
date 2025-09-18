import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  // Set isClient to true on mount (client-side only)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check if already logged in
  // Authentication redirect handled server-side via getServerSideProps

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (loading) {
      return;
    }
    
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      console.log('🔄 Attempting admin login for:', email);
      
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      
      const data = await res.json();
      console.log('📡 Admin login response:', { status: res.status, success: data.success, data });
      
      if (!res.ok) {
        // Handle specific error cases
        if (res.status === 401) {
          throw new Error('Invalid email or password. Please try again.');
        } else if (res.status === 403) {
          throw new Error('Access denied. Admin privileges required.');
        } else if (res.status === 429) {
          throw new Error('Too many login attempts. Please try again later.');
        } else {
          throw new Error(data.error?.message || data.error || 'Login failed. Please try again.');
        }
      }
      
      // Check if login was actually successful
      if (!data.success) {
        throw new Error(data.error?.message || data.error || 'Login failed. Please try again.');
      }
      
      // Show success message
      setSuccess('Login successful! Redirecting to admin dashboard...');
      console.log('✅ Admin login successful, preparing redirect...');
      
      // Wait a moment for the cookie to be set and show success message
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Use Next.js router for client-side navigation instead of full page reload (client-side only)
      if (isClient) {
        console.log('🔄 Redirecting to admin dashboard...');
        router.push('/admin').then(() => {
          // Force a refresh to ensure the page loads with the new authentication state
          window.location.reload();
        });
      }
      
    } catch (err: unknown) {
      console.error('❌ Admin login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: 'email' | 'password', value: string) => {
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
    if (field === 'email') {
      setEmail(value);
    } else {
      setPassword(value);
    }
  };

  return (
    <AdminLayout title="Admin Login - Shankarmala" description="Admin authentication">
      <div className="min-h-[60vh] flex items-center justify-center py-16">
        <form
          onSubmit={onSubmit}
          className="bg-white/90 rounded-2xl shadow-xl border border-amber-200 p-8 w-full max-w-md"
        >
          <h1 className="text-2xl font-bold text-amber-900 mb-6 text-center">Admin Login</h1>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-amber-900 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                required
                autoComplete="email"
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-amber-900 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                required
                autoComplete="current-password"
                disabled={loading}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-red-700 text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-green-700 text-sm font-medium">{success}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            className={`w-full mt-6 px-6 py-3 rounded-xl font-bold transition-all duration-200 ${
              loading
                ? 'bg-amber-400 cursor-not-allowed'
                : 'bg-amber-600 hover:bg-amber-700 hover:shadow-lg transform hover:-translate-y-0.5'
            } text-white`}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </div>
            ) : (
              'Login to Admin Panel'
            )}
          </button>

          <div className="mt-4 text-center">
            <p className="text-sm text-amber-700">
              Need help? Contact the system administrator
            </p>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminLogin;

// Redirect authenticated admins away from login page
import getSessionOrRedirect from '../../utils/withServerAuth';