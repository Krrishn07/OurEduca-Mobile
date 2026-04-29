import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppTheme, AppCard, AppTypography, StatusPill, AppRow } from '../../../design-system';

const StyledLinearGradient = LinearGradient ? typeof LinearGradient === 'function' ? LinearGradient : View : View;

interface HeadmasterProfileProps {
  currentUser: any;
  onShowEditProfileModal: () => void;
}

export const HeadmasterProfile: React.FC<HeadmasterProfileProps> = ({
  currentUser,
  onShowEditProfileModal,
}) => {
  return (
    <ScrollView 
        className="flex-1 bg-[#f5f7ff]" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
    >
        {/* 1. Compact Header Banner — Platinum Sync */}
        <View className="relative z-20">
            <LinearGradient
                colors={AppTheme.colors.gradients.brand}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                className="h-[140px] rounded-b-[40px] shadow-xl shadow-indigo-200"
            />
            
            {/* Avatar — Platinum Proportions */}
            <View className="absolute -bottom-10 left-6 p-1.5 rounded-[24px] bg-white shadow-xl shadow-indigo-200 z-30">
                <View className="w-20 h-20 rounded-[20px] bg-indigo-50 items-center justify-center border border-indigo-100 overflow-hidden">
                    <Text className="text-2xl font-black text-indigo-600 tracking-tighter font-inter-black">{currentUser?.name?.charAt(0) || 'A'}</Text>
                </View>
                {/* Online Status */}
                <View className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-emerald-500 border-[3px] border-white shadow-sm shadow-emerald-500/40" />
            </View>
        </View>
        
        {/* 2. Profile Header Block */}
        <View className="px-6 mt-14 mb-5 relative z-10">
            <View className="flex-row justify-between items-start">
                <View className="flex-1 mr-4">
                    <Text className="text-xl font-black text-gray-900 tracking-tighter leading-none mb-2 font-inter-black">{currentUser?.name}</Text>
                    <StatusPill
                        label="Principal & Headmaster"
                        type="enterprise"
                    />
                </View>
                <TouchableOpacity 
                    onPress={onShowEditProfileModal} 
                    className="bg-white border border-gray-100 shadow-md shadow-indigo-100/20 p-3 rounded-xl active:scale-95"
                >
                    <Icons.Edit size={18} color="#4f46e5" />
                </TouchableOpacity>
            </View>
        </View>

        {/* 3. Personal Information — AppRow pattern */}
        <View className="px-4 mb-5">
            <SectionHeader
                title="PROFILE DETAILS"
                className="px-2"
            />

            <AppCard className="overflow-hidden p-0">
                <AppRow
                    title={currentUser?.email || 'not set'}
                    subtitle="Email Address"
                    avatarIcon={<Icons.Mail size={15} color="#4f46e5" />}
                    avatarBg="#eef2ff"
                    showBorder={true}
                    rightElement={<Icons.ChevronRight size={13} color="#d1d5db" />}
                />
                <AppRow
                    title={currentUser?.phone || 'not set'}
                    subtitle="Phone Number"
                    avatarIcon={<Icons.Phone size={15} color="#4f46e5" />}
                    avatarBg="#eef2ff"
                    showBorder={true}
                    rightElement={<Icons.ChevronRight size={13} color="#d1d5db" />}
                />
                <AppRow
                    title={currentUser?.office || 'Main Office'}
                    subtitle="School Location"
                    avatarIcon={<Icons.Globe size={15} color="#4f46e5" />}
                    avatarBg="#eef2ff"
                    showBorder={false}
                    rightElement={<Icons.ChevronRight size={13} color="#d1d5db" />}
                />
            </AppCard>
        </View>

        {/* 4. Account & Security — AppRow pattern */}
        <View className="px-4 mb-16">
            <SectionHeader
                title="SECURITY & ACCOUNT"
                className="px-2"
            />
            
            <AppCard className="p-0 overflow-hidden">
                <AppRow
                    title="Security Settings"
                    subtitle="Password & Access"
                    avatarIcon={<Icons.Lock size={15} color="#4f46e5" />}
                    avatarBg="#eef2ff"
                    showBorder={true}
                    rightElement={<Icons.ChevronRight size={13} color="#d1d5db" />}
                />
                <AppRow
                    title="Sign Out"
                    subtitle="Safely exit session"
                    avatarIcon={<Icons.Logout size={15} color="#e11d48" />}
                    avatarBg="#fff1f2"
                    showBorder={false}
                    rightElement={<Icons.ChevronRight size={13} color="#fca5a5" />}
                />
            </AppCard>

            {/* Build Information */}
            <View className="mt-10 items-center opacity-30">
                <View className="w-8 h-0.5 bg-gray-300 rounded-full mb-3" />
                <Text className="text-[8px] font-black text-gray-400 uppercase tracking-[3px] font-inter-black">Secure Connection</Text>
                <Text className="text-[8px] font-black text-gray-400 mt-1 uppercase tracking-widest font-inter-black">Institutional Standard</Text>
            </View>
        </View>
    </ScrollView>
  );
};
