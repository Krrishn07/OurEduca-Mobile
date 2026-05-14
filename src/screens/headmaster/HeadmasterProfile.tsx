import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icons } from '@components/common/Icons';
import { AppTheme, AppCard, AppRow, StatusPill, SectionHeader } from '@components/common';
import { User } from '@/types';
import { UnifiedActivityFeed } from '@components/dashboard/UnifiedActivityFeed';

interface HeadmasterProfileProps {
  currentUser: User;
  onLogout: () => void;
  onEdit: () => void;
  onViewAll?: () => void;
}

export const HeadmasterProfile: React.FC<HeadmasterProfileProps> = ({ 
  currentUser, 
  onLogout, 
  onEdit,
  onViewAll
}) => {
  return (
    <ScrollView className="flex-1 bg-[#f8fafc]" showsVerticalScrollIndicator={false}>
        {/* Platinum Brand Hero */}
        <View className="relative z-20">
            <LinearGradient 
                colors={AppTheme.colors.gradients.brand}
                start={{x: 0, y: 0}} end={{x: 1, y: 1}}
                className="h-[140px] rounded-b-[40px] shadow-xl shadow-indigo-200/50"
            />
            
            <View className="absolute -bottom-10 left-6 p-1.5 rounded-[24px] bg-white shadow-xl shadow-indigo-200 border border-gray-50 z-30">
                <View className="w-20 h-20 rounded-[20px] bg-indigo-50 items-center justify-center border border-indigo-100 overflow-hidden shadow-inner">
                    <Icons.Profile size={48} color="#4f46e5" />
                </View>
                <View className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-emerald-500 border-[3px] border-white shadow-sm shadow-emerald-500/40" />
            </View>
        </View>

        {/* Profile Title Block */}
        <View className="px-6 mt-14 mb-5 relative z-10">
            <View className="flex-row justify-between items-start">
                <View className="flex-1 mr-4">
                    <Text className="text-xl font-black text-gray-900 tracking-tighter leading-none mb-2 font-inter-black">{currentUser?.name}</Text>
                    <View className="flex-row">
                        <StatusPill label="Institutional Administrator" type="info" />
                    </View>
                </View>
                <TouchableOpacity 
                    onPress={onEdit}
                    activeOpacity={0.7}
                    className="bg-white border border-gray-100 shadow-md shadow-indigo-100/20 p-3 rounded-xl active:scale-95"
                >
                    <Icons.Edit size={18} color="#4f46e5" />
                </TouchableOpacity>
            </View>
        </View>

        {/* Professional Identity */}
        <View className="px-4 mb-5">
            <SectionHeader title="PROFESSIONAL IDENTITY" className="px-2" />
            <AppCard className="p-0 overflow-hidden border border-white shadow-xl shadow-indigo-100/30">
                <AppRow 
                    title={currentUser?.email || 'N/A'}
                    subtitle="Institutional Email"
                    avatarIcon={<Icons.Mail size={15} color="#4f46e5" />}
                    avatarBg="#eef2ff"
                    showBorder
                    rightElement={<Icons.ChevronRight size={13} color="#d1d5db" />}
                />
                <AppRow 
                    title={currentUser?.phone || '+1 555-0100'}
                    subtitle="Administrative Line"
                    avatarIcon={<Icons.Phone size={15} color="#4f46e5" />}
                    avatarBg="#eef2ff"
                    showBorder
                    rightElement={<Icons.ChevronRight size={13} color="#d1d5db" />}
                />
                <AppRow 
                    title={currentUser?.office || 'Admin Wing, Block A'}
                    subtitle="Executive Office"
                    avatarIcon={<Icons.Globe size={15} color="#4f46e5" />}
                    avatarBg="#eef2ff"
                    rightElement={<Icons.ChevronRight size={13} color="#d1d5db" />}
                />
            </AppCard>
        </View>

        {/* Account & Security */}
        <View className="px-4 mb-5">
            <SectionHeader title="ACCOUNT & SECURITY" className="px-2" />
            <AppCard className="p-0 overflow-hidden border border-white shadow-xl shadow-indigo-100/30">
                <AppRow 
                    title="Security Credentials"
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
                    onPress={onLogout}
                    showBorder={false}
                    rightElement={<Icons.ChevronRight size={13} color="#fca5a5" />}
                />
            </AppCard>
        </View>

        <View className="px-4 mb-10">
          <UnifiedActivityFeed 
            limit={8} 
            onViewAll={onViewAll}
            emptyMessage="Institutional record is silent. No administrative events to report."
          />
        </View>

        {/* Terminal Footer */}
        <View className="mb-16 items-center opacity-30">
            <View className="w-8 h-0.5 bg-gray-300 rounded-full mb-4" />
            <Text className="text-[9px] font-black text-gray-400 uppercase tracking-[4px] font-inter-black">Institutional Node v2.0</Text>
            <Text className="text-[8px] font-black text-gray-400 mt-1 uppercase tracking-widest font-inter-black">Institutional Standard</Text> 
        </View>
    </ScrollView>
  );
};
