import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { useUser } from '../components/context/UserContext';
import { useRouter } from 'next/router';

export default function Login() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const [form, setForm] = useState({ email: '', password: '' });
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const { login } = useUser();
  const router = useRouter();

  if (!mounted) {
    return (
      <Layout title="Login - Shankarmala Gemstore">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-500"></div>
        </div>
      </Layout>
    );
  }

  // Real-time validation
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === 'email') {
      setFormErrors((prev) => ({
        ...prev,
        email: !/^\S+@\S+\.\S+$/.test(value) ? 'Enter a valid email.' : undefined,
      }));
    }
    if (name === 'password') {
      setFormErrors((prev) => ({
        ...prev,
        password: value.length < 6 ? 'Password must be at least 6 characters.' : undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    // Validate before submit
    const errors: { email?: string; password?: string } = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'Enter a valid email.';
    if (form.password.length < 6) errors.password = 'Password must be at least 6 characters.';
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setLoading(true);
    try {
      const success = await login(form.email, form.password);
      if (success) {
        setSuccess('Login successful! Redirecting...');
        setForm({ email: '', password: '' });
        
        // Wait a moment to show success message
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Check user role and redirect
        const userRes = await fetch('/api/users/me', { credentials: 'include' });
        if (userRes.ok) {
          const userData = await userRes.json();
          if (userData.role === 'admin') {
            router.push('/admin');
          } else {
            // Check if there's a redirect parameter
            const redirectTo = router.query.redirect as string;
            router.push(redirectTo || '/');
          }
        } else {
          throw new Error('Authentication verification failed');
        }
      } else {
        throw new Error('Invalid email or password. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  // Forgot password handler
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setForgotSent(false);
    if (!/^\S+@\S+\.\S+$/.test(forgotEmail)) {
      setError('Enter a valid email.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/users/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      await res.json();
      setForgotSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Login - Kolkata Gems">
      <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 py-12 px-4">
        <div className="w-full max-w-md bg-white/80 rounded-3xl shadow-xl border border-amber-100 p-8 relative">
          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center rounded-3xl">
              <svg
                className="animate-spin h-8 w-8 text-amber-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
            </div>
          )}
          <h1 className="text-3xl font-bold text-amber-900 mb-6 text-center">
            Login to Your Account
          </h1>
          {!forgotMode ? (
            <form className="flex flex-col gap-4" onSubmit={handleSubmit} aria-label="Login form">
              <label htmlFor="login-email" className="sr-only">
                Email
              </label>
              <input
                ref={emailInputRef}
                id="login-email"
                name="email"
                type="email"
                placeholder="Email"
                required
                className={`rounded-xl border px-4 py-3 focus:ring-amber-500 ${formErrors.email ? 'border-red-400' : 'border-amber-200'}`}
                value={form.email}
                onChange={handleChange}
                aria-invalid={!!formErrors.email}
                aria-describedby={formErrors.email ? 'login-email-error' : undefined}
                autoComplete="email"
              />
              {formErrors.email && (
                <div id="login-email-error" className="text-red-600 text-xs" role="alert">
                  {formErrors.email}
                </div>
              )}
              <div className="relative">
                <label htmlFor="login-password" className="sr-only">
                  Password
                </label>
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  required
                  className={`rounded-xl border px-4 py-3 focus:ring-amber-500 w-full ${formErrors.password ? 'border-red-400' : 'border-amber-200'}`}
                  value={form.password}
                  onChange={handleChange}
                  aria-invalid={!!formErrors.password}
                  aria-describedby={formErrors.password ? 'login-password-error' : undefined}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-600 focus:outline-none"
                  tabIndex={0}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.234.938-4.675m1.662-2.325A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.336 3.234-.938 4.675m-1.662 2.325A9.956 9.956 0 0112 21c-5.523 0-10-4.477-10-10"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {formErrors.password && (
                <div id="login-password-error" className="text-red-600 text-xs" role="alert">
                  {formErrors.password}
                </div>
              )}
              <button
                type="submit"
                className={`mt-4 px-6 py-3 rounded-xl font-bold transition-all duration-200 ${
                  loading
                    ? 'bg-amber-400 cursor-not-allowed'
                    : 'bg-amber-600 hover:bg-amber-700 hover:shadow-lg transform hover:-translate-y-0.5'
                } text-white`}
                disabled={loading}
                aria-busy={loading}
                aria-label="Login"
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
                  'Login to Your Account'
                )}
              </button>
              <button
                type="button"
                className="text-xs text-amber-700 hover:underline mt-2 text-left"
                onClick={() => {
                  setForgotMode(true);
                  setError('');
                  setForgotSent(false);
                  setTimeout(() => emailInputRef.current?.focus(), 100);
                }}
              >
                Forgot password?
              </button>
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg" role="alert">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-red-700 text-sm font-medium">{error}</span>
                  </div>
                </div>
              )}
              {success && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg" role="status">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-green-700 text-sm font-medium">{success}</span>
                  </div>
                </div>
              )}
            </form>
          ) : (
            <form
              className="flex flex-col gap-4"
              onSubmit={handleForgot}
              aria-label="Forgot password form"
            >
              <label htmlFor="forgot-email" className="sr-only">
                Email
              </label>
              <input
                id="forgot-email"
                name="forgot-email"
                type="email"
                placeholder="Enter your email"
                required
                className="rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                autoComplete="email"
              />
              <button
                type="submit"
                className="mt-2 bg-amber-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-700 transition"
                disabled={loading}
                aria-busy={loading}
                aria-label="Send password reset"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <button
                type="button"
                className="text-xs text-gray-500 hover:underline mt-2 text-left"
                onClick={() => {
                  setForgotMode(false);
                  setError('');
                  setForgotSent(false);
                }}
              >
                Back to login
              </button>
              {forgotSent && (
                <div className="text-green-700 text-sm mt-2" role="status">
                  If your email exists, a reset link has been sent.
                </div>
              )}
              {error && (
                <div className="text-red-600 text-sm mt-2" role="alert">
                  {error}
                </div>
              )}
            </form>
          )}
          <div className="mt-4 text-center text-sm">
            <span>Don&apos;t have an account? </span>
            <Link href="/signup" className="text-amber-700 font-semibold hover:underline">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};
