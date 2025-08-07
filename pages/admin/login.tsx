import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import Head from 'next/head';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const router = useRouter();

  // Check if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/users/me', { credentials: 'include' });
        if (response.ok) {
          const user = await response.json();
          if (user.role === 'admin') {
            router.push('/admin');
          }
        }
      } catch (error) {
        console.log('Not authenticated');
      }
    };
    checkAuth();
  }, []); // Empty dependency array - run only once

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLocked) {
      toast.error('Account temporarily locked. Please try again later.');
      return;
    }

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Login successful! Redirecting...');
        setLoginAttempts(0);
        setTimeout(() => {
          router.push('/admin');
        }, 1000);
      } else {
        setLoginAttempts((prev) => prev + 1);
        toast.error(data.error || 'Login failed. Please check your credentials.');

        // Lock account after 5 failed attempts
        if (loginAttempts >= 4) {
          setIsLocked(true);
          toast.error(
            'Account locked due to multiple failed attempts. Please try again in 15 minutes.',
          );
          setTimeout(
            () => {
              setIsLocked(false);
              setLoginAttempts(0);
            },
            15 * 60 * 1000,
          );
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('admin@shankarmala.com');
    setPassword('Admin@123');

    // Auto-submit after setting demo credentials
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }
    }, 100);
  };

  return (
    <>
      <Head>
        <title>Admin Login - Shankarmala</title>
        <meta name="description" content="Admin panel login for Shankarmala Gemstones" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">🏠</div>
            <h1 className="text-3xl font-bold text-amber-900 font-serif">Shankarmala Admin</h1>
            <p className="text-amber-600 mt-2">Secure Admin Access</p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-3xl shadow-2xl border border-amber-100 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-amber-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                    placeholder="admin@shankarmala.com"
                    disabled={isLoading || isLocked}
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <span className="text-amber-400">📧</span>
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-amber-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-amber-200 px-4 py-3 pr-12 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                    placeholder="••••••••"
                    disabled={isLoading || isLocked}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-amber-400 hover:text-amber-600 transition-colors"
                    disabled={isLoading || isLocked}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Security Status */}
              {loginAttempts > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">
                    ⚠️ Failed attempts: {loginAttempts}/5
                    {loginAttempts >= 3 && ' - Account will be locked after 2 more attempts'}
                  </p>
                </div>
              )}

              {isLocked && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">
                    🔒 Account temporarily locked due to multiple failed attempts
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || isLocked}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>🔐</span>
                    <span>Sign In</span>
                  </>
                )}
              </button>

              {/* Demo Login Button */}
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={isLoading || isLocked}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg text-sm hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🚀 Quick Demo Login
              </button>
            </form>

            {/* Help Section */}
            <div className="mt-6 pt-6 border-t border-amber-100">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-2">Admin credentials:</p>
                <p className="text-xs text-gray-400">admin@shankarmala.com / Admin@123</p>
              </div>

              <div className="mt-4 text-center">
                <Link
                  href="/"
                  className="text-amber-600 hover:text-amber-700 text-sm font-medium transition-colors"
                >
                  ← Back to Website
                </Link>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              🔒 Secure admin access. All activities are logged and monitored.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
