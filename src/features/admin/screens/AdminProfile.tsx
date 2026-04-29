import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Icons } from '../../../../components/Icons';

interface AdminProfileProps {
  currentUser: any;
  onShowEditProfileModal: () => void;
}

export const AdminProfile: React.FC<AdminProfileProps> = ({
  currentUser,
  onShowEditProfileModal,
}) => {
  return (
    <ScrollView className="space-y-6 px-4 py-2 flex-1" showsVerticalScrollIndicator={false}>
      <View className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 items-center mt-8 pt-16 relative mb-6">
        <View className="w-24 h-24 bg-indigo-100 rounded-full absolute -top-12 border-4 border-gray-50 items-center justify-center">
          <Text className="text-4xl font-black text-indigo-600">{currentUser.name?.charAt(0) || 'A'}</Text>
        </View>
        <Text className="text-2xl font-black text-gray-900 mt-2">{currentUser.name}</Text>
        <Text className="text-gray-500 mt-1 text-sm text-center">Platform Admin • {currentUser.email}</Text>
        
        <View className="w-full flex-row mt-6 pt-4 border-t border-gray-100">
          <View className="flex-1 items-center border-r border-gray-100">
            <Text className="text-[11px] text-gray-500 font-black">OFFICE</Text>
            <Text className="mt-1 font-black">{currentUser.office || 'HQ'}</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-[11px] text-gray-500 font-black">PHONE</Text>
            <Text className="mt-1 font-black">{currentUser.phone || 'N/A'}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity onPress={onShowEditProfileModal} className="bg-white p-4 rounded-xl shadow-sm flex-row justify-between items-center mb-6">
        <Text className="font-black text-gray-800">Edit Profile Details</Text>
        <Icons.ChevronRight size={16} color="#9ca3af" />
      </TouchableOpacity>
    </ScrollView>
  );
};

// Re-verified for modularization
