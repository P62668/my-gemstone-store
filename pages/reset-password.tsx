import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';

const ResetPasswordPage: React.FC = () => {
  const router = useRouter();
  const { token } = router.query;
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Calculate password strength
  useEffect(() => {
    if (password.length === 0) {
      setPasswordStrength(0);
      return;
    }
    
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    setPasswordStrength(strength);
  }, [password]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!token || Array.isArray(token)) {
      setError('Invalid reset link');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (passwordStrength < 2) {
      setError('Please use a stronger password');
      return;
    }
    
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      // attempt to get recaptcha token when site key is configured
      let recaptchaToken: string | undefined;
      const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
      if (siteKey && (window as any).grecaptcha && typeof (window as any).grecaptcha.execute === 'function') {
        try {
          recaptchaToken = await (window as any).grecaptcha.execute(siteKey, { action: 'reset_password' });
        } catch (recErr) {
          console.warn('reCAPTCHA token fetch failed', recErr);
        }
      }

      const res = await fetch('/api/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, recaptchaToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');
      setSuccess('Password updated successfully. You can now log in.');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  // Load reCAPTCHA script when site key is configured (client-side only)
  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (!siteKey) return;
    if (typeof window === 'undefined') return;
    if ((window as any).grecaptcha) return;
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, []);

  return (
    <Layout title="Reset Password - Shankarmala">
      <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-amber-900 mb-2">Reset Password</h1>
            <p className="text-gray-600">Enter your new password below</p>
          </div>
          
          <form
            onSubmit={onSubmit}
            className="bg-white rounded-2xl shadow-xl border border-amber-200 p-8"
          >
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              />
              {/* Password strength meter */}
              <div className="mt-2">
                <div className="h-2 w-full bg-amber-100 rounded-full">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      passwordStrength === 0 
                        ? 'w-0' 
                        : passwordStrength === 1 
                          ? 'w-1/4 bg-red-400' 
                          : passwordStrength === 2 
                            ? 'w-1/2 bg-yellow-400' 
                            : passwordStrength === 3 
                              ? 'w-3/4 bg-amber-500' 
                              : 'w-full bg-green-500'
                    }`}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {password.length > 0 && (
                    passwordStrength === 0
                      ? 'Very weak'
                      : passwordStrength === 1
                        ? 'Weak'
                        : passwordStrength === 2
                          ? 'Medium'
                          : passwordStrength === 3
                            ? 'Strong'
                            : 'Very strong'
                  )}
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm new password"
                className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              />
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg text-sm">
                {success}
              </div>
            )}
            
            {!success && (
              <button
                type="submit"
                className="w-full bg-amber-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-700 transition disabled:opacity-50"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </div>
                ) : (
                  'Save Password'
                )}
              </button>
            )}
            
            {success && (
              <Link 
                href="/login" 
                className="w-full block text-center bg-amber-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-700 transition"
              >
                Go to Login
              </Link>
            )}
          </form>
          
          <div className="mt-6 text-center">
            <Link href="/login" className="text-amber-600 hover:text-amber-800 font-medium">
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ResetPasswordPage;