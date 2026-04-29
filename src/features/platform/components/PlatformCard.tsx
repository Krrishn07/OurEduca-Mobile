import React from 'react';
import { ViewProps } from 'react-native';
import { AppCard } from '../../../design-system';

interface PlatformCardProps extends ViewProps {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
  noPadding?: boolean;
}

export const PlatformCard: React.FC<PlatformCardProps> = ({ 
  children, 
  onPress, 
  className = '', 
  noPadding = false,
  ...props 
}) => {
  return (
    <AppCard className={className} noPadding={noPadding} onPress={onPress} {...props}>
      {children}
    </AppCard>
  );
};
