import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { AppRadius, AppTypography } from '../theme';

interface AppButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const AppButton: React.FC<AppButtonProps> = ({
  label,
  variant = 'primary',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const variantClasses = {
    primary: 'bg-indigo-600 border border-indigo-500/50 shadow-md shadow-indigo-200',
    secondary: 'bg-indigo-50 border border-indigo-100',
    outline: 'bg-white border border-gray-200',
    danger: 'bg-rose-600 border border-rose-500/50 shadow-md shadow-rose-200',
  }[variant];

  const textClasses = {
    primary: 'text-white',
    secondary: 'text-indigo-700',
    outline: 'text-gray-700',
    danger: 'text-white',
  }[variant];

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      disabled={disabled || isLoading}
      className={`px-5 py-3.5 flex-row items-center justify-center ${AppRadius.control} ${variantClasses} ${disabled || isLoading ? 'opacity-50' : 'active:scale-[0.98]'} ${className}`}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'secondary' ? '#4f46e5' : '#ffffff'} size="small" />
      ) : (
        <>
          {leftIcon ? <View className="mr-2">{leftIcon}</View> : null}
          <Text className={`${AppTypography.eyebrow} ${textClasses}`}>{label}</Text>
          {rightIcon ? <View className="ml-2">{rightIcon}</View> : null}
        </>
      )}
    </TouchableOpacity>
  );
};
