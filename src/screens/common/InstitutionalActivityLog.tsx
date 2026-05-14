import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icons } from '@components/common/Icons';
import { UnifiedActivityFeed } from '@components/dashboard/UnifiedActivityFeed';
import { PlatinumSearchHeader, SectionHeader, StatusPill } from '@components/common';
import { useMockAuth } from '@context/MockAuthContext';
import { triggerHaptic } from '@utils/haptics';

interface InstitutionalActivityLogProps {
  onBack: () => void;
  isDark?: boolean;
}

export const InstitutionalActivityLog: React.FC<InstitutionalActivityLogProps> = ({ 
  onBack,
  isDark = false 
}) => {
  const insets = useSafeAreaInsets();
  const { currentSchool } = useMockAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');

  // Animation Refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
    ]).start();
  }, []);

  const categories = ['ALL', 'SYSTEM', 'INSTITUTION', 'ACADEMIC', 'ATTENDANCE', 'FEES', 'MESSAGES'];

  const bgColor = isDark ? 'bg-slate-950' : 'bg-[#f8faff]';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const subtextColor = isDark ? 'text-slate-400' : 'text-gray-400';

  return (
    <View className={`flex-1 ${bgColor}`}>
      <PlatinumSearchHeader
        title="Activity Log"
        subtitle={`${currentSchool?.name || 'Institutional'} Audit Node`}
        onBack={onBack}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search activities..."
      />

      <Animated.View 
        className="flex-1"
        style={{ 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          className="flex-1"
          contentContainerStyle={{ 
            paddingHorizontal: 16, 
            paddingTop: 24, 
            paddingBottom: insets.bottom + 32 
          }}
        >
          {/* Category Filter Bar */}
          <SectionHeader
            title="FILTER BY CATEGORY"
            className="mb-4"
            rightElement={
                <StatusPill 
                    label={activeCategory === 'ALL' ? 'Total' : activeCategory} 
                    type="neutral" 
                />
            }
          />

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            className="mb-8"
            contentContainerStyle={{ gap: 8 }}
          >
            {categories.map(cat => (
              <TouchableOpacity
                key={cat}
                onPress={() => {
                    triggerHaptic();
                    setActiveCategory(cat);
                }}
                className={`px-5 py-2.5 rounded-2xl border ${
                  activeCategory === cat 
                    ? 'bg-indigo-500 border-indigo-500 shadow-lg shadow-indigo-200' 
                    : isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100 shadow-sm'
                }`}
              >
                <Text className={`text-[10px] font-inter-black uppercase tracking-widest ${
                  activeCategory === cat ? 'text-white' : subtextColor
                }`}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <SectionHeader
            title="CHRONOLOGICAL FEED"
            className="mb-4"
          />

          <UnifiedActivityFeed 
            showTitle={false}
            variant={isDark ? 'dark' : 'light'}
            searchQuery={searchQuery}
            activeCategory={activeCategory}
            enablePagination={true}
            emptyMessage="No matching activity records found."
          />
        </ScrollView>
      </Animated.View>
    </View>
  );
};
