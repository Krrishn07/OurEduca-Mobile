import React, { useState, useMemo, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, TextInput, ScrollView, Animated } from 'react-native';
import { Icons } from '@components/common/Icons';
import { AppTheme, AppCard, AnnouncementCard, SectionHeader, StatusPill } from '@components/common';
import { triggerHaptic } from '@utils/haptics';
import { LinearGradient } from 'expo-linear-gradient';

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
  title = "Bulletin Center",
  subtitle = "Institutional Archives"
}) => {
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'STAFF' | 'PARENT' | 'STUDENT'>('ALL');
  const scrollY = useRef(new Animated.Value(0)).current;

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

  return (
    <View className="flex-1 bg-[#f8fafc]">
      {/* Header Area */}
      <View className="pt-12 pb-6 px-6 bg-white border-b border-gray-100 shadow-sm">
        <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity 
                onPress={onBack}
                className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center border border-gray-100"
            >
                <Icons.ArrowLeft size={18} color="#4f46e5" />
            </TouchableOpacity>
            <View className="items-center">
                <Text className="text-[12px] font-inter-black text-indigo-600 uppercase tracking-[2px]">{title}</Text>
                <Text className="text-[10px] font-inter-bold text-gray-400 uppercase tracking-[1px]">{subtitle}</Text>
            </View>
            <View className="w-10 h-10" />
        </View>

        {/* Search Bar - Platinum Style */}
        <View className="flex-row items-center bg-gray-50 rounded-2xl border border-gray-100 px-4 py-3 shadow-inner">
          <Icons.Search size={16} color="#9ca3af" />
          <TextInput 
            placeholder="Search all bulletins..."
            placeholderTextColor="#cbd5e1"
            className="flex-1 ml-2 text-[14px] font-inter-bold text-gray-900"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Icons.Close size={14} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-8 px-1">
          {(['ALL', 'STAFF', 'PARENT', 'STUDENT'] as const).map((filter) => (
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

        <SectionHeader 
            title="ARCHIVED RECORDS" 
            rightElement={
                <StatusPill label={`${filteredAnnouncements.length} Found`} type="neutral" />
            }
            className="mb-4 px-2"
        />

        {filteredAnnouncements.length === 0 ? (
          <View className="items-center justify-center py-20 px-8">
            <View className="bg-white p-5 rounded-full shadow-sm mb-4 border border-gray-50">
              <Icons.Notifications size={40} color="#e2e8f0" />
            </View>
            <Text className="text-gray-900 font-inter-black text-lg">No Bulletins Found</Text>
            <Text className="text-gray-400 text-center text-[11px] mt-2 leading-relaxed font-inter-medium">
              We couldn't find any notices matching your current search or filters.
            </Text>
          </View>
        ) : (
          <AppCard className="p-0 overflow-hidden border border-white shadow-xl shadow-indigo-100/10">
            {filteredAnnouncements.map((a: any, idx) => {
              const diff = Date.now() - new Date(a.date || Date.now()).getTime();
              const isNew = diff < 24 * 60 * 60 * 1000;
              
              const canDelete = onDeleteNotice && (
                currentUser?.id === a.sender_id || 
                ['SCHOOL_ADMIN', 'HEADMASTER'].includes(currentUser?.role?.toUpperCase())
              );

              return (
                <AnnouncementCard 
                  key={a.id || idx}
                  index={idx}
                  title={a.title}
                  message={a.message}
                  date={a.date}
                  category={a.category || (a.audience === 'ALL' ? 'urgent' : 'general')}
                  isNew={isNew}
                  showDelete={!!canDelete}
                  onDelete={() => handleDelete(a.id)}
                  onPress={() => onShowNoticeDetail && onShowNoticeDetail(a)}
                />
              );
            })}
          </AppCard>
        )}

        <View className="mt-10 items-center opacity-30 pb-10">
            <View className="w-8 h-0.5 bg-gray-300 rounded-full mb-3" />
            <Text className="text-[9px] text-gray-400 uppercase tracking-[4px] font-inter-black">End of Archives</Text>
        </View>
      </ScrollView>
    </View>
  );
};
