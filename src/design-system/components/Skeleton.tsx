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
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-150, 300],
  });

  return (
    <View
      style={{ width, height, borderRadius, backgroundColor: '#e2e8f0', overflow: 'hidden' } as any}
      className={className}
    >
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: 80,
          backgroundColor: 'rgba(255, 255, 255, 0.4)',
          transform: [{ translateX }, { skewX: '-20deg' }],
        }}
      />
    </View>
  );
};

export const SkeletonCard: React.FC<{ 
  className?: string;
  width?: number | string;
  height?: number | string;
}> = ({ className = '', width, height }) => (
  <View 
    style={[{ width, height } as any]}
    className={`bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex-row items-center justify-between mb-3 ${className}`}
  >
    {/* LEFT SECTION */}
    <View className="flex-row items-center flex-1">
      <Skeleton width={56} height={56} borderRadius={12} className="mr-4" />
      <View className="flex-1">
        <Skeleton width="70%" height={16} className="mb-2" />
        <View className="flex-row items-center">
          <Skeleton width={40} height={10} className="mr-2" />
          <Skeleton width={30} height={10} />
        </View>
      </View>
    </View>

    {/* RIGHT SECTION */}
    <View className="items-center">
      <Skeleton width={50} height={24} borderRadius={12} className="mb-2" />
      <Skeleton width={40} height={8} />
    </View>
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
