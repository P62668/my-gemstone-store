import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { useUser } from '../components/context/UserContext';
import { useRouter } from 'next/router';

const LoginPage: React.FC = () => {
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string }>({});
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const { setUser } = useUser();
  const router = useRouter();

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
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      setSuccess('Login successful!');
      // Fetch user info and update context
      const userRes = await fetch('/api/users/me');
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
        setForm({ email: '', password: '' });
        if (userData.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      } else {
        throw new Error('Failed to fetch user data');
      }
    } catch (err: any) {
      setError(err.message);
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
                className="mt-4 bg-amber-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-700 transition"
                disabled={loading}
                aria-busy={loading}
                aria-label="Login"
              >
                {loading ? 'Logging in...' : 'Login'}
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
                <div className="text-red-600 text-sm mt-2" role="alert">
                  {error}
                </div>
              )}
              {success && (
                <div className="text-green-700 text-sm mt-2" role="status">
                  {success}
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
            <span>Don't have an account? </span>
            <Link href="/signup" className="text-amber-700 font-semibold hover:underline">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};
export default LoginPage;
