import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, TextInput } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { AppTheme, ModalShell, AppButton, AppTypography, AppCard, AppRow } from '../../../design-system';
import { PERMISSION_CATEGORIES } from '../constants';

interface ModifyPermissionsModalProps {
  visible: boolean;
  onClose: () => void;
  role: {
    id: string;
    name: string;
    permissions: string[];
    color: string;
    icon: string;
  } | null;
  onSave: (updatedPermissions: string[]) => void;
  showConfirm?: (title: string, message: string, onConfirm: () => void, type: 'DANGER' | 'INFO') => void;
  showToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const ModifyPermissionsModal: React.FC<ModifyPermissionsModalProps> = ({
  visible,
  onClose,
  role,
  onSave,
}) => {
  const [search, setSearch] = useState('');
  const [tempPermissions, setTempPermissions] = useState<string[]>([]);
  
  React.useEffect(() => {
    if (role) setTempPermissions(role.permissions);
  }, [role, visible]);

  if (!role) return null;

  const togglePermission = (perm: string) => {
    setTempPermissions(prev => prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]);
  };

  const applicableCategories = PERMISSION_CATEGORIES.filter(cat => !cat.applicableRoles || cat.applicableRoles.includes(role.id));

  return (
    <ModalShell
      visible={visible}
      onClose={onClose}
      title="Edit Permissions"
      subtitle={`Role: ${role.name}`}
      headerGradient={AppTheme.colors.gradients.brand}
    >
      {/* Search Utility */}
      <View className="mb-6">
        <View className="bg-white rounded-2xl border border-gray-100 flex-row items-center px-4 py-3 shadow-sm">
          <Icons.Search size={18} color="#6366f1" opacity={0.6} />
          <TextInput 
            className="flex-1 ml-3 text-sm font-black text-gray-900 p-0" 
            placeholder="Search permissions..." 
            placeholderTextColor="#9ca3af" 
            value={search} 
            onChangeText={setSearch} 
          />
        </View>
      </View>

      <View className="gap-6">
        {applicableCategories.map((category) => {
          const filtered = category.permissions.filter(p => p.toLowerCase().includes(search.toLowerCase()));
          if (filtered.length === 0) return null;
          return (
            <View key={category.title} className="mb-2">
              <View className="mb-4 flex-row items-center justify-between px-1">
                <View className="flex-row items-center">
                  <View className="w-1 h-4 bg-indigo-500 rounded-full mr-2" />
                  <Text className={`text-[10px] font-black uppercase tracking-[2px] font-inter-black ${category.isSensitive ? 'text-red-600' : 'text-gray-900'}`}>
                    {category.title}
                  </Text>
                </View>
                {category.isSensitive && (
                    <View className="bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100 flex-row items-center">
                        <Icons.Lock size={10} color="#f43f5e" />
                        <Text className="ml-1.5 text-[8px] font-black text-rose-600 uppercase tracking-widest">Sensitive</Text>
                    </View>
                )}
              </View>
              
              <AppCard className="p-0 overflow-hidden">
                {filtered.map((perm, index) => {
                  const isEnabled = tempPermissions.includes(perm);
                  return (
                    <TouchableOpacity 
                        key={perm} 
                        onPress={() => togglePermission(perm)} 
                        activeOpacity={0.7}
                        className={`flex-row justify-between items-center p-4 ${index < filtered.length - 1 ? 'border-b border-gray-50' : ''} ${isEnabled ? 'bg-indigo-50/10' : ''}`}
                    >
                      <View className="flex-1 flex-row items-center pr-3">
                        <View className={`w-1.5 h-1.5 rounded-full mr-3 ${isEnabled ? 'bg-indigo-600 shadow-sm shadow-indigo-200' : 'bg-gray-200'}`} />
                        <Text className={`text-[12.5px] font-black tracking-tight ${isEnabled ? 'text-gray-900' : 'text-gray-400'}`}>{perm}</Text>
                      </View>
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
              </AppCard>
            </View>
          );
        })}
      </View>

      <View className="mt-10 flex-row gap-4">
        <AppButton 
          label="Cancel"
          variant="outline"
          onPress={onClose}
          className="flex-1"
        />
        <AppButton 
          label="Save Changes"
          onPress={() => onSave(tempPermissions)}
          className="flex-[2]"
        />
      </View>
    </ModalShell>
  );
};
