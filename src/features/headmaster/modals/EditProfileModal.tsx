import React from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { LinearGradient } from 'expo-linear-gradient';
import { styled } from 'nativewind';

const StyledLinearGradient = styled(LinearGradient);

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  profileForm: { name: string; phone: string; email: string; office: string };
  setProfileForm: (form: { name: string; phone: string; email: string; office: string }) => void;
  onSave: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onClose,
  profileForm,
  setProfileForm,
  onSave,
}) => {
  const getInitials = (name: string) => {
    if (!name || name.trim().length === 0) return '??';
    return name.trim().split(/\s+/).map(n => n[0]).filter(Boolean).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1 bg-black/60 justify-end"
      >
        <View className="bg-white rounded-t-[32px] overflow-hidden shadow-2xl border-t border-gray-100">
          {/* Master Identity Header - Compact Platinum */}
          <StyledLinearGradient 
            colors={['#6366f1', '#4338ca', '#312e81']} 
            start={{x: 0, y: 0}} end={{x: 1, y: 1}} 
            className="px-6 pt-8 pb-10"
          >
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 items-center justify-center mr-3">
                  <Icons.Profile size={20} color="white" />
                </View>
                <View>
                  <Text className="text-white text-lg font-black tracking-tighter">Profile Details</Text>
                  <Text className="text-indigo-200 text-[8px] font-black uppercase tracking-[2px]">Edit Profile</Text>
                </View>
              </View>
              <TouchableOpacity 
                onPress={onClose} 
                className="bg-white/10 p-2.5 rounded-full border border-white/10 active:scale-90"
              >
                <Icons.Close size={18} color="white" />
              </TouchableOpacity>
            </View>
          </StyledLinearGradient>

          <View className="p-6 bg-gray-50/30 -mt-6 rounded-t-[32px]">
            {/* Identity Banner Strip - Compact Authority */}
            <View className="flex-row items-center p-4 bg-white rounded-2xl border border-gray-100 shadow-sm mb-6">
              <View className="w-12 h-12 rounded-full bg-indigo-600 items-center justify-center mr-4 border-2 border-indigo-50 shadow-sm">
                <Text className="text-white font-black text-lg">{getInitials(profileForm.name)}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-black text-gray-900 tracking-tight">{profileForm.name || 'User Name'}</Text>
                <View className="flex-row items-center mt-1">
                  <View className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 shadow-sm" />
                  <Text className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Verified Account</Text>
                </View>
              </View>
              <Icons.Shield size={14} color="#10b981" />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="space-y-4" contentContainerStyle={{ paddingBottom: 20 }}>
              <View>
                <Text className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Full Name</Text>
                <TextInput 
                  className="bg-white px-4 py-3.5 rounded-xl text-[11px] font-black text-gray-900 border border-gray-100 shadow-sm" 
                  value={profileForm.name} 
                  onChangeText={t => setProfileForm({ ...profileForm, name: t })} 
                  placeholder="Enter full legal name"
                  placeholderTextColor="#cbd5e1"
                />
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Phone Terminal</Text>
                  <TextInput 
                    className="bg-white px-4 py-3.5 rounded-xl text-[11px] font-black text-gray-700 border border-gray-100 shadow-sm" 
                    value={profileForm.phone} 
                    onChangeText={t => setProfileForm({ ...profileForm, phone: t })} 
                    keyboardType="phone-pad"
                    placeholder="+1 (000) 000-0000"
                    placeholderTextColor="#cbd5e1"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Department</Text>
                  <TextInput 
                    className="bg-white px-4 py-3.5 rounded-xl text-[11px] font-black text-gray-700 border border-gray-100 shadow-sm" 
                    value={profileForm.office} 
                    onChangeText={t => setProfileForm({ ...profileForm, office: t })} 
                    placeholder="e.g. Administration"
                    placeholderTextColor="#cbd5e1"
                  />
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Official Email</Text>
                <TextInput 
                  className="bg-white px-4 py-3.5 rounded-xl text-[11px] font-black text-gray-700 border border-gray-100 shadow-sm" 
                  value={profileForm.email} 
                  onChangeText={t => setProfileForm({ ...profileForm, email: t })} 
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="name@domain.com"
                  placeholderTextColor="#cbd5e1"
                />
              </View>
            </ScrollView>

            {/* Footer Action Suite - Compact Platinum */}
            <View className="flex-row gap-3 mt-4 pt-4 border-t border-gray-100 bg-white/50 rounded-b-[32px]">
              <TouchableOpacity 
                onPress={onClose} 
                className="flex-1 py-4 bg-gray-100/50 rounded-xl items-center border border-gray-100 active:scale-95"
              >
                <Text className="text-gray-400 font-black text-[10px] uppercase tracking-[2px]">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={onSave} 
                className="flex-[2] py-4 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-100 items-center active:scale-95"
              >
                <Text className="text-white font-black text-[10px] uppercase tracking-[2px]">Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
