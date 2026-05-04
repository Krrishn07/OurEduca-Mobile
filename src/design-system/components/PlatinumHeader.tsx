import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icons } from '../../../components/Icons';

interface PlatinumHeaderProps {
    title: string;
    subtitle?: string;
    onBack?: () => void;
    rightAction?: React.ReactNode;
    icon?: React.ReactNode;
}

/**
 * PlatinumHeader - The unified, sleek header for the OurEduca Teacher Dashboard.
 * Tweak the 'headerPaddingTop' variable below to change header height globally.
 */
export const PlatinumHeader: React.FC<PlatinumHeaderProps> = ({
    title,
    subtitle,
    onBack,
    rightAction,
    icon
}) => {
    const insets = useSafeAreaInsets();

    // 💡 TWEAK HEADER HEIGHT HERE:
    // Change this value to adjust the vertical height of all 'Sleek' headers globally.
    const headerPaddingTop = insets.top + 5;
    const headerPaddingBottom = 10;

    return (
        <View
            className="bg-white border-b border-gray-100 px-6 shadow-sm z-20"
            style={{
                paddingTop: insets.top + 8,
                paddingBottom: 10
            }}
        >
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                    {onBack && (
                        <TouchableOpacity
                            onPress={onBack}
                            className="mr-3 active:scale-90"
                        >
                            <Icons.ChevronLeft size={22} color="#111827" />
                        </TouchableOpacity>
                    )}

                    {icon && <View className="mr-3">{icon}</View>}

                    <View className="flex-1">
                        <Text className="text-[20px] text-gray-900 font-inter-black tracking-tight" numberOfLines={1}>
                            {title}
                        </Text>
                        {subtitle && (
                            <Text className="text-[8px] text-indigo-500 font-inter-bold uppercase tracking-[2px]">
                                {subtitle}
                            </Text>
                        )}
                    </View>
                </View>

                {rightAction && (
                    <View className="flex-row items-center gap-3">
                        {rightAction}
                    </View>
                )}
            </View>
        </View>
    );
};
