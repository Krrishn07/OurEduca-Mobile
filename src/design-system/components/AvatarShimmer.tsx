import React, { useEffect, useRef } from "react";
import { View, Animated } from "react-native";

export const AvatarShimmer: React.FC = () => {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    ).start();
  }, [shimmer]);

  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-120, 120],
  });

  return (
    <View className="w-20 h-20 rounded-[20px] bg-gray-100 overflow-hidden border border-white">
      <Animated.View
        style={{
          position: "absolute",
          width: 80,
          top: 0,
          bottom: 0,
          transform: [{ translateX }, { skewX: '-20deg' }],
          backgroundColor: "rgba(255,255,255,0.4)",
        }}
      />
    </View>
  );
};
