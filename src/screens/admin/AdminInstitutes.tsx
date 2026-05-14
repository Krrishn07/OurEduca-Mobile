import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { UserRole } from '@/types';
import { 
  Icons, 
  RestrictedAccessView, 
  AppTheme, 
  AppCard, 
  AppTypography, 
  AppButton,
  AppRow, 
  AppFilterBar, 
  StatusPill, 
  inferPillType,
  PlatinumSearchHeader,
  SectionHeader
} from '@components/common';
import { triggerHaptic } from '@utils/haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';

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
    <View className="flex-1 bg-[#fbfbfe]">
      <PlatinumSearchHeader 
        title="Institutional Directory"
        subtitle="MANAGE SCHOOLS"
        searchValue={instSearch}
        onSearchChange={setInstSearch}
        placeholder="Search schools, IDs..."
        rightAction={
            <TouchableOpacity
                onPress={() => { triggerHaptic(); onShowAddInstituteModal(); }}
                className="w-10 h-10 bg-indigo-600 rounded-full items-center justify-center shadow-md shadow-indigo-200 active:scale-95"
            >
                <Icons.Plus size={20} color="white" />
            </TouchableOpacity>
        }
      />

      <AppFilterBar
        chips={filterChips}
        active={activeInstituteTab}
        onChange={(tab) => { triggerHaptic(); setActiveInstituteTab(tab); }}
        className="mx-5 mb-8"
      />



      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }}
      >
        <View className="px-5">
            <SectionHeader 
                title={`${activeInstituteTab} ENTRIES`}
                className="px-1 mb-4"
                rightElement={
                    isLoadingInstitutes && <ActivityIndicator size="small" color="#4f46e5" />
                }
            />

            {isLoadingInstitutes && filteredInstitutes.length === 0 ? (
                <View className="py-20 items-center">
                    <ActivityIndicator color="#4f46e5" size="large" />
                    <Text className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-6 font-inter-black">
                        Syncing institutional data...
                    </Text>
                </View>
            ) : filteredInstitutes.length > 0 ? (
                <AppCard className="p-0 overflow-hidden mb-5 border-white shadow-xl shadow-indigo-100/20 rounded-[32px]">
                    {filteredInstitutes.map((inst: any, index: number) => {
                        const isPending = inst.status === 'PENDING';
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
                                showBorder={index < filteredInstitutes.length - 1}
                                onPress={() => { triggerHaptic(); onManage(inst); }}
                                rightElement={
                                    <View className="flex-row items-center">
                                        {isPending ? (
                                            <TouchableOpacity 
                                                onPress={() => { triggerHaptic(); onReview ? onReview(inst) : onVerifyInstitute(inst.id); }}
                                                className="bg-emerald-500 px-4 py-2 rounded-xl mr-2 shadow-sm shadow-emerald-200"
                                            >
                                                <Text className="text-white text-[9px] font-black uppercase tracking-widest font-inter-black">Verify</Text>
                                            </TouchableOpacity>
                                        ) : (
                                            <StatusPill
                                                label={inst.plan || 'Standard'}
                                                type={inferPillType(inst.plan || 'standard')}
                                            />
                                        )}
                                        <Icons.ChevronRight size={14} color="#d1d5db" className="ml-2" />
                                    </View>
                                }
                            />
                        );
                    })}
                </AppCard>
            ) : (
                <View className="py-20 items-center">
                    <View className="w-16 h-16 bg-slate-50 rounded-3xl items-center justify-center mb-6 border border-slate-100 shadow-inner">
                        <Icons.School size={32} color="#cbd5e1" />
                    </View>
                    <Text className="text-[16px] font-black text-slate-900 tracking-tight font-inter-black">Directory Empty</Text>
                    <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 font-inter-black text-center">
                        No schools matching the current filters were found in the registry.
                    </Text>
                </View>
            )}
        </View>

        {/* Global Registry Banner */}
        <Animated.View entering={FadeInDown.delay(300)} className="mx-5">
            <LinearGradient
                colors={['#1e1b4b', '#312e81']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={{ borderRadius: 32 }}
                className="p-6 flex-row items-center shadow-2xl shadow-indigo-200 mt-2 overflow-hidden"
            >
                <View className="absolute right-[-20] bottom-[-20] opacity-10 transform rotate-12">
                    <Icons.Globe size={120} color="white" />
                </View>
                <View className="flex-1 relative z-10">
                    <Text className="text-white font-black text-[16px] mb-1 tracking-tight font-inter-black">Global School Network</Text>
                    <Text className="text-indigo-300 text-[11px] leading-relaxed font-inter-medium opacity-80">
                        Managing {counts.ACTIVE + counts.PENDING + counts.SUSPENDED} institutions across the decentralized network.
                    </Text>
                </View>
                <View className="bg-white/10 p-3 rounded-2xl border border-white/20 ml-4">
                    <Icons.Grid size={20} color="white" />
                </View>
            </LinearGradient>
        </Animated.View>
      </ScrollView>
    </View>
  );
};
