import React from 'react';
import { TouchableOpacity, View, ViewProps } from 'react-native';
import { AppTheme } from '../theme';

interface AppCardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  onPress?: () => void;
}

export const AppCard: React.FC<AppCardProps> = ({
  children,
  className = '',
  noPadding = false,
  onPress,
  ...props
}) => {
  const classes = `${AppTheme.card.base} ${noPadding ? '' : AppTheme.spacing.cardPadding} ${className}`;

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={onPress}
        className={`${classes} active:scale-[0.99]`}
        {...(props as any)}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View className={classes} {...props}>
      {children}
    </View>
  );
};
