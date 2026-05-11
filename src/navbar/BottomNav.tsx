import React from 'react';
import { View, Pressable, Text, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Icons } from '@components/common/Icons';
import { UserRole } from '@/types';

interface NavItem {
  id: string;
  label: string;
  icon: any;
}

interface BottomNavProps {
  navItems: NavItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  role: UserRole;
  hasPermission: (id: string, role: UserRole) => boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({ 
  navItems, 
  activeTab, 
  onTabChange, 
  role,
  hasPermission
}) => {
  return (
    <View className="md:hidden h-16 z-20 relative" style={{ paddingBottom: Platform.OS === 'ios' ? 10 : 0 }}>
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.03)', 'rgba(0,0,0,0.05)']}
        className="absolute -top-4 left-0 right-0 h-4"
      />
      <View className="absolute inset-0 bg-white/80" />
      <BlurView intensity={80} tint="light" className="absolute inset-0 border-t border-white/20" />
      <View className="flex-1 flex-row justify-around items-center px-4">
        {navItems.filter((item) => !(role === UserRole.SUPER_ADMIN && item.id === 'messages')).map((item) => (
          <Pressable 
            key={item.id} 
            onPress={() => onTabChange(item.id)} 
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.96 : 1 }],
              opacity: pressed ? 0.8 : 1
            })}
            className="flex-1 items-center justify-center h-full"
          >
            <View className="relative">
              <item.icon size={24} color={activeTab === item.id ? '#4f46e5' : '#9ca3af'} />
              {!hasPermission(item.id, role) ? (
                <View className="absolute -top-1 -right-1 bg-white rounded-full">
                  <Icons.Lock size={10} color="#6b7280" />
                </View>
              ) : null}
            </View>
            <Text 
              className={`text-[10px] font-bold mt-1 font-inter-medium ${
                activeTab === item.id ? 'text-indigo-600' : 'text-gray-400'
              } tracking-[1px]`}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};
