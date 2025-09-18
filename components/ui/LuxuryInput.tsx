import React, { forwardRef } from 'react';

interface LuxuryInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const LuxuryInput = forwardRef<HTMLInputElement, LuxuryInputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-luxury-text-primary mb-1 luxury-font-sans">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`luxury-input ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''} ${className}`}
          {...props}
        />
        {helperText && !error && (
          <p className="mt-1 text-sm text-luxury-text-tertiary luxury-font-sans">{helperText}</p>
        )}
        {error && (
          <p className="mt-1 text-sm text-red-600 luxury-font-sans">{error}</p>
        )}
      </div>
    );
  }
);

LuxuryInput.displayName = 'LuxuryInput';

export default LuxuryInput;