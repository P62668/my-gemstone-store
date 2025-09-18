import React, { forwardRef } from 'react';

interface LuxurySelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  children: React.ReactNode;
}

const LuxurySelect = forwardRef<HTMLSelectElement, LuxurySelectProps>(
  ({ label, error, helperText, children, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-luxury-text-primary mb-1 luxury-font-sans">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`luxury-select ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''} ${className}`}
          {...props}
        >
          {children}
        </select>
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

LuxurySelect.displayName = 'LuxurySelect';

export default LuxurySelect;