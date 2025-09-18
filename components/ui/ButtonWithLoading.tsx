import React from 'react';
import { useLoading } from '../context/LoadingContext';

interface ButtonWithLoadingProps {
  children: React.ReactNode;
  onClick?: () => void;
  apiKey?: string;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'sm' | 'md' | 'lg';
}

const ButtonWithLoading: React.FC<ButtonWithLoadingProps> = ({
  children,
  onClick,
  apiKey,
  className = '',
  disabled = false,
  type = 'button',
  variant = 'primary',
  size = 'md',
}) => {
  const { isLoading } = useLoading();
  const loading = apiKey ? isLoading(apiKey) : false;
  
  // Base classes
  const baseClasses = 'relative inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2';
  
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-amber-600 text-white hover:bg-amber-700 disabled:bg-amber-300',
    secondary: 'bg-gray-800 text-white hover:bg-gray-900 disabled:bg-gray-600',
    outline: 'border border-amber-600 text-amber-600 hover:bg-amber-50 disabled:opacity-50',
    text: 'text-amber-600 hover:bg-amber-50 disabled:opacity-50',
  };
  
  const buttonClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;
  
  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </span>
      )}
      <span className={loading ? 'invisible' : 'visible'}>{children}</span>
    </button>
  );
};

export default ButtonWithLoading;