import React from 'react';
import { useApiLoadingSetup } from '../../hooks/useApiLoadingSetup';

/**
 * Component that initializes the API loading setup
 * This is a utility component with no UI that connects the LoadingContext with the apiClient
 */
const ApiLoadingSetup: React.FC = () => {
  // Initialize API loading indicators
  useApiLoadingSetup();
  
  // This component doesn't render anything
  return null;
};

export default ApiLoadingSetup;