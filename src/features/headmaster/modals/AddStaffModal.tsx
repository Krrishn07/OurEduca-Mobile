import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { AppTheme, ModalShell, AppButton, AppTypography } from '../../../design-system';

interface AddStaffModalProps {
  visible: boolean;
  onClose: () => void;
  userForm: { name: string; email: string; subject: string; phone: string; office: string };
  setUserForm: (form: { name: string; email: string; subject: string; phone: string; office: string }) => void;
  userModalType: 'TEACHER' | 'MENTOR';
  setUserModalType: (type: 'TEACHER' | 'MENTOR') => void;
  onSave: () => void;
  isEditing?: boolean;
}

export const AddStaffModal: React.FC<AddStaffModalProps> = ({
  visible,
  onClose,
  userForm,
  setUserForm,
  onSave,
  isEditing = false,
}) => {
  return (
    <ModalShell
      visible={visible}
      onClose={onClose}
      title={isEditing ? 'Edit Faculty' : 'Add Staff'}
      subtitle="Define institutional role & contact"
      headerGradient={AppTheme.colors.gradients.brand}
    >
      <View className="gap-6">
        <View>
          <Text className={`${AppTypography.eyebrow} text-gray-400 mb-2 ml-1`}>Full Name</Text>
          <TextInput 
            className="border border-gray-100 bg-white rounded-2xl p-4 text-sm font-black text-gray-900 h-14" 
            placeholder="Mr. John Smith" 
            value={userForm.name} 
            onChangeText={t => setUserForm({...userForm, name: t})} 
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View>
          <Text className={`${AppTypography.eyebrow} text-gray-400 mb-2 ml-1`}>Email Address</Text>
          <TextInput 
            className="border border-gray-100 bg-white rounded-2xl p-4 text-sm font-black text-gray-900 h-14" 
            placeholder="john@school.com" 
            autoCapitalize="none"
            value={userForm.email} 
            onChangeText={t => setUserForm({...userForm, email: t})} 
            keyboardType="email-address"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View className="flex-row gap-4">
          <View className="flex-1">
            <Text className={`${AppTypography.eyebrow} text-gray-400 mb-2 ml-1`}>Phone</Text>
            <TextInput 
              className="border border-gray-100 bg-white rounded-2xl p-4 text-sm font-black text-gray-900 h-14" 
              placeholder="+1 234..." 
              value={userForm.phone} 
              onChangeText={t => setUserForm({...userForm, phone: t})} 
              keyboardType="phone-pad"
              placeholderTextColor="#9ca3af"
            />
          </View>
          <View className="flex-1">
            <Text className={`${AppTypography.eyebrow} text-gray-400 mb-2 ml-1`}>Office</Text>
            <TextInput 
              className="border border-gray-100 bg-white rounded-2xl p-4 text-sm font-black text-gray-900 h-14" 
              placeholder="Room 204" 
              value={userForm.office} 
              onChangeText={t => setUserForm({...userForm, office: t})} 
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        <View className="mb-4">
            <Text className={`${AppTypography.eyebrow} text-indigo-500 mb-2 ml-1`}>Institutional Role</Text>
            <View className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 flex-row items-center">
                <Icons.Profile size={20} color="#4f46e5" />
                <View className="ml-3 flex-1">
                    <Text className="text-[13px] font-black text-indigo-900">Faculty Staff (Teacher)</Text>
                    <Text className="text-[10px] text-indigo-600 mt-0.5 font-black uppercase tracking-widest">Active Node</Text>
                </View>
            </View>
        </View>

        <View className="flex-row gap-4 mt-2">
            <AppButton 
                label="Cancel"
                variant="outline"
                onPress={onClose}
                className="flex-1"
            />
            <AppButton 
                label={isEditing ? 'Update Profile' : 'Save Staff'}
                onPress={onSave}
                className="flex-[2]"
            />
        </View>
      </View>
    </ModalShell>
  );
};
