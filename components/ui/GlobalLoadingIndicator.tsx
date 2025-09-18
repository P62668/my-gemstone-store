import React from 'react';
import { useLoading } from '../context/LoadingContext';

const GlobalLoadingIndicator: React.FC = () => {
  const { anyLoading } = useLoading();

  if (!anyLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="h-1 bg-amber-500 animate-pulse rounded-sm">
        <div 
          className="h-full bg-amber-600 rounded-sm animate-progress" 
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
};

export default GlobalLoadingIndicator;