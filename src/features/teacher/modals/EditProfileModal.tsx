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
  status?: string | null;
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
  loading,
  status
}) => {
  const canSave = name.trim().length > 0;

  return (
    <ModalShell
      visible={visible}
      onClose={onClose}
      title="Update Identity"
      subtitle="Modify your profile settings"
      headerGradient={AppTheme.colors.gradients.brand}
    >
      <View className="gap-6">
        {error ? (
          <Text className="text-red-500 text-sm mt-2 font-bold text-center">{error}</Text>
        ) : null}
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

        <AppButton
          label={loading ? (status || "Saving...") : "Save Identity Updates"}
          onPress={onSave}
          disabled={!canSave || loading}
          className="py-5 mt-4 mb-6"
        />
      </View>
    </ModalShell>
  );
};
