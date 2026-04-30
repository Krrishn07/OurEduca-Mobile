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
  error?: string | null;
  loading?: boolean;
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
  loading
}) => {
  const canSave = studentName.trim() && studentEmail.trim();

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View className="flex-1 justify-center items-center bg-black/60 p-4">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="w-full max-w-md"
        >
          <View className="bg-white rounded-[24px] p-8 shadow-2xl">
            {error && (
              <View className="bg-rose-50 p-4 rounded-2xl border border-rose-100 mb-6">
                <Text className="text-rose-600 text-[11px] font-black uppercase tracking-wider font-inter-black text-center">{error}</Text>
              </View>
            )}
          <View className="flex-row justify-between items-center mb-8">
              <View>
                <Text className="text-2xl font-black text-gray-900 font-inter-black">Register Student</Text>
                <Text className="text-[10px] font-black text-indigo-400 uppercase tracking-widest font-inter-black mt-1">Institutional Node Entry</Text>
              </View>
              <TouchableOpacity onPress={onClose} className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <Icons.Close size={20} color="#94a3b8" />
              </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
              <View className="mb-6">
                  <Text className="text-[9px] font-black text-gray-400 uppercase tracking-[2px] mb-3 px-1 font-inter-black">Legal Identity</Text>
                  <View className="bg-gray-50 border border-gray-100 rounded-[20px] px-5 py-4 shadow-inner">
                      <TextInput 
                          placeholder="e.g. Bart Simpson" 
                          value={studentName}
                          onChangeText={setStudentName}
                          className="text-gray-900 font-black text-[14px] font-inter-black p-0"
                          placeholderTextColor="#cbd5e1"
                      />
                  </View>
              </View>

              <View className="mb-8">
                  <Text className="text-[9px] font-black text-gray-400 uppercase tracking-[2px] mb-3 px-1 font-inter-black">Communication Node (Email)</Text>
                  <View className="bg-gray-50 border border-gray-100 rounded-[20px] px-5 py-4 shadow-inner">
                      <TextInput 
                          placeholder="e.g. bart@springfield.edu" 
                          value={studentEmail}
                          onChangeText={setStudentEmail}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          className="text-gray-900 font-black text-[14px] font-inter-black p-0"
                          placeholderTextColor="#cbd5e1"
                      />
                  </View>
              </View>

              <View className="bg-indigo-50/50 p-5 rounded-[24px] border border-indigo-100/50 flex-row items-center mb-8">
                <View className="w-10 h-10 bg-white rounded-full items-center justify-center mr-4 border border-indigo-100 shadow-sm">
                    <Icons.School size={18} color="#4f46e5" />
                </View>
                <Text className="text-indigo-900 text-[11px] font-black leading-tight flex-1 font-inter-black">
                  New student will be automatically synchronized with your active class segment roster.
                </Text>
              </View>

              <TouchableOpacity 
                  onPress={onAdd}
                  disabled={!canSave || loading}
                  activeOpacity={0.9}
                  className={`w-full py-5 rounded-[20px] flex-row items-center justify-center shadow-xl ${
                    !canSave || loading 
                      ? 'bg-gray-100 border border-gray-200' 
                      : 'bg-[#16a34a] border border-[#15803d] shadow-green-200'
                  }`}
              >
                  {!loading && <Icons.Plus size={20} color={!canSave ? "#94a3b8" : "white"} />}
                  <Text className={`font-black ml-3 text-[14px] uppercase tracking-[2px] font-inter-black ${
                    !canSave || loading ? 'text-gray-400' : 'text-white'
                  }`}>
                      {loading ? 'Synchronizing Node...' : 'Register Student'}
                  </Text>
              </TouchableOpacity>
          </ScrollView>
        </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};
