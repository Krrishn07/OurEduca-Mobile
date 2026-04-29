import React from 'react';
import { TouchableOpacityProps } from 'react-native';
import { AppButton } from '../../../design-system';

interface PlatformButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const PlatformButton: React.FC<PlatformButtonProps> = ({
  label,
  variant = 'primary',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <AppButton
      label={label}
      variant={variant}
      isLoading={isLoading}
      leftIcon={leftIcon}
      rightIcon={rightIcon}
      className={className}
      disabled={disabled}
      {...props}
    />
  );
};
