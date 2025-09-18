import React from 'react';

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
}

// Luxury Heading Components
export const LuxuryH1: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <h1 className={`text-4xl md:text-5xl font-bold text-gray-900 leading-tight luxury-font-serif ${className}`}>
    {children}
  </h1>
);

export const LuxuryH2: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <h2 className={`text-3xl md:text-4xl font-semibold text-gray-900 leading-tight luxury-font-serif ${className}`}>
    {children}
  </h2>
);

export const LuxuryH3: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <h3 className={`text-2xl font-semibold text-gray-900 leading-tight luxury-font-serif ${className}`}>{children}</h3>
);

export const LuxuryH4: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <h4 className={`text-xl font-semibold text-gray-900 leading-tight luxury-font-serif ${className}`}>{children}</h4>
);

export const LuxuryH5: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <h5 className={`text-lg font-semibold text-gray-900 leading-tight luxury-font-serif ${className}`}>{children}</h5>
);

export const LuxuryH6: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <h6 className={`text-base font-semibold text-gray-900 leading-tight luxury-font-serif ${className}`}>{children}</h6>
);

// Luxury Text Components
export const LuxuryBodyText: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <p className={`text-base text-gray-700 leading-relaxed luxury-font-sans ${className}`}>{children}</p>
);

export const LuxuryBodyLarge: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <p className={`text-lg text-gray-700 leading-relaxed luxury-font-sans ${className}`}>{children}</p>
);

export const LuxuryBodySmall: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <p className={`text-sm text-gray-700 leading-relaxed luxury-font-sans ${className}`}>{children}</p>
);

export const LuxuryCaption: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <p className={`text-sm text-gray-500 leading-normal luxury-font-sans ${className}`}>{children}</p>
);

// Luxury Special Text Components
interface LuxuryPriceProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const LuxuryPrice: React.FC<LuxuryPriceProps> = ({ amount, size = 'md', className = '' }) => {
  const sizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <span className={`font-bold bg-gradient-to-r from-luxury-gold-light to-luxury-amber bg-clip-text text-transparent luxury-font-serif ${sizes[size]} ${className}`}>
      ${amount.toLocaleString()}
    </span>
  );
};

export const LuxuryGemstoneName: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <span className={`text-xl font-semibold text-gray-900 luxury-font-serif ${className}`}>{children}</span>
);

export const LuxuryGemstoneType: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <span className={`text-sm text-gray-600 luxury-font-sans ${className}`}>{children}</span>
);

export const LuxuryCertification: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <span className={`text-xs font-medium text-luxury-gold-dark luxury-font-sans ${className}`}>{children}</span>
);

// Luxury Link Components
interface LuxuryLinkProps extends TypographyProps {
  href: string;
  external?: boolean;
}

export const LuxuryTextLink: React.FC<LuxuryLinkProps> = ({
  children,
  href,
  external = false,
  className = '',
}) => (
  <a
    href={href}
    target={external ? '_blank' : undefined}
    rel={external ? 'noopener noreferrer' : undefined}
    className={`text-luxury-gold-dark hover:text-luxury-gold-darker underline transition-colors luxury-font-sans ${className}`}
  >
    {children}
  </a>
);

// Luxury List Components
export const LuxuryListItem: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <li className={`text-gray-700 leading-relaxed luxury-font-sans ${className}`}>{children}</li>
);

// Luxury Quote Component
export const LuxuryQuote: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <blockquote className={`border-l-4 border-luxury-gold-dark pl-4 italic text-gray-700 luxury-font-serif ${className}`}>
    {children}
  </blockquote>
);

// Luxury Code Component
export const LuxuryCode: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <code className={`bg-luxury-bg-ivory px-2 py-1 rounded text-sm font-mono text-gray-800 border border-luxury-gold-dark luxury-font-sans ${className}`}>
    {children}
  </code>
);

// Luxury Display Text for Hero Sections
export const LuxuryDisplayText: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <h1 className={`text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight luxury-font-serif ${className}`}>
    {children}
  </h1>
);

// Luxury Subtitle Text
export const LuxurySubtitle: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <p className={`text-xl md:text-2xl text-gray-600 leading-relaxed luxury-font-serif ${className}`}>{children}</p>
);