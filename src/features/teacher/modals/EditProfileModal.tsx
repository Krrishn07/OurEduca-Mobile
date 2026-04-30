import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { AppTheme, ModalShell, AppButton, AppTypography } from '../../../design-system';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  name: string;
  setName: (text: string) => void;
  phone: string;
  setPhone: (text: string) => void;
  office: string;
  setOffice: (text: string) => void;
  error?: string | null;
  loading?: boolean;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onClose,
  onSave,
  name,
  setName,
  phone,
  setPhone,
  office,
  setOffice,
  error,
  loading
}) => {
  return (
    <ModalShell
      visible={visible}
      onClose={onClose}
      title="Update Identity"
      subtitle="Modify your profile settings"
      headerGradient={AppTheme.colors.gradients.brand}
    >
      <View className="gap-6">
        {error && (
          <View className="bg-rose-50 p-4 rounded-2xl border border-rose-100 mb-2">
            <Text className="text-rose-600 text-[11px] font-black uppercase tracking-wider font-inter-black">{error}</Text>
          </View>
        )}
        <View>
          <Text className={`${AppTypography.eyebrow} text-gray-400 mb-2 ml-1`}>Display Name</Text>
          <TextInput 
            placeholder="e.g. Dr. Sarah Wilson" 
            placeholderTextColor="#9ca3af"
            value={name}
            onChangeText={setName}
            className="w-full border border-gray-100 bg-white rounded-2xl p-4 text-sm font-black text-gray-900 h-14 shadow-sm"
          />
        </View>

        <View>
          <Text className={`${AppTypography.eyebrow} text-gray-400 mb-2 ml-1`}>Contact Number</Text>
          <TextInput 
            placeholder="e.g. +91 98765 43210" 
            placeholderTextColor="#9ca3af"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            className="w-full border border-gray-100 bg-white rounded-2xl p-4 text-sm font-black text-gray-900 h-14 shadow-sm"
          />
        </View>

        <View>
          <Text className={`${AppTypography.eyebrow} text-gray-400 mb-2 ml-1`}>Office Designation</Text>
          <TextInput 
            placeholder="e.g. Room 402, Admin Block" 
            placeholderTextColor="#9ca3af"
            value={office}
            onChangeText={setOffice}
            className="w-full border border-gray-100 bg-white rounded-2xl p-4 text-sm font-black text-gray-900 h-14 shadow-sm"
          />
        </View>

        <TouchableOpacity 
          onPress={onSave}
          disabled={loading || !name.trim()}
          activeOpacity={0.9}
          className={`py-5 rounded-[20px] flex-row items-center justify-center shadow-xl mt-4 mb-6 ${
            loading || !name.trim() 
              ? 'bg-gray-100 border border-gray-200' 
              : 'bg-[#7c3aed] border border-[#6d28d9] shadow-purple-200'
          }`}
        >
          <Text className={`font-black text-[14px] uppercase tracking-[2px] font-inter-black ${
            loading || !name.trim() ? 'text-gray-400' : 'text-white'
          }`}>
              {loading ? 'Synchronizing Updates...' : 'Save Identity Updates'}
          </Text>
        </TouchableOpacity>
      </View>
    </ModalShell>
  );
};
