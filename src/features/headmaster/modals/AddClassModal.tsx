import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { AppTheme, ModalShell, AppButton, AppTypography } from '../../../design-system';

interface AddClassModalProps {
  visible: boolean;
  onClose: () => void;
  newClassName: string;
  setNewClassName: (name: string) => void;
  sections: string;
  setSections: (sections: string) => void;
  onAdd: () => void;
  isEditing?: boolean;
}

export const AddClassModal: React.FC<AddClassModalProps> = ({
  visible,
  onClose,
  newClassName,
  setNewClassName,
  sections,
  setSections,
  onAdd,
  isEditing = false,
}) => {
  return (
    <ModalShell
      visible={visible}
      onClose={onClose}
      title={isEditing ? 'Edit Class' : 'New Class'}
      subtitle={isEditing ? 'Modify existing configuration' : 'Create a new academic group'}
      headerGradient={AppTheme.colors.gradients.brand}
    >
      <View className="gap-6">
        <View>
          <Text className={`${AppTypography.eyebrow} text-gray-400 mb-2 ml-1`}>Class Name</Text>
          <TextInput 
            className="border border-gray-100 bg-white rounded-2xl p-4 text-sm font-black text-gray-900 h-14" 
            placeholder="e.g. Grade 10" 
            value={newClassName} 
            onChangeText={setNewClassName} 
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View className="mb-4">
          <Text className={`${AppTypography.eyebrow} text-gray-400 mb-2 ml-1`}>Sections</Text>
          <TextInput 
            className="border border-gray-100 bg-white rounded-2xl p-4 text-sm font-black text-gray-900 h-14" 
            placeholder="e.g. A, B, C" 
            value={sections} 
            onChangeText={setSections} 
            placeholderTextColor="#9ca3af"
          />
          <Text className="text-[10px] text-gray-400 mt-2 px-1 font-medium">Example: A, B, C or Alpha, Beta</Text>
        </View>

        <View className="flex-row gap-4 mt-4">
          <AppButton 
            label="Cancel"
            onPress={onClose}
            variant="outline"
            className="flex-1"
          />
          <AppButton 
            label={isEditing ? 'Save Changes' : 'Create Class'}
            onPress={onAdd}
            className="flex-[2]"
          />
        </View>
      </View>
    </ModalShell>
  );
};
