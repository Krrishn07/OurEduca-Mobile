import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { AppCard } from './AppCard';
import { AppTheme, AppTypography } from '@constants/Theme';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Icons } from './Icons';
import { triggerHaptic, ImpactFeedbackStyle } from '@utils/haptics';

interface StatCardProps {
  value: string | number;
  label: string;
  icon: React.ReactNode;
  tone?: 'indigo' | 'amber' | 'emerald' | 'rose' | 'blue' | 'sky' | 'violet';
  className?: string;
  trend?: string | number;
  trendType?: 'up' | 'down' | 'neutral';
  index?: number;
  onPress?: () => void;
  isLoading?: boolean;
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

/**
 * StatCard - The master controller for KPI cards across all dashboards.
 * Handles internal haptics, animations, and theme-synchronized styling.
 */
export const StatCard: React.FC<StatCardProps> = ({
  value,
  label,
  icon,
  tone = 'indigo',
  className = '',
  trend,
  trendType = 'neutral',
  index = 0,
  onPress,
  isLoading = false,
}) => {
  const config = TONE_CONFIG[tone] || TONE_CONFIG.indigo;

  // MASTER SWITCH: Change this to true/false to enable/disable haptics for ALL stats in the app.
  const ENABLE_HAPTICS = false; 

  const handlePress = () => {
    if (isLoading || !onPress) return;
    if (ENABLE_HAPTICS) triggerHaptic(ImpactFeedbackStyle.Light);
    onPress();
  };

  if (isLoading) {
    return (
      <AppCard className={`w-full items-center justify-center min-h-[150px] ${className}`}>
        <View className="w-10 h-10 rounded-2xl bg-gray-50 mb-3" />
        <View className="w-2/3 h-6 bg-gray-50 rounded-lg mb-2" />
        <View className="w-1/3 h-3 bg-gray-50 rounded-md" />
      </AppCard>
    );
  }

  return (
    <Animated.View 
      entering={FadeInDown.delay(index * 100).duration(500).springify()}
      className={`w-full ${className}`}
    >
      <AppCard 
        noPadding 
        onPress={handlePress}
        className="items-center justify-center min-h-[150px] overflow-hidden"
      >
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
          
          <View className="items-center mt-1 mb-2">
            <Text className={`${AppTypography.meta} text-gray-400`}>{label}</Text>
            {trend && (
              <View className={`flex-row items-center px-1.5 py-0.5 rounded-full mt-1.5 ${
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
      </AppCard>
    </Animated.View>
  );
};
