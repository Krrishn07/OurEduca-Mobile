import React from 'react';
import { Text, View } from 'react-native';
import { AppCard } from './AppCard';
import { AppTypography } from '../theme';

interface StatCardProps {
  value: string | number;
  label: string;
  icon: React.ReactNode;
  tone?: 'indigo' | 'amber' | 'emerald' | 'rose' | 'blue' | 'sky' | 'violet';
  className?: string;
  pill?: React.ReactNode;
}

const TONE_STYLES: Record<string, { backgroundColor: string }> = {
  indigo:  { backgroundColor: '#eef2ff' },
  amber:   { backgroundColor: '#fffbeb' },
  emerald: { backgroundColor: '#f0fdf4' },
  rose:    { backgroundColor: '#fff1f2' },
  blue:    { backgroundColor: '#f0f9ff' },
  sky:     { backgroundColor: '#e0f2fe' },
  violet:  { backgroundColor: '#f5f3ff' },
};

export const StatCard: React.FC<StatCardProps> = ({
  value,
  label,
  icon,
  tone = 'indigo',
  className = '',
  pill,
}) => {
  return (
    <AppCard className={`w-full items-center justify-center min-h-[140px] ${className}`}>
      <View 
        className="p-3 rounded-[12px] mb-3"
        style={TONE_STYLES[tone] || TONE_STYLES.indigo}
      >
        {icon}
      </View>
      <Text 
        className={AppTypography.statValue}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
      <Text className={`${AppTypography.meta} text-gray-400 mt-1 mb-2 text-center`}>{label}</Text>
      {pill}
    </AppCard>
  );
};
