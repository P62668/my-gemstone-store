import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface LoadingState {
  [key: string]: boolean;
}

interface LoadingContextType {
  isLoading: (key: string) => boolean;
  startLoading: (key: string) => void;
  stopLoading: (key: string) => void;
  anyLoading: boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [loadingState, setLoadingState] = useState<LoadingState>({});
  
  const startLoading = useCallback((key: string) => {
    setLoadingState(prev => ({ ...prev, [key]: true }));
  }, []);
  
  const stopLoading = useCallback((key: string) => {
    setLoadingState(prev => ({ ...prev, [key]: false }));
  }, []);
  
  const isLoading = useCallback((key: string) => {
    return !!loadingState[key];
  }, [loadingState]);

  // Check if any key is in loading state
  const anyLoading = Object.values(loadingState).some(value => value === true);
  
  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading, anyLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};