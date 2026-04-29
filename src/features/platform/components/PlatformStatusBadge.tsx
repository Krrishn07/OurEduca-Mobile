import React from 'react';
import { View, Text } from 'react-native';

interface PlatformStatusBadgeProps {
  status: string;
  type?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  label?: string;
  pill?: boolean;
  size?: 'normal' | 'small';
}

export const PlatformStatusBadge: React.FC<PlatformStatusBadgeProps> = ({ 
  status, 
  type = 'info', 
  label,
  pill = true,
  size = 'normal'
}) => {
  const getColors = () => {
    switch (type) {
      case 'success': return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' };
      case 'warning': return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' };
      case 'danger': return { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' };
      case 'neutral': return { bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-200' };
      default: return { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' };
    }
  };

  const colors = getColors();

  const padding = size === 'small' ? 'px-1.5 py-0.5' : 'px-2.5 py-1';
  const fontSize = size === 'small' ? 'text-[8px]' : 'text-[10px]';

  return (
    <View className={`${colors.bg} ${colors.border} border ${padding} ${pill ? 'rounded-full' : 'rounded-lg'} items-center justify-center`}>
      <Text className={`${colors.text} ${fontSize} font-black uppercase tracking-widest`}>
        {label || status}
      </Text>
    </View>
  );
};
