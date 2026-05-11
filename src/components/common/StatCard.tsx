import React from 'react';
import { Text, View } from 'react-native';
import { AppCard } from './AppCard';
import { AppTheme, AppTypography } from '@constants/Theme';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Icons } from './Icons';

interface StatCardProps {
  value: string | number;
  label: string;
  icon: React.ReactNode;
  tone?: 'indigo' | 'amber' | 'emerald' | 'rose' | 'blue' | 'sky' | 'violet';
  className?: string;
  pill?: React.ReactNode;
  trend?: string | number;
  trendType?: 'up' | 'down' | 'neutral';
  index?: number;
}

const TONE_CONFIG: Record<string, { colors: string[], iconBg: string }> = {
  indigo:  { colors: ['#f5f7ff', '#eef2ff'], iconBg: '#e0e7ff' },
  amber:   { colors: ['#fffcf0', '#fffbeb'], iconBg: '#fef3c7' },
  emerald: { colors: ['#f0fdf4', '#dcfce7'], iconBg: '#bbf7d0' },
  rose:    { colors: ['#fff1f2', '#ffe4e6'], iconBg: '#fecdd3' },
  blue:    { colors: ['#eff6ff', '#dbeafe'], iconBg: '#bfdbfe' },
  sky:     { colors: ['#f0f9ff', '#e0f2fe'], iconBg: '#bae6fd' },
  violet:  { colors: ['#f5f3ff', '#ede9fe'], iconBg: '#ddd6fe' },
};

export const StatCard: React.FC<StatCardProps> = ({
  value,
  label,
  icon,
  tone = 'indigo',
  className = '',
  pill,
  trend,
  trendType = 'neutral',
  index = 0,
}) => {
  const config = TONE_CONFIG[tone] || TONE_CONFIG.indigo;

  return (
    <Animated.View 
      entering={FadeInDown.delay(index * 100).duration(500).springify()}
      className={`w-full ${className}`}
    >
      <AppCard noPadding className="items-center justify-center min-h-[150px] overflow-hidden">
        <LinearGradient
          colors={config.colors}
          style={{ position: 'absolute', inset: 0, opacity: 0.5 }}
        />
        
        <View 
          className="p-3 rounded-[16px] mb-2.5 shadow-sm"
          style={{ backgroundColor: config.iconBg }}
        >
          {icon}
        </View>

        <View className="items-center px-2">
          <Text 
            className={`${AppTypography.statValue} text-[22px]`}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {value}
          </Text>
          
          <View className="flex-row items-center mt-1 mb-2">
            <Text className={`${AppTypography.meta} text-gray-400 mr-1.5`}>{label}</Text>
            {trend && (
              <View className={`flex-row items-center px-1.5 py-0.5 rounded-full ${
                trendType === 'up' ? 'bg-emerald-100' : trendType === 'down' ? 'bg-rose-100' : 'bg-gray-100'
              }`}>
                {trendType === 'up' && <Icons.ArrowUp size={8} color="#059669" />}
                {trendType === 'down' && <Icons.ArrowDown size={8} color="#e11d48" />}
                <Text className={`text-[8px] font-black font-inter-black ml-0.5 ${
                  trendType === 'up' ? 'text-emerald-700' : trendType === 'down' ? 'text-rose-700' : 'text-gray-600'
                }`}>
                  {trend}
                </Text>
              </View>
            )}
          </View>
        </View>
        
        {pill && <View className="mt-1">{pill}</View>}
      </AppCard>
    </Animated.View>
  );
};
