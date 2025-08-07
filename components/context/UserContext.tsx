import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  loading: true,
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Only check auth once on mount, not on every router change
    if (hasCheckedAuth) return;

    const fetchUser = async () => {
      try {
        const res = await fetch('/api/users/me', {
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else if (res.status === 401) {
          setUser(null);
          // Only redirect if we're not already on login page and not on public pages
          const publicPages = ['/login', '/admin/login', '/', '/shop', '/about', '/contact'];
          if (!publicPages.includes(router.pathname)) {
            router.push('/login');
          }
        } else {
          console.error('Auth check failed with status:', res.status);
          setUser(null);
        }
      } catch (error) {
        // Suppress authentication errors for unauthenticated users
        if (error instanceof Error && error.message.includes('401')) {
          setUser(null);
        } else {
          console.error('Auth check error:', error);
          setUser(null);
        }
        // Don't redirect on network errors, just set user to null
      } finally {
        setLoading(false);
        setHasCheckedAuth(true);
      }
    };

    fetchUser();
  }, [hasCheckedAuth, router.pathname]); // Include router.pathname to handle route changes

  return <UserContext.Provider value={{ user, setUser, loading }}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);
