import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { AppTheme, ModalShell, AppButton, AppTypography } from '@components/common';

interface AddClassModalProps {
  visible: boolean;
  onClose: () => void;
  newClassName: string;
  setNewClassName: (name: string) => void;
  sections: string;
  setSections: (sections: string) => void;
  subject?: string;
  setSubject?: (subject: string) => void;
  roomNo?: string;
  setRoomNo?: (roomNo: string) => void;
  classTime?: string;
  setClassTime?: (classTime: string) => void;
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
  subject = '',
  setSubject,
  roomNo = '',
  setRoomNo,
  classTime = '',
  setClassTime,
  onAdd,
  isEditing = false,
}) => {
  return (
    <ModalShell
      visible={visible}
      onClose={onClose}
      title={isEditing ? 'Edit Class' : 'New Class'}
      subtitle={isEditing ? 'Modify existing configuration' : 'Configure an academic group with schedule'}
      headerGradient={AppTheme.colors.gradients.brand}
    >
      <View className="gap-5">
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

        <View>
          <Text className={`${AppTypography.eyebrow} text-gray-400 mb-2 ml-1`}>Sections</Text>
          <TextInput 
            className="border border-gray-100 bg-white rounded-2xl p-4 text-sm font-black text-gray-900 h-14" 
            placeholder="e.g. A, B, C" 
            value={sections} 
            onChangeText={setSections} 
            placeholderTextColor="#9ca3af"
          />
          <Text className="text-[10px] text-gray-400 mt-1.5 px-1 font-medium">Comma-separated. Example: A, B, C</Text>
        </View>

        <View>
          <Text className={`${AppTypography.eyebrow} text-gray-400 mb-2 ml-1`}>Subject</Text>
          <TextInput 
            className="border border-gray-100 bg-white rounded-2xl p-4 text-sm font-black text-gray-900 h-14" 
            placeholder="e.g. Mathematics" 
            value={subject} 
            onChangeText={setSubject} 
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View className="flex-row gap-4">
          <View className="flex-1">
            <Text className={`${AppTypography.eyebrow} text-gray-400 mb-2 ml-1`}>Room No.</Text>
            <TextInput 
              className="border border-gray-100 bg-white rounded-2xl p-4 text-sm font-black text-gray-900 h-14" 
              placeholder="e.g. 302" 
              value={roomNo} 
              onChangeText={setRoomNo} 
              placeholderTextColor="#9ca3af"
            />
          </View>
          <View className="flex-1">
            <Text className={`${AppTypography.eyebrow} text-gray-400 mb-2 ml-1`}>Class Time</Text>
            <TextInput 
              className="border border-gray-100 bg-white rounded-2xl p-4 text-sm font-black text-gray-900 h-14" 
              placeholder="e.g. 10:00 AM" 
              value={classTime} 
              onChangeText={setClassTime} 
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>
        <Text className="text-[10px] text-gray-400 -mt-3 px-1 font-medium">This time powers the Teacher's Daily Timeline</Text>

        <View className="flex-row gap-4 mt-2">
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
