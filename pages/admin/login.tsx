import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
  }, [router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      router.push('/admin');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Admin Login - Shankarmala" description="Admin authentication">
      <div className="min-h-[60vh] flex items-center justify-center py-16">
        <form
          onSubmit={onSubmit}
          className="bg-white/90 rounded-2xl shadow-xl border border-amber-200 p-8 w-full max-w-md"
        >
          <h1 className="text-2xl font-bold text-amber-900 mb-4">Admin Login</h1>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border border-amber-200 px-4 py-3 mb-3"
            required
            autoComplete="email"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border border-amber-200 px-4 py-3 mb-3"
            required
            autoComplete="current-password"
          />
          {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
          <button
            type="submit"
            className="w-full bg-amber-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-700 transition"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminLogin;
