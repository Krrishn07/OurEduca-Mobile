import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { AppTheme, ModalShell, AppButton, AppTypography, AppCard } from '../../../design-system';
import { AVAILABLE_COLORS, AVAILABLE_ICONS } from '../constants';

interface EditRoleModalProps {
  visible: boolean;
  onClose: () => void;
  role: {
    id: string;
    name: string;
    description: string;
    color: string;
    icon: string;
  } | null;
  onSave: (updatedData: { name: string, description: string, color: string, icon: string }) => void;
}

export const EditRoleModal: React.FC<EditRoleModalProps> = ({
  visible,
  onClose,
  role,
  onSave
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState('#4f46e5');
  const [selectedIcon, setSelectedIcon] = useState('Shield');

  useEffect(() => {
    if (role && visible) {
      setName(role.name);
      setDescription(role.description || '');
      setSelectedColor(role.color);
      setSelectedIcon(role.icon);
    }
  }, [role, visible]);

  if (!role) return null;

  return (
    <ModalShell
      visible={visible}
      onClose={onClose}
      title="Role Settings"
      subtitle={`Configure: ${role.name}`}
      headerGradient={AppTheme.colors.gradients.brand}
    >
      {/* Role Appearance */}
      <View className="flex-row items-center mb-3 px-2">
        <View className="w-1 h-4 bg-indigo-500 rounded-full mr-2" />
        <Text className="text-[10px] font-black text-gray-900 uppercase tracking-[2px] font-inter-black">Role Style</Text>
      </View>

      <AppCard className="p-6 mb-6">
        
        <View className="flex-row gap-6">
          <View className="flex-1">
            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Color</Text>
            <View className="flex-row flex-wrap gap-2.5">
              {AVAILABLE_COLORS.slice(0, 10).map(color => (
                <TouchableOpacity 
                  key={color} 
                  onPress={() => setSelectedColor(color)} 
                  className={`w-7 h-7 rounded-full border-2 ${selectedColor === color ? 'border-indigo-600 scale-110' : 'border-transparent'}`} 
                  style={{ backgroundColor: color }} 
                />
              ))}
            </View>
          </View>

          <View className="w-[1px] bg-gray-100" />

          <View className="flex-1">
            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Icon</Text>
            <View className="flex-row flex-wrap gap-2.5">
              {AVAILABLE_ICONS.slice(0, 10).map(iconConfig => {
                const IconComp = (Icons as any)[iconConfig.name] || Icons.Shield;
                const isSelected = selectedIcon === iconConfig.name;
                return (
                  <TouchableOpacity 
                    key={iconConfig.name} 
                    onPress={() => setSelectedIcon(iconConfig.name)} 
                    className={`w-7 h-7 rounded-lg items-center justify-center ${isSelected ? 'bg-indigo-600 shadow-md' : 'bg-gray-50'}`}
                  >
                    <IconComp size={12} color={isSelected ? 'white' : '#6366f1'} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </AppCard>

      {/* Basic Info */}
      <View className="gap-4 mb-10">
        <View className="flex-row items-center mb-2 px-1">
          <View className="w-1 h-4 bg-indigo-500 rounded-full mr-2" />
          <Text className="text-[10px] font-black text-gray-900 uppercase tracking-[2px] font-inter-black">Identity Details</Text>
        </View>
        <TextInput 
          className="bg-white rounded-2xl p-4 text-sm font-black text-gray-900 border border-gray-100 h-14" 
          placeholder="Role Name" 
          value={name} 
          onChangeText={setName} 
          placeholderTextColor="#9ca3af" 
        />
        <TextInput 
          className="bg-white rounded-2xl p-4 text-sm font-black text-gray-600 border border-gray-100 h-24" 
          placeholder="Role description..." 
          multiline 
          value={description} 
          onChangeText={setDescription} 
          textAlignVertical="top" 
          placeholderTextColor="#9ca3af" 
        />
      </View>

      <View className="flex-row gap-4">
        <AppButton 
          label="Cancel"
          onPress={onClose}
          variant="outline"
          className="flex-1"
        />
        <AppButton 
          label="Update Role"
          onPress={() => onSave({ name, description, color: selectedColor, icon: selectedIcon })}
          className="flex-[2]"
        />
      </View>
    </ModalShell>
  );
};
