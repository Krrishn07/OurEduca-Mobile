import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Alert, TextInput, ScrollView } from 'react-native';
import { AppTheme, ModalShell, AppCard, AnnouncementCard } from '@components/common';
import { triggerHaptic } from '@utils/haptics';

interface AnnouncementHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  announcements: any[];
  currentUser: any;
  onDeleteNotice?: (id: string) => void;
  onShowNoticeDetail?: (notice: any) => void;
}

export const AnnouncementHistoryModal: React.FC<AnnouncementHistoryModalProps> = ({
  visible,
  onClose,
  announcements,
  currentUser,
  onDeleteNotice,
  onShowNoticeDetail
}) => {
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'STAFF' | 'PARENT' | 'STUDENT'>('ALL');

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

  const getAudienceColor = (audience: string) => {
    const aud = (audience || '').toUpperCase();
    if (aud === 'STAFF') return { text: '#4f46e5', bg: 'bg-indigo-50' };
    if (aud === 'PARENT') return { text: '#d97706', bg: 'bg-amber-50' };
    if (aud === 'STUDENT') return { text: '#10b981', bg: 'bg-emerald-50' };
    return { text: '#9333ea', bg: 'bg-purple-50' };
  };

  return (
    <ModalShell
      visible={visible}
      onClose={onClose}
      title="Bulletin Center"
      subtitle="Institutional Archive"
      headerGradient={AppTheme.colors.gradients.brand}
    >
      <View className="pb-8 pt-2">
        {/* Search Bar - Platinum Style */}
        <View className="flex-row items-center bg-white rounded-2xl border border-gray-100 px-4 py-3 mb-6 shadow-sm">
          <Icons.Search size={16} color="#9ca3af" />
          <TextInput 
            placeholder="Search bulletins..."
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

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-6 px-1">
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

        {filteredAnnouncements.length === 0 ? (
          <View className="items-center justify-center py-20 px-8">
            <View className="bg-white p-5 rounded-full shadow-sm mb-4 border border-gray-50">
              <Icons.Notifications size={40} color="#e2e8f0" />
            </View>
            <Text className="text-gray-900 font-inter-black text-lg">No Bulletins Found</Text>
            <Text className="text-gray-400 text-center text-[11px] mt-2 leading-relaxed font-inter-medium">
              We couldn't find any notices matching your current search.
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
      </View>
    </ModalShell>
  );
};
