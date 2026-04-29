import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styled } from 'nativewind';
import { Icons } from '../../../../components/Icons';
import { AppTheme, AppCard, AppTypography, AppRow, StatusPill, SectionHeader } from '../../../design-system';

const StyledLinearGradient = LinearGradient ? styled(LinearGradient) : View;

interface MentorProfileProps {
  currentUser: any;
  onShowEditProfileModal: () => void;
  onAccountSecurity?: () => void;
  onLogout: () => void;
}

export const MentorProfile: React.FC<MentorProfileProps> = ({
  currentUser,
  onShowEditProfileModal,
  onAccountSecurity,
  onLogout,
}) => {
  return (
    <ScrollView className="flex-1 bg-[#f5f7ff]" showsVerticalScrollIndicator={false}>
        {/* Banner with Platinum Proportions */}
        <View className="relative z-20">
            <StyledLinearGradient 
              colors={AppTheme.colors.gradients.brand}
              start={{x: 0, y: 0}} end={{x: 1, y: 1}}
              className="h-[140px] shadow-xl shadow-indigo-200/50 rounded-b-[40px]"
            />
            
            {/* Avatar Cluster - Standardized Proportions */}
            <View className="absolute -bottom-10 left-6 p-1.5 rounded-[24px] bg-white shadow-xl shadow-indigo-200 border border-gray-50 z-30">
                <View className="w-20 h-20 rounded-[20px] bg-indigo-50 items-center justify-center border border-indigo-100 overflow-hidden shadow-inner">
                    {currentUser?.avatar_url ? (
                        <Image source={{ uri: currentUser.avatar_url }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                        <Text className="text-2xl font-black text-indigo-600 tracking-tighter font-inter-black">
                            {currentUser?.name?.charAt(0) || 'M'}
                        </Text>
                    )}
                </View>
                <View className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-emerald-500 border-[3px] border-white shadow-sm shadow-emerald-500/40" />
            </View>
        </View>

        {/* Profile Header Block */}
        <View className="px-6 mt-14 mb-5 relative z-10">
            <View className="flex-row justify-between items-start">
                <View className="flex-1 mr-4">
                    <Text className="text-xl font-black text-gray-900 tracking-tighter leading-none mb-2 font-inter-black">{currentUser?.name}</Text>
                    <View className="flex-row">
                        <StatusPill label="Class Mentor" type="success" />
                        <View className="ml-2">
                           <StatusPill label="Faculty Hub" type="neutral" />
                        </View>
                    </View>
                </View>
                <TouchableOpacity 
                    onPress={onShowEditProfileModal}
                    className="bg-white border border-gray-100 shadow-md shadow-indigo-100/20 p-3 rounded-xl active:scale-95"
                >
                    <Icons.Edit size={18} color="#4f46e5" />
                </TouchableOpacity>
            </View>
        </View>

        {/* Personal Information Module */}
        <View className="px-4 mb-5">
            <SectionHeader
                title="PERSONAL INFORMATION"
                className="px-2"
            />
            
            <AppCard className="p-0 overflow-hidden border border-white shadow-xl shadow-indigo-100/30">
                <AppRow 
                  title={currentUser?.email || 'not set'}
                  subtitle="School Email"
                  avatarIcon={<Icons.Mail size={15} color="#4f46e5" />}
                  avatarBg="#eef2ff"
                  showBorder={true}
                  rightElement={<Icons.ChevronRight size={13} color="#d1d5db" />}
                />
                <AppRow 
                  title={currentUser?.phone || 'not set'}
                  subtitle="Contact Number"
                  avatarIcon={<Icons.Phone size={15} color="#4f46e5" />}
                  avatarBg="#eef2ff"
                  showBorder={true}
                  rightElement={<Icons.ChevronRight size={13} color="#d1d5db" />}
                />
                <AppRow 
                  title={currentUser?.office || 'Faculty Office'}
                  subtitle="Office Location"
                  avatarIcon={<Icons.Globe size={15} color="#4f46e5" />}
                  avatarBg="#eef2ff"
                  showBorder={false}
                  rightElement={<Icons.ChevronRight size={13} color="#d1d5db" />}
                />
            </AppCard>
        </View>

        {/* Security & Settings Section */}
        <View className="px-4 mb-24">
            <SectionHeader
                title="SECURITY & SETTINGS"
                className="px-2"
            />
            
            <AppCard className="p-0 overflow-hidden border border-white shadow-xl shadow-indigo-100/30">
                <AppRow 
                  title="Account Security"
                  subtitle="Password & Safety"
                  avatarIcon={<Icons.Shield size={15} color="#4f46e5" />}
                  avatarBg="#eef2ff"
                  onPress={onAccountSecurity}
                  showBorder={true}
                  rightElement={<Icons.ChevronRight size={13} color="#d1d5db" />}
                />
                <AppRow 
                  title="Sign Out"
                  subtitle="Logout from App"
                  avatarIcon={<Icons.Logout size={15} color="#e11d48" />}
                  avatarBg="#fff1f2"
                  onPress={onLogout}
                  showBorder={false}
                  rightElement={<Icons.ChevronRight size={13} color="#fca5a5" />}
                />
            </AppCard>

            {/* App Footer */}
            <View className="mt-16 items-center opacity-30">
                <View className="w-8 h-0.5 bg-gray-300 rounded-full mb-4" />
                <Text className="text-[9px] font-black text-gray-400 uppercase tracking-[4px] font-inter-black">OurEduca Mentor v2.0</Text>
                <Text className="text-[8px] font-black text-gray-400 mt-1 uppercase tracking-widest font-inter-black italic text-center">Secured Connection • My School Hub</Text>
            </View>
        </View>
    </ScrollView>
  );
};
