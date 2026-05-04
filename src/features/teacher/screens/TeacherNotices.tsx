import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppCard, SectionHeader, AppRow, StatusPill, PlatinumHeader } from '../../../design-system';
import { formatAcademicTime } from '../../../utils/timeUtils';

interface TeacherNoticesProps {
  announcements: any[];
  currentUser: any;
  onDeleteNotice: (id: string) => Promise<void>; // Updated to reflect async nature
  onBack: () => void;
}

export const TeacherNotices: React.FC<TeacherNoticesProps> = ({
  announcements = [],
  currentUser,
  onDeleteNotice,
  onBack
}) => {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // PLATINUM FIX: Memoize expensive array operations to prevent keyboard lag
  const staffAnnouncements = useMemo(() => {
    return announcements.filter(a =>
      (a.audience === 'ALL' || a.audience === 'STAFF') &&
      (a.title?.toLowerCase().includes(search.toLowerCase()) || a.message?.toLowerCase().includes(search.toLowerCase()))
    );
  }, [announcements, search]);

  const handleDeletePress = async (id: string) => {
    setDeletingId(id);
    try {
      await onDeleteNotice(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <View className="flex-1 bg-gray-50/50">
      <PlatinumHeader
        title="School Notices"
        subtitle={`${currentUser?.school_name || 'Academy'} Node`}
        onBack={onBack}
      />

      <View className="flex-1 px-4 pt-6">
        <View className="bg-white p-4 rounded-[28px] border border-gray-100 shadow-sm flex-row items-center mb-6">
          <Icons.Search size={18} color="#94a3b8" />
          <TextInput
            className="flex-1 ml-4 text-[13px] font-black text-gray-900 font-inter-black"
            placeholder="Search Faculty News..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#94a3b8"
          />
          {/* PLATINUM FIX: Clear Search Button */}
          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch('')}
              className="p-1 active:opacity-70"
            >
              <Icons.Close size={16} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <SectionHeader
            title="ALL ANNOUNCEMENTS"
            className="mb-4"
            rightElement={<StatusPill label={`${staffAnnouncements.length} Total`} type="neutral" />}
          />

          <AppCard className="p-0 overflow-hidden border border-white shadow-xl shadow-indigo-100/30 mb-10">
            {staffAnnouncements.map((a, idx) => {
              const audienceLabel = a.audience === 'ALL' ? 'Global' : a.audience === 'STAFF' ? 'Staff Only' : 'Class Group';

              return (
                <AppRow
                  key={a.id}
                  title={a.title}
                  titleProps={{ numberOfLines: 1, ellipsizeMode: 'tail' }}
                  // PLATINUM FIX: Prevent massive messages from breaking layout
                  subtitle={`${audienceLabel} • ${a.message}`}
                  subtitleProps={{ numberOfLines: 2, ellipsizeMode: 'tail' }}
                  avatarIcon={<Icons.Notifications size={15} color="#4f46e5" />}
                  avatarBg="#eef2ff"
                  meta={formatAcademicTime(a.created_at || a.date)}
                  showBorder={idx < staffAnnouncements.length - 1}
                  rightElement={
                    a.sender_id === currentUser.id ? (
                      <TouchableOpacity
                        disabled={deletingId === a.id}
                        onPress={() => handleDeletePress(a.id)}
                        className={`px-4 py-2 rounded-xl active:scale-95 ${deletingId === a.id ? 'bg-gray-50 border-gray-100' : 'bg-rose-50 border-rose-100'}`}
                      >
                        {deletingId === a.id ? (
                          <ActivityIndicator size="small" color="#ef4444" />
                        ) : (
                          <Icons.Trash size={14} color="#ef4444" />
                        )}
                      </TouchableOpacity>
                    ) : <Icons.ChevronRight size={13} color="#d1d5db" />
                  }
                />
              );
            })}

            {staffAnnouncements.length === 0 && (
              <View className="items-center py-20">
                <View className="w-16 h-16 bg-gray-50 rounded-2xl items-center justify-center mb-6 border border-gray-100">
                  <Icons.Notifications size={32} color="#cbd5e1" />
                </View>
                <Text className="text-gray-900 font-black text-lg font-inter-black">No New Notices</Text>
                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-[3px] mt-2 text-center px-10">
                  There are no school-wide updates at this time.
                </Text>
              </View>
            )}
          </AppCard>
          <View className="h-20" />
        </ScrollView>
      </View>
    </View>
  );
};