import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icons } from '../../../../components/Icons';
import { RestrictedAccessView } from '../../../../components/RestrictedAccessView';
import { UserRole } from '../../../../types';
import {
  AppCard, AppTheme, AppTypography, AppButton,
  AppRow, AppFilterBar, StatusPill, inferPillType,
} from '../../../design-system';

interface AdminInstitutesProps {
  institutes: any[];
  isLoadingInstitutes: boolean;
  instSearch: string;
  setInstSearch: (t: string) => void;
  activeInstituteTab: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  setActiveInstituteTab: (tab: 'ACTIVE' | 'PENDING' | 'SUSPENDED') => void;
  onShowAddInstituteModal: () => void;
  onVerifyInstitute: (id: string) => void;
  onReview?: (inst: any) => void;
  onManage: (inst: any) => void;
  hasPermission?: (perm: string) => boolean;
  currentUserRole?: UserRole;
}

export const AdminInstitutes: React.FC<AdminInstitutesProps> = ({
  institutes = [],
  isLoadingInstitutes,
  instSearch,
  setInstSearch,
  activeInstituteTab,
  setActiveInstituteTab,
  onShowAddInstituteModal,
  onVerifyInstitute,
  onReview,
  onManage,
  hasPermission,
  currentUserRole
}) => {
  if (hasPermission && !hasPermission('institutes')) {
    return <RestrictedAccessView featureName="School Management" role={currentUserRole} />;
  }

  const counts = useMemo(() => ({
    ACTIVE:    (institutes || []).filter(i => i.status === 'ACTIVE').length,
    PENDING:   (institutes || []).filter(i => i.status === 'PENDING').length,
    SUSPENDED: (institutes || []).filter(i => i.status === 'SUSPENDED').length,
  }), [institutes]);

  const filteredInstitutes = useMemo(() => {
    return (institutes || []).filter(i => {
      const matchesSearch = i.name?.toLowerCase().includes((instSearch || '').toLowerCase());
      const matchesTab    = i.status === activeInstituteTab;
      return matchesSearch && matchesTab;
    });
  }, [institutes, instSearch, activeInstituteTab]);

  const filterChips = [
    { label: 'Active',    value: 'ACTIVE'    as const, count: counts.ACTIVE    },
    { label: 'Pending',   value: 'PENDING'   as const, count: counts.PENDING   },
    { label: 'Suspended', value: 'SUSPENDED' as const, count: counts.SUSPENDED },
  ];

  return (
    <View className="flex-1 bg-[#f5f7ff]">
      {/* Hero Header */}
      <LinearGradient
        colors={AppTheme.colors.gradients.brand}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        className="px-6 pt-5 pb-10 rounded-b-[40px] shadow-xl shadow-indigo-200 z-20"
      >
        <View className="absolute right-[-20] bottom-[-20] opacity-10 transform rotate-12">
          <Icons.School size={140} color="white" />
        </View>
        <View className="flex-row justify-between items-center relative z-10 mb-5">
          <View className="flex-1 mr-4">
            <Text className={`${AppTypography.heroTitle} text-white`} numberOfLines={1}>School List</Text>
            <Text className={`${AppTypography.eyebrow} text-white/60 mt-1`}>Manage Schools</Text>
          </View>
          <TouchableOpacity
            onPress={onShowAddInstituteModal}
            className="w-10 h-10 bg-white/10 rounded-2xl items-center justify-center border border-white/20 active:scale-95"
          >
            <Icons.Plus size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View className="bg-white/10 rounded-2xl border border-white/20 px-4 py-3 flex-row items-center relative z-10">
          <Icons.Search size={18} color="white" opacity={0.8} />
          <TextInput
            className="flex-1 ml-3 text-sm font-black text-white p-0"
            placeholder="Find a school..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            selectionColor="white"
            value={instSearch}
            onChangeText={setInstSearch}
          />
        </View>
      </LinearGradient>

      {/* Filter Chips */}
      <AppFilterBar
        chips={filterChips}
        active={activeInstituteTab}
        onChange={setActiveInstituteTab}
      />



      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
      >
        {isLoadingInstitutes ? (
          <View className="p-20 items-center">
            <ActivityIndicator color={AppTheme.colors.primary} size="small" />
            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-4 font-inter-black">
              Syncing Schools...
            </Text>
          </View>
        ) : filteredInstitutes.length > 0 ? (
          <AppCard className="p-0 overflow-hidden mb-5">
            {filteredInstitutes.map((inst: any, index: number) => {
              const submittedAt = inst.created_at
                ? new Date(inst.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })
                : null;

              return (
                <AppRow
                  key={inst.id}
                  title={inst.name}
                  subtitle={inst.email || inst.phone || 'No contact registered'}
                  avatarLetter={inst.name?.charAt(0)?.toUpperCase() || 'S'}
                  avatarBg="#eef2ff"
                  avatarColor="#4f46e5"
                  statusDot={
                    inst.status === 'ACTIVE' ? 'active'
                    : inst.status === 'PENDING' ? 'pending'
                    : 'danger'
                  }
                  pills={null}
                  showBorder={index < filteredInstitutes.length - 1}
                  onPress={() => onManage(inst)}
                  swipeAction={inst.status === 'PENDING' ? {
                    label: 'Verify',
                    bgColor: 'bg-emerald-500',
                    icon: <Icons.Check size={18} color="white" />,
                    onPress: () => onReview ? onReview(inst) : onVerifyInstitute(inst.id),
                  } : {
                    label: 'Manage',
                    bgColor: 'bg-indigo-500',
                    icon: <Icons.Settings size={18} color="white" />,
                    onPress: () => onManage(inst),
                  }}
                  rightElement={
                    <View className="flex-row items-center">
                        <StatusPill
                            label={inst.plan || 'Standard'}
                            type={inferPillType(inst.plan || 'standard')}
                        />
                        <Icons.ChevronRight size={14} color="#d1d5db" className="ml-2" />
                    </View>
                  }
                />
              );
            })}
          </AppCard>
        ) : (
          <View className="py-20 items-center">
            <View className="w-16 h-16 bg-gray-50 rounded-2xl items-center justify-center mb-4 border border-gray-100">
              <Icons.School size={32} color="#cbd5e1" />
            </View>
            <Text className="text-[15px] font-black text-gray-900 tracking-tight font-inter-black">No Schools Found</Text>
            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 font-inter-black">
              Zero entries in this category
            </Text>
          </View>
        )}

        {/* Guide Card */}
        <LinearGradient
          colors={['#1e1b4b', '#312e81']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          className="rounded-[20px] p-5 flex-row items-center shadow-lg shadow-indigo-200 relative overflow-hidden"
        >
          <View className="flex-1 relative z-10">
            <Text className="text-white font-black text-[15px] mb-1 tracking-tight font-inter-black">System Records</Text>
            <Text className="text-indigo-200 text-[11px] leading-relaxed font-medium font-inter-medium">
              Swipe left on any school to quick-verify or manage. Filter by status above.
            </Text>
          </View>
          <View className="bg-white/10 p-3 rounded-xl border border-white/10 ml-5">
            <Icons.Globe size={20} color="white" />
          </View>
          <View className="absolute right-[-20] bottom-[-20] opacity-10 rotate-12">
            <Icons.Grid size={120} color="white" />
          </View>
        </LinearGradient>
      </ScrollView>
    </View>
  );
};
