import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { User, UserRole } from '../../../../types';
import { AppTheme, ModalShell, AppButton, AppTypography, AppCard, AppRow } from '../../../design-system';

interface ViewRoleUsersModalProps {
  visible: boolean;
  onClose: () => void;
  roleName: string;
  roleColor: string;
  users: User[];
  institutes?: any[];
  onJumpToInstitute?: (schoolId: string) => void;
}

export const ViewRoleUsersModal: React.FC<ViewRoleUsersModalProps> = ({
  visible,
  onClose,
  roleName,
  roleColor,
  users,
  institutes = [],
  onJumpToInstitute,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const getInitials = (name: string) => {
    if (!name || name.trim().length === 0) return '??';
    return name.trim().split(/\s+/).map(n => n[0]).filter(Boolean).join('').toUpperCase().slice(0, 2);
  };

  const roleMapping: Record<string, UserRole> = {
    'Platform Admin': UserRole.PLATFORM_ADMIN,
    'Headmaster': UserRole.SUPER_ADMIN,
    'Teacher': UserRole.TEACHER,
    'Mentor': UserRole.ADMIN_TEACHER,
    'Student': UserRole.STUDENT,
    'Parent': UserRole.PARENT,
  };

  const targetRole = roleMapping[roleName];
  const filteredUsers = (users || []).filter(user => 
    user.role === targetRole && 
    (user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     user.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getInstituteName = (user: User) => {
      const id = user.schoolId || user.instituteId;
      if (!id) return 'System Administrator';
      const inst = institutes.find(i => i.id === id);
      return inst?.name || `School ID: ${id.substring(0, 5).toUpperCase()}`;
  };

  const maskInfo = (text?: string) => {
      if (!text) return 'Not Provided';
      if (!text.includes('@')) return text;
      const [name, domain] = text.split('@');
      return `${name.substring(0, 2)}***@${domain}`;
  };

  const InfoChip = ({ label, value, icon: Icon }: any) => (
    <View className="bg-white p-4 rounded-2xl border border-gray-50 shadow-sm flex-1">
        <View className="flex-row items-center mb-2">
            <View className="w-6 h-6 rounded-lg bg-indigo-50 items-center justify-center mr-2">
                <Icon size={12} color="#4f46e5" />
            </View>
            <Text className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{label}</Text>
        </View>
        <Text className="text-[13px] font-black text-gray-900 tracking-tight" numberOfLines={1}>{value}</Text>
    </View>
  );

  return (
    <ModalShell
      visible={visible}
      onClose={selectedUser ? () => setSelectedUser(null) : onClose}
      title={selectedUser ? 'User Profile' : roleName}
      subtitle={selectedUser ? 'Account Details' : `Total Users: ${filteredUsers.length}`}
      headerGradient={AppTheme.colors.gradients.brand}
    >
      {!selectedUser ? (
        <View>
          <View className="mb-6">
            <View className="bg-white rounded-2xl border border-gray-100 flex-row items-center px-4 py-3 shadow-sm">
                <Icons.Search size={18} color="#6366f1" opacity={0.6} />
                <TextInput 
                    className="flex-1 ml-3 text-sm font-black text-gray-900 p-0" 
                    placeholder={`Search ${roleName}s...`} 
                    placeholderTextColor="#9ca3af" 
                    value={searchQuery} 
                    onChangeText={setSearchQuery} 
                />
            </View>
          </View>

          <AppCard className="p-0 overflow-hidden">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <AppRow 
                      key={user.id} 
                      title={user.name}
                      subtitle={getInstituteName(user)}
                      avatarLetter={getInitials(user.name)}
                      avatarBg="#eef2ff"
                      avatarColor="#4f46e5"
                      showBorder={index < filteredUsers.length - 1}
                      onPress={() => setSelectedUser(user)} 
                      rightElement={<Icons.ChevronRight size={14} color="#cbd5e1" />}
                  />
                ))
              ) : (
                <View className="py-20 items-center">
                    <Icons.Search size={40} color="#d1d5db" />
                    <Text className="text-gray-900 font-black text-lg tracking-tighter mt-4">No results found</Text>
                </View>
              )}
          </AppCard>
        </View>
      ) : (
        <View>
            <View className="items-center mb-10">
                <View className="p-2 rounded-[40px] bg-white shadow-xl">
                    <View 
                      className="w-24 h-24 rounded-[32px] items-center justify-center border-4 border-white" 
                      style={{ backgroundColor: roleColor || '#4f46e5' }}
                    >
                        <Text className="text-white font-black text-2xl tracking-tighter">{getInitials(selectedUser.name)}</Text>
                    </View>
                </View>
                <Text className="text-2xl font-black text-gray-900 tracking-tighter mb-2 mt-6 text-center leading-tight">
                  {selectedUser.name}
                </Text>
                <View className="bg-indigo-600 px-5 py-1.5 rounded-full">
                    <Text className="text-white text-[9px] font-black uppercase tracking-widest">{roleName}</Text>
                </View>
            </View>

            <View className="mb-6">
                <View className="flex-row items-center mb-4 px-1">
                    <View className="w-1 h-4 bg-indigo-500 rounded-full mr-2" />
                    <Text className="text-[10px] font-black text-gray-900 uppercase tracking-[2px] font-inter-black">Account Profile</Text>
                </View>
                
                <View className="flex-row flex-wrap justify-between">
                    <View style={{ width: '48.2%' }} className="mb-3.5">
                        <InfoChip label="Organization" value={getInstituteName(selectedUser)} icon={Icons.School} />
                    </View>
                    <View style={{ width: '48.2%' }} className="mb-3.5">
                        <InfoChip label="User ID" value={`#${selectedUser.id.substring(0, 5).toUpperCase()}`} icon={Icons.Shield} />
                    </View>
                    <View style={{ width: '48.2%' }} className="mb-3.5">
                        <InfoChip label="Email Address" value={maskInfo(selectedUser.email)} icon={Icons.Mail} />
                    </View>
                    <View style={{ width: '48.2%' }} className="mb-3.5">
                        <InfoChip label="Status" value={selectedUser.status || 'Verified'} icon={Icons.Check} />
                    </View>
                </View>
            </View>

            <View className="gap-4 mt-6">
                {(selectedUser.schoolId || selectedUser.instituteId) && onJumpToInstitute && (
                    <AppButton 
                        label="Manage Institution"
                        onPress={() => onJumpToInstitute(selectedUser.schoolId || selectedUser.instituteId || '')} 
                        variant="primary"
                    />
                )}
                <AppButton 
                    label="Back to List"
                    onPress={() => setSelectedUser(null)} 
                    variant="outline"
                />
            </View>
        </View>
      )}
    </ModalShell>
  );
};
