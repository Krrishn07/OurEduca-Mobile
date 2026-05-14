import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Icons } from '@components/common/Icons';
import { useSchoolData, SystemLog } from '@context/SchoolDataContext';
import { LinearGradient } from 'expo-linear-gradient';
import { AppCard, AppTheme, AppTypography, AppRow, AppFilterBar, StatusPill } from '@components/common';
import { UnifiedActivityFeed } from '@components/dashboard/UnifiedActivityFeed';

type CategoryFilter = 'ALL' | SystemLog['category'];

const CATEGORY_PILL_TYPE: Record<string, any> = {
  SECURITY:    'danger',
  BILLING:     'warning',
  INSTITUTION: 'info',
  SYSTEM:      'neutral',
};

const CATEGORY_DOT: Record<string, any> = {
  SECURITY:    'danger',
  BILLING:     'pending',
  INSTITUTION: 'active',
  SYSTEM:      'none',
};

export const PlatformAuditTrail: React.FC = () => {
  const { systemLogs, fetchSystemLogs } = useSchoolData();
  const [searchQuery, setSearchQuery]       = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('ALL');
  const [isRefreshing, setIsRefreshing]     = useState(false);

  const counts = useMemo(() => ({
    INSTITUTION: (systemLogs || []).filter(l => l.category === 'INSTITUTION').length,
    SECURITY:    (systemLogs || []).filter(l => l.category === 'SECURITY').length,
    BILLING:     (systemLogs || []).filter(l => l.category === 'BILLING').length,
    SYSTEM:      (systemLogs || []).filter(l => l.category === 'SYSTEM').length,
    ALL:         (systemLogs || []).length,
  }), [systemLogs]);

  const filterChips = [
    { label: 'All',       value: 'ALL'         as CategoryFilter, count: counts.ALL         },
    { label: 'Schools',   value: 'INSTITUTION' as CategoryFilter, count: counts.INSTITUTION },
    { label: 'Security',  value: 'SECURITY'    as CategoryFilter, count: counts.SECURITY    },
    { label: 'Billing',   value: 'BILLING'     as CategoryFilter, count: counts.BILLING     },
    { label: 'System',    value: 'SYSTEM'      as CategoryFilter, count: counts.SYSTEM      },
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchSystemLogs();
    setIsRefreshing(false);
  };

  // Filtering logic moved to UnifiedActivityFeed

  return (
    <View className="flex-1 bg-white">
      {/* Hero Header — full bleed */}
      <LinearGradient
        colors={AppTheme.colors.gradients.brand}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        className="px-6 pt-5 pb-10 rounded-b-[40px] shadow-xl shadow-indigo-200 z-20"
      >
        <View className="absolute right-[-20] bottom-[-20] opacity-10 transform rotate-12">
          <Icons.Activity size={140} color="white" />
        </View>
        <View className="flex-row justify-between items-center relative z-10 mb-5">
          <View className="flex-1 mr-4">
            <Text className={`${AppTypography.heroTitle} text-white`} numberOfLines={1}>Activity Log</Text>
            <Text className={`${AppTypography.eyebrow} text-white/60 mt-1`}>Audit Trail</Text>
          </View>
          <TouchableOpacity
            onPress={handleRefresh}
            disabled={isRefreshing}
            className="w-10 h-10 bg-white/10 rounded-2xl items-center justify-center border border-white/20 active:scale-95"
          >
            {isRefreshing
              ? <ActivityIndicator size="small" color="white" />
              : <Icons.Refresh size={18} color="white" />
            }
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View className="bg-white/10 rounded-2xl border border-white/20 px-4 py-3 flex-row items-center relative z-10">
          <Icons.Search size={18} color="white" opacity={0.8} />
          <TextInput
            className="flex-1 ml-3 text-sm font-bold text-white p-0"
            placeholder="Search activity history..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            selectionColor="white"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </LinearGradient>

      {/* Filter Chips */}
      <AppFilterBar
        chips={filterChips}
        active={activeCategory}
        onChange={setActiveCategory}
      />

      {/* Log List */}
      {/* Audit Eyebrow — Compactness consistent with dashboard */}
      <View className="flex-row items-center mt-6 mb-3 px-6">
        <View className="w-1 h-4 bg-indigo-500 rounded-full mr-2" />
        <Text className="text-[10px] font-black text-gray-900 uppercase tracking-[2px] font-inter-black">System Activity</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        <UnifiedActivityFeed 
          showTitle={false}
          searchQuery={searchQuery}
          activeCategory={activeCategory}
          emptyMessage="No History Found. Zero entries match your criteria."
        />
      </ScrollView>
    </View>
  );
};
