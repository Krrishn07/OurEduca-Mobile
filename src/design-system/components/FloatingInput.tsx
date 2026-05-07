import React, { useEffect, useRef, useState, forwardRef } from 'react';
import {
  Animated,
  TextInput,
  View,
  Text,
  TextInputProps,
} from 'react-native';
import { HapticPatterns } from '../../utils/haptics';

interface FloatingInputProps extends Omit<TextInputProps, 'onChangeText'> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  icon?: React.ReactNode;
  error?: string | null;
}

export const FloatingInput = forwardRef<TextInput, FloatingInputProps>(({
  label,
  value,
  onChangeText,
  icon,
  error,
  keyboardType = 'default',
  ...rest
}, ref) => {
  const [focused, setFocused] = useState(false);
  const animated = useRef(new Animated.Value(value ? 1 : 0)).current;
  const shake = useRef(new Animated.Value(0)).current;
  const prevError = useRef<string | null | undefined>(null);

  useEffect(() => {
    Animated.timing(animated, {
      toValue: (focused || value) ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [focused, value]);

  // Trigger shake when error transitions from null → truthy
  useEffect(() => {
    if (error && !prevError.current) {
      HapticPatterns.error();
      Animated.sequence([
        Animated.timing(shake, { toValue: 10, duration: 40, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -10, duration: 40, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 6, duration: 40, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 40, useNativeDriver: true }),
      ]).start();
    }
    prevError.current = error;
  }, [error]);

  const labelTop = animated.interpolate({
    inputRange: [0, 1],
    outputRange: [24, 10],
  });

  const labelSize = animated.interpolate({
    inputRange: [0, 1],
    outputRange: [15, 10],
  });

  const labelColor = error
    ? '#ef4444'
    : focused
    ? '#4f46e5'
    : '#9ca3af';

  const borderClass = error
    ? 'border-red-400'
    : focused
    ? 'border-indigo-500 shadow-xl shadow-indigo-100'
    : 'border-transparent';

  return (
    <Animated.View className="mb-5" style={{ transform: [{ translateX: shake }] }}>
      <View
        className={`h-[68px] rounded-2xl border-2 bg-white px-4 flex-row items-center shadow-sm ${borderClass}`}
      >
        {/* Icon */}
        {icon && (
          <>
            <View className="w-5 items-center justify-center">
              {React.cloneElement(icon as React.ReactElement, {
                color: error ? '#ef4444' : focused ? '#4f46e5' : '#9ca3af',
              })}
            </View>
            <View className="w-[1px] h-6 bg-gray-100 mx-3" />
          </>
        )}

        {/* Label + Input stack */}
        <View className="flex-1 h-full justify-center">
          <Animated.Text
            style={{
              position: 'absolute',
              left: 0,
              top: labelTop,
              fontSize: labelSize,
              color: labelColor,
            }}
            className="font-inter-black uppercase tracking-[0.5px]"
          >
            {label}
          </Animated.Text>

          <TextInput
            ref={ref}
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="flex-1 pt-4 text-[15px] font-inter-bold text-gray-900"
            placeholder=""
            placeholderTextColor="#9ca3af"
            {...rest}
          />
        </View>
      </View>

      {/* Error message */}
      {error && (
        <Text className="text-red-400 text-[11px] mt-1.5 ml-1 font-inter-medium italic">
          * {error}
        </Text>
      )}
    </Animated.View>
  );
});
