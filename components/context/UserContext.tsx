import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { apiClient } from '../../utils/apiClient';

interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role: string;
  createdAt: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<boolean>;
  fetchUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Cache for user data to prevent excessive API calls
let userCache: { user: User | null; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Debounce function to prevent multiple simultaneous calls
let fetchUserPromise: Promise<void> | null = null;

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchUser = async () => {
    // Check cache first
    if (userCache && Date.now() - userCache.timestamp < CACHE_DURATION) {
      setUser(userCache.user);
      return;
    }

    // If there's already a fetch in progress, wait for it
    if (fetchUserPromise) {
      await fetchUserPromise;
      return;
    }

    setLoading(true);
    
    fetchUserPromise = (async () => {
      try {
        const response = await apiClient.get('/api/users/me');
        if (response.ok) {
          const userData = response.data as User;
          setUser(userData);
          // Update cache
          userCache = { user: userData, timestamp: Date.now() };
        } else {
          setUser(null);
          userCache = { user: null, timestamp: Date.now() };
        }
      } catch (error: unknown) {
        console.error('Error fetching user:', error);
        setUser(null);
        userCache = { user: null, timestamp: Date.now() };
      } finally {
        setLoading(false);
        fetchUserPromise = null;
      }
    })();

    await fetchUserPromise;
  };

  // Initialize user from cache if available
  useEffect(() => {
    if (userCache && Date.now() - userCache.timestamp < CACHE_DURATION) {
      setUser(userCache.user);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiClient.post('/api/users/login', { email, password });
      if (response.ok) {
        const userData = (response.data as { user: User }).user;
        setUser(userData);
        // Update cache
        userCache = { user: userData, timestamp: Date.now() };
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/api/users/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      // Clear cache
      userCache = null;
      router.push('/');
    }
  };

  const updateUser = async (data: Partial<User>): Promise<boolean> => {
    try {
      const response = await apiClient.patch('/api/users/me', data);
      if (response.ok) {
        const userData = response.data as any;
        setUser(userData);
        // Update cache
        userCache = { user: userData, timestamp: Date.now() };
        return true;
      }
      return false;
    } catch (error) {
      console.error('Update user error:', error);
      return false;
    }
  };

  return (
    <UserContext.Provider value={{ user, loading, login, logout, updateUser, fetchUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    // Return a default context during SSR to prevent errors
    return {
      user: null,
      loading: false,
      login: async () => false,
      logout: async () => {},
      updateUser: async () => false,
      fetchUser: async () => {},
    };
  }
  return context;
}



