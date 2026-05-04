import React from 'react';
import { Text, View } from 'react-native';
import { AppTypography } from '../theme';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  rightElement,
  className = '',
}) => {
  return (
    <View className={`flex-row items-center justify-between mb-4 ${className}`}>
      <View className="flex-1 pr-4">
        <View className="flex-row items-center">
          <View className="w-1 h-3.5 bg-indigo-500 rounded-full mr-2" />
          <Text className={AppTypography.sectionTitle}>{title}</Text>
        </View>
        {subtitle ? <Text className={`${AppTypography.eyebrow} text-indigo-500 mt-0.5 ml-3`}>{subtitle}</Text> : null}
      </View>
      {rightElement}
    </View>
  );
};
