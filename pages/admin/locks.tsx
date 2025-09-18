import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/AdminLayout';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import getSessionOrRedirect from '../../utils/withServerAuth';
import type { GetServerSideProps } from 'next';
import LuxuryButton from '../../components/ui/LuxuryButton';
import LuxuryInput from '../../components/ui/LuxuryInput';

const AdminLocks: React.FC = () => {
  const router = useRouter();
  const [route, setRoute] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [ip, setIp] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Server-side guard enforced in getServerSideProps; no client-side auth check required.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/admin/locks/clear', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ route, identifier: identifier || undefined, ip: ip || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setSuccess('Lock cleared successfully!');
      setRoute(''); setIdentifier(''); setIp('');
    } catch (err: any) {
      setError(err?.message || 'Failed to clear lock');
    } finally {
      setBusy(false);
    }
  };

  // No client-side auth loading state — server-side redirect handles unauthenticated users.

  return (
    <AdminLayout title="Admin - Locks">
      <Head>
        <title>Admin - Clear Locks</title>
      </Head>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-amber-900 mb-4">Clear Rate Limit Lock</h1>
        {(error || success) && (
          <div className={`rounded-xl p-4 mb-6 font-semibold text-center shadow border ${error ? 'bg-red-100 border-red-300 text-red-800' : 'bg-green-100 border-green-300 text-green-800'}`}>
            {error || success}
          </div>
        )}
        <form onSubmit={handleSubmit} className="max-w-xl bg-white p-6 rounded-lg shadow">
          <LuxuryInput 
            label="Route"
            value={route} 
            onChange={(e) => setRoute(e.target.value)} 
            required 
            placeholder="rl-test" 
            className="mb-3"
          />

          <LuxuryInput 
            label="Identifier (email or id)"
            value={identifier} 
            onChange={(e) => setIdentifier(e.target.value)} 
            placeholder="user@example.com" 
            className="mb-3"
          />

          <LuxuryInput 
            label="IP (optional)"
            value={ip} 
            onChange={(e) => setIp(e.target.value)} 
            placeholder="127.0.0.1" 
            className="mb-4"
          />

          <div className="flex items-center space-x-2">
            <LuxuryButton disabled={busy} variant="primary" size="md">
              {busy ? 'Clearing...' : 'Clear Lock'}
            </LuxuryButton>
            <LuxuryButton 
              type="button" 
              onClick={() => { setRoute(''); setIdentifier(''); setIp(''); }} 
              variant="ghost" 
              size="sm"
            >
              Reset
            </LuxuryButton>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminLocks;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const res = await getSessionOrRedirect(ctx, { requireAdmin: true });
  if ('redirect' in res) return res;
  return { props: {} };
};
