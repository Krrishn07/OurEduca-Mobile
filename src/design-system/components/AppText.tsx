import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';

/**
 * AppText — Drop-in replacement for React Native `Text`.
 * Automatically maps fontWeight/className weight helpers to the correct
 * Inter typeface variant loaded via expo-google-fonts.
 *
 * Usage:
 *   <AppText weight="black" className="text-2xl text-gray-900">Title</AppText>
 *   <AppText weight="medium" className="text-sm text-gray-500">Body</AppText>
 */

type FontWeight = 'regular' | 'medium' | 'semibold' | 'bold' | 'black';

const FONT_MAP: Record<FontWeight, string> = {
  regular: 'Inter_400Regular',
  medium:  'Inter_500Medium',
  semibold:'Inter_600SemiBold',
  bold:    'Inter_700Bold',
  black:   'Inter_900Black',
};

interface AppTextProps extends TextProps {
  weight?: FontWeight;
  className?: string;
  children?: React.ReactNode;
}

export const AppText: React.FC<AppTextProps> = ({
  weight = 'regular',
  style,
  children,
  ...props
}) => {
  return (
    <Text
      style={[{ fontFamily: FONT_MAP[weight] }, style]}
      {...props}
    >
      {children}
    </Text>
  );
};
