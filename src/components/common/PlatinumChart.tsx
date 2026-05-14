import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppTheme } from '@constants/Theme';
import { styled } from 'nativewind';

const StyledLinearGradient = styled(LinearGradient || View);

interface PlatinumChartData {
    label: string;
    value: number; // 0 to 100
    raw?: string | number;
}

interface PlatinumChartProps {
    data: PlatinumChartData[];
    height?: number;
    showBackgroundBars?: boolean;
    activeBarIndex?: number;
}

/**
 * PlatinumChart - Standardized bar chart for institutional analytics.
 * Synchronizes with the Platinum Design System grid and gradients.
 */
export const PlatinumChart: React.FC<PlatinumChartProps> = ({ 
    data, 
    height = 160, 
    showBackgroundBars = true,
    activeBarIndex
}) => {
    const finalActiveIndex = activeBarIndex !== undefined ? activeBarIndex : data.length - 1;

    return (
        <View style={{ height }} className="flex-row items-end justify-between px-2 relative mt-2">
            {/* Horizontal Grid Lines */}
            <View className="absolute inset-0 justify-between py-1 opacity-5">
                {[1, 2, 3, 4].map((i) => (
                    <View key={i} className="h-[1px] bg-gray-900 w-full" />
                ))}
            </View>

            {data.map((item, i) => {
                const isActive = i === finalActiveIndex;
                return (
                    <View key={i} className="items-center flex-1">
                        <View className="relative w-8 items-center justify-end h-full">
                            {showBackgroundBars && (
                                <View className="absolute inset-0 bg-gray-50/80 rounded-t-2xl w-full" />
                            )}
                            <StyledLinearGradient
                                colors={isActive ? AppTheme.colors.gradients.brand : ['#e0e7ff', '#c7d2fe']}
                                className="w-8 rounded-t-2xl shadow-lg shadow-indigo-100"
                                style={{ height: `${Math.max(item.value, 5)}%` }}
                            />
                        </View>
                        <Text className={`text-[9px] font-black mt-4 uppercase tracking-tighter font-inter-black ${isActive ? 'text-indigo-600' : 'text-gray-400'}`}>
                            {item.label}
                        </Text>
                    </View>
                );
            })}
        </View>
    );
};
