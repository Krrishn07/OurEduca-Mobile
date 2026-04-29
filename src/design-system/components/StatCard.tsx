import React from 'react';
import { Text, View } from 'react-native';
import { AppCard } from './AppCard';
import { AppTypography } from '../theme';

interface StatCardProps {
  value: string | number;
  label: string;
  icon: React.ReactNode;
  toneClassName: string;
  className?: string;
  pill?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
  value,
  label,
  icon,
  toneClassName,
  className = '',
  pill,
}) => {
  return (
    <AppCard className={`flex-1 items-center ${className}`}>
      <View className={`p-3 rounded-[12px] mb-3 ${toneClassName}`}>
        {icon}
      </View>
      <Text className={AppTypography.statValue}>{value}</Text>
      <Text className={`${AppTypography.meta} text-gray-400 mt-1 mb-2 text-center`}>{label}</Text>
      {pill}
    </AppCard>
  );
};
