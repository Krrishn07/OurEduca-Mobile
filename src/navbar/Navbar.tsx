import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Icons } from '@components/common/Icons';
import { UserRole } from '@/types';

interface NavbarProps {
  isPlatformAdmin: boolean;
  platformName: string;
  currentSchool?: any;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onLogout: () => void;
  setShowHelp: (show: boolean) => void;
  role: UserRole;
  hasPermission: (id: string, role: UserRole) => boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  isPlatformAdmin,
  platformName,
  currentSchool,
  activeTab,
  onTabChange,
  onLogout,
  setShowHelp,
  role,
  hasPermission
}) => {
  return (
    <View className="bg-white border-b border-gray-100 h-16 flex-row items-center justify-between px-5 shadow-sm z-10 shrink-0">
      <View className="flex-row items-center">
        <View className="w-10 h-10 rounded-2xl overflow-hidden border border-gray-100 items-center justify-center bg-white mr-3 shadow-sm shadow-indigo-100/30">
          {isPlatformAdmin ? (
            <View className="w-full h-full items-center justify-center bg-indigo-50">
              <Icons.Classes size={18} color="#4f46e5" />
            </View>
          ) : currentSchool?.logo_url ? (
            <Image source={{ uri: currentSchool.logo_url }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <View className="w-full h-full items-center justify-center bg-gray-50">
              <Icons.School size={16} color="#94a3b8" />
            </View>
          )}
        </View>

        <View className="justify-center">
          <Text className="text-[15px] font-black text-gray-900 leading-tight tracking-tighter font-inter-black">
            {isPlatformAdmin ? platformName : (currentSchool?.name || 'School Portal')}
          </Text>
          <Text className="text-[8px] text-gray-400 font-black uppercase tracking-[2px] mt-0.5 font-inter-black">
            {isPlatformAdmin ? 'Platform Authority' : 'Institutional Portal'}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center">
        <View className="flex-row items-center space-x-1.5">
          {hasPermission('Messaging', role) && (
            <TouchableOpacity
              onPress={() => onTabChange('messages')}
              className={`w-9 h-9 items-center justify-center rounded-xl ${activeTab === 'messages' ? 'bg-indigo-50 border border-indigo-100' : ''}`}
            >
              <Icons.Messages size={18} color={activeTab === 'messages' ? '#4f46e5' : '#94a3b8'} />
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={() => setShowHelp(true)} className="w-9 h-9 items-center justify-center rounded-xl active:bg-gray-50">
            <Icons.Phone size={18} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity onPress={onLogout} className="w-9 h-9 items-center justify-center bg-gray-50 rounded-xl border border-gray-100 active:bg-red-50">
            <Icons.Logout size={18} color="#f43f5e" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
