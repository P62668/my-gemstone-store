import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

const VerifyEmailPage: React.FC = () => {
  const router = useRouter();
  const { token } = router.query;
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token || Array.isArray(token)) return;
    const verify = async () => {
      setStatus('verifying');
      try {
        const res = await fetch('/api/users/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Verification failed');
        setStatus('success');
        setMessage('Your email has been verified successfully.');
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'Verification failed');
      }
    };
    verify();
  }, [token]);

  return (
    <Layout title="Verify Email - Shankarmala">
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-white/90 rounded-2xl shadow-xl border border-amber-200 p-8 w-full max-w-md text-center">
          <h1 className="text-2xl font-bold text-amber-900 mb-2">Email Verification</h1>
          {status === 'verifying' && <div>Verifying...</div>}
          {status !== 'verifying' && (
            <div className={status === 'success' ? 'text-green-700' : 'text-red-600'}>
              {message}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default VerifyEmailPage;
