import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Linking, Alert, TextInput } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { RegistrationMessage } from '../../../../contexts/SchoolDataContext';
import { LinearGradient } from 'expo-linear-gradient';
import {
  AppCard, AppTheme, AppTypography,
  AppRow, AppFilterBar, StatusPill,
} from '../../../design-system';

interface InquiryManagementProps {
  leads: RegistrationMessage[];
  isLoading: boolean;
  onUpdateStatus: (id: string, status: 'NEW' | 'REVIEWED' | 'ONBOARDED') => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onOnboard?: (lead: RegistrationMessage) => void;
  showToast?: (message: string, type: 'success' | 'error' | 'info') => void;
  showConfirm?: (title: string, message: string, onConfirm: () => void, type: 'DANGER' | 'INFO') => void;
}

export const InquiryManagement: React.FC<InquiryManagementProps> = ({
  leads = [],
  isLoading,
  onUpdateStatus,
  onDelete,
  onOnboard,
  showToast,
  showConfirm,
}) => {
  const [activeTab, setActiveTab] = useState<'NEW' | 'REVIEWED' | 'ONBOARDED' | 'ALL'>('NEW');
  const [searchQuery, setSearchQuery] = useState('');

  const counts = useMemo(() => ({
    NEW:       (leads || []).filter(l => l.status === 'NEW').length,
    REVIEWED:  (leads || []).filter(l => l.status === 'REVIEWED').length,
    ONBOARDED: (leads || []).filter(l => l.status === 'ONBOARDED').length,
    ALL:       (leads || []).length,
  }), [leads]);

  const filteredLeads = useMemo(() => {
    return (leads || []).filter(lead => {
      const matchesTab = activeTab === 'ALL' || lead.status === activeTab;
      const matchesSearch = !searchQuery ||
        lead.institute_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [leads, activeTab, searchQuery]);

  const confirmDelete = (id: string) => {
    const action = async () => {
      try {
        await onDelete(id);
        showToast?.('Inquiry removed', 'success');
      } catch {
        showToast?.('Failed to delete', 'error');
      }
    };
    if (showConfirm) showConfirm('Purge Inquiry?', 'Permanent removal of this request.', action, 'DANGER');
    else Alert.alert('Delete Inquiry', 'Confirm permanent removal?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: action },
    ]);
  };

  const filterChips = [
    { label: 'New',       value: 'NEW'       as const, count: counts.NEW       },
    { label: 'Reviewed',  value: 'REVIEWED'  as const, count: counts.REVIEWED  },
    { label: 'Onboarded', value: 'ONBOARDED' as const, count: counts.ONBOARDED },
    { label: 'All',       value: 'ALL'       as const, count: counts.ALL        },
  ];

  return (
    <View className="flex-1 bg-[#f5f7ff]">
      {/* Hero Header — full bleed */}
      <LinearGradient
        colors={AppTheme.colors.gradients.brand}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        className="px-6 pt-5 pb-10 rounded-b-[40px] shadow-xl shadow-indigo-200 z-20"
      >
        <View className="absolute right-[-20] bottom-[-20] opacity-10 transform rotate-12">
          <Icons.Inbox size={140} color="white" />
        </View>
        <View className="flex-row justify-between items-center relative z-10 mb-5">
          <View className="flex-1 mr-4">
            <Text className={`${AppTypography.heroTitle} text-white`} numberOfLines={1}>Inquiries</Text>
            <Text className={`${AppTypography.eyebrow} text-white/60 mt-1`}>Lead Pipeline</Text>
          </View>
          <View className="bg-white/10 p-2.5 rounded-xl border border-white/20">
            <Icons.Zap size={18} color="white" />
          </View>
        </View>

        {/* Search */}
        <View className="bg-white/10 rounded-2xl border border-white/20 px-4 py-3 flex-row items-center relative z-10">
          <Icons.Search size={18} color="white" opacity={0.8} />
          <TextInput
            className="flex-1 ml-3 text-sm font-bold text-white p-0"
            placeholder="Search lead pipeline..."
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
        active={activeTab}
        onChange={setActiveTab}
      />



      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
      >
        {isLoading ? (
          <View className="p-20 items-center">
            <ActivityIndicator color={AppTheme.colors.primary} size="small" />
            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-4 font-inter-black">
              Syncing Pipeline...
            </Text>
          </View>
        ) : filteredLeads.length > 0 ? (
          <AppCard className="p-0 overflow-hidden mb-5">
            {filteredLeads.map((lead, index) => {
              const submittedAt = lead.created_at
                ? new Date(lead.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })
                : 'Recently';

              const statusType =
                lead.status === 'ONBOARDED' ? 'success' :
                lead.status === 'REVIEWED'  ? 'info'    : 'warning';

              return (
                <AppRow
                  key={lead.id}
                  title={lead.institute_name || 'Unknown Institute'}
                  subtitle={`${lead.name} · ${lead.phone}`}
                  avatarLetter={lead.institute_name?.charAt(0)?.toUpperCase() || 'I'}
                  avatarBg="#eef2ff"
                  avatarColor="#4f46e5"
                  statusDot={
                    lead.status === 'ONBOARDED' ? 'active' :
                    lead.status === 'REVIEWED'  ? 'pending' : 'pending'
                  }
                  pills={
                    <StatusPill label={lead.status} type={statusType} />
                  }
                  showBorder={index < filteredLeads.length - 1}
                  onPress={null}
                  swipeAction={{
                    label: 'Delete',
                    bgColor: 'bg-rose-500',
                    icon: <Icons.Trash size={18} color="white" />,
                    onPress: () => confirmDelete(lead.id),
                  }}
                  rightElement={
                    lead.status === 'NEW' ? (
                      <View className="flex-row items-center gap-2">
                        <TouchableOpacity 
                          onPress={() => onUpdateStatus(lead.id, 'REVIEWED')}
                          className="bg-amber-50 border border-amber-100/50 rounded-xl px-2.5 py-2 active:bg-amber-100"
                        >
                          <Text className="text-[9px] font-black text-amber-600 uppercase tracking-wider font-inter-black">Review</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          onPress={() => onOnboard?.(lead)}
                          className="bg-indigo-50 border border-indigo-100/50 rounded-xl px-2.5 py-2 active:bg-indigo-100 flex-row items-center"
                        >
                          <Text className="text-[9px] font-black text-indigo-600 uppercase tracking-wider mr-1 font-inter-black">Onboard</Text>
                          <Icons.ChevronRight size={10} color="#4f46e5" />
                        </TouchableOpacity>
                      </View>
                    ) : lead.status === 'REVIEWED' ? (
                      <TouchableOpacity 
                        onPress={() => onOnboard?.(lead)}
                        className="bg-indigo-50 border border-indigo-100/50 rounded-xl px-3 py-2 active:bg-indigo-100 flex-row items-center"
                      >
                        <Text className="text-[9px] font-black text-indigo-600 uppercase tracking-wider mr-1 font-inter-black">Proceed Onboarding</Text>
                        <Icons.ChevronRight size={10} color="#4f46e5" />
                      </TouchableOpacity>
                    ) : (
                      <View className="flex-row items-center bg-emerald-50 border border-emerald-100/50 rounded-xl px-3 py-2">
                        <Icons.Check size={10} color="#10b981" />
                        <Text className="text-[9px] font-black text-emerald-600 uppercase tracking-wider ml-1 font-inter-black">Success</Text>
                      </View>
                    )
                  }
                />
              );
            })}
          </AppCard>
        ) : (
          <View className="py-20 items-center">
            <View className="w-16 h-16 bg-gray-50 rounded-2xl items-center justify-center mb-4 border border-gray-100">
              <Icons.Inbox size={32} color="#cbd5e1" />
            </View>
            <Text className="text-[15px] font-black text-gray-900 tracking-tight font-inter-black">Empty Pipeline</Text>
            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 font-inter-black">
              Zero active inquiries in queue
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
            <Text className="text-white font-black text-[15px] mb-1 tracking-tight font-inter-black">Onboarding Guide</Text>
            <Text className="text-indigo-200 text-[11px] leading-relaxed font-medium font-inter-medium">
              Swipe left on any lead to remove it. Tap a row to execute onboarding.
            </Text>
          </View>
          <View className="bg-white/10 p-3 rounded-xl border border-white/10 ml-5">
            <Icons.Zap size={20} color="white" />
          </View>
          <View className="absolute right-[-20] bottom-[-20] opacity-10 rotate-12">
            <Icons.Grid size={120} color="white" />
          </View>
        </LinearGradient>
      </ScrollView>
    </View>
  );
};
