import React from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Icons } from '../../../../components/Icons';

interface AddStudentModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: () => void;
  // Simulating fields for demo
  studentName: string;
  setStudentName: (text: string) => void;
  studentEmail: string;
  setStudentEmail: (text: string) => void;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  visible,
  onClose,
  onAdd,
  studentName,
  setStudentName,
  studentEmail,
  setStudentEmail,
}) => {
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View className="flex-1 justify-center items-center bg-black/60 p-4">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="w-full max-w-md"
        >
          <View className="bg-white rounded-2xl p-6 shadow-2xl">
          <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-black text-gray-900">Add New Student</Text>
              <TouchableOpacity onPress={onClose} className="p-2 bg-gray-100 rounded-full">
                  <Icons.Close size={20} color="#6b7280" />
              </TouchableOpacity>
          </View>

          <ScrollView className="space-y-6">
              <View>
                  <Text className="text-sm font-black text-gray-700 mb-2 uppercase tracking-wider">Full Name</Text>
                  <View className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                      <TextInput 
                          placeholder="e.g., Bart Simpson" 
                          value={studentName}
                          onChangeText={setStudentName}
                          className="text-gray-900"
                      />
                  </View>
              </View>

              <View>
                  <Text className="text-sm font-black text-gray-700 mb-2 uppercase tracking-wider">Email Address</Text>
                  <View className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                      <TextInput 
                          placeholder="e.g., bart@school.edu" 
                          value={studentEmail}
                          onChangeText={setStudentEmail}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          className="text-gray-900"
                      />
                  </View>
              </View>

              <View className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex-row items-center mb-6">
                <Icons.School size={20} color="#2563eb" />
                <Text className="text-blue-700 text-[11px] font-medium ml-3 flex-1">
                  New students will be added to your currently selected class section.
                </Text>
              </View>

              <TouchableOpacity 
                  onPress={onAdd}
                  className="w-full py-4 bg-indigo-600 rounded-xl shadow-lg flex-row items-center justify-center mt-4"
              >
                  <Icons.Plus size={20} color="white" />
                  <Text className="text-white font-black ml-2 text-lg">Register Student</Text>
              </TouchableOpacity>
          </ScrollView>
        </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};
