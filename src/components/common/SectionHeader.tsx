import React from 'react';
import { Text, View } from 'react-native';
import { AppTypography } from '@constants/Theme';

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

          <Text className={AppTypography.sectionTitle}>{title}</Text>
        </View>
        {subtitle ? <Text className={`${AppTypography.eyebrow} text-gray-400 mt-0.5`}>{subtitle}</Text> : null}
      </View>
      {rightElement}
    </View>
  );
};
