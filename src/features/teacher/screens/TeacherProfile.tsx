import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styled } from 'nativewind';
import { Icons } from '../../../../components/Icons';
import { User } from '../../../../types';
import { AppTheme, AppCard, AppTypography, AppRow, StatusPill, SectionHeader } from '../../../design-system';

const StyledLinearGradient = LinearGradient ? styled(LinearGradient) : View;

interface TeacherProfileProps {
  currentUser: User;
  onEdit: () => void;
  onAccountSecurity?: () => void;
  onLogout: () => void;
}

export const TeacherProfile: React.FC<TeacherProfileProps> = ({
  currentUser,
  onEdit,
  onAccountSecurity,
  onLogout,
}) => {
  return (
    <ScrollView className="flex-1 bg-[#f5f7ff]" showsVerticalScrollIndicator={false}>
        {/* Platinum Profile Hero — TUNED */}
        <View className="relative z-20">
            <StyledLinearGradient 
              colors={AppTheme.colors.gradients.brand}
              start={{x: 0, y: 0}} end={{x: 1, y: 1}}
              className="h-[140px] rounded-b-[40px] shadow-xl shadow-indigo-200/50"
            />
            
            {/* Avatar Cluster — TUNED proportions */}
            <View className="absolute -bottom-10 left-6 p-1.5 rounded-[24px] bg-white shadow-xl shadow-indigo-200 border border-gray-50 z-30">
                <View className="w-20 h-20 rounded-[20px] bg-indigo-50 items-center justify-center border border-indigo-100 overflow-hidden shadow-inner">
                    {currentUser?.avatar_url ? (
                        <Image source={{ uri: currentUser.avatar_url }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                        <Text className="text-2xl font-black text-indigo-600 tracking-tighter font-inter-black">
                            {currentUser?.name?.charAt(0) || 'T'}
                        </Text>
                    )}
                </View>
                {/* Online Status — TUNED */}
                <View className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-emerald-500 border-[3px] border-white shadow-sm shadow-emerald-500/40 items-center justify-center" />
            </View>
        </View>

        {/* Profile Header Block — TUNED to include Edit Button on the right */}
        <View className="px-6 mt-14 mb-5 relative z-10">
            <View className="flex-row justify-between items-start">
                <View className="flex-1 mr-4">
                    <Text className="text-xl font-black text-gray-900 tracking-tighter leading-none mb-2 font-inter-black">{currentUser?.name}</Text>
                    <View className="flex-row">
                        <StatusPill label="Academy Faculty" type="info" />
                    </View>
                </View>
                <TouchableOpacity 
                    onPress={onEdit} 
                    className="bg-white border border-gray-100 shadow-md shadow-indigo-100/20 p-3 rounded-xl active:scale-95"
                >
                    <Icons.Edit size={18} color="#4f46e5" />
                </TouchableOpacity>
            </View>
        </View>

        {/* Core Identity Module — TUNED for data priority */}
        <View className="px-4 mb-5">
            <View className="flex-row items-center mb-3 px-2">
                <View className="w-1 h-4 bg-indigo-500 rounded-full mr-2" />
                <Text className="text-[10px] font-black text-gray-900 uppercase tracking-[2px] font-inter-black">Personal Information</Text>
            </View>
            <AppCard className="p-0 overflow-hidden border border-white shadow-xl shadow-indigo-100/30">
                <AppRow 
                  title={currentUser.email || 'not set'}
                  subtitle="Primary Email"
                  avatarIcon={<Icons.Mail size={15} color="#4f46e5" />}
                  avatarBg="#eef2ff"
                  showBorder={true}
                  rightElement={<Icons.ChevronRight size={13} color="#d1d5db" />}
                />
                <AppRow 
                  title={currentUser.phone || 'not set'}
                  subtitle="Direct Line"
                  avatarIcon={<Icons.Phone size={15} color="#4f46e5" />}
                  avatarBg="#eef2ff"
                  showBorder={true}
                  rightElement={<Icons.ChevronRight size={13} color="#d1d5db" />}
                />
                <AppRow 
                  title={currentUser.office || 'Main Faculty Hub'}
                  subtitle="Faculty Office"
                  avatarIcon={<Icons.Globe size={15} color="#4f46e5" />}
                  avatarBg="#eef2ff"
                  showBorder={false}
                  rightElement={<Icons.ChevronRight size={13} color="#d1d5db" />}
                />
            </AppCard>
        </View>

        {/* Security & Session — TUNED */}
        <View className="px-4 mb-24">
            <View className="flex-row items-center mb-3 px-2">
                <View className="w-1 h-4 bg-indigo-500 rounded-full mr-2" />
                <Text className="text-[10px] font-black text-gray-900 uppercase tracking-[2px] font-inter-black">Account & Security</Text>
            </View>
            <AppCard className="p-0 overflow-hidden border border-white shadow-xl shadow-indigo-100/30">
                <AppRow 
                  title="Security Settings"
                  subtitle="Password & Security"
                  avatarIcon={<Icons.Lock size={15} color="#4f46e5" />}
                  avatarBg="#eef2ff"
                  onPress={onAccountSecurity}
                  showBorder={true}
                  rightElement={<Icons.ChevronRight size={13} color="#d1d5db" />}
                />
                <AppRow 
                  title="Logout"
                  subtitle="Sign out safely"
                  avatarIcon={<Icons.Logout size={15} color="#e11d48" />}
                  avatarBg="#fff1f2"
                  onPress={onLogout}
                  showBorder={false}
                  rightElement={<Icons.ChevronRight size={13} color="#fca5a5" />}
                />
            </AppCard>

            {/* Platform Build Info */}
            <View className="mt-16 items-center opacity-30">
                <View className="w-8 h-0.5 bg-gray-300 rounded-full mb-4" />
                <Text className="text-[9px] font-black text-gray-400 uppercase tracking-[4px] font-inter-black">Verified Faculty Node</Text>
                <Text className="text-[8px] font-black text-gray-400 mt-1 uppercase tracking-widest font-inter-black italic">TLS 1.3 SECURE CONNECTION</Text>
            </View>
        </View>
    </ScrollView>
  );
};
