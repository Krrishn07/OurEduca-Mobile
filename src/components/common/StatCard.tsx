import React from 'react';
import { Text, View, Pressable } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { AppCard } from './AppCard';
import { AppTypography, AppTheme } from '@constants/Theme';
import { triggerHaptic } from '@utils/haptics';

interface StatCardProps {
  value: string | number;
  label: string;
  icon: React.ReactNode;
  tone?: 'indigo' | 'amber' | 'emerald' | 'rose' | 'blue' | 'sky' | 'violet';
  className?: string;
  pill?: React.ReactNode;
  onPress?: () => void;
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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const StatCard: React.FC<StatCardProps> = ({
  value,
  label,
  icon,
  tone = 'indigo',
  className = '',
  pill,
  onPress,
}) => {
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(pressed.value, [0, 1], [1, 0.97], Extrapolate.CLAMP);
    const elevation = interpolate(pressed.value, [0, 1], [4, 8], Extrapolate.CLAMP);
    const shadowOpacity = interpolate(pressed.value, [0, 1], [0.1, 0.2], Extrapolate.CLAMP);

    return {
      transform: [{ scale: withSpring(scale, { damping: 15, stiffness: 150 }) }],
      shadowOpacity: withTiming(shadowOpacity, { duration: 150 }),
      elevation: withTiming(elevation, { duration: 150 }),
    };
  });

  const iconStyle = useAnimatedStyle(() => {
    const translateY = interpolate(pressed.value, [0, 1], [0, -4], Extrapolate.CLAMP);
    return {
      transform: [{ translateY: withSpring(translateY, { damping: 12, stiffness: 120 }) }],
    };
  });

  const pillStyle = useAnimatedStyle(() => {
    const opacity = interpolate(pressed.value, [0, 1], [1, 0.8], Extrapolate.CLAMP);
    const scale = interpolate(pressed.value, [0, 1], [1, 1.05], Extrapolate.CLAMP);
    return {
      opacity: withTiming(opacity, { duration: 200 }),
      transform: [{ scale: withSpring(scale) }],
    };
  });

  const handlePressIn = () => {
    pressed.value = 1;
    triggerHaptic();
  };

  const handlePressOut = () => {
    pressed.value = 0;
  };

  const content = (
    <Animated.View 
      style={[animatedStyle]} 
      className={`w-full bg-white border border-gray-100/50 rounded-[24px] p-5 items-center justify-center min-h-[160px] shadow-xl shadow-indigo-100/30 ${className}`}
    >
      <Animated.View 
        className="p-4 rounded-[18px] mb-3 items-center justify-center"
        style={[TONE_STYLES[tone] || TONE_STYLES.indigo, iconStyle]}
      >
        {icon}
      </Animated.View>
      <Text 
        className={AppTypography.statValue}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
      <Text className={`${AppTypography.meta} text-gray-400 mt-1.5 mb-3 text-center`}>{label}</Text>
      {pill && (
        <Animated.View style={pillStyle}>
          {pill}
        </Animated.View>
      )}
    </Animated.View>
  );

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{ width: '100%' }}
      >
        {content}
      </AnimatedPressable>
    );
  }

  return content;
};
