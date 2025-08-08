import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

const ResetPasswordPage: React.FC = () => {
  const router = useRouter();
  const { token } = router.query;
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');
      setSuccess('Password updated. You can now log in.');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Reset Password - Shankarmala">
      <div className="min-h-[60vh] flex items-center justify-center">
        <form
          onSubmit={onSubmit}
          className="bg-white/90 rounded-2xl shadow-xl border border-amber-200 p-8 w-full max-w-md"
        >
          <h1 className="text-2xl font-bold text-amber-900 mb-4">Reset Password</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            className="w-full rounded-xl border border-amber-200 px-4 py-3 mb-3"
            required
          />
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm new password"
            className="w-full rounded-xl border border-amber-200 px-4 py-3 mb-3"
            required
          />
          {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
          {success && <div className="text-green-700 text-sm mb-2">{success}</div>}
          <button
            type="submit"
            className="w-full bg-amber-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-700 transition"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Password'}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default ResetPasswordPage;
