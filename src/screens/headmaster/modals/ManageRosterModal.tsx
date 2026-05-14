import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Platform } from 'react-native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { Icons } from '@components/common/Icons';
import { UserRole, User } from '@/types';
import { 
    AppTheme, 
    ModalShell, 
    AppButton, 
    AppTypography, 
    StatusPill 
} from '@components/common';
import { triggerHaptic } from '@utils/haptics';

interface ManageRosterModalProps {
  visible: boolean;
  onClose: () => void;
  staff: User[];
  students: User[];
  onAssign: (user: User, subject?: string, roleInClass?: string) => void;
  assignType: 'TEACHER' | 'STUDENT' | 'MENTOR';
}

export const ManageRosterModal: React.FC<ManageRosterModalProps> = ({
  visible,
  onClose,
  staff,
  students,
  onAssign,
  assignType,
}) => {
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [targetRole, setTargetRole] = useState<'teacher' | 'mentor'>(assignType === 'MENTOR' ? 'mentor' : 'teacher');

  const isFaculty = assignType === 'TEACHER' || assignType === 'MENTOR';

  const potentialUsers = useMemo(() => {
    let list = assignType === 'STUDENT' ? students : staff;
    
    if (assignType === 'MENTOR') {
      list = list.filter(u => 
        u.role === UserRole.TEACHER || 
        u.role === UserRole.SUPER_ADMIN || 
        u.role === UserRole.ADMIN
      );
    }

    return list.filter(u => (u.name || '').toLowerCase().includes(search.toLowerCase()));
  }, [assignType, staff, students, search]);

  const handleAssign = () => {
    if (selectedUser) {
      triggerHaptic();
      onAssign(selectedUser, isFaculty ? subject : undefined, isFaculty ? targetRole : 'student');
      onClose();
      setSelectedUser(null);
      setSubject('');
      setSearch('');
    }
  };

  return (
    <ModalShell
      visible={visible}
      onClose={onClose}
      title="Appointment"
      subtitle={`ASSIGNING ${assignType}`}
    >
      <View className="flex-1">
        {/* Search Bar */}
        <View className="bg-gray-50/80 p-4 rounded-[24px] border border-gray-100/50 flex-row items-center mb-6 shadow-sm">
          <Icons.Search size={18} color="#6366f1" />
          <TextInput 
            className="flex-1 ml-3 text-gray-900 font-inter-black text-[14px]"
            placeholder={`Find ${assignType.toLowerCase()}...`}
            placeholderTextColor="#94a3b8"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {isFaculty && (
          <Animated.View entering={FadeInDown.duration(400)} className="mb-6">
            <View className="flex-row gap-2 mb-4 bg-gray-50/50 p-1 rounded-[20px] border border-gray-100">
              {(['teacher', 'mentor'] as const).map(role => (
                <TouchableOpacity 
                  key={role}
                  onPress={() => { triggerHaptic(); setTargetRole(role); }}
                  className={`flex-1 py-3 rounded-[16px] items-center ${targetRole === role ? 'bg-white shadow-sm border border-indigo-100' : 'bg-transparent'}`}
                >
                  <Text className={`text-[9px] font-black uppercase tracking-[1px] font-inter-black ${targetRole === role ? 'text-indigo-600' : 'text-gray-400'}`}>
                    {role === 'mentor' ? 'Class Mentor' : 'Subject Teacher'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="bg-white rounded-[24px] border border-gray-100 p-5 shadow-sm">
                <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[1px] mb-2.5 ml-1 font-inter-black">Subject / Specialization</Text>
                <TextInput 
                  className="text-gray-900 font-inter-black text-[15px] p-0"
                  placeholder="e.g. Mathematics"
                  placeholderTextColor="#cbd5e1"
                  value={subject}
                  onChangeText={setSubject}
                />
            </View>
          </Animated.View>
        )}

        <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[1px] mb-4 ml-1 font-inter-black">Select Candidate</Text>
        
        <ScrollView 
          className="max-h-[350px]" 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 10 }}
        >
          {potentialUsers.map((user) => (
            <TouchableOpacity 
              key={user.id}
              onPress={() => { triggerHaptic(); setSelectedUser(user); }}
              activeOpacity={0.9}
              className={`flex-row items-center p-4 rounded-[24px] mb-3 border transition-all ${selectedUser?.id === user.id ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-gray-50'}`}
            >
              <View className={`w-10 h-10 rounded-xl items-center justify-center mr-4 border border-gray-100/50 ${assignType === 'STUDENT' ? 'bg-emerald-50' : 'bg-indigo-50'}`}>
                <Text className={`font-inter-black text-[16px] ${assignType === 'STUDENT' ? 'text-emerald-600' : 'text-indigo-600'}`}>{user.name?.charAt(0) || '?'}</Text>
              </View>
              <View className="flex-1">
                <Text className={`font-inter-black text-[14px] tracking-tight ${selectedUser?.id === user.id ? 'text-indigo-900' : 'text-gray-900'}`} numberOfLines={1}>{user.name}</Text>
                <Text className="text-[9px] text-gray-400 font-inter-black uppercase tracking-[1px] mt-0.5">ID: {user.id.substring(0, 8).toUpperCase()}</Text>
              </View>
              {selectedUser?.id === user.id && (
                <View className="bg-indigo-600 rounded-full w-6 h-6 items-center justify-center shadow-lg shadow-indigo-300">
                   <Icons.Check size={14} color="white" />
                </View>
              )}
            </TouchableOpacity>
          ))}
          {potentialUsers.length === 0 && (
            <View className="items-center py-12 opacity-30">
               <Icons.Users size={32} color="#6366f1" />
               <Text className="text-[10px] font-black uppercase mt-3 font-inter-black">No Candidates Found</Text>
            </View>
          )}
        </ScrollView>

        <AppButton 
          label="CONFIRM APPOINTMENT"
          onPress={handleAssign}
          disabled={!selectedUser}
          className="mt-6 py-5"
        />
      </View>
    </ModalShell>
  );
};
