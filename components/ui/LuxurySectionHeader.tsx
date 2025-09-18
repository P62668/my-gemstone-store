import React from 'react';
import { LuxuryH2, LuxuryBodyLarge } from './LuxuryTypography';

interface LuxurySectionHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}

const LuxurySectionHeader: React.FC<LuxurySectionHeaderProps> = ({
  title,
  subtitle,
  className = '',
  titleClassName = '',
  subtitleClassName = '',
}) => {
  return (
    <div className={`luxury-section-header text-center ${className}`}>
      <LuxuryH2 className={`text-amber-900 mb-4 ${titleClassName}`}>
        {title}
      </LuxuryH2>
      {subtitle && (
        <LuxuryBodyLarge className={`text-amber-600 max-w-2xl mx-auto ${subtitleClassName}`}>
          {subtitle}
        </LuxuryBodyLarge>
      )}
    </div>
  );
};

export default LuxurySectionHeader;