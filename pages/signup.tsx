import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';

const SignupPage: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    terms?: string;
  }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [agreed, setAgreed] = useState(false);

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
      setPasswordStrength(getPasswordStrength(value));
    }
    if (name === 'name') {
      setFormErrors((prev) => ({
        ...prev,
        name: value.trim().length < 2 ? 'Enter your full name.' : undefined,
      }));
    }
  };

  // Password strength: 0-4
  function getPasswordStrength(pw: string) {
    let score = 0;
    if (pw.length >= 6) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    // Validate before submit
    const errors: { name?: string; email?: string; password?: string; terms?: string } = {};
    if (form.name.trim().length < 2) errors.name = 'Enter your full name.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'Enter a valid email.';
    if (form.password.length < 6) errors.password = 'Password must be at least 6 characters.';
    if (!agreed) errors.terms = 'You must agree to the terms and privacy policy.';
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setLoading(true);
    try {
      const res = await fetch('/api/users/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error && data.error.toLowerCase().includes('email')) {
          setFormErrors((f) => ({ ...f, email: data.error }));
        }
        throw new Error(data.error || 'Signup failed');
      }
      setSuccess('Account created! You can now log in.');
      setForm({ name: '', email: '', password: '' });
      setAgreed(false);
      setPasswordStrength(0);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unknown error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign Up - Shankarmala Gemstore</title>
        <meta
          name="description"
          content="Create your account at Shankarmala Gemstore. Enjoy luxury, secure shopping, and exclusive member benefits."
        />
        <link rel="canonical" href="https://shankarmala.com/signup" />
        <meta property="og:title" content="Sign Up - Shankarmala Gemstore" />
        <meta
          property="og:description"
          content="Create your account at Shankarmala Gemstore. Enjoy luxury, secure shopping, and exclusive member benefits."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://shankarmala.com/signup" />
        <meta property="og:image" content="/images/placeholder-gemstone.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Sign Up - Shankarmala Gemstore" />
        <meta
          name="twitter:description"
          content="Create your account at Shankarmala Gemstore. Enjoy luxury, secure shopping, and exclusive member benefits."
        />
        <meta name="twitter:image" content="/images/placeholder-gemstone.jpg" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'RegisterAction',
              agent: {
                '@type': 'Organization',
                name: 'Shankarmala Gemstore',
              },
              object: 'UserAccount',
            }),
          }}
        />
      </Head>
      <Layout title="Sign Up - Shankarmala Gemstore">
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
              Create Your Account
            </h1>
            {/* Social signup placeholder */}
            {/* <div className="flex gap-3 mb-4 justify-center">
              <button className="bg-white border border-amber-200 rounded-full px-4 py-2 flex items-center gap-2 shadow hover:bg-amber-50">
                <Image
                  src={typeof '/images/google.svg' === 'string' && '/images/google.svg'.startsWith('/') ? '/images/google.svg' : '/images/placeholder-gemstone.jpg'}
                  alt="Google"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                /> Google
              </button>
              <button className="bg-white border border-amber-200 rounded-full px-4 py-2 flex items-center gap-2 shadow hover:bg-amber-50">
                <Image
                  src={typeof '/images/apple.svg' === 'string' && '/images/apple.svg'.startsWith('/') ? '/images/apple.svg' : '/images/placeholder-gemstone.jpg'}
                  alt="Apple"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                /> Apple
              </button>
            </div> */}
            <form className="flex flex-col gap-4" onSubmit={handleSubmit} aria-label="Signup form">
              <label htmlFor="signup-name" className="sr-only">
                Full Name
              </label>
              <input
                id="signup-name"
                name="name"
                type="text"
                placeholder="Full Name"
                required
                className={`rounded-xl border px-4 py-3 focus:ring-amber-500 ${formErrors.name ? 'border-red-400' : 'border-amber-200'}`}
                value={form.name}
                onChange={handleChange}
                aria-invalid={!!formErrors.name}
                aria-describedby={formErrors.name ? 'signup-name-error' : undefined}
                autoComplete="name"
              />
              {formErrors.name && (
                <div id="signup-name-error" className="text-red-600 text-xs" role="alert">
                  {formErrors.name}
                </div>
              )}
              <label htmlFor="signup-email" className="sr-only">
                Email
              </label>
              <input
                id="signup-email"
                name="email"
                type="email"
                placeholder="Email"
                required
                className={`rounded-xl border px-4 py-3 focus:ring-amber-500 ${formErrors.email ? 'border-red-400' : 'border-amber-200'}`}
                value={form.email}
                onChange={handleChange}
                aria-invalid={!!formErrors.email}
                aria-describedby={formErrors.email ? 'signup-email-error' : undefined}
                autoComplete="email"
              />
              {formErrors.email && (
                <div id="signup-email-error" className="text-red-600 text-xs" role="alert">
                  {formErrors.email}
                </div>
              )}
              <div className="relative">
                <label htmlFor="signup-password" className="sr-only">
                  Password
                </label>
                <input
                  id="signup-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  required
                  className={`rounded-xl border px-4 py-3 focus:ring-amber-500 w-full ${formErrors.password ? 'border-red-400' : 'border-amber-200'}`}
                  value={form.password}
                  onChange={handleChange}
                  aria-invalid={!!formErrors.password}
                  aria-describedby={formErrors.password ? 'signup-password-error' : undefined}
                  autoComplete="new-password"
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
              {/* Password strength meter */}
              <div className="h-2 w-full bg-amber-100 rounded-full mt-1 mb-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${passwordStrength === 0 ? 'w-0' : passwordStrength === 1 ? 'w-1/4 bg-red-400' : passwordStrength === 2 ? 'w-1/2 bg-yellow-400' : passwordStrength === 3 ? 'w-3/4 bg-amber-500' : 'w-full bg-green-500'}`}
                ></div>
              </div>
              <div className="text-xs text-amber-700 mb-2" aria-live="polite">
                {form.password &&
                  (passwordStrength === 1
                    ? 'Weak password'
                    : passwordStrength === 2
                      ? 'Medium password'
                      : passwordStrength === 3
                        ? 'Strong password'
                        : passwordStrength === 4
                          ? 'Very strong password'
                          : '')}
              </div>
              {formErrors.password && (
                <div id="signup-password-error" className="text-red-600 text-xs" role="alert">
                  {formErrors.password}
                </div>
              )}
              {/* Terms and privacy checkbox */}
              <label className="flex items-center gap-2 text-xs text-amber-900 mt-2">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="accent-amber-600 rounded"
                  required
                  aria-invalid={!!formErrors.terms}
                  aria-describedby={formErrors.terms ? 'signup-terms-error' : undefined}
                />
                I agree to the{' '}
                <a
                  href="/terms"
                  className="underline hover:text-amber-700"
                  target="_blank"
                  rel="noopener"
                >
                  Terms
                </a>{' '}
                and{' '}
                <a
                  href="/privacy"
                  className="underline hover:text-amber-700"
                  target="_blank"
                  rel="noopener"
                >
                  Privacy Policy
                </a>
                .
              </label>
              {formErrors.terms && (
                <div id="signup-terms-error" className="text-red-600 text-xs" role="alert">
                  {formErrors.terms}
                </div>
              )}
              <button
                type="submit"
                className="mt-2 bg-amber-600 text-white px-8 py-3 rounded-2xl font-bold text-lg shadow-lg hover:bg-amber-700 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500"
                disabled={loading}
                aria-busy={loading}
                aria-label="Sign Up"
              >
                {loading ? 'Signing Up...' : 'Sign Up'}
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
            <div className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link href="/login" className="text-amber-700 font-semibold hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default SignupPage;
