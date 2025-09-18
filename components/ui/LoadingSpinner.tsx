import React from 'react';
import { useLoading } from '../context/LoadingContext';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  apiKey?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  apiKey,
  fullScreen = false,
}) => {
  const { isLoading, anyLoading } = useLoading();
  
  // If apiKey is provided, only show spinner when that specific API call is loading
  // Otherwise, if fullScreen is true, show when any API call is loading
  const shouldShow = apiKey ? isLoading(apiKey) : fullScreen ? anyLoading : true;
  
  if (!shouldShow) return null;
  
  // Size classes
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };
  
  // Color classes
  const colorClasses = {
    primary: 'border-amber-500 border-t-amber-200',
    secondary: 'border-gray-600 border-t-gray-200',
    white: 'border-white border-t-gray-200',
  };
  
  const spinnerClasses = `${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin`;
  
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className={spinnerClasses}></div>
      </div>
    );
  }
  
  return <div className={spinnerClasses}></div>;
};

export default LoadingSpinner;