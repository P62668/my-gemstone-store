import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
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

interface PersonalizedOffer {
  id: number;
  title: string;
  description: string;
  discountPercentage: number;
  type: string;
  applicableTo: string;
  endTime?: string;
  tier?: string;
  pointsRequired?: number;
  categories?: number[];
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  offers: PersonalizedOffer[];
  offersLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<boolean>;
  fetchUser: () => Promise<void>;
  fetchPersonalizedOffers: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [offers, setOffers] = useState<PersonalizedOffer[]>([]);
  const [offersLoading, setOffersLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync user data from session
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const sessionUser = session.user as any;
      setUser({
        id: parseInt(sessionUser.id, 10),
        email: sessionUser.email,
        name: sessionUser.name,
        role: sessionUser.role,
        createdAt: new Date().toISOString(),
      });
      
      // Fetch personalized offers when user logs in
      fetchPersonalizedOffers();
    } else if (status === 'unauthenticated') {
      setUser(null);
      setOffers([]); // Clear offers on logout
    }
  }, [status, session]);

  const fetchUser = async () => {
    // This is now handled by NextAuth session management
    // We can still fetch additional user data if needed
    if (status === 'authenticated' && session?.user) {
      setLoading(true);
      try {
        const response = await apiClient.get('/api/users/me');
        if (response.ok) {
          const userData = response.data as User;
          setUser(userData);
        }
      } catch (error) {
        console.error('Error fetching additional user data:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const fetchPersonalizedOffers = async () => {
    setOffersLoading(true);
    try {
      const response = await apiClient.get<PersonalizedOffer[]>('/api/personalized-offers');
      if (response.ok) {
        setOffers(response.data);
      }
    } catch (error) {
      console.error('Error fetching personalized offers:', error);
      setOffers([]); // Set empty array on error
    } finally {
      setOffersLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    // Login is now handled by NextAuth in the login page
    // This function is kept for backward compatibility but should not be used
    return true;
  };

  const logout = async () => {
    try {
      await apiClient.post('/api/users/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Use NextAuth signOut
      await signOut({ redirect: false });
      setUser(null);
      setOffers([]); // Clear offers on logout
      // Only push to router if component is mounted (not during SSG)
      if (mounted && router) {
        router.push('/');
      }
    }
  };

  const updateUser = async (data: Partial<User>): Promise<boolean> => {
    try {
      const response = await apiClient.patch('/api/users/me', data);
      if (response.ok) {
        const userData = response.data as any;
        setUser(userData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Update user error:', error);
      return false;
    }
  };

  // Add a method to manually refresh the token
  const refreshToken = async (): Promise<boolean> => {
    // Token refresh is handled by NextAuth automatically
    // This function is kept for backward compatibility
    return true;
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      loading, 
      offers, 
      offersLoading, 
      login, 
      logout, 
      updateUser, 
      fetchUser, 
      fetchPersonalizedOffers,
      refreshToken 
    }}>
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
      offers: [],
      offersLoading: false,
      login: async () => false,
      logout: async () => {},
      updateUser: async () => false,
      fetchUser: async () => {},
      fetchPersonalizedOffers: async () => {},
      refreshToken: async () => false,
    };
  }
  return context;
}