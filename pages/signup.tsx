import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';

const SignupPage: React.FC = () => {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formErrors, setFormErrors] = useState<{
    firstName?: string;
    lastName?: string;
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
    if (name === 'firstName') {
      setFormErrors((prev) => ({
        ...prev,
        firstName: value.trim().length < 1 ? 'Enter your first name.' : undefined,
      }));
    }
    if (name === 'lastName') {
      setFormErrors((prev) => ({
        ...prev,
        lastName: value.trim().length < 1 ? 'Enter your last name.' : undefined,
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
    
    // Enhanced validation with more detailed feedback
    const errors: { firstName?: string; lastName?: string; email?: string; password?: string; terms?: string } = {};
    
    // Name validation
    if (form.firstName.trim().length < 1) {
      errors.firstName = 'Enter your first name.';
    } else if (form.firstName.trim().length > 50) {
      errors.firstName = 'First name is too long (maximum 50 characters).';
    }
    
    if (form.lastName.trim().length < 1) {
      errors.lastName = 'Enter your last name.';
    } else if (form.lastName.trim().length > 50) {
      errors.lastName = 'Last name is too long (maximum 50 characters).';
    }
    
    // Email validation with better pattern
    if (!form.email) {
      errors.email = 'Email is required.';
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.email)) {
      errors.email = 'Please enter a valid email address.';
    }
    
    // Password validation with strength feedback
    if (!form.password) {
      errors.password = 'Password is required.';
    } else if (form.password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    } else if (passwordStrength < 2) {
      errors.password = 'Please use a stronger password with numbers or special characters.';
    }
    
    // Terms agreement
    if (!agreed) {
      errors.terms = 'You must agree to the terms and privacy policy.';
    }
    
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    
    setLoading(true);
    try {
      // If reCAPTCHA site key is configured, request a token before submit
      let recaptchaToken: string | undefined;
      const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
      if (siteKey && (window as any).grecaptcha && typeof (window as any).grecaptcha.execute === 'function') {
        try {
          recaptchaToken = await (window as any).grecaptcha.execute(siteKey, { action: 'signup' });
        } catch (recErr) {
          // fail-open: continue without token but log client-side
          console.warn('reCAPTCHA token fetch failed', recErr);
        }
      }

      // Show loading feedback to user
      setSuccess('Creating your account...');
      
      const res = await fetch('/api/users/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          recaptchaToken,
        }),
      });
      
      // Handle different response status codes with specific messages
      let data;
      try {
        data = await res.json();
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        // If we can't parse the response, fall back to status-based errors
        if (res.status === 429) {
          const retryAfter = res.headers.get('Retry-After');
          if (retryAfter) {
            const seconds = parseInt(retryAfter, 10);
            throw new Error(`Too many attempts. Please try again in ${seconds} seconds.`);
          } else {
            throw new Error('Too many attempts. Please try again later.');
          }
        } else if (res.status === 400) {
          throw new Error('Invalid information provided. Please check your details.');
        } else if (res.status === 500) {
          throw new Error('Server error. Please try again later or contact support.');
        } else if (!res.ok) {
          throw new Error(`Registration failed (${res.status}). Please try again.`);
        }
        throw new Error('Unexpected error during signup. Please try again.');
      }
      
      // Handle error responses
      if (!res.ok) {
        console.warn('Signup error response:', { status: res.status, data });
        
        // Handle specific error types
        if (res.status === 429) {
          const retryAfter = res.headers.get('Retry-After');
          if (retryAfter) {
            const seconds = parseInt(retryAfter, 10);
            throw new Error(`Too many attempts. Please try again in ${seconds} seconds.`);
          } else {
            throw new Error('Too many attempts. Please try again later.');
          }
        } else if (res.status === 409 && data.error?.toLowerCase().includes('email')) {
          // Email already exists - set specific field error
          setFormErrors((f) => ({ ...f, email: 'This email is already registered. Please use a different email or try logging in.' }));
          throw new Error('This email is already registered.');
        } else if (res.status === 400) {
          // Handle validation errors
          if (data.error?.toLowerCase().includes('email')) {
            setFormErrors((f) => ({ ...f, email: data.error }));
          } else if (data.error?.toLowerCase().includes('password')) {
            setFormErrors((f) => ({ ...f, password: data.error }));
          }
          throw new Error(data.error || 'Invalid information provided. Please check your details.');
        } else if (res.status === 500) {
          throw new Error('Server error. Please try again later or contact support.');
        } else {
          throw new Error(data.error || `Registration failed (${res.status}). Please try again.`);
        }
      }
      
      // Handle successful registration
      if (res.status === 201 && data) {
        setSuccess('Account created successfully! You can now log in.');
        setForm({ firstName: '', lastName: '', email: '', password: '' });
        setAgreed(false);
        setPasswordStrength(0);
      } else {
        throw new Error('Registration completed but received unexpected response. Please try logging in.');
      }
    } catch (err: unknown) {
      // Clear any success message
      setSuccess('');
      
      // Log the error for debugging
      console.error('Signup error:', err);
      
      // Provide user-friendly error message
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        setError((err as {message: string}).message);
      } else if (typeof err === 'string') {
        setError(err);
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
      
      // If we have a network error, provide a specific message
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Network error. Please check your internet connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Dynamically load reCAPTCHA script if NEXT_PUBLIC_RECAPTCHA_SITE_KEY is set
  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (!siteKey) return;
    if (typeof window === 'undefined') return;
    if ((window as any).grecaptcha) return; // already loaded

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, []);

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
            <form className="flex flex-col gap-4" onSubmit={handleSubmit} aria-label="Signup form">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="signup-firstName" className="sr-only">
                    First Name
                  </label>
                  <input
                    id="signup-firstName"
                    name="firstName"
                    type="text"
                    placeholder="First Name"
                    required
                    className={`rounded-xl border px-4 py-3 focus:ring-amber-500 w-full ${formErrors.firstName ? 'border-red-400' : 'border-amber-200'}`}
                    value={form.firstName}
                    onChange={handleChange}
                    aria-invalid={!!formErrors.firstName}
                    aria-describedby={formErrors.firstName ? 'signup-firstName-error' : undefined}
                    autoComplete="given-name"
                  />
                  {formErrors.firstName && (
                    <div id="signup-firstName-error" className="text-red-600 text-xs mt-1" role="alert">
                      {formErrors.firstName}
                    </div>
                  )}
                </div>
                <div>
                  <label htmlFor="signup-lastName" className="sr-only">
                    Last Name
                  </label>
                  <input
                    id="signup-lastName"
                    name="lastName"
                    type="text"
                    placeholder="Last Name"
                    required
                    className={`rounded-xl border px-4 py-3 focus:ring-amber-500 w-full ${formErrors.lastName ? 'border-red-400' : 'border-amber-200'}`}
                    value={form.lastName}
                    onChange={handleChange}
                    aria-invalid={!!formErrors.lastName}
                    aria-describedby={formErrors.lastName ? 'signup-lastName-error' : undefined}
                    autoComplete="family-name"
                  />
                  {formErrors.lastName && (
                    <div id="signup-lastName-error" className="text-red-600 text-xs mt-1" role="alert">
                      {formErrors.lastName}
                    </div>
                  )}
                </div>
              </div>
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
                <Link href="/terms" className="underline hover:text-amber-700">
                  Terms
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="underline hover:text-amber-700">
                  Privacy Policy
                </Link>
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
                <div className="max-w-md mx-auto mt-4 mb-2">
                  <div className="bg-red-100 border border-red-300 text-red-800 px-6 py-4 rounded-xl text-center font-semibold shadow" role="alert">
                    {error}
                  </div>
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
