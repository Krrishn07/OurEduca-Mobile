import React from 'react';
import { SectionHeader } from '../../../design-system';

interface PlatformHeaderProps {
  title: string;
  subtitle?: string;
  category?: string;
  rightElement?: React.ReactNode;
}

export const PlatformHeader: React.FC<PlatformHeaderProps> = ({ 
  title, 
  subtitle, 
  category,
  rightElement 
}) => {
  return (
    <SectionHeader
      title={title}
      subtitle={category || subtitle}
      rightElement={rightElement}
      className="mt-8 mb-8"
    />
  );
};
