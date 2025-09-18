import React from 'react';

interface LuxuryCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
  border?: boolean;
  shadow?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'none';
  role?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
  tabIndex?: number;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
}

const LuxuryCard: React.FC<LuxuryCardProps> = ({
  children,
  className = '',
  hoverEffect = true,
  padding = 'lg',
  rounded = '2xl',
  border = true,
  shadow = 'xl',
  role,
  ariaLabelledby,
  ariaDescribedby,
  tabIndex,
  onKeyDown,
  onMouseEnter,
  onMouseLeave,
  onClick,
}) => {
  // Padding classes
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
    '2xl': 'p-10',
  };

  // Rounded classes
  const roundedClasses = {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    xl: 'rounded-3xl',
    '2xl': 'rounded-3xl',
    '3xl': 'rounded-3xl',
    full: 'rounded-full',
  };

  // Shadow classes
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
  };

  // Border classes using Tailwind's border utilities with luxury colors
  const borderClass = border ? 'border border-luxury-gold-dark border-opacity-25' : '';

  return (
    <div 
      className={`luxury-card ${paddingClasses[padding]} ${roundedClasses[rounded]} ${borderClass} ${shadowClasses[shadow]} ${hoverEffect ? 'transform hover:-translate-y-2 luxury-hover-glow' : ''} transition-all duration-500 ${className}`}
      role={role}
      aria-labelledby={ariaLabelledby}
      aria-describedby={ariaDescribedby}
      tabIndex={tabIndex}
      onKeyDown={onKeyDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default LuxuryCard;