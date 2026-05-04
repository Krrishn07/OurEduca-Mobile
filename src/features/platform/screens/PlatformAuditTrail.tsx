import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { useSchoolData, SystemLog } from '../../../../contexts/SchoolDataContext';
import { LinearGradient } from 'expo-linear-gradient';
import { AppCard, AppTheme, AppTypography, AppRow, AppFilterBar, StatusPill } from '../../../design-system';

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

  const filteredLogs = useMemo(() => {
    return (systemLogs || []).filter(log => {
      const matchesSearch   = log.title?.toLowerCase().includes(searchQuery.toLowerCase());
      const logCategory     = log.category || 'SYSTEM';
      const matchesCategory = activeCategory === 'ALL' || logCategory === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [systemLogs, searchQuery, activeCategory]);

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
        {filteredLogs.length === 0 ? (
          <View className="items-center justify-center py-20">
            <View className="w-16 h-16 bg-gray-50 rounded-2xl items-center justify-center mb-4 border border-gray-100">
              <Icons.Inbox size={32} color="#d1d5db" />
            </View>
            <Text className="text-[15px] font-black text-gray-900 tracking-tight font-inter-black">No History Found</Text>
            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 font-inter-black">
              Zero entries match your criteria
            </Text>
          </View>
        ) : (
          <AppCard className="p-0 overflow-hidden">
            {filteredLogs.map((log, index) => {
              const IconComponent = (Icons as any)[log.icon] || Icons.Activity;
              const category      = log.category || 'SYSTEM';
              const pillType      = CATEGORY_PILL_TYPE[category] ?? 'neutral';
              const dotStatus     = CATEGORY_DOT[category] ?? 'none';
              const logTime       = new Date(log.created_at);
              const timeStr       = logTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const dateStr       = logTime.toLocaleDateString([], { month: 'short', day: 'numeric' });

              return (
                <AppRow
                  key={log.id}
                  title={log.title}
                  subtitle={`${dateStr} · ${timeStr}`}
                  statusDot={dotStatus}
                  avatarIcon={<IconComponent size={16} color={log.color || AppTheme.colors.primary} />}
                  avatarBg={log.color ? `${log.color}15` : '#eef2ff'}
                  pills={
                    <StatusPill label={category} type={pillType} />
                  }
                  showBorder={index < filteredLogs.length - 1}
                  rightElement={
                    <Icons.ChevronRight size={14} color="#d1d5db" />
                  }
                />
              );
            })}
          </AppCard>
        )}
      </ScrollView>
    </View>
  );
};
