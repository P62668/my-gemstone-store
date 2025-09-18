import React from 'react';

interface LuxuryBadgeProps {
  children: React.ReactNode;
  variant?: 'gold' | 'amber' | 'green' | 'red' | 'blue';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LuxuryBadge: React.FC<LuxuryBadgeProps> = ({
  children,
  variant = 'gold',
  size = 'md',
  className = '',
}) => {
  const variants = {
    gold: 'luxury-badge-gold',
    amber: 'luxury-badge-amber',
    green: 'bg-green-100 text-green-800 border border-green-200',
    red: 'bg-red-100 text-red-800 border border-red-200',
    blue: 'bg-blue-100 text-blue-800 border border-blue-200',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <span className={`luxury-badge ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};

export default LuxuryBadge;