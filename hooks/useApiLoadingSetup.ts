import { useEffect } from 'react';
import { useLoading } from '../components/context/LoadingContext';
import { setLoadingHandlers } from '../utils/apiClient';

/**
 * Hook to connect the LoadingContext with the apiClient
 * This should be called once at the app level
 */
export const useApiLoadingSetup = () => {
  const { startLoading, stopLoading } = useLoading();
  
  useEffect(() => {
    // Set the global loading handlers in the apiClient
    setLoadingHandlers(startLoading, stopLoading);
    
    // No cleanup needed as these handlers should persist for the app lifetime
  }, [startLoading, stopLoading]);
};