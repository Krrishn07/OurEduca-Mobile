import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { ModalShell } from '../../../design-system';

interface AddStudentModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: () => void;
  studentName: string;
  setStudentName: (text: string) => void;
  studentEmail: string;
  setStudentEmail: (text: string) => void;
  error?: string | null;
  loading?: boolean;
  status?: string | null;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  visible,
  onClose,
  onAdd,
  studentName,
  setStudentName,
  studentEmail,
  setStudentEmail,
  error,
  loading,
  status
}) => {
  const canSave = studentName.trim().length > 0 && studentEmail.trim().length > 0;

  return (
    <ModalShell
      visible={visible}
      onClose={onClose}
      title="Register Student"
      subtitle="Institutional Node Entry"
    >
      <View className="p-1">
        {error ? (
          <Text className="text-red-500 text-sm mb-6 text-center font-inter-bold">{error}</Text>
        ) : null}

        <View className="mb-6">
          <Text className="text-[9px] font-inter-black text-gray-400 uppercase tracking-[2px] mb-3 px-1">Legal Identity</Text>
          <View className="bg-white border border-gray-100 rounded-[20px] px-5 py-4 shadow-sm">
            <TextInput 
              placeholder="e.g. Bart Simpson" 
              value={studentName}
              onChangeText={setStudentName}
              className="text-gray-900 font-inter-black text-[14px] p-0"
              placeholderTextColor="#cbd5e1"
            />
          </View>
        </View>

        <View className="mb-8">
          <Text className="text-[9px] font-inter-black text-gray-400 uppercase tracking-[2px] mb-3 px-1">Communication Node (Email)</Text>
          <View className="bg-white border border-gray-100 rounded-[20px] px-5 py-4 shadow-sm">
            <TextInput 
              placeholder="e.g. bart@springfield.edu" 
              value={studentEmail}
              onChangeText={setStudentEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              className="text-gray-900 font-inter-black text-[14px] p-0"
              placeholderTextColor="#cbd5e1"
            />
          </View>
        </View>

        <View className="bg-indigo-50/50 p-5 rounded-[24px] border border-indigo-100/50 flex-row items-center mb-8">
          <View className="w-10 h-10 bg-white rounded-full items-center justify-center mr-4 border border-indigo-100 shadow-sm">
            <Icons.School size={18} color="#4f46e5" />
          </View>
          <Text className="text-indigo-900 text-[11px] font-inter-black leading-tight flex-1">
            New student will be automatically synchronized with your active class segment roster.
          </Text>
        </View>

        <TouchableOpacity 
          onPress={onAdd}
          disabled={!canSave || loading}
          className={`w-full py-4 rounded-2xl shadow-lg flex-row items-center justify-center mt-4 ${
            !canSave || loading ? "bg-indigo-300" : "bg-indigo-600 shadow-indigo-200"
          }`}
        >
          <Icons.Plus size={20} color="white" />
          <Text className="text-white font-inter-black ml-2 text-lg">
            {loading ? (status || "Registering...") : "Register Student"}
          </Text>
        </TouchableOpacity>
      </View>
    </ModalShell>
  );
};
