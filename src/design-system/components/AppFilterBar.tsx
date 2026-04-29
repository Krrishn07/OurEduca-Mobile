import React, { useRef } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export interface FilterChip<T extends string = string> {
  label: string;
  value: T;
  count?: number; // optional badge count
}

interface AppFilterBarProps<T extends string = string> {
  chips: FilterChip<T>[];
  active: T;
  onChange: (value: T) => void;
  className?: string;
}

export function AppFilterBar<T extends string = string>({
  chips,
  active,
  onChange,
  className = '',
}: AppFilterBarProps<T>) {
  return (
    <View className={`${className}`}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}
      >
        {chips.map((chip) => {
          const isActive = chip.value === active;
          return (
            <TouchableOpacity
              key={chip.value}
              onPress={() => onChange(chip.value)}
              activeOpacity={0.75}
              className={`flex-row items-center px-4 py-2 rounded-full border active:scale-95 transition-all ${
                isActive
                  ? 'bg-indigo-600 border-indigo-600 shadow-md shadow-indigo-200'
                  : 'bg-white border-gray-200'
              }`}
            >
              <Text
                className={`text-[11px] font-black uppercase tracking-wider font-inter-black ${
                  isActive ? 'text-white' : 'text-gray-500'
                }`}
              >
                {chip.label}
              </Text>
              {chip.count !== undefined && chip.count > 0 && (
                <View
                  className={`ml-1.5 min-w-[16px] h-4 rounded-full items-center justify-center px-1 ${
                    isActive ? 'bg-white/25' : 'bg-indigo-50'
                  }`}
                >
                  <Text
                    className={`text-[9px] font-black font-inter-black ${
                      isActive ? 'text-white' : 'text-indigo-600'
                    }`}
                  >
                    {chip.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
