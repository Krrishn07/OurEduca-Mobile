import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  width = '100%', 
  height = 20, 
  borderRadius = 8, 
  className = '' 
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { width, height, borderRadius, backgroundColor: '#e2e8f0', opacity },
      ]}
      className={className}
    />
  );
};

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <View 
    className={`bg-white rounded-[20px] p-5 border border-gray-100 shadow-sm ${className}`}
  >
    <View className="flex-row items-center mb-4">
      <Skeleton width={40} height={40} borderRadius={12} className="mr-3" />
      <View className="flex-1">
        <Skeleton width="60%" height={14} className="mb-2" />
        <Skeleton width="40%" height={10} />
      </View>
    </View>
    <Skeleton width="100%" height={60} borderRadius={14} />
  </View>
);

export const SkeletonRow: React.FC = () => (
  <View className="flex-row items-center py-4 px-5 border-b border-gray-50">
    <Skeleton width={32} height={32} borderRadius={10} className="mr-4" />
    <View className="flex-1">
      <Skeleton width="70%" height={12} className="mb-2" />
      <Skeleton width="40%" height={8} />
    </View>
    <Skeleton width={40} height={20} borderRadius={10} />
  </View>
);
