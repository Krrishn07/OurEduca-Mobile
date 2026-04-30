import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { AppCard, SectionHeader, AppRow, StatusPill } from '../../../design-system';

interface TeacherNoticesProps {
  announcements: any[];
  currentUser: any;
  onDeleteNotice: (id: string) => void;
  onBack: () => void;
}

export const TeacherNotices: React.FC<TeacherNoticesProps> = ({
  announcements = [],
  currentUser,
  onDeleteNotice,
  onBack
}) => {
  const [search, setSearch] = useState('');

  const staffAnnouncements = announcements.filter(a => 
    (a.audience === 'ALL' || a.audience === 'STAFF') &&
    (a.title?.toLowerCase().includes(search.toLowerCase()) || a.message?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <View className="flex-1 bg-gray-50/50">
      {/* Header */}
      <View className="bg-white border-b border-gray-100 pt-12 pb-6 px-6 shadow-sm">
        <View className="flex-row items-center">
            <TouchableOpacity 
                onPress={onBack}
                className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 mr-4 active:scale-90"
            >
                <Icons.ChevronLeft size={18} color="#4f46e5" />
            </TouchableOpacity>
            <View>
                <Text className="text-[17px] font-black text-gray-900 tracking-tighter font-inter-black uppercase tracking-widest">School Notices</Text>
                <Text className="text-[9px] font-black text-indigo-400 uppercase tracking-[3px] mt-0.5 font-inter-black">Official Updates</Text>
            </View>
        </View>
      </View>

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
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <SectionHeader 
            title="ALL ANNOUNCEMENTS" 
            className="mb-4 px-2"
            rightElement={<StatusPill label={`${staffAnnouncements.length} Total`} type="neutral" />}
          />

          <AppCard className="p-0 overflow-hidden border border-white shadow-xl shadow-indigo-100/30 mb-10">
            {staffAnnouncements.map((a, idx) => (
              <AppRow
                key={a.id}
                title={a.title}
                subtitle={a.message}
                avatarIcon={<Icons.Notifications size={15} color="#4f46e5" />}
                avatarBg="#eef2ff"
                meta={a.date || new Date(a.created_at).toLocaleDateString()}
                showBorder={idx < staffAnnouncements.length - 1}
                rightElement={
                  a.sender_id === currentUser.id ? (
                    <TouchableOpacity
                      onPress={() => onDeleteNotice(a.id)}
                      className="bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-xl active:bg-rose-100"
                    >
                      <Text className="text-[9px] font-black text-rose-500 uppercase tracking-widest font-inter-black">Delete</Text>
                    </TouchableOpacity>
                  ) : <Icons.ChevronRight size={13} color="#d1d5db" />
                }
              />
            ))}

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
