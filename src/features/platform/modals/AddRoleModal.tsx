import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Switch } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { AppTheme, ModalShell, AppButton, AppTypography, AppCard } from '../../../design-system';
import { MASTER_PERMISSIONS, AVAILABLE_COLORS, AVAILABLE_ICONS } from '../constants';

interface AddRoleModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (newRole: {
    name: string;
    description: string;
    color: string;
    icon: string;
    permissions: string[];
  }) => void;
}

export const AddRoleModal: React.FC<AddRoleModalProps> = ({
  visible,
  onClose,
  onSave
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVAILABLE_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(AVAILABLE_ICONS[0].name);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [permissionSearch, setPermissionSearch] = useState('');

  const togglePermission = (perm: string) => {
    setSelectedPermissions(prev => prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]);
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    onSave({ name, description, color: selectedColor, icon: selectedIcon, permissions: selectedPermissions });
    setName(''); setDescription(''); setSelectedColor(AVAILABLE_COLORS[0]); setSelectedIcon(AVAILABLE_ICONS[0].name); setSelectedPermissions([]);
    onClose();
  };

  const filteredPermissions = MASTER_PERMISSIONS.filter(p => p.toLowerCase().includes(permissionSearch.toLowerCase()));

  return (
    <ModalShell
      visible={visible}
      onClose={onClose}
      title="Create New Role"
      subtitle="Define Permissions & Access"
      headerGradient={AppTheme.colors.gradients.brand}
    >
      {/* Role Appearance */}
      <AppCard className="p-6 mb-6">
        <View className="flex-row items-center mb-6">
          <View className="w-1 h-4 bg-indigo-500 rounded-full mr-2" />
          <Text className="text-[10px] font-black text-gray-900 uppercase tracking-[2px] font-inter-black">Role Style</Text>
        </View>
        
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
      <View className="gap-4 mb-6">
        <TextInput 
          className="bg-white rounded-2xl p-4 text-sm font-black text-gray-900 border border-gray-100 h-14" 
          placeholder="Role Name (e.g. Registrar)" 
          value={name} 
          onChangeText={setName} 
          placeholderTextColor="#9ca3af" 
        />
        <TextInput 
          className="bg-white rounded-2xl p-4 text-sm font-black text-gray-600 border border-gray-100 h-24" 
          placeholder="Describe this role's responsibility..." 
          multiline 
          value={description} 
          onChangeText={setDescription} 
          textAlignVertical="top" 
          placeholderTextColor="#9ca3af" 
        />
      </View>

      {/* Permissions Selector */}
      <View className="mb-10">
        <View className="flex-row justify-between items-center mb-3 px-2">
          <View className="flex-row items-center">
            <View className="w-1 h-4 bg-indigo-500 rounded-full mr-2" />
            <Text className="text-[10px] font-black text-gray-900 uppercase tracking-[2px] font-inter-black">Permissions</Text>
          </View>
          <View className="bg-indigo-50 px-2.5 py-1 rounded-full">
            <Text className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">{selectedPermissions.length} Active</Text>
          </View>
        </View>

        <AppCard className="p-0 overflow-hidden">
          <View className="px-5 py-4 border-b border-gray-50">
            <View className="bg-gray-50/50 rounded-2xl flex-row items-center px-4 py-3 border border-gray-100">
              <Icons.Search size={18} color="#6366f1" opacity={0.6} />
              <TextInput 
                className="flex-1 ml-3 text-sm font-black text-gray-900 p-0" 
                placeholder="Search permissions..." 
                value={permissionSearch} 
                onChangeText={setPermissionSearch} 
                placeholderTextColor="#9ca3af" 
              />
            </View>
          </View>

          <View className="divide-y divide-gray-50">
            {filteredPermissions.slice(0, 10).map(perm => {
              const isEnabled = selectedPermissions.includes(perm);
              return (
                <TouchableOpacity 
                  key={perm} 
                  onPress={() => togglePermission(perm)} 
                  activeOpacity={0.7}
                  className={`flex-row justify-between items-center p-4 ${isEnabled ? 'bg-indigo-50/10' : ''}`}
                >
                  <Text className={`text-[12.5px] font-black tracking-tight ${isEnabled ? 'text-gray-900' : 'text-gray-400'}`}>{perm}</Text>
                  <Switch 
                    trackColor={{ false: '#f1f5f9', true: '#4f46e5' }} 
                    thumbColor="#ffffff" 
                    onValueChange={() => togglePermission(perm)} 
                    value={isEnabled} 
                    style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] }} 
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </AppCard>
      </View>

      <AppButton 
        label="Create Role"
        onPress={handleCreate}
        disabled={!name.trim()}
        className="py-5"
      />
    </ModalShell>
  );
};
