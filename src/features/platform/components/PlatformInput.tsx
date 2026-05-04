import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { Icons } from '../../../../components/Icons';

import { PlatformTheme, PlatformRadius, PlatformTypography } from '../theme';

interface PlatformInputProps extends TextInputProps {
  label: string;
  editable?: boolean;
}

export const PlatformInput: React.FC<PlatformInputProps> = ({ 
  label, 
  editable = true, 
  ...props 
}) => {
  return (
    <View className="mb-4">
      <Text className={`${PlatformTypography.label} text-gray-500 mb-2 ml-1`}>
        {label}
      </Text>
      <View className={`bg-gray-50 ${PlatformRadius.secondary} border transition-all duration-200 ${
        editable ? 'border-indigo-100 bg-white shadow-sm' : 'border-gray-100'
      }`}>
        <TextInput 
          className="px-5 text-[15px] font-semibold text-gray-800"
          style={{ paddingVertical: 16 }}
          editable={editable}
          placeholderTextColor="#9ca3af"
          {...props}
        />
        {editable && (
          <View className="absolute right-5 top-[22px]">
            <Icons.Edit size={14} color="#6366f1" opacity={0.5} />
          </View>
        )}
      </View>
    </View>
  );
};
