import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Icons } from '../../../../components/Icons';

interface AdminHomeProps {
  institutes: any[];
  users: any[];
}

export const AdminHome: React.FC<AdminHomeProps> = ({
  institutes,
  users,
}) => {
  return (
    <ScrollView className="space-y-6 flex-1 px-4 py-2" showsVerticalScrollIndicator={false}>
      <View className="my-6">
        <Text className="text-2xl font-black text-gray-900">Platform Admin</Text>
        <Text className="text-gray-500">System is running properly</Text>
      </View>
      <View className="flex-row flex-wrap gap-4 mb-6">
        <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 w-[48%] items-center justify-center py-6">
          <Icons.School size={32} color="#4f46e5" />
          <Text className="text-2xl font-black mt-2">{institutes.length}</Text>
          <Text className="text-[11px] text-gray-500">Institutes</Text>
        </View>
        <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 w-[48%] items-center justify-center py-6">
          <Icons.Users size={32} color="#16a34a" />
          <Text className="text-2xl font-black mt-2">{users.length}</Text>
          <Text className="text-[11px] text-gray-500">Users</Text>
        </View>
      </View>
    </ScrollView>
  );
};

// Re-verified for modularization
