import React from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { Icons } from '@components/common/Icons';
import { UserRole } from '@/types';

interface NavItem {
  id: string;
  label: string;
  icon: any;
}

interface SidebarProps {
  navItems: NavItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  role: UserRole;
  hasPermission: (id: string, role: UserRole) => boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  navItems,
  activeTab,
  onTabChange,
  role,
  hasPermission
}) => {
  return (
    <View className="hidden md:flex flex-col w-72 bg-white border-r border-gray-200">
      <ScrollView className="flex-1 py-5 px-4">
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => onTabChange(item.id)}
            className={`w-full flex-row items-center px-4 py-3.5 mb-2 rounded-[20px] border ${
              activeTab === item.id 
                ? 'bg-indigo-50 border-indigo-100 shadow-sm shadow-indigo-100/40' 
                : 'border-transparent'
            }`}
          >
            <View 
              className={`w-10 h-10 rounded-2xl items-center justify-center mr-3 ${
                activeTab === item.id 
                  ? 'bg-white border border-indigo-100' 
                  : 'bg-slate-50 border border-gray-100'
              }`}
            >
              <item.icon size={18} color={activeTab === item.id ? '#4f46e5' : '#4b5563'} />
            </View>
            <View className="flex-1 flex-row items-center justify-between">
              <Text 
                className={`text-sm font-black tracking-tight font-inter-black ${
                  activeTab === item.id ? 'text-indigo-700' : 'text-gray-700'
                }`}
              >
                {item.label}
              </Text>
              {!hasPermission(item.id, role) ? (
                <Icons.Lock size={12} color="#9ca3af" />
              ) : null}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};
