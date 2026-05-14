import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icons } from '@components/common/Icons';
import { AppTheme, AppCard, AppRow, StatusPill, SectionHeader } from '@components/common';
import { User } from '@/types';
import { UnifiedActivityFeed } from '@components/dashboard/UnifiedActivityFeed';

interface PlatformProfileProps {
  currentUser: User;
  onLogout: () => void;
  onEditProfile: () => void;
  onAccountSecurity?: () => void;
}

export const PlatformProfile: React.FC<PlatformProfileProps> = ({ 
  currentUser, 
  onLogout, 
  onEditProfile, 
  onAccountSecurity,
}) => {
  return (
    <ScrollView className="flex-1 bg-[#0f172a]" showsVerticalScrollIndicator={false}>
        {/* Platinum Dark Brand Hero */}
        <View className="relative z-20">
            <LinearGradient 
                colors={['#1e293b', '#0f172a']}
                start={{x: 0, y: 0}} end={{x: 1, y: 1}}
                className="h-[140px] rounded-b-[40px] shadow-2xl shadow-black/50"
            />
            
            <View className="absolute -bottom-10 left-6 p-1.5 rounded-[24px] bg-slate-800 shadow-2xl shadow-black/40 border border-slate-700 z-30">
                <View className="w-20 h-20 rounded-[20px] bg-slate-900 items-center justify-center border border-slate-700 overflow-hidden shadow-inner">
                    <Icons.Profile size={48} color="#38bdf8" />
                </View>
                <View className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-sky-500 border-[3px] border-slate-800 shadow-sm shadow-sky-500/40" />
            </View>
        </View>

        {/* Profile Title Block */}
        <View className="px-6 mt-14 mb-5 relative z-10">
            <View className="flex-row justify-between items-start">
                <View className="flex-1 mr-4">
                    <Text className="text-xl font-black text-white tracking-tighter leading-none mb-2 font-inter-black">{currentUser?.name}</Text>
                    <View className="flex-row">
                        <StatusPill label="Platform Architect" type="info" />
                    </View>
                </View>
                <TouchableOpacity 
                    onPress={onEditProfile}
                    activeOpacity={0.7}
                    className="bg-slate-800 border border-slate-700 shadow-lg p-3 rounded-xl active:scale-95"
                >
                    <Icons.Edit size={18} color="#38bdf8" />
                </TouchableOpacity>
            </View>
        </View>

        {/* Global Access Identity */}
        <View className="px-4 mb-5">
            <SectionHeader title="GLOBAL ACCESS IDENTITY" className="px-2 text-slate-400" />
            <AppCard className="p-0 overflow-hidden border border-slate-700 bg-slate-800/50 shadow-2xl shadow-black/20">
                <AppRow 
                    title={<Text className="text-white font-inter-black">{currentUser?.email || 'N/A'}</Text>}
                    subtitle="Platform Root Email"
                    avatarIcon={<Icons.Mail size={15} color="#38bdf8" />}
                    avatarBg="#0c4a6e"
                    showBorder
                    rightElement={<Icons.ChevronRight size={13} color="#475569" />}
                />
                <AppRow 
                    title={<Text className="text-white font-inter-black">{currentUser?.phone || '+1 555-ROOT'}</Text>}
                    subtitle="Secure Operations Line"
                    avatarIcon={<Icons.Phone size={15} color="#38bdf8" />}
                    avatarBg="#0c4a6e"
                    showBorder
                    rightElement={<Icons.ChevronRight size={13} color="#475569" />}
                />
                <AppRow 
                    title={<Text className="text-white font-inter-black">Global Data Center</Text>}
                    subtitle="Operations Base"
                    avatarIcon={<Icons.Globe size={15} color="#38bdf8" />}
                    avatarBg="#0c4a6e"
                    rightElement={<Icons.ChevronRight size={13} color="#475569" />}
                />
            </AppCard>
        </View>

        {/* Platform Security */}
        <View className="px-4 mb-5">
            <SectionHeader title="PLATFORM SECURITY" className="px-2 text-slate-400" />
            <AppCard className="p-0 overflow-hidden border border-slate-700 bg-slate-800/50 shadow-2xl shadow-black/20">
                <AppRow 
                    title={<Text className="text-white font-inter-black">Security Protocols</Text>}
                    subtitle="Auth Keys & Encryption"
                    avatarIcon={<Icons.Shield size={15} color="#38bdf8" />}
                    avatarBg="#0c4a6e"
                    showBorder={true}
                    onPress={onAccountSecurity}
                    rightElement={<Icons.ChevronRight size={13} color="#475569" />}
                />
                <AppRow 
                    title={<Text className="text-rose-400 font-inter-black">Terminate Session</Text>}
                    subtitle="Secure Platform Exit"
                    avatarIcon={<Icons.Logout size={15} color="#f43f5e" />}
                    avatarBg="#4c0519"
                    onPress={onLogout}
                    showBorder={false}
                    rightElement={<Icons.ChevronRight size={13} color="#991b1b" />}
                />
            </AppCard>
        </View>
        <View className="px-4 mb-10">
          <UnifiedActivityFeed 
            variant="dark"
            limit={8} 
            emptyMessage="No system events detected."
          />
        </View>

        {/* Platinum Terminal Signature */}
        <View className="mb-16 items-center opacity-30">
            <View className="w-8 h-0.5 bg-slate-700 rounded-full mb-4" />
            <Text className="text-[9px] font-black text-slate-400 uppercase tracking-[4px] font-inter-black">Platform Core v2.0</Text>
            <Text className="text-[8px] font-black text-slate-400 mt-1 uppercase tracking-widest font-inter-black">Encrypted Node</Text> 
        </View>
    </ScrollView>
  );
};
