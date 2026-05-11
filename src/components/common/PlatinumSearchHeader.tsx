import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Pressable } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { Icons } from './Icons';
import { triggerHaptic, HapticPatterns } from '@utils/haptics';
import { PlatinumHeader } from './PlatinumHeader';

interface PlatinumSearchHeaderProps {
    title: string;
    subtitle?: string;
    onBack?: () => void;
    icon?: React.ReactNode;
    rightAction?: React.ReactNode;
    searchValue: string;
    onSearchChange: (text: string) => void;
    placeholder?: string;
    searchVisible?: boolean;
    onSearchToggle?: (visible: boolean) => void;
}

/**
 * PlatinumSearchHeader - Extends PlatinumHeader with integrated, high-fidelity search.
 * Features the "Indigo Tint" highlight and collapsible search bar.
 */
export const PlatinumSearchHeader = ({
    title,
    subtitle,
    onBack,
    icon,
    rightAction,
    searchValue,
    onSearchChange,
    placeholder = "Search...",
    searchVisible: externalSearchVisible,
    onSearchToggle
}: PlatinumSearchHeaderProps) => {
    const [internalSearchVisible, setInternalSearchVisible] = useState(false);
    const isSearchVisible = externalSearchVisible !== undefined ? externalSearchVisible : internalSearchVisible;
    const searchRef = useRef<TextInput>(null);

    const toggleSearch = () => {
        const nextVisible = !isSearchVisible;
        if (onSearchToggle) {
            onSearchToggle(nextVisible);
        } else {
            setInternalSearchVisible(nextVisible);
        }
        
        triggerHaptic();
        
        if (nextVisible) {
            setTimeout(() => searchRef.current?.focus(), 150);
        } else {
            onSearchChange('');
        }
    };

    return (
        <View className="z-30 bg-white">
            <PlatinumHeader
                title={title}
                subtitle={subtitle}
                onBack={onBack}
                icon={icon}
                rightAction={
                    <View className="flex-row items-center">
                        <TouchableOpacity 
                            activeOpacity={0.7} 
                            onPress={toggleSearch}
                            className={`w-9 h-9 rounded-full items-center justify-center border mr-2 ${isSearchVisible ? 'bg-indigo-50 border-indigo-100' : 'bg-gray-50 border-gray-100'}`}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Icons.Search size={18} color={isSearchVisible ? "#4f46e5" : "#6b7280"} />
                        </TouchableOpacity>
                        {rightAction}
                    </View>
                }
            />

            {isSearchVisible && (
                <Animated.View 
                    entering={FadeInDown.duration(200)}
                    exiting={FadeOutUp.duration(150)}
                    className="px-4 pb-4 pt-2 bg-white border-b border-gray-100/50 shadow-sm"
                >
                    <View className="bg-gray-50/80 p-3.5 rounded-[20px] border border-gray-100 flex-row items-center">
                        <Icons.Search size={16} color="#94a3b8" />
                        <TextInput
                            ref={searchRef}
                            className="flex-1 ml-3 text-[14px] font-inter-semibold text-gray-900"
                            placeholder={placeholder}
                            value={searchValue}
                            onChangeText={onSearchChange}
                            placeholderTextColor="#94a3b8"
                            autoCapitalize="none"
                            returnKeyType="search"
                        />
                        {searchValue.length > 0 && (
                            <TouchableOpacity 
                                onPress={() => {
                                    triggerHaptic();
                                    onSearchChange('');
                                }} 
                                className="p-1 bg-gray-200/50 rounded-full"
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Icons.Close size={12} color="#64748b" />
                            </TouchableOpacity>
                        )}
                    </View>
                </Animated.View>
            )}
        </View>
    );
};
