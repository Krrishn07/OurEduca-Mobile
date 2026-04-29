import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { AppTheme, ModalShell, AppButton, AppTypography } from '../../../design-system';

interface AddStudentModalProps {
  visible: boolean;
  onClose: () => void;
  studentForm: { name: string; email: string; roll: string; phone: string; grade: string };
  setStudentForm: (form: { name: string; email: string; roll: string; phone: string; grade: string }) => void;
  onAdd: () => void;
  isEditing?: boolean;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  visible,
  onClose,
  studentForm,
  setStudentForm,
  onAdd,
  isEditing = false,
}) => {
  return (
    <ModalShell
      visible={visible}
      onClose={onClose}
      title={isEditing ? 'Update Student' : 'New Admission'}
      subtitle="Register a new academic profile"
      headerGradient={AppTheme.colors.gradients.brand}
    >
      <View className="gap-6">
        <View>
          <Text className={`${AppTypography.eyebrow} text-gray-400 mb-2 ml-1`}>Student Name</Text>
          <TextInput 
            className="border border-gray-100 bg-white rounded-2xl p-4 text-sm font-black text-gray-900 h-14" 
            placeholder="John Doe" 
            value={studentForm.name} 
            onChangeText={t => setStudentForm({ ...studentForm, name: t })} 
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View>
          <Text className={`${AppTypography.eyebrow} text-gray-400 mb-2 ml-1`}>Email (Optional)</Text>
          <TextInput 
            className="border border-gray-100 bg-white rounded-2xl p-4 text-sm font-black text-gray-900 h-14" 
            placeholder="john@student.com" 
            value={studentForm.email} 
            onChangeText={t => setStudentForm({ ...studentForm, email: t })} 
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View className="flex-row gap-4">
          <View className="flex-1">
            <Text className={`${AppTypography.eyebrow} text-gray-400 mb-2 ml-1`}>Roll Number</Text>
            <TextInput 
              className="border border-gray-100 bg-white rounded-2xl p-4 text-sm font-black text-gray-900 h-14" 
              placeholder="101" 
              value={studentForm.roll} 
              onChangeText={t => setStudentForm({ ...studentForm, roll: t })} 
              placeholderTextColor="#9ca3af"
            />
          </View>
          <View className="flex-1">
            <Text className={`${AppTypography.eyebrow} text-gray-400 mb-2 ml-1`}>Grade Level</Text>
            <TextInput 
              className="border border-gray-100 bg-white rounded-2xl p-4 text-sm font-black text-gray-900 h-14" 
              placeholder="X" 
              value={studentForm.grade} 
              onChangeText={t => setStudentForm({ ...studentForm, grade: t })} 
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        <View className="mb-4">
          <Text className={`${AppTypography.eyebrow} text-gray-400 mb-2 ml-1`}>Emergency Phone</Text>
          <TextInput 
            className="border border-gray-100 bg-white rounded-2xl p-4 text-sm font-black text-gray-900 h-14" 
            placeholder="+1 234..." 
            value={studentForm.phone} 
            onChangeText={t => setStudentForm({ ...studentForm, phone: t })} 
            keyboardType="phone-pad"
            placeholderTextColor="#9ca3af"
          />
        </View>
        
        <View className="flex-row gap-4 mt-2">
          <AppButton 
            label="Cancel"
            variant="outline"
            onPress={onClose}
            className="flex-1"
          />
          <AppButton 
            label={isEditing ? 'Update Profile' : 'Add Student'}
            onPress={onAdd}
            className="flex-[2]"
          />
        </View>
      </View>
    </ModalShell>
  );
};
