import * as React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icons } from './Icons';
import { triggerHaptic } from '@utils/haptics';

interface PlatinumHeaderProps {
    title: string;
    subtitle?: string;
    onBack?: () => void;
    rightAction?: React.ReactNode;
    icon?: React.ReactNode;
}

/**
 * PlatinumHeader - The unified, sleek header for the OurEduca Teacher Dashboard.
 * Optimized for NativeWind v4 and safe area insets.
 */
export const PlatinumHeader = ({
    title,
    subtitle,
    onBack,
    rightAction,
    icon
}: PlatinumHeaderProps) => {
    const insets = useSafeAreaInsets();

    const handleBack = () => {
        triggerHaptic();
        onBack?.();
    };

    return (
        <View
            className="bg-white border-b border-gray-100 px-6 shadow-sm z-20 flex-row items-center justify-between"
            style={{ 
                paddingTop: insets.top + 12,
                paddingBottom: 12,
                minHeight: 64 + insets.top
            }}
        >
            <View className="flex-row items-center flex-1">
                {onBack && (
                    <TouchableOpacity
                        onPress={handleBack}
                        className="mr-3 active:scale-90"
                        hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                    >
                        <Icons.ChevronLeft size={22} color="#111827" />
                    </TouchableOpacity>
                )}

                {icon && <View className="mr-3">{icon}</View>}

                <View className="flex-col justify-center flex-1">
                    <Text className="text-[18px] leading-[22px] text-gray-900 font-inter-black tracking-tight" numberOfLines={1}>
                        {title}
                    </Text>
                    {subtitle && (
                        <Text className="text-[10px] leading-[12px] text-indigo-600 font-inter-bold uppercase tracking-[1px] mt-[2px]">
                            {subtitle}
                        </Text>
                    )}
                </View>
            </View>

            {rightAction && (
                <View className="flex-row items-center">
                    {rightAction}
                </View>
            )}
        </View>
    );
};
