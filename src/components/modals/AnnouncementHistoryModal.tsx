import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Alert, TextInput, ScrollView } from 'react-native';
import { Icons } from '@components/common/Icons';
import { AppTheme, ModalShell, AppCard } from '@components/common';
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-6">
          {(['ALL', 'STAFF', 'PARENT', 'STUDENT'] as const).map((filter) => (
            <TouchableOpacity 
              key={filter}
              onPress={() => { triggerHaptic(); setActiveFilter(filter); }}
              className={`mr-3 px-6 py-3 rounded-2xl border-2 ${
                activeFilter === filter 
                  ? 'bg-white border-indigo-500 shadow-xl shadow-indigo-100/50' 
                  : 'bg-white border-transparent shadow-sm'
              } active:scale-95`}
            >
              <Text className={`text-[10px] font-inter-black uppercase tracking-[1px] ${
                activeFilter === filter ? 'text-indigo-600' : 'text-gray-400'
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
          <View className="gap-3">
            {filteredAnnouncements.map((a: any, idx) => {
              const style = getAudienceColor(a.audience);
              const canDelete = onDeleteNotice && (
                currentUser?.id === a.sender_id || 
                ['SCHOOL_ADMIN', 'HEADMASTER'].includes(currentUser?.role?.toUpperCase())
              );

              return (
                <TouchableOpacity 
                  key={a.id || idx} 
                  onPress={() => { triggerHaptic(); onShowNoticeDetail && onShowNoticeDetail(a); }}
                  activeOpacity={0.7}
                  className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex-row items-center"
                >
                  <View className={`w-10 h-10 rounded-xl ${style.bg} items-center justify-center mr-4 border border-black/5`}>
                    <Icons.Notifications size={18} color={style.text} />
                  </View>

                  <View className="flex-1 mr-2">
                    <View className="flex-row items-center mb-0.5 flex-wrap">
                      <Text className="font-inter-bold text-gray-900 text-[14px] tracking-tight mr-2" numberOfLines={1}>{a.title}</Text>
                      <View className={`${style.bg} px-1.5 py-0.5 rounded-md`}>
                        <Text className={`text-[7px] font-inter-bold uppercase tracking-[0.5px]`} style={{ color: style.text }}>{a.audience}</Text>
                      </View>
                    </View>
                    <Text className="text-[9px] font-inter-bold text-gray-400 uppercase tracking-[0.5px] mb-1">
                      {a.sender || 'System'} • {a.date}
                    </Text>
                    <Text className="text-gray-500 text-[11px] leading-relaxed font-inter-medium" numberOfLines={1}>{a.message}</Text>
                  </View>

                  <View className="flex-row items-center gap-2">
                    {canDelete && (
                      <TouchableOpacity 
                        onPress={() => handleDelete(a.id)}
                        className="p-2 bg-gray-50 rounded-xl border border-gray-100 active:bg-red-50"
                      >
                        <Icons.Trash size={12} color="#9ca3af" />
                      </TouchableOpacity>
                    )}
                    <Icons.ChevronRight size={14} color="#e2e8f0" />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    </ModalShell>
  );
};
