import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { UserRole, User } from '../../../../types';
import { PlatformTheme, PlatformRadius } from '../../platform/theme';
import { PlatformStatusBadge } from '../../platform/components/PlatformStatusBadge';

interface ManageRosterModalProps {
  visible: boolean;
  onClose: () => void;
  staff: User[];
  students: User[];
  onAssign: (user: User, subject?: string, roleInClass?: string) => void;
  assignType: 'TEACHER' | 'STUDENT' | 'MENTOR'; // Kept for logic compatibility
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
    
    // Pro-Level Filtering: If assigning a Mentor, prioritize Teachers and Admins
    if (assignType === 'MENTOR') {
      list = list.filter(u => 
        u.role === UserRole.TEACHER || 
        u.role === UserRole.SUPER_ADMIN || 
        u.role === UserRole.ADMIN
      );
    }

    return list.filter(u => u.name.toLowerCase().includes(search.toLowerCase()));
  }, [assignType, staff, students, search]);

  const handleAssign = () => {
    if (selectedUser) {
      onAssign(selectedUser, isFaculty ? subject : undefined, isFaculty ? targetRole : 'student');
      onClose();
      setSelectedUser(null);
      setSubject('');
      setSearch('');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
      <View className="flex-1 bg-black/60">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={onClose} 
            className="flex-1"
          />
          <View className={`bg-white ${PlatformRadius.primary} h-[90%] p-8 shadow-2xl`}>
            <View className={`flex-row justify-between items-start ${PlatformTheme.spacing.section}`}>
              <View className="flex-1 mr-4">
                <Text className="text-2xl font-black text-gray-900 tracking-tighter leading-tight">Institutional Appointment</Text>
                <Text className="text-[10px] text-gray-400 font-black uppercase tracking-[2px] mt-1.5">Assigning {assignType.toLowerCase()} to node</Text>
              </View>
              <TouchableOpacity onPress={onClose} className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center border border-gray-100">
                <Icons.Plus size={20} color="#94a3b8" style={{ transform: [{ rotate: '45deg' }] }} />
              </TouchableOpacity>
            </View>

            {/* Search Bar - Sentinel Standard */}
            <View className={`bg-gray-50/50 ${PlatformRadius.secondary} px-5 py-4 flex-row items-center border border-gray-100 mb-6`}>
              <Icons.Search size={18} color="#4f46e5" />
              <View className="flex-1 ml-4">
                <TextInput 
                  className="text-gray-900 font-black text-sm tracking-tight"
                  placeholder={`Search ${assignType.toLowerCase()} archive...`}
                  placeholderTextColor="#94a3b8"
                  value={search}
                  onChangeText={setSearch}
                />
              </View>
            </View>

            {isFaculty && (
              <View className="mb-6">
                {/* Role Switcher - Critical refinement for faculty unification */}
                <View className="flex-row gap-3 mb-6">
                  {(['teacher', 'mentor'] as const).map(role => (
                    <TouchableOpacity 
                      key={role}
                      onPress={() => setTargetRole(role)}
                      className={`flex-1 py-3.5 rounded-2xl border items-center shadow-sm ${targetRole === role ? 'bg-indigo-600 border-indigo-500 shadow-indigo-100' : 'bg-gray-50 border-gray-100'}`}
                    >
                      <Text className={`text-[10px] font-black uppercase tracking-widest ${targetRole === role ? 'text-white' : 'text-gray-400'}`}>{role === 'mentor' ? 'Class Mentor' : 'Subject Teacher'}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {targetRole === 'mentor' && (
                  <View className="mb-4 p-4 bg-amber-50/50 border border-amber-100/50 rounded-2xl flex-row items-center">
                    <View className="w-8 h-8 bg-amber-100 rounded-full items-center justify-center mr-3">
                      <Icons.Info size={16} color="#d97706" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[11px] font-black text-amber-900 tracking-tight">Supervisor Assignment</Text>
                      <Text className="text-[9px] text-amber-700/70 font-black uppercase mt-0.5">Assigning a mentor replaces the existing section supervisor.</Text>
                    </View>
                  </View>
                )}

                <View className="flex-row justify-between items-center mb-2 px-1">
                    <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Specialization / Subject</Text>
                    <View className="bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100/50">
                        <Text className="text-[8px] font-black text-indigo-500 uppercase">Recommendation</Text>
                    </View>
                </View>
                <TextInput 
                  className={`bg-gray-50/50 ${PlatformRadius.secondary} px-5 py-4 border border-gray-100 text-gray-900 font-black`}
                  placeholder="e.g. Mathematics, Physics..."
                  placeholderTextColor="#cbd5e1"
                  value={subject}
                  onChangeText={setSubject}
                />
              </View>
            )}

            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Select from {assignType === 'STUDENT' ? 'Students' : 'Faculty'}</Text>
            
            <ScrollView 
              className="flex-1" 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {potentialUsers.length > 0 ? potentialUsers.map((user) => (
                <TouchableOpacity 
                  key={user.id}
                  onPress={() => setSelectedUser(user)}
                  activeOpacity={0.9}
                  className={`flex-row items-center p-4 ${PlatformRadius.secondary} mb-3 border active:scale-[0.98] transition-all ${selectedUser?.id === user.id ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-gray-50'}`}
                >
                  <View className={`w-11 h-11 ${PlatformRadius.secondary} items-center justify-center mr-4 border border-gray-100/50 ${assignType === 'STUDENT' ? 'bg-emerald-50' : 'bg-indigo-50'}`}>
                    <Text className={`font-black text-lg ${assignType === 'STUDENT' ? 'text-emerald-600' : 'text-indigo-600'}`}>{user.name?.charAt(0) || '?'}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className={`font-black text-[15px] tracking-tight ${selectedUser?.id === user.id ? 'text-indigo-900' : 'text-gray-900'}`} numberOfLines={1}>{user.name}</Text>
                    <View className="flex-row items-center mt-1">
                        <PlatformStatusBadge 
                            status={user.role.replace('_', ' ')} 
                            type={user.role === UserRole.STUDENT ? 'success' : 'info'}
                            size="small"
                        />
                        <Text className="text-[9px] text-gray-400 font-black uppercase tracking-wider ml-2">ID: {user.id.substring(0, 5).toUpperCase()}</Text>
                    </View>
                  </View>
                  {selectedUser?.id === user.id && (
                    <View className="bg-indigo-600 rounded-full w-6 h-6 items-center justify-center shadow-lg shadow-indigo-300">
                       <Icons.Check size={14} color="white" />
                    </View>
                  )}
                </TouchableOpacity>
              )) : (
                <View className="items-center py-10">
                  <Text className="text-gray-400 italic">No matches found</Text>
                </View>
              )}
            </ScrollView>

            <TouchableOpacity 
              onPress={handleAssign}
              disabled={!selectedUser}
              activeOpacity={0.8}
              className={`mt-6 py-5 ${PlatformRadius.secondary} items-center shadow-xl active:scale-[0.98] ${selectedUser ? 'bg-indigo-600 shadow-indigo-200' : 'bg-gray-200'}`}
            >
              <Text className="text-white font-black text-lg uppercase tracking-widest">Confirm Appointment</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};
