import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Icons } from '@components/common/Icons';
import { AppTheme, AppCard, AnnouncementCard, SectionHeader, StatusPill, PlatinumSearchHeader } from '@components/common';
import { triggerHaptic } from '@utils/haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface AnnouncementsScreenProps {
  announcements: any[];
  currentUser: any;
  onDeleteNotice?: (id: string) => void;
  onShowNoticeDetail?: (notice: any) => void;
  onBack: () => void;
  title?: string;
  subtitle?: string;
}

export const AnnouncementsScreen: React.FC<AnnouncementsScreenProps> = ({
  announcements,
  currentUser,
  onDeleteNotice,
  onShowNoticeDetail,
  onBack,
  title = "School Notices",
  subtitle
}) => {
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'STAFF' | 'STUDENT'>('ALL');
  const [searchVisible, setSearchVisible] = useState(false);

  const filteredAnnouncements = useMemo(() => {
    return (announcements || []).filter(a => {
      const matchesSearch = 
        (a.title || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (a.message || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (a.sender || '').toLowerCase().includes(searchText.toLowerCase());
      
      const matchesFilter = 
        activeFilter === 'ALL' || 
        (a.audience || '').toUpperCase() === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [announcements, searchText, activeFilter]);

  const handleDelete = (id: string) => {
    triggerHaptic();
    Alert.alert(
      "Purge Bulletin",
      "This will permanently remove this notice from the institutional archives. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        { 
            text: "Purge", 
            style: "destructive",
            onPress: () => {
                if (onDeleteNotice) onDeleteNotice(id);
            }
        }
      ]
    );
  };

  const activeSubtitle = subtitle || `${currentUser?.school_name || 'OurEduca'} Node`;

  return (
    <View className="flex-1 bg-[#f8faff]">
      <PlatinumSearchHeader
        title={title}
        subtitle={activeSubtitle}
        onBack={onBack}
        searchValue={searchText}
        onSearchChange={setSearchText}
        placeholder="Search Faculty News..."
        searchVisible={searchVisible}
        onSearchToggle={setSearchVisible}
      />

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Filter Chips - High Fidelity */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-8 px-1">
            {(['ALL', 'STAFF', 'STUDENT'] as const).map((filter) => (
                <TouchableOpacity 
                key={filter}
                onPress={() => { triggerHaptic(); setActiveFilter(filter); }}
                className={`mr-3 px-6 py-2.5 rounded-xl border ${
                    activeFilter === filter 
                    ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-200' 
                    : 'bg-white border-gray-100'
                } active:scale-95`}
                >
                <Text className={`text-[10px] font-inter-black uppercase tracking-[1.5px] ${
                    activeFilter === filter ? 'text-white' : 'text-gray-400'
                }`}>
                    {filter}
                </Text>
                </TouchableOpacity>
            ))}
            </ScrollView>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <SectionHeader 
                title="ALL ANNOUNCEMENTS" 
                rightElement={
                    <StatusPill label={`${filteredAnnouncements.length} Total`} type="neutral" />
                }
                className="mb-4 px-2"
            />
        </Animated.View>

        {filteredAnnouncements.length === 0 ? (
          <Animated.View entering={FadeInDown.delay(300).duration(400)} className="items-center justify-center py-20 px-8">
            <View className="bg-white p-5 rounded-full shadow-sm mb-4 border border-gray-50">
              <Icons.Notifications size={40} color="#e2e8f0" />
            </View>
            <Text className="text-gray-900 font-inter-black text-lg">No New Notices</Text>
            <Text className="text-gray-400 text-center text-[11px] mt-2 leading-relaxed font-inter-medium">
              There are no updates matching your current filters at this time.
            </Text>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <AppCard className="p-0 overflow-hidden border border-white shadow-xl shadow-indigo-100/30 mb-10">
                {filteredAnnouncements.map((a: any, idx) => {
                const diff = Date.now() - new Date(a.date || a.created_at || Date.now()).getTime();
                const isNew = diff < 24 * 60 * 60 * 1000;
                
                const canDelete = onDeleteNotice && (
                    currentUser?.id === a.sender_id || 
                    ['SCHOOL_ADMIN', 'HEADMASTER'].includes(currentUser?.role?.toUpperCase())
                );

                // Intelligent Category Mapping (Keyword-based fallback)
                let cardCategory: any = a.category;
                if (!cardCategory || cardCategory === 'general') {
                    const titleUpper = (a.title || '').toUpperCase();
                    if (titleUpper.includes('[URGENT]') || titleUpper.includes('URGENT:')) cardCategory = 'urgent';
                    else if (titleUpper.includes('[ACADEMIC]') || titleUpper.includes('ACADEMIC:')) cardCategory = 'academic';
                    else if (titleUpper.includes('[EVENT]') || titleUpper.includes('EVENT:')) cardCategory = 'event';
                    else cardCategory = a.audience === 'ALL' ? 'urgent' : 'general';
                }

                return (
                    <AnnouncementCard 
                    key={a.id || idx}
                    index={idx}
                    title={a.title}
                    message={a.message}
                    date={a.date || a.created_at}
                    category={cardCategory}
                    isNew={isNew}
                    showDelete={!!canDelete}
                    onDelete={() => handleDelete(a.id)}
                    onPress={() => onShowNoticeDetail && onShowNoticeDetail(a)}
                    />
                );
                })}
            </AppCard>
          </Animated.View>
        )}

        <View className="items-center opacity-30 pb-10">
            <View className="w-8 h-0.5 bg-gray-300 rounded-full mb-3" />
            <Text className="text-[9px] text-gray-400 uppercase tracking-[4px] font-inter-black">End of Records</Text>
        </View>
      </ScrollView>
    </View>
  );
};
