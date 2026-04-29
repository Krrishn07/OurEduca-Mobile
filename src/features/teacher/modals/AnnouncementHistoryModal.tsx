import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Alert, TextInput, ScrollView } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { AppTheme, AppTypography, ModalShell, AppCard, AppRadius } from '../../../design-system';

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
    >
      {/* Search Bar - Platinum Style */}
      <View className="flex-row items-center bg-white rounded-2xl border border-gray-100 px-4 py-3.5 mb-6 shadow-sm">
        <Icons.Search size={18} color="#9ca3af" />
        <TextInput 
          placeholder="Search titles, messages, or senders..."
          placeholderTextColor="#9ca3af"
          className="flex-1 ml-3 text-sm font-black text-gray-900"
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Icons.Close size={16} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-8">
        {(['ALL', 'STAFF', 'PARENT', 'STUDENT'] as const).map((filter) => (
          <TouchableOpacity 
            key={filter}
            onPress={() => setActiveFilter(filter)}
            className={`mr-3 px-6 py-2.5 rounded-2xl border ${
              activeFilter === filter 
              ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-100' 
              : 'bg-white border-gray-200'
            } active:scale-95 transition-all`}
          >
            <Text className={`text-[10px] font-black uppercase tracking-widest ${
              activeFilter === filter ? 'text-white' : 'text-gray-400'
            }`}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filteredAnnouncements.length === 0 ? (
        <View className="items-center justify-center py-20 px-8">
          <View className="bg-white p-6 rounded-full shadow-sm mb-4">
            <Icons.Notifications size={48} color="#e2e8f0" />
          </View>
          <Text className="text-gray-900 font-black text-lg">No Bulletins Found</Text>
          <Text className="text-gray-400 text-center text-[11px] mt-2 leading-relaxed">
            We couldn't find any notices matching your current search or filter criteria.
          </Text>
        </View>
      ) : (
        <View className="gap-4">
          {filteredAnnouncements.map((a: any, idx) => {
            const style = getAudienceColor(a.audience);
            const canDelete = onDeleteNotice && (
              currentUser?.id === a.sender_id || 
              ['SCHOOL_ADMIN', 'HEADMASTER'].includes(currentUser?.role?.toUpperCase())
            );

            return (
              <AppCard 
                key={a.id || idx} 
                onPress={() => onShowNoticeDetail && onShowNoticeDetail(a)}
                className="flex-row items-center p-5"
              >
                <View className={`w-12 h-12 rounded-2xl ${style.bg} items-center justify-center mr-4 border border-black/5`}>
                  <Icons.Notifications size={20} color={style.text} />
                </View>

                <View className="flex-1 mr-4">
                  <View className="flex-row items-center mb-1 flex-wrap">
                    <Text className="font-black text-gray-900 text-[15px] tracking-tight mr-2" numberOfLines={1}>{a.title}</Text>
                    <View className={`${style.bg} px-2 py-0.5 rounded-md`}>
                      <Text className={`text-[8px] font-black uppercase`} style={{ color: style.text }}>{a.audience}</Text>
                    </View>
                  </View>
                  <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5" numberOfLines={1}>
                    {a.sender || 'System'} • {a.date}
                  </Text>
                  <Text className="text-gray-600 text-[11px] leading-relaxed" numberOfLines={2}>{a.message}</Text>
                </View>

                <View className="flex-row items-center gap-2">
                  {canDelete && (
                    <TouchableOpacity 
                      onPress={() => handleDelete(a.id)}
                      className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 active:bg-red-50 active:border-red-100"
                    >
                      <Icons.Trash size={12} color="#9ca3af" />
                    </TouchableOpacity>
                  )}
                  <Icons.ChevronRight size={14} color="#e2e8f0" />
                </View>
              </AppCard>
            );
          })}
        </View>
      )}
    </ModalShell>
  );
};
