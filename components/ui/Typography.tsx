import React from 'react';

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
}

// Heading Components with Luxury Styling
export const H1: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <h1 className={`text-4xl md:text-5xl font-bold text-gray-900 leading-tight luxury-font-serif ${className}`}>
    {children}
  </h1>
);

export const H2: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <h2 className={`text-3xl md:text-4xl font-semibold text-gray-900 leading-tight luxury-font-serif ${className}`}>
    {children}
  </h2>
);

export const H3: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <h3 className={`text-2xl font-semibold text-gray-900 leading-tight luxury-font-serif ${className}`}>{children}</h3>
);

export const H4: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <h4 className={`text-xl font-semibold text-gray-900 leading-tight luxury-font-serif ${className}`}>{children}</h4>
);

// Text Components with Luxury Styling
export const BodyText: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <p className={`text-base text-gray-700 leading-relaxed luxury-font-sans ${className}`}>{children}</p>
);

export const BodyLarge: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <p className={`text-lg text-gray-700 leading-relaxed luxury-font-sans ${className}`}>{children}</p>
);

export const BodySmall: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <p className={`text-sm text-gray-700 leading-relaxed luxury-font-sans ${className}`}>{children}</p>
);

export const Caption: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <p className={`text-sm text-gray-500 leading-normal luxury-font-sans ${className}`}>{children}</p>
);

// Special Text Components with Luxury Styling
interface PriceProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Price: React.FC<PriceProps> = ({ amount, size = 'md', className = '' }) => {
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

export const GemstoneName: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <span className={`text-xl font-semibold text-gray-900 luxury-font-serif ${className}`}>{children}</span>
);

export const GemstoneType: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <span className={`text-sm text-gray-600 luxury-font-sans ${className}`}>{children}</span>
);

export const Certification: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <span className={`text-xs font-medium text-luxury-gold-dark luxury-font-sans ${className}`}>{children}</span>
);

// Link Components with Luxury Styling
interface LinkProps extends TypographyProps {
  href: string;
  external?: boolean;
}

export const TextLink: React.FC<LinkProps> = ({
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

// List Components with Luxury Styling
export const ListItem: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <li className={`text-gray-700 leading-relaxed luxury-font-sans ${className}`}>{children}</li>
);

// Quote Component with Luxury Styling
export const Quote: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <blockquote className={`border-l-4 border-luxury-gold-dark pl-4 italic text-gray-700 luxury-font-serif ${className}`}>
    {children}
  </blockquote>
);

// Code Component with Luxury Styling
export const Code: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <code className={`bg-luxury-bg-ivory px-2 py-1 rounded text-sm font-mono text-gray-800 border border-luxury-gold-dark luxury-font-sans ${className}`}>
    {children}
  </code>
);