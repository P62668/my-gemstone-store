import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { logger } from '../utils/logger';

export const useAdminAuth = () => {
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        if (status === 'loading') {
          setLoading(true);
          return;
        }

        if (!session) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        // Check if user has admin role
        if (session.user?.role === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        logger.error('Error checking admin status', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [session, status]);

  return { isAdmin, loading, session };
};